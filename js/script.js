let mensagens = [];

//console.log(pegarMensagem());
pegarMensagem();



function pegarMensagem(){
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    //callback
    promise.then(carregarDados);
}

function carregarDados(response){
    mensagens = response.data;
    renderizarMensagens();
}

function renderizarMensagens(){
    const ulMensagens = document.querySelector(".mensagens");
    ulMensagens.innerHTML = "";

    for(let i = 0; i < mensagens.length; i++){
        ulMensagens.innerHTML += `
        <li>
            ${mensagens[i].name}
        </li>
        `;
    }
}

function adicionarMensagem(){
    const name = document.querySelector(".text-box").value;

    const novaMensagem = {
        name: name,
    };

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", novaMensagem);

    promise.then(tratarSucesso);

    promise.catch(tratarFalha);
}

function tratarFalha(){
    alert("Deu ruim");
    console.log(error.response);
}

function tratarSucesso(){
    alert("Mensagem enviada com sucesso");
}

promise.then(pegarMensagem);