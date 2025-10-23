// ⚡ Endereço do WebSocket (troque pelo IP do ESP)
const ENDERECO_WS = "192.1168.1.114";

// Pegando elementos do HTML
const statusConexao = document.getElementById("status"); // cria um span lá no HTML se quiser
const selectEmocao = document.getElementById("emocao"); // seu select único
const selectEssencia = document.querySelector("#programar select");
const inputHorario = document.querySelector("#programar input[type='time']");
const btnProgramar = document.querySelector("#programar button");
const logMensagens = document.getElementById("raw"); // opcional para debug

let conexaoWs;

// --- FUNÇÕES DE UI ---
function atualizarUiConectado() {
    if(statusConexao) {
        statusConexao.textContent = "Conectado ao ESP";
        statusConexao.className = "ok";
    }
}

function atualizarUiDesconectado(texto = "Desconectado") {
    if(statusConexao) {
        statusConexao.textContent = texto;
        statusConexao.className = "bad";
    }
}

// --- FUNÇÃO DE CONEXÃO ---
function conectar() {
    conexaoWs = new WebSocket(ENDERECO_WS);

    conexaoWs.onopen = () => atualizarUiConectado();
    conexaoWs.onerror = () => atualizarUiDesconectado("Erro");
    conexaoWs.onclose = () => { 
        atualizarUiDesconectado();
        setTimeout(conectar, 1200); // tenta reconectar
    }

    conexaoWs.onmessage = (evento) => {
        logMensagens && (logMensagens.textContent = evento.data);
        console.log("Mensagem recebida do ESP:", evento.data);
    }
}

// --- FUNÇÃO PARA ENVIAR JSON ---
function enviarObjetoJson(objeto) {
    if (!conexaoWs || conexaoWs.readyState !== WebSocket.OPEN) {
        alert("ESP32 não conectado!");
        return;
    }
    const mensagem = JSON.stringify(objeto);
    conexaoWs.send(mensagem);
    console.log("Enviado pro ESP:", mensagem);
}

// --- MAPA HUMOR → ESSÊNCIA ---
function escolherEssencia(humor) {
    humor = humor.toLowerCase();
    if(humor.includes("ansiosa") || humor.includes("com sono")) return "Lavanda";
    if(humor.includes("estressada") || humor.includes("irritada")) return "Alecrim";
    if(humor.includes("sem foco") || humor.includes("congestionada") || humor.includes("empolgada")) return "Hortelã e pimenta";
    return "Lavanda"; // padrão
}

// --- FUNÇÃO CHAMADA PELO BOTÃO DO HTML ---
function registrarHumor() {
    const humor = selectEmocao.value;
    const horario = document.getElementById('horarioEmocao').value;

    if(humor === "Selecione...") {
        alert("Escolha um humor antes de registrar!");
        return;
    }

    const essenciaEscolhida = escolherEssencia(humor);
    selectEssencia.value = essenciaEscolhida;

    // envia JSON pro ESP
    enviarObjetoJson({ essencia: essenciaEscolhida, horario });

    alert(`✨ Registro enviado!\nHumor: ${humor}\nEssência: ${essenciaEscolhida}\nHorário: ${horario}`);
}

// --- EVENTO DO BOTÃO PROGRAMAR ---
btnProgramar.onclick = () => {
    const essencia = selectEssencia.value;
    const horario = inputHorario.value;

    if(essencia === "Selecione...") {
        alert("Escolha uma essência primeiro!");
        return;
    }
    if(!horario) {
        alert("Escolha um horário!");
        return;
    }

    // envia JSON pro ESP
    enviarObjetoJson({ essencia, horario });
    alert(`Essência "${essencia}" programada para ${horario}!`);
}

// --- INICIAR ---
conectar();
