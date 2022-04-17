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