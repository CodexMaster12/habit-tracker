// ============================
// ELEMENTOS DA TELA
// ============================

const campoNome = document.getElementById("nome-habito");
const campoData = document.getElementById("data-inicio");
const campoHora = document.getElementById("hora-inicio");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaHabitos = document.getElementById("lista-habitos");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const mensagemModal = document.getElementById("mensagem-modal");
const botaoCancelarModal = document.getElementById("btn-cancelar-modal");
const botaoConfirmarModal = document.getElementById("btn-confirmar-modal");


// ============================
// DADOS DO PROJETO
// ============================

const habitos = [];

let idHabitoPendente = null;
let idHabitoEmEdicao = null;


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

    if (idHabitoEmEdicao !== null) {
        salvarEdicao(nome, dataInicio);
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


// Abre o modal de confirmação para reiniciar um hábito
function reiniciarHabito(idHabito) {
    const habito = habitos.find(function (habito) {
        return habito.id === idHabito;
    });

    if (!habito) {
        return;
    }

    idHabitoPendente = idHabito;

    mensagemModal.textContent =
        `Deseja reiniciar a contagem de "${habito.nome}" a partir de agora?`;

    modalConfirmacao.classList.remove("oculto");
}


// Confirma o reinício do hábito selecionado
function confirmarReinicio() {
    const habito = habitos.find(function (habito) {
        return habito.id === idHabitoPendente;
    });

    if (!habito) {
        fecharModal();
        return;
    }

    habito.dataInicio = new Date();

    salvarHabitos();

    const cartao = document.getElementById(`habito-${habito.id}`);

    if (cartao) {
        const textoInicio = cartao.querySelector(".inicio");

        textoInicio.textContent =
            `Iniciado em: ${habito.dataInicio.toLocaleString("pt-BR")}`;
    }

    atualizarContadores();
    fecharModal();
}

// Preenche o formulário com os dados do hábito selecionado
function prepararEdicao(idHabito) {
    const habito = habitos.find(function (habito) {
        return habito.id === idHabito;
    });

    if (!habito) {
        return;
    }

    campoNome.value = habito.nome;

    campoData.value = habito.dataInicio
        .toLocaleDateString("en-CA");

    campoHora.value = habito.dataInicio
        .toTimeString()
        .slice(0, 5);

    campoNome.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoNome.focus();
    
    idHabitoEmEdicao = idHabito;

    botaoAdicionar.textContent = "Salvar alterações";
}

// Salva as alterações feitas em um hábito existente
function salvarEdicao(nome, dataInicio) {
    const habito = habitos.find(function (habito) {
        return habito.id === idHabitoEmEdicao;
    });

    if (!habito) {
        return;
    }

    habito.nome = nome;
    habito.dataInicio = dataInicio;

    salvarHabitos();

    const cartaoAntigo = document.getElementById(
        `habito-${habito.id}`
    );

    if (cartaoAntigo) {
        cartaoAntigo.remove();
    }

    criarCartao(habito);
    atualizarContadores();
    limparFormulario();

    idHabitoEmEdicao = null;
    botaoAdicionar.textContent = "Adicionar hábito";
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

            <button class="btn-editar">
                ✏️ Editar
            </button>

            <button class="btn-reiniciar">
                🔄 Reiniciar
            </button>

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


// Fecha o modal sem realizar alterações
function fecharModal() {
    modalConfirmacao.classList.add("oculto");
    idHabitoPendente = null;
}


// ============================
// EVENTOS
// ============================

// Identifica ações realizadas dentro dos cartões
function tratarCliqueNosCartoes(evento) {
    const cartao = evento.target.closest(".habit-card");

    if (!cartao) {
        return;
    }

    const idHabito = Number(
        cartao.id.replace("habito-", "")
    );

    if (evento.target.classList.contains("btn-excluir")) {
        excluirHabito(idHabito);
    }

    if (evento.target.classList.contains("btn-reiniciar")) {
        reiniciarHabito(idHabito);
    }

    if (evento.target.classList.contains("btn-editar")) {
        prepararEdicao(idHabito);
    }
}


// Registra os eventos usados pela aplicação
function registrarEventos() {
    botaoAdicionar.addEventListener("click", adicionarHabito);
    listaHabitos.addEventListener("click", tratarCliqueNosCartoes);

    botaoCancelarModal.addEventListener("click", fecharModal);
    botaoConfirmarModal.addEventListener("click", confirmarReinicio);
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