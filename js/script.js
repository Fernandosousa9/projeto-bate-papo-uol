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

const opcoes = document.getElementById("outro-container");
const sobrepor = document.getElementById("sobrepor");
const barralateral = document.getElementById("barra-lateral");

//Botão de login
function cliqueLogin() {
    const nomeUsuario = document.getElementById("nomeUsuario").value;
    solicitaNomeUsuario(nomeUsuario);
    document.addEventListener("click", clique);
}

function clique(event) {
    let item;
    if (event.target.id !== "") {
        item = event.target.id;
    } else if (event.target.classList.contains("click")) {
        item = event.target.parentNode.parentNode.id;
    }
    switch (item) {
        case "usuarios":
            escolheUsuario(event.target.parentNode);
            break;
        case "privacidade":
            selecionarPrivacidade(event.target.parentNode);
            break;
        default:
            break;
    }
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

//esconde a tela de inicio
function escondeTelaLogin() {
    const tela = document.getElementById("tela-inicial")
    tela.style.opacity = 0
    setTimeout(function () {
        tela.classList.add("escondido")
    }, 500)
}

//loop que pega novas as mensasgens a cada 5s
function mensagemLoop() {
    pegarMensagens()
    setInterval(pegarMensagens, 3000);
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
                        <span class="usuario">${arrayMensagem[i].from}</span> 
                        ${arrayMensagem[i].text}</li>`
                    mensagens += message
                    break;
                case "message":
                    message = `
                        <li><span class="time">(${arrayMensagem[i].time})</span> 
                        <span class="usuario">${arrayMensagem[i].from}</span> para 
                        <span class="usuario">${arrayMensagem[i].to}</span>: ${arrayMensagem[i].text}</li>`
                    mensagens += message
                    break;
                case "private_message":
                    if (arrayMensagem[i].to === "Todos" || arrayMensagem[i].to === nome.name || arrayMensagem[i].from === nome.name) {
                        message = `
                            <li class="private"><span class="time">(${arrayMensagem[i].time})</span> 
                            <span class="usuario">${arrayMensagem[i].from}</span>
                            reservadamente para <span class="usuario">${arrayMensagem[i].to}</span>: 
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

//ver os participantes que entraram
function usuariosLoop() {
    pegarUsuarios()
    setInterval(pegarUsuarios, 5000);
}

//pega a lista de participantes
function pegarUsuarios() {
    const usuarios = axios.get(url);
    usuarios.then(renderUsuarios);
}

//renderiza os participantes
function renderUsuarios(response) {
    const arrayUsuarios = response.data
    usuariosOnline(arrayUsuarios);
    let participant;
    let addclass = "check escondido";
    if (mensagemEnviar.to === "Todos") {
        addclass = "check"
    }
    let userHTML = `
    <li>
        <div class="click"></div>
        <ion-icon name="people"></ion-icon>
        <span class="usuario">Todos</span>
        <p class="${addclass}"><ion-icon name="checkmark"></ion-icon></p>
    </li>`
    for (let i = 0; i < arrayUsuarios.length; i++) {
        if (arrayUsuarios[i].name === mensagemEnviar.to) {
            addclass = "check"
        } else {
            addclass = "check escondido"
        }
        participant = `
                <li>
                    <div class="click"></div>
                    <ion-icon name="person-circle"></ion-icon>
                    <span class="usuario">${arrayUsuarios[i].name}</span>
                    <p class="${addclass}"><ion-icon name="checkmark"></ion-icon></p>
                </li>`
        userHTML += participant;
    }
    const usuarios = document.getElementById("usuarios");
    usuarios.innerHTML = userHTML;
}
//ver os participantes que estão online
function usuariosOnline(arrayUsuarios) {
    const continuaConectado = arrayUsuarios.find(usuarios => usuarios.name === mensagemEnviar.to);
    if (continuaConectado === undefined) {
        mensagemEnviar.to = "Todos"
        mensagemEnviar.type = "message"
        atualizaEnvio();
    }
}

//manter usuário online
function manterOnline() {
    setInterval(function () {
        axios.post(urlStatus, nome);
    }, 5000);
}

//enviar menssagem
function enviarMensagem() {
    const mensagemDigitada = document.getElementById("message")
    if (mensagemDigitada.value !== "" && mensagemDigitada.value !== undefined) {
        mensagemEnviar.text = mensagemDigitada.value
        promise = axios.post(urlMessages, mensagemEnviar);
        promise.then(pegarMensagens);
        promise.catch(function () {
            window.location.reload()
        });
        mensagemDigitada.value = "";
        mensagemDigitada.focus();
    }
}


//seleciona a privacidade
function selecionarPrivacidade(privacidade) {
    const checa = document.querySelectorAll("#privacidade li p.check")
    if (privacidade.innerText === "Reservadamente") {
        mensagemEnviar.type = "private_message";
        checa[0].classList.add("escondido")
        checa[1].classList.remove("escondido")
    } else {
        mensagemEnviar.type = "message";
        checa[1].classList.add("escondido")
        checa[0].classList.remove("escondido")
    }
    atualizaEnvio()
}

//mostra a barra lateral
function mostraBarraLateral(event) {
    opcoes.classList.remove("escondido");
    sobrepor.classList.remove("escondido")
    barralateral.style.right = "0";
        
}

function ocultarBarraLateral(){
    sobrepor.classList.add("escondido")
    barralateral.style.right = "-250px"
    opcoes.classList.add("escondido");
}

//seleciona participante
function escolheUsuario(user) {
    mensagemEnviar.to = user.innerText;
    atualiza(user);
    atualizaEnvio();
}

//atualiza checagem
function atualiza(user) {
    const participante = user.parentNode.querySelector("li p.check:not(.escondido)")
    participante.classList.add("escondido")
    user.querySelector("p.check").classList.remove("escondido");
}

//seleciona o tipo de envio da privacidade
function atualizaEnvio() {
    const envio = document.getElementById("mensagem-info")
    if (mensagemEnviar.type == "message") {
        envio.innerText = `Enviando para ${mensagemEnviar.to} (Público)`
    } else {
        envio.innerText = `Enviando para ${mensagemEnviar.to} (Reservadamente)`

    }
}

//Logout
function sair(){
    location.reload();
}


//Tratar caso sucesso
function tratarSucesso() {
    mensagemEnviar.from = nome.name;
    escondeTelaLogin();
    mensagemLoop();
    usuariosLoop()
    manterOnline();
}


//caso erro
function tratarErro(error) {
    carregaTela()
    const nomeUsuarioDigitado = document.getElementById("nomeUsuario");
    nomeUsuarioDigitado.value = "";
    nomeUsuarioDigitado.focus();
    document.getElementById("entrar").classList.remove("active")
    document.querySelector("#tela-inicial .aviso").classList.remove("esconde");
}