// ============================
// ELEMENTOS DA TELA
// ============================

const campoNome = document.getElementById("nome-habito");
const campoData = document.getElementById("data-inicio");
const campoHora = document.getElementById("hora-inicio");

const botaoAdicionar = document.getElementById("botao-adicionar");
const botaoCancelar = document.getElementById("botao-cancelar");

const listaHabitos = document.getElementById("lista-habitos");
const estadoVazio = document.getElementById("estado-vazio");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const mensagemModal = document.getElementById("mensagem-modal");
const botaoCancelarModal = document.getElementById("btn-cancelar-modal");
const botaoConfirmarModal = document.getElementById("btn-confirmar-modal");
const campoOrdenacao = document.getElementById("ordem-habitos");
const campoBusca = document.getElementById("busca-habitos");


// ============================
// DADOS DO PROJETO
// ============================

const habitos = [];

let idHabitoPendente = null;
let idHabitoEmEdicao = null;


// ============================
// FUNÇÕES AUXILIARES
// ============================

// Busca um hábito pelo identificador
function buscarHabito(idHabito) {
    return habitos.find(function (habito) {
        return habito.id === idHabito;
    });
}


// Retorna os valores atuais do formulário
function obterDadosFormulario() {
    return {
        nome: campoNome.value.trim(),
        data: campoData.value,
        hora: campoHora.value || "00:00"
    };
}


// Define se o formulário está criando ou editando um hábito
function definirModoEdicao(estaEditando) {
    botaoAdicionar.textContent = estaEditando
        ? "Salvar alterações"
        : "Adicionar hábito";

    botaoCancelar.classList.toggle("oculto", !estaEditando);
}


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
        atualizarEstadoVazio();
        return;
    }

    const habitosSalvos = JSON.parse(dadosSalvos);

    habitosSalvos.forEach(function (habito) {
        habito.dataInicio = new Date(habito.dataInicio);
        habitos.push(habito);
    });

    ordenarHabitos();
    renderizarHabitos();
}

// Salva a opção de ordenação escolhida
function salvarOrdenacao() {
    localStorage.setItem(
        "ordem-habitos",
        campoOrdenacao.value
    );
}


// Carrega a opção de ordenação salva
function carregarOrdenacao() {
    const ordemSalva = localStorage.getItem("ordem-habitos");

    if (!ordemSalva) {
        return;
    }

    campoOrdenacao.value = ordemSalva;
}


// ============================
// HÁBITOS
// ============================

// Cria ou atualiza um hábito usando os dados do formulário
function adicionarHabito() {
    const { nome, data, hora } = obterDadosFormulario();

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
        nome,
        dataInicio
    };

    habitos.push(novoHabito);

    ordenarHabitos();
    salvarHabitos();
    renderizarHabitos();
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

    atualizarEstadoVazio();
}


// Abre o modal de confirmação para reiniciar um hábito
function reiniciarHabito(idHabito) {
    const habito = buscarHabito(idHabito);

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
    const habito = buscarHabito(idHabitoPendente);

    if (!habito) {
        fecharModal();
        return;
    }

    habito.dataInicio = new Date();

    salvarHabitos();
    atualizarCartao(habito);
    atualizarContadores();
    fecharModal();
}


// Preenche o formulário com os dados do hábito selecionado
function prepararEdicao(idHabito) {
    const habito = buscarHabito(idHabito);

    if (!habito) {
        return;
    }

    campoNome.value = habito.nome;

    campoData.value = habito.dataInicio
        .toLocaleDateString("en-CA");

    campoHora.value = habito.dataInicio
        .toTimeString()
        .slice(0, 5);

    idHabitoEmEdicao = idHabito;
    definirModoEdicao(true);

    campoNome.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoNome.focus();
}


// Salva as alterações feitas em um hábito existente
function salvarEdicao(nome, dataInicio) {
    const habito = buscarHabito(idHabitoEmEdicao);

    if (!habito) {
        cancelarEdicao();
        return;
    }

    habito.nome = nome;
    habito.dataInicio = dataInicio;

    salvarHabitos();
    ordenarHabitos();
    renderizarHabitos();s
    cancelarEdicao();
}


// Cancela a edição atual
function cancelarEdicao() {
    idHabitoEmEdicao = null;

    limparFormulario();
    definirModoEdicao(false);
}


// ============================
// INTERFACE
// ============================

// Cria visualmente o cartão de um hábito
function criarCartao(habito) {
    const cartao = document.createElement("section");

    cartao.classList.add("habit-card");
    cartao.id = `habito-${habito.id}`;

    cartao.innerHTML = gerarConteudoCartao(habito);

    listaHabitos.appendChild(cartao);
}


// Gera o conteúdo HTML de um cartão
function gerarConteudoCartao(habito) {
    return `
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
            <button
                type="button"
                class="btn-editar"
            >
                ✏️ Editar
            </button>

            <button
                type="button"
                class="btn-reiniciar"
            >
                🔄 Reiniciar
            </button>

            <button
                type="button"
                class="btn-excluir"
            >
                🗑 Excluir
            </button>
        </div>
    `;
}


// Atualiza visualmente um cartão existente
function atualizarCartao(habito) {
    const cartao = document.getElementById(`habito-${habito.id}`);

    if (!cartao) {
        criarCartao(habito);
        return;
    }

    cartao.innerHTML = gerarConteudoCartao(habito);
}


// Atualiza o tempo de todos os hábitos
function atualizarContadores() {
    const agora = new Date();

    habitos.forEach(function (habito) {
        const elementosContador = obterElementosContador(habito.id);

        if (!elementosContador) {
            return;
        }

        const tempo = calcularTempoDecorrido(
            habito.dataInicio,
            agora
        );

        elementosContador.dias.textContent =
            formatarUnidade(tempo.dias, "dia", "dias");

        elementosContador.horas.textContent =
            formatarUnidade(tempo.horas, "hora", "horas");

        elementosContador.minutos.textContent =
            formatarUnidade(tempo.minutos, "minuto", "minutos");

        elementosContador.segundos.textContent =
            formatarUnidade(tempo.segundos, "segundo", "segundos");
    });
}


// Calcula o tempo decorrido desde uma data
function calcularTempoDecorrido(dataInicio, dataAtual) {
    const diferenca = dataAtual - dataInicio;
    const segundosTotais = Math.max(
        0,
        Math.floor(diferenca / 1000)
    );

    return {
        dias: Math.floor(segundosTotais / 86400),
        horas: Math.floor((segundosTotais % 86400) / 3600),
        minutos: Math.floor((segundosTotais % 3600) / 60),
        segundos: segundosTotais % 60
    };
}


// Busca os elementos visuais do contador
function obterElementosContador(idHabito) {
    const dias = document.getElementById(`dias-${idHabito}`);
    const horas = document.getElementById(`horas-${idHabito}`);
    const minutos = document.getElementById(`minutos-${idHabito}`);
    const segundos = document.getElementById(`segundos-${idHabito}`);

    if (!dias || !horas || !minutos || !segundos) {
        return null;
    }

    return {
        dias,
        horas,
        minutos,
        segundos
    };
}


// Formata singular e plural
function formatarUnidade(valor, singular, plural) {
    return `${valor} ${valor === 1 ? singular : plural}`;
}


// Limpa o formulário
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


// Mostra a mensagem adequada quando nenhum cartão está visível
function atualizarEstadoVazio(habitosFiltrados = habitos) {
    const listaEstaVazia = habitos.length === 0;
    const buscaSemResultado =
        habitos.length > 0 && habitosFiltrados.length === 0;

    if (!listaEstaVazia && !buscaSemResultado) {
        estadoVazio.classList.add("oculto");
        return;
    }

    const titulo = estadoVazio.querySelector("p");
    const descricao = estadoVazio.querySelector("small");

    if (buscaSemResultado) {
        titulo.textContent = "Nenhum hábito encontrado.";
        descricao.textContent = "Tente pesquisar usando outro nome.";
    } else {
        titulo.textContent = "Nenhum hábito cadastrado.";
        descricao.textContent =
            "Adicione seu primeiro hábito para começar.";
    }

    estadoVazio.classList.remove("oculto");
}

// Ordena os hábitos conforme a opção selecionada
function ordenarHabitos() {
    if (campoOrdenacao.value === "mais-recente") {
        habitos.sort(function (habitoA, habitoB) {
            return habitoB.dataInicio - habitoA.dataInicio;
        });

        return;
    }

    habitos.sort(function (habitoA, habitoB) {
        return habitoA.dataInicio - habitoB.dataInicio;
    });
}

// Redesenha todos os cartões na ordem atual do array
function renderizarHabitos() {
    listaHabitos.innerHTML = "";

    const habitosFiltrados = filtrarHabitos();

    habitosFiltrados.forEach(function (habito) {
        criarCartao(habito);
    });

    atualizarContadores();
    atualizarEstadoVazio(habitosFiltrados);
}

// Retorna os hábitos que correspondem à busca
function filtrarHabitos() {
    const termoBusca = campoBusca.value
        .trim()
        .toLowerCase();

    if (termoBusca === "") {
        return habitos;
    }

    return habitos.filter(function (habito) {
        return habito.nome
            .toLowerCase()
            .includes(termoBusca);
    });
}

// ============================
// EVENTOS
// ============================

// Identifica ações realizadas dentro dos cartões
function tratarCliqueNosCartoes(evento) {
    const botaoClicado = evento.target.closest("button");
    const cartao = evento.target.closest(".habit-card");

    if (!botaoClicado || !cartao) {
        return;
    }

    const idHabito = Number(
        cartao.id.replace("habito-", "")
    );

    if (botaoClicado.classList.contains("btn-excluir")) {
        excluirHabito(idHabito);
        return;
    }

    if (botaoClicado.classList.contains("btn-reiniciar")) {
        reiniciarHabito(idHabito);
        return;
    }

    if (botaoClicado.classList.contains("btn-editar")) {
        prepararEdicao(idHabito);
    }
}


// Registra os eventos usados pela aplicação
function registrarEventos() {
    botaoAdicionar.addEventListener("click", adicionarHabito);
    botaoCancelar.addEventListener("click", cancelarEdicao);

    listaHabitos.addEventListener(
        "click",
        tratarCliqueNosCartoes
    );

    botaoCancelarModal.addEventListener(
        "click",
        fecharModal
    );

    botaoConfirmarModal.addEventListener(
        "click",
        confirmarReinicio
    );

    campoOrdenacao.addEventListener("change", function () {
        salvarOrdenacao();
        ordenarHabitos();
        renderizarHabitos();
    });

    campoBusca.addEventListener("input", renderizarHabitos);
}


// ============================
// INICIALIZAÇÃO
// ============================

// Prepara a aplicação quando a página é aberta
function iniciarAplicacao() {
    registrarEventos();
    carregarOrdenacao();
    carregarHabitos();
    definirModoEdicao(false);

    setInterval(atualizarContadores, 1000);
}

iniciarAplicacao();