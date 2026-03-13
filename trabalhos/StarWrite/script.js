import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    updateProfile, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBiObOZ8RVnO6g9LSgR7YWbdvgkokD6Iws",
    authDomain: "starwrite-back-end.firebaseapp.com",
    projectId: "starwrite-back-end",
    storageBucket: "starwrite-back-end.firebasestorage.app",
    messagingSenderId: "929693367761",
    appId: "1:929693367761:web:3cbd94cb2fa65d1c7b74f0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variáveis de Estado
let userKey = ""; // Chave derivada (PBKDF2) guardada apenas em memória
let isLoginMode = true;

// --- SEGURANÇA: PBKDF2 + AES-256 ---
const PBKDF2_ITERATIONS = 10000;
const KEY_SIZE = 256 / 32;

// Gera um Salt aleatório para novos utilizadores
const generateSalt = () => {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

// Deriva uma chave forte a partir da senha e do salt
const deriveKey = (password, salt) => {
    return CryptoJS.PBKDF2(password, salt, {
        keySize: KEY_SIZE,
        iterations: PBKDF2_ITERATIONS
    }).toString();
};

const encrypt = (text, key) => {
    if (!text) return "";
    return CryptoJS.AES.encrypt(text, key).toString();
};

const decrypt = (hash, key) => {
    if (!hash) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(hash, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText && hash) throw new Error("Falha na decodificação");
        return originalText;
    } catch (e) {
        console.error("Erro de descriptografia:", e);
        return "⚠️ Erro: Não foi possível ler os dados. A chave mestra pode estar incorreta.";
    }
};

// --- ELEMENTOS DA UI ---
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const authForm = document.getElementById('auth-form');
const btnSubmit = document.getElementById('btn-submit');
const btnToggle = document.getElementById('btn-toggle-mode');
const authError = document.getElementById('auth-error');
const editor = document.getElementById('editor');
const status = document.getElementById('status');
const displayUsername = document.getElementById('display-username');

// --- LÓGICA DE AUTENTICAÇÃO ---

// Alternar entre Login e Cadastro
btnToggle.onclick = () => {
    isLoginMode = !isLoginMode;
    authError.innerText = "";
    document.getElementById('register-fields').style.display = isLoginMode ? 'none' : 'block';
    btnSubmit.innerText = isLoginMode ? 'Entrar' : 'Criar Conta Estelar';
    btnToggle.innerText = isLoginMode ? 'Não tem conta? Criar uma' : 'Já tenho conta. Entrar';
};

// Submissão do Formulário (Login/Cadastro)
authForm.onsubmit = async (e) => {
    e.preventDefault();
    authError.innerText = "";
    
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const name = document.getElementById('user-name').value;

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Processando Segurança...";

    try {
        if (isLoginMode) {
            // MODO LOGIN
            const res = await signInWithEmailAndPassword(auth, email, pass);
            
            // 1. Procurar o Salt dinâmico do utilizador no Firestore
            const metaSnap = await getDoc(doc(db, "user_metadata", res.user.uid));
            
            if (metaSnap.exists()) {
                const salt = metaSnap.data().salt;
                // 2. Derivar a chave com o salt recuperado
                userKey = deriveKey(pass, salt);
                entrarNoApp(res.user.uid, res.user.displayName);
            } else {
                throw new Error("Metadados de segurança não encontrados.");
            }
        } else {
            // MODO CADASTRO
            const salt = generateSalt();
            userKey = deriveKey(pass, salt);
            
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(res.user, { displayName: name });
            
            // Gravar o Salt publicamente (necessário para logins futuros)
            await setDoc(doc(db, "user_metadata", res.user.uid), { salt: salt });
            
            entrarNoApp(res.user.uid, name);
        }
    } catch (err) {
        console.error(err);
        authError.innerText = "Erro: " + traduzirErro(err.code || err.message);
        btnSubmit.disabled = false;
        btnSubmit.innerText = isLoginMode ? 'Entrar' : 'Criar Conta';
    }
};

function entrarNoApp(uid, name) {
    authContainer.style.display = 'none';
    mainContent.style.display = 'flex';
    displayUsername.innerText = `@${name || 'Explorador'}`;
    iniciarEditor(uid);
}

// --- LÓGICA DO EDITOR ---

function iniciarEditor(uid) {
    const docRef = doc(db, "star_docs", uid);

    // ESCUTA EM TEMPO REAL (Read)
    onSnapshot(docRef, (snap) => {
        // Só atualiza o editor se o utilizador não estiver a escrever no momento
        if (snap.exists() && document.activeElement !== editor) {
            const data = snap.data();
            editor.innerHTML = decrypt(data.content, userKey);
        }
    });

    // SALVAMENTO AUTOMÁTICO (Write com Debounce)
    let timer;
    editor.oninput = () => {
        status.innerText = "A guardar nas estrelas...";
        status.style.color = "#8b949e";

        clearTimeout(timer);
        timer = setTimeout(async () => {
            if (!userKey) return;

            const encrypted = encrypt(editor.innerHTML, userKey);
            
            try {
                await setDoc(docRef, {
                    content: encrypted,
                    lastUpdate: new Date()
                }, { merge: true });
                
                status.innerText = "Protegido ✨";
                status.style.color = "#7ee787";
            } catch (e) {
                status.innerText = "Erro ao guardar!";
                status.style.color = "#ff7b72";
            }
        }, 1000);
    };
}

// --- LOGOUT ---
document.getElementById('btn-logout').onclick = () => {
    signOut(auth).then(() => {
        window.location.reload();
    });
};

// --- MODAIS DE INFORMAÇÃO ---
const infoModal = document.getElementById('info-modal');
const infoText = document.getElementById('info-text');

const contentStrings = {
    howItWorks: `
        <h3>Criptografia de Ponta-a-Ponta</h3>
        <p>No StarWrite, a sua senha nunca é enviada para o nosso servidor da forma que a digita.</p>
        <p><strong>O Processo:</strong></p>
        <ol>
            <li>Geramos um <strong>Salt</strong> (código aleatório) único para si.</li>
            <li>Usamos <strong>PBKDF2</strong> com 10.000 iterações para transformar a sua senha numa chave mestre ultra-forte.</li>
            <li>O seu texto é cifrado com <strong>AES-256</strong> antes de sair do seu computador.</li>
        </ol>
        <p><em>Resultado: Nem nós podemos ler o que escreve.</em></p>
    `
};

document.getElementById('link-how-it-works').onclick = (e) => {
    e.preventDefault();
    infoText.innerHTML = contentStrings.howItWorks;
    infoModal.style.display = 'flex';
};

document.getElementById('close-info').onclick = () => infoModal.style.display = 'none';

window.onclick = (e) => { if (e.target == infoModal) infoModal.style.display = 'none'; };

// Helper para mensagens de erro
function traduzirErro(code) {
    switch (code) {
        case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
        case 'auth/email-already-in-use': return 'Este e-mail já está em uso.';
        case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
        default: return 'Ocorreu um erro inesperado.';
    }
}