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

// --- FUNÇÕES DE UTILIDADE ---
function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// --- CARREGAR CONTEÚDO DA NOTÍCIA ---
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
            document.title = `${data.titulo} | MC.`;
            document.getElementById('post-title').innerText = data.titulo;
            document.getElementById('post-date').innerText = formatDate(data.data);
            
            const postBody = document.getElementById('post-body');
            postBody.innerHTML = data.conteudo.replace(/\n/g, '<br>');

            if (data.imagem) {
                const imgTag = document.getElementById('post-image');
                imgTag.src = data.imagem;
                imgTag.style.display = 'block';
            }
            
            // Iniciar escuta de comentários para este post
            listarComentarios(postId);
        } else {
            document.getElementById('post-body').innerText = "Notícia não encontrada.";
        }
    } catch (error) {
        console.error("Erro ao carregar post:", error);
    }
}

// --- LÓGICA DE COMENTÁRIOS ---

// 1. Listar comentários em tempo real
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
            container.innerHTML = "<p style='color:#888;'>Nenhum comentário ainda. Seja o primeiro a comentar!</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const c = docSnap.data();
            const commentId = docSnap.id;
            
            // Verifica se o usuário logado é o dono do comentário
            const isOwner = usuarioLogado && usuarioLogado.uid === c.userId;

            const div = document.createElement('div');
            div.className = "comment-item";
            div.style.cssText = "margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;";
            
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <strong style="font-family:'Inter', sans-serif; font-size:0.9rem;">${c.userName}</strong>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <small style="color:#999; font-size:0.75rem;">${c.data ? formatDate(c.data) : 'agora'}</small>
                        ${isOwner ? `
                            <button onclick="editComment('${commentId}', \`${c.texto}\`)" style="background:none; border:none; color:#0056b3; cursor:pointer; font-size:0.75rem; font-weight:600;">Editar</button>
                            <button onclick="deleteComment('${commentId}')" style="background:none; border:none; color:#dc3545; cursor:pointer; font-size:0.75rem; font-weight:600;">Excluir</button>
                        ` : ''}
                    </div>
                </div>
                <p style="margin-top:8px; font-size:1rem; color:#444; line-height:1.5;">${c.texto}</p>
            `;
            container.appendChild(div);
        });
    });
}

// 2. Funções de Ação (Globais para funcionarem no HTML dinâmico)
window.deleteComment = async (id) => {
    if (confirm("Tem certeza que deseja remover este comentário?")) {
        try {
            await deleteDoc(doc(db, "comentarios", id));
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao remover: Você não tem permissão ou o comentário já foi removido.");
        }
    }
};

window.editComment = async (id, textoAntigo) => {
    const novoTexto = prompt("Edite seu comentário:", textoAntigo);
    if (novoTexto !== null && novoTexto.trim() !== "" && novoTexto !== textoAntigo) {
        try {
            await updateDoc(doc(db, "comentarios", id), {
                texto: novoTexto,
                editadoEm: serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao editar:", error);
            alert("Erro ao editar o comentário.");
        }
    }
};

// 3. Enviar novo comentário
const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('comment-text');
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');

        if (!usuarioLogado) {
            alert("Você precisa estar logado para comentar.");
            return;
        }

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
            console.error("Erro ao comentar:", error);
            alert("Erro ao publicar comentário.");
        }
    });
}

// --- MONITORAR LOGIN ---
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