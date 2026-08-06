// ============================
// ELEMENTOS DA TELA
// ============================

const campoNome = document.getElementById("nome-habito");
const campoData = document.getElementById("data-inicio");
const campoHora = document.getElementById("hora-inicio");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaHabitos = document.getElementById("lista-habitos");


// ============================
// DADOS DO PROJETO
// ============================

const habitos = [];


// ============================
// SALVAMENTO DOS DADOS
// ============================

// Salva todos os hábitos no navegador
function salvarHabitos() {
    localStorage.setItem("habitos", JSON.stringify(habitos));
}


// ============================
// EVENTOS
// ============================

botaoAdicionar.addEventListener("click", adicionarHabito);


// ============================
// FUNÇÕES
// ============================

// Cria um novo hábito a partir dos dados do formulário
function adicionarHabito() {
    const nome = campoNome.value.trim();
    const data = campoData.value;
    const hora = campoHora.value || "00:00";

    if (nome === "" || data === "") {
        alert("Preencha o nome e a data de início.");
        return;
    }

    const dataInicio = new Date(`${data}T${hora}`);
    const agora = new Date();

    if (dataInicio > agora) {
        alert("A data de início não pode estar no futuro.");
        return;
    }

    const novoHabito = {
        id: Date.now(),
        nome: nome,
        dataInicio: dataInicio
    };

    habitos.push(novoHabito);

    // Salva o novo hábito no navegador
    salvarHabitos();

    criarCartao(novoHabito);
}


// ============================
// CARREGAMENTO DOS DADOS
// ============================

// Carrega os hábitos salvos no navegador
function carregarHabitos() {

    const dadosSalvos = localStorage.getItem("habitos");

    // Se não existir nada salvo, encerra a função
    if (!dadosSalvos) {
        return;
    }

    const habitosSalvos = JSON.parse(dadosSalvos);

    habitosSalvos.forEach(function (habito) {

        // O LocalStorage transforma datas em texto.
        // Precisamos converter novamente para Date.
        habito.dataInicio = new Date(habito.dataInicio);

        habitos.push(habito);

        criarCartao(habito);
    });

    atualizarContadores();
}


// Cria visualmente o cartão de um hábito
function criarCartao(habito) {
    const cartao = document.createElement("section");

    cartao.classList.add("habit-card");
    cartao.id = `habito-${habito.id}`;

    cartao.innerHTML = `
        <h2>🎯 Sem ${habito.nome}</h2>

        <div class="contador">
            <span id="dias-${habito.id}">0 dias</span>
            <span id="horas-${habito.id}">0 horas</span>
            <span id="minutos-${habito.id}">0 minutos</span>
            <span id="segundos-${habito.id}">0 segundos</span>
        </div>

        <p class="inicio">
            Iniciado em: ${habito.dataInicio.toLocaleString("pt-BR")}
        </p>

        <div class="acoes">
            <button class="btn-excluir">
                🗑 Excluir
            </button>
        </div>
    `;

    listaHabitos.appendChild(cartao);
}


// Atualiza o tempo de todos os hábitos cadastrados
function atualizarContadores() {
    const agora = new Date();

    habitos.forEach(function (habito) {
        const diferenca = agora - habito.dataInicio;
        const segundosTotais = Math.floor(diferenca / 1000);

        const dias = Math.floor(segundosTotais / 86400);
        const horas = Math.floor((segundosTotais % 86400) / 3600);
        const minutos = Math.floor((segundosTotais % 3600) / 60);
        const segundos = segundosTotais % 60;

        document.getElementById(`dias-${habito.id}`).textContent =
            `${dias} ${dias === 1 ? "dia" : "dias"}`;

        document.getElementById(`horas-${habito.id}`).textContent =
            `${horas} ${horas === 1 ? "hora" : "horas"}`;

        document.getElementById(`minutos-${habito.id}`).textContent =
            `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;

        document.getElementById(`segundos-${habito.id}`).textContent =
            `${segundos} ${segundos === 1 ? "segundo" : "segundos"}`;
    });
}


// Limpa os campos após o hábito ser criado
function limparFormulario() {
    campoNome.value = "";
    campoData.value = "";
    campoHora.value = "";
}


// ============================
// CLIQUES NOS CARTÕES
// ============================

listaHabitos.addEventListener("click", function (evento) {
    if (evento.target.classList.contains("btn-excluir")) {
        const cartao = evento.target.closest(".habit-card");

        const idHabito = Number(
            cartao.id.replace("habito-", "")
        );

        excluirHabito(idHabito);
    }
});

// Exclui um hábito da tela, do array e do LocalStorage
function excluirHabito(idHabito) {
    const indice = habitos.findIndex(function (habito) {
        return habito.id === idHabito;
    });

    if (indice === -1) {
        return;
    }

    habitos.splice(indice, 1);

    salvarHabitos();

    const cartao = document.getElementById(`habito-${idHabito}`);
    cartao.remove();
}

// Atualiza os contadores a cada segundo
setInterval(atualizarContadores, 1000);

// Carrega os hábitos salvos quando a página abre
carregarHabitos();