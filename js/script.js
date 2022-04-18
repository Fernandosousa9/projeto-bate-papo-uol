const url = "https://mock-api.driven.com.br/api/v6/uol/participants";
const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";

const nome = {};
const mensagemEnviar = {
    from: "",
    to: "Todos",
    text: "",
    type: "message" // ou "private_message" para o bônus
};
let ultimaMensagem;

function clique(event) {
    let item;
    if (event.target.id !== "") {
        item = event.target.id;
    } else if (event.target.classList.contains("click")) {
        item = event.target.parentNode.parentNode.id;
    }
    switch (item) {
        case "people":
            mostraBarraLateral(true);
            break;
        case "participants":
            escolheUsuario(event.target.parentNode);
            break;
        case "privacidade":
            selecionarPrivacidade(event.target.parentNode);
            break;
        case "sobrepor":
            mostraBarraLateral(false);
            break;
        default:
            break;
    }
}

//Botão de login
function cliqueLogin() {
    const nomeUsuario = document.getElementById("nomeUsuario").value;
    solicitaNomeUsuario(nomeUsuario);
    document.addEventListener("click", clique);
}

//verifica se o nome digitado já existe
function checarNomeDigitado(evt) {
    const login = document.getElementById("entrar")
    if (evt.target.value === undefined || evt.target.value === "") {
        login.classList.remove("active")
    } else {
        login.classList.add("active")
        
    }
    document.querySelector("#tela-inicial .aviso").classList.add("soft-hidden");
}

//manda o nome do usuario
function solicitaNomeUsuario(usuario) {
    nome.name = usuario
    const nomeUsuario = axios.post(url, nome);
    nomeUsuario.then(function () { tratarSucesso() });
    nomeUsuario.catch(tratarErro)
    carregaTela();
}

//carrega a tela após login
function carregaTela() {
    elementosIniciais = document.querySelectorAll("#tela-inicial > *:not(.logo, .escondido)")
    carregaElementos = document.querySelectorAll("#tela-inicial > .escondido:not(.logo)")
    elementosIniciais.forEach(element => {
        element.classList.add("escondido")
    });
    carregaElementos.forEach(element => {
        element.classList.remove("escondido")
    });
}

//Tratar caso sucesso
function tratarSucesso() {
    mensagemEnviar.from = nome.name;
    escondeTelaLogin();
    mensagemLoop();
}

//esconde a tela de inicio
function escondeTelaLogin() {
    const loginScreen = document.getElementById("tela-inicial")
    loginScreen.style.opacity = 0
    setTimeout(function () {
        loginScreen.classList.add("escondido")
    }, 500)
}

//loop que pega novas as mensasgens a cada 5s
function mensagemLoop() {
    pegarMensagens()
    setInterval(pegarMensagens, 5000);
}

//requisição de mensagem
function pegarMensagens() {
    const promise = axios.get(urlMessages);
    promise.then(renderMessages);
}

//renderiza mensagem
function renderMessages(response) {
    let mensagens = ""
    let message;
    const arrayMensagem = response.data
    const mensagensNovas = (JSON.stringify(arrayMensagem) !== JSON.stringify(ultimaMensagem))
    if (ultimaMensagem === undefined || mensagensNovas) {
        for (let i = 0; i < arrayMensagem.length; i++) {
            switch (arrayMensagem[i].type) {
                case "status":
                    message = `
                        <li class="status">
                        <span class="time">(${arrayMensagem[i].time})</span> 
                        <span class="participant">${arrayMensagem[i].from}</span> 
                        ${arrayMensagem[i].text}</li>`
                    mensagens += message
                    break;
                case "message":
                    message = `
                        <li><span class="time">(${arrayMensagem[i].time})</span> 
                        <span class="participant">${arrayMensagem[i].from}</span> para 
                        <span class="participant">${arrayMensagem[i].to}</span>: ${arrayMensagem[i].text}</li>`
                    mensagens += message
                    break;
                case "private_message":
                    if (arrayMensagem[i].to === "Todos" || arrayMensagem[i].to === nome.name || arrayMensagem[i].from === nome.name) {
                        message = `
                            <li class="private"><span class="time">(${arrayMensagem[i].time})</span> 
                            <span class="participant">${arrayMensagem[i].from}</span>
                            reservadamente para <span class="participant">${arrayMensagem[i].to}</span>: 
                            ${arrayMensagem[i].text}</li>`
                        mensagens += message
                    }
                    break;
                default:
                    break;
            }
        }
        const messages = document.getElementById("messages");
        messages.innerHTML = mensagens;
        ultimaMensagem = arrayMensagem
        messages.scrollTop = messages.scrollHeight;
    }
}
