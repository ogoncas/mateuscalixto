import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, doc, getDoc, collection, addDoc, query, where, orderBy, 
    onSnapshot, serverTimestamp, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDjuRApif2O4TgX2mAycKEcXULCnFSapbQ",
    authDomain: "mateuscalixto-b8d30.firebaseapp.com",
    projectId: "mateuscalixto-b8d30",
    storageBucket: "mateuscalixto-b8d30.firebasestorage.app",
    messagingSenderId: "1028342828902",
    appId: "1:1028342828902:web:6d283c8280e7c8aa5542a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let usuarioLogado = null;

// --- FUNÇÃO DE SEO E META TAGS DINÂMICAS ---
function updateSocialMeta(data) {
    const siteTitle = " | Mateus Calixto";
    const fullTitle = data.titulo + siteTitle;
    
    // 1. Atualiza o Título da Aba (SEO Title)
    document.title = fullTitle;

    // 2. Atualiza Meta Description para Google
    const metaDesc = document.getElementById('meta-desc');
    if (metaDesc) metaDesc.content = data.resumo;

    // 3. Atualiza Open Graph (Facebook, WhatsApp, LinkedIn)
    const ogTitle = document.getElementById('og-title');
    if (ogTitle) ogTitle.content = fullTitle;

    const ogDesc = document.getElementById('og-desc');
    if (ogDesc) ogDesc.content = data.resumo;

    const ogImage = document.getElementById('og-image');
    if (ogImage) ogImage.content = data.imagem;

    // 4. Injeta Dados Estruturados (JSON-LD) para o Google Rich Snippets
    // Remove script antigo se existir para evitar duplicados em SPAs
    const oldScript = document.getElementById('json-ld-data');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = 'json-ld-data';
    script.type = 'application/ld+json';
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": data.titulo,
        "description": data.resumo,
        "image": [data.imagem],
        "datePublished": data.data ? data.data.toDate().toISOString() : new Date().toISOString(),
        "author": [{
            "@type": "Person",
            "name": "Mateus Calixto",
            "url": window.location.origin
        }]
    };
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
}

// --- CARREGAR CONTEÚDO DO POST ---
async function carregarPost() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const docRef = doc(db, "noticias", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Atualizar Metadados de SEO
            updateSocialMeta(data);

            // Preencher HTML
            document.getElementById('post-title').innerText = data.titulo;
            
            if (data.data) {
                const dataFormatada = data.data.toDate().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                });
                document.getElementById('post-date').innerText = `Publicado em ${dataFormatada}`;
            }

            const postBody = document.getElementById('post-body');
            postBody.innerHTML = data.conteudo.replace(/\n/g, '<br>');

            const imgTag = document.getElementById('post-image');
            if (data.imagem) {
                imgTag.src = data.imagem;
                imgTag.alt = data.titulo; // Importante para SEO de imagens
                imgTag.style.display = 'block';
            }
            
            // Carregar Comentários
            listarComentarios(postId);
        } else {
            document.getElementById('post-body').innerText = "Notícia não encontrada.";
        }
    } catch (error) {
        console.error("Erro ao carregar post:", error);
    }
}

// --- LÓGICA DE COMENTÁRIOS ---
function listarComentarios(postId) {
    const q = query(
        collection(db, "comentarios"),
        where("postId", "==", postId),
        orderBy("data", "desc")
    );

    const container = document.getElementById('comments-display');

    onSnapshot(q, (snapshot) => {
        container.innerHTML = "";
        if (snapshot.empty) {
            container.innerHTML = "<p style='color:#888;'>Nenhum comentário ainda. Seja o primeiro!</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const c = docSnap.data();
            const commentId = docSnap.id;
            const isOwner = usuarioLogado && usuarioLogado.uid === c.userId;

            const div = document.createElement('div');
            div.className = "comment-item";
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items: center;">
                    <strong>${c.userName}</strong>
                    <small>${c.data ? c.data.toDate().toLocaleDateString('pt-BR') : 'agora'}</small>
                </div>
                <p style="margin: 10px 0;">${c.texto}</p>
                ${isOwner ? `
                    <div style="font-size: 0.8rem;">
                        <button onclick="deleteComment('${commentId}')" style="color:red; background:none; border:none; cursor:pointer; padding:0;">Excluir</button>
                    </div>
                ` : ''}
            `;
            container.appendChild(div);
        });
    });
}

// Funções globais para interação
window.deleteComment = async (id) => {
    if (confirm("Deseja apagar o seu comentário?")) {
        try {
            await deleteDoc(doc(db, "comentarios", id));
        } catch (error) {
            console.error("Erro ao apagar:", error);
        }
    }
};

// --- SUBMISSÃO DE COMENTÁRIO ---
const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('comment-text');
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');

        if (!usuarioLogado) return alert("Precisa de iniciar sessão para comentar.");
        if (!textInput.value.trim()) return;

        try {
            await addDoc(collection(db, "comentarios"), {
                postId: postId,
                userId: usuarioLogado.uid,
                userName: usuarioLogado.displayName || "Leitor",
                texto: textInput.value,
                data: serverTimestamp()
            });
            textInput.value = ""; 
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
        }
    });
}

// --- MONITORAR ESTADO DE AUTENTICAÇÃO ---
onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
    const form = document.getElementById('comment-form');
    const notice = document.getElementById('comment-auth-notice');

    if (user) {
        if (form) form.classList.remove('hidden');
        if (notice) notice.classList.add('hidden');
    } else {
        if (form) form.classList.add('hidden');
        if (notice) notice.classList.remove('hidden');
    }
});

// Inicialização
carregarPost();