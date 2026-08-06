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
// PERSISTÊNCIA DOS DADOS
// ============================

// Salva os hábitos no navegador
function salvarHabitos() {
    localStorage.setItem("habitos", JSON.stringify(habitos));
}


// Carrega os hábitos salvos no navegador
function carregarHabitos() {
    const dadosSalvos = localStorage.getItem("habitos");

    if (!dadosSalvos) {
        return;
    }

    const habitosSalvos = JSON.parse(dadosSalvos);

    habitosSalvos.forEach(function (habito) {
        // Converte novamente o texto salvo em uma data
        habito.dataInicio = new Date(habito.dataInicio);

        habitos.push(habito);
        criarCartao(habito);
    });

    atualizarContadores();
}


// ============================
// HÁBITOS
// ============================

// Cria um novo hábito com os dados do formulário
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

    salvarHabitos();
    criarCartao(novoHabito);
    atualizarContadores();
    limparFormulario();
}


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

    if (cartao) {
        cartao.remove();
    }
}


// ============================
// INTERFACE
// ============================

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


// Atualiza o tempo de todos os hábitos
function atualizarContadores() {
    const agora = new Date();

    habitos.forEach(function (habito) {
        const diferenca = agora - habito.dataInicio;
        const segundosTotais = Math.floor(diferenca / 1000);

        const dias = Math.floor(segundosTotais / 86400);
        const horas = Math.floor((segundosTotais % 86400) / 3600);
        const minutos = Math.floor((segundosTotais % 3600) / 60);
        const segundos = segundosTotais % 60;

        const elementoDias = document.getElementById(`dias-${habito.id}`);
        const elementoHoras = document.getElementById(`horas-${habito.id}`);
        const elementoMinutos = document.getElementById(`minutos-${habito.id}`);
        const elementoSegundos = document.getElementById(`segundos-${habito.id}`);

        if (!elementoDias) {
            return;
        }

        elementoDias.textContent =
            `${dias} ${dias === 1 ? "dia" : "dias"}`;

        elementoHoras.textContent =
            `${horas} ${horas === 1 ? "hora" : "horas"}`;

        elementoMinutos.textContent =
            `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;

        elementoSegundos.textContent =
            `${segundos} ${segundos === 1 ? "segundo" : "segundos"}`;
    });
}


// Limpa o formulário após criar um hábito
function limparFormulario() {
    campoNome.value = "";
    campoData.value = "";
    campoHora.value = "";
}


// ============================
// EVENTOS
// ============================

// Identifica ações realizadas dentro dos cartões
function tratarCliqueNosCartoes(evento) {
    if (!evento.target.classList.contains("btn-excluir")) {
        return;
    }

    const cartao = evento.target.closest(".habit-card");

    if (!cartao) {
        return;
    }

    const idHabito = Number(
        cartao.id.replace("habito-", "")
    );

    excluirHabito(idHabito);
}


// Registra os eventos usados pela aplicação
function registrarEventos() {
    botaoAdicionar.addEventListener("click", adicionarHabito);
    listaHabitos.addEventListener("click", tratarCliqueNosCartoes);
}


// ============================
// INICIALIZAÇÃO
// ============================

// Prepara a aplicação quando a página é aberta
function iniciarAplicacao() {
    registrarEventos();
    carregarHabitos();
    setInterval(atualizarContadores, 1000);
}

iniciarAplicacao();