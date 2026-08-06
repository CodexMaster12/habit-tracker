// ============================
// ELEMENTOS DA TELA
// ============================

import { definirModoEdicao } from "./habitos.js";
// definirModoEdicao(false);

const campoNome = document.getElementById("nome-habito");
const campoData = document.getElementById("data-inicio");
const campoHora = document.getElementById("hora-inicio");

const botaoAdicionar = document.getElementById("botao-adicionar");
const botaoCancelar = document.getElementById("botao-cancelar");

const campoBusca = document.getElementById("busca-habitos");
const campoOrdenacao = document.getElementById("ordem-habitos");

const listaHabitos = document.getElementById("lista-habitos");
const estadoVazio = document.getElementById("estado-vazio");
const totalHabitos = document.getElementById("total-habitos");

const estatisticaTotal = document.getElementById("estatistica-total");
const estatisticaMaior = document.getElementById("estatistica-maior");
const estatisticaDestaque = document.getElementById(
    "estatistica-destaque"
);

const modalConfirmacao = document.getElementById("modal-confirmacao");
const mensagemModal = document.getElementById("mensagem-modal");
const botaoCancelarModal = document.getElementById(
    "btn-cancelar-modal"
);
const botaoConfirmarModal = document.getElementById(
    "btn-confirmar-modal"
);


// ============================
// DADOS DO PROJETO
// ============================

const habitos = [];

let idHabitoPendente = null;
let idHabitoEmEdicao = null;


// ============================
// FUNÇÕES AUXILIARES
// ============================


// Formata uma data para o campo input do tipo date
function formatarDataParaInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


// Formata uma data para o campo input do tipo time
function formatarHoraParaInput(data) {
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}`;
}


// Formata singular e plural
function formatarUnidade(valor, singular, plural) {
    return `${valor} ${valor === 1 ? singular : plural}`;
}


// Evita que códigos HTML sejam inseridos pelo nome do hábito
function escaparHTML(texto) {
    const elemento = document.createElement("div");

    elemento.textContent = texto;

    return elemento.innerHTML;
}


// ============================
// PERSISTÊNCIA DOS DADOS
// ============================

// Salva todos os hábitos no navegador
function salvarHabitos() {
    localStorage.setItem(
        "habitos",
        JSON.stringify(habitos)
    );
}


// Carrega os hábitos salvos no navegador
function carregarHabitos() {
    const dadosSalvos = localStorage.getItem("habitos");

    if (!dadosSalvos) {
        renderizarHabitos();
        return;
    }

    try {
        const habitosSalvos = JSON.parse(dadosSalvos);

        habitosSalvos.forEach(function (habito) {
            const dataInicio = new Date(habito.dataInicio);

            if (Number.isNaN(dataInicio.getTime())) {
                return;
            }

            habitos.push({
                id: Number(habito.id),
                nome: String(habito.nome),
                dataInicio
            });
        });
    } catch (erro) {
        console.error(
            "Não foi possível carregar os hábitos:",
            erro
        );
    }

    ordenarHabitos();
    renderizarHabitos();
}


// Salva a opção escolhida no seletor de ordenação
function salvarOrdenacao() {
    localStorage.setItem(
        "ordem-habitos",
        campoOrdenacao.value
    );
}


// Carrega a opção de ordenação salva
function carregarOrdenacao() {
    const ordemSalva = localStorage.getItem(
        "ordem-habitos"
    );

    const ordensPermitidas = [
        "mais-antigo",
        "mais-recente"
    ];

    if (ordensPermitidas.includes(ordemSalva)) {
        campoOrdenacao.value = ordemSalva;
    }
}


// ============================
// HÁBITOS
// ============================

// Cria ou atualiza um hábito usando o formulário
function adicionarHabito() {
    const dados = obterDadosFormulario();

    if (dados.nome === "" || dados.data === "") {
        alert("Preencha o nome e a data de início.");
        return;
    }

    const dataInicio = new Date(
        `${dados.data}T${dados.hora}`
    );

    if (Number.isNaN(dataInicio.getTime())) {
        alert("Informe uma data e um horário válidos.");
        return;
    }

    if (dataInicio > new Date()) {
        alert("A data de início não pode estar no futuro.");
        return;
    }

    if (idHabitoEmEdicao !== null) {
        salvarEdicao(dados.nome, dataInicio);
        return;
    }

    const novoHabito = {
        id: Date.now(),
        nome: dados.nome,
        dataInicio
    };

    habitos.push(novoHabito);

    ordenarHabitos();
    salvarHabitos();
    renderizarHabitos();
    limparFormulario();
}


// Exclui um hábito do array, da tela e do LocalStorage
function excluirHabito(idHabito) {
    const indice = habitos.findIndex(function (habito) {
        return habito.id === idHabito;
    });

    if (indice === -1) {
        return;
    }

    habitos.splice(indice, 1);

    if (idHabitoEmEdicao === idHabito) {
        cancelarEdicao();
    }

    salvarHabitos();
    renderizarHabitos();
}


// Prepara o modal para reiniciar um hábito
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


// Confirma o reinício do contador
function confirmarReinicio() {
    const habito = buscarHabito(idHabitoPendente);

    if (!habito) {
        fecharModal();
        return;
    }

    habito.dataInicio = new Date();

    ordenarHabitos();
    salvarHabitos();
    renderizarHabitos();
    fecharModal();
}


// Preenche o formulário para editar um hábito
function prepararEdicao(idHabito) {
    const habito = buscarHabito(idHabito);

    if (!habito) {
        return;
    }

    campoNome.value = habito.nome;
    campoData.value = formatarDataParaInput(
        habito.dataInicio
    );
    campoHora.value = formatarHoraParaInput(
        habito.dataInicio
    );

    idHabitoEmEdicao = idHabito;
    definirModoEdicao(true);

    campoNome.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoNome.focus();
}


// Salva as alterações de um hábito existente
function salvarEdicao(nome, dataInicio) {
    const habito = buscarHabito(idHabitoEmEdicao);

    if (!habito) {
        cancelarEdicao();
        return;
    }

    habito.nome = nome;
    habito.dataInicio = dataInicio;

    ordenarHabitos();
    salvarHabitos();
    cancelarEdicao();
    renderizarHabitos();
}


// Cancela o modo de edição
function cancelarEdicao() {
    idHabitoEmEdicao = null;

    limparFormulario();
    definirModoEdicao(false);
}


// ============================
// INTERFACE
// ============================

// Cria visualmente um cartão
function criarCartao(habito) {
    const cartao = document.createElement("section");

    cartao.classList.add("habit-card");
    cartao.id = `habito-${habito.id}`;
    cartao.innerHTML = gerarConteudoCartao(habito);

    listaHabitos.appendChild(cartao);
}


// Gera o HTML interno de um cartão
function gerarConteudoCartao(habito) {
    const nomeSeguro = escaparHTML(habito.nome);

    return `
        <h2>🎯 Sem ${nomeSeguro}</h2>

        <div class="contador">
            <span id="dias-${habito.id}">0 dias</span>
            <span id="horas-${habito.id}">0 horas</span>
            <span id="minutos-${habito.id}">0 minutos</span>
            <span id="segundos-${habito.id}">0 segundos</span>
        </div>

        <div class="progresso-marco">
            <div class="progresso-texto">
                <span id="marco-texto-${habito.id}">
                    Calculando próximo marco...
                </span>

                <strong id="marco-valor-${habito.id}">
                    0%
                </strong>
            </div>

            <div class="barra-progresso">
                <div
                    id="barra-${habito.id}"
                    class="barra-preenchimento"
                ></div>
            </div>
        </div>

        <p class="inicio">
            Iniciado em:
            ${habito.dataInicio.toLocaleString("pt-BR")}
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


// Redesenha todos os cartões na ordem atual
function renderizarHabitos() {
    listaHabitos.innerHTML = "";

    const habitosFiltrados = filtrarHabitos();

    habitosFiltrados.forEach(function (habito) {
        criarCartao(habito);
    });

    atualizarContadores();
    atualizarEstadoVazio(habitosFiltrados);
    atualizarResumo(habitosFiltrados);
    atualizarEstatisticas();
}


// Limpa os campos do formulário
function limparFormulario() {
    campoNome.value = "";
    campoData.value = "";
    campoHora.value = "";
}


// Mostra a mensagem adequada quando não há cartões
function atualizarEstadoVazio(habitosFiltrados = habitos) {
    const listaEstaVazia = habitos.length === 0;

    const buscaSemResultado =
        habitos.length > 0 &&
        habitosFiltrados.length === 0;

    if (!listaEstaVazia && !buscaSemResultado) {
        estadoVazio.classList.add("oculto");
        return;
    }

    const titulo = estadoVazio.querySelector("p");
    const descricao = estadoVazio.querySelector("small");

    if (buscaSemResultado) {
        titulo.textContent =
            "Nenhum hábito encontrado.";

        descricao.textContent =
            "Tente pesquisar usando outro nome.";
    } else {
        titulo.textContent =
            "Nenhum hábito cadastrado.";

        descricao.textContent =
            "Adicione seu primeiro hábito para começar.";
    }

    estadoVazio.classList.remove("oculto");
}


// Atualiza a quantidade de hábitos exibidos
function atualizarResumo(habitosFiltrados = habitos) {
    const total = habitos.length;
    const visiveis = habitosFiltrados.length;
    const existeBusca = campoBusca.value.trim() !== "";

    if (existeBusca) {
        totalHabitos.textContent =
            `${visiveis} de ${total} hábitos encontrados`;
        return;
    }

    totalHabitos.textContent = formatarUnidade(
        total,
        "hábito",
        "hábitos"
    );
}


// Atualiza as estatísticas gerais do topo
function atualizarEstatisticas() {
    estatisticaTotal.textContent = habitos.length;

    if (habitos.length === 0) {
        estatisticaMaior.textContent = "0 dias";
        estatisticaDestaque.textContent = "Nenhum";
        return;
    }

    const agora = new Date();

    let habitoDestaque = habitos[0];
    let maiorQuantidadeDias = -1;

    habitos.forEach(function (habito) {
        const tempo = calcularTempoDecorrido(
            habito.dataInicio,
            agora
        );

        if (tempo.dias > maiorQuantidadeDias) {
            maiorQuantidadeDias = tempo.dias;
            habitoDestaque = habito;
        }
    });

    estatisticaMaior.textContent = formatarUnidade(
        maiorQuantidadeDias,
        "dia",
        "dias"
    );

    estatisticaDestaque.textContent =
        habitoDestaque.nome;
}


// ============================
// CONTADORES E MARCOS
// ============================

// Atualiza o tempo e o progresso de todos os cartões visíveis
function atualizarContadores() {
    const agora = new Date();

    habitos.forEach(function (habito) {
        const elementos = obterElementosContador(
            habito.id
        );

        // O hábito pode estar escondido pelo campo de busca
        if (!elementos) {
            return;
        }

        const tempo = calcularTempoDecorrido(
            habito.dataInicio,
            agora
        );

        elementos.dias.textContent = formatarUnidade(
            tempo.dias,
            "dia",
            "dias"
        );

        elementos.horas.textContent = formatarUnidade(
            tempo.horas,
            "hora",
            "horas"
        );

        elementos.minutos.textContent = formatarUnidade(
            tempo.minutos,
            "minuto",
            "minutos"
        );

        elementos.segundos.textContent = formatarUnidade(
            tempo.segundos,
            "segundo",
            "segundos"
        );

        atualizarProgressoMarco(
            habito,
            tempo.dias
        );
    });

    // Mantém as estatísticas corretas caso um novo dia comece
    atualizarEstatisticas();
}


// Calcula o tempo decorrido entre duas datas
function calcularTempoDecorrido(dataInicio, dataAtual) {
    const diferenca = dataAtual - dataInicio;

    const segundosTotais = Math.max(
        0,
        Math.floor(diferenca / 1000)
    );

    return {
        dias: Math.floor(segundosTotais / 86400),

        horas: Math.floor(
            (segundosTotais % 86400) / 3600
        ),

        minutos: Math.floor(
            (segundosTotais % 3600) / 60
        ),

        segundos: segundosTotais % 60
    };
}


// Busca os elementos de um contador na tela
function obterElementosContador(idHabito) {
    const dias = document.getElementById(
        `dias-${idHabito}`
    );

    const horas = document.getElementById(
        `horas-${idHabito}`
    );

    const minutos = document.getElementById(
        `minutos-${idHabito}`
    );

    const segundos = document.getElementById(
        `segundos-${idHabito}`
    );

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


// Descobre o próximo marco do hábito
function calcularProximoMarco(diasAtuais) {
    const marcos = [7, 30, 100, 365];

    const proximoMarco = marcos.find(
        function (marco) {
            return diasAtuais < marco;
        }
    );

    return proximoMarco || null;
}


// Atualiza a barra de progresso de um hábito
function atualizarProgressoMarco(
    habito,
    diasAtuais
) {
    const textoMarco = document.getElementById(
        `marco-texto-${habito.id}`
    );

    const valorMarco = document.getElementById(
        `marco-valor-${habito.id}`
    );

    const barra = document.getElementById(
        `barra-${habito.id}`
    );

    if (!textoMarco || !valorMarco || !barra) {
        return;
    }

    const proximoMarco =
        calcularProximoMarco(diasAtuais);

    if (proximoMarco === null) {
        textoMarco.textContent =
            "Todos os marcos principais alcançados!";

        valorMarco.textContent = "🏆";
        barra.style.width = "100%";

        return;
    }

    const porcentagem = Math.min(
        100,
        Math.floor(
            (diasAtuais / proximoMarco) * 100
        )
    );

    textoMarco.textContent =
        `${diasAtuais} de ${proximoMarco} dias para o próximo marco`;

    valorMarco.textContent = `${porcentagem}%`;
    barra.style.width = `${porcentagem}%`;
}


// ============================
// BUSCA E ORDENAÇÃO
// ============================

// Retorna apenas os hábitos correspondentes à busca
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


// Ordena os hábitos conforme a opção selecionada
function ordenarHabitos() {
    const ordem = campoOrdenacao.value;

    if (ordem === "mais-recente") {
        habitos.sort(function (habitoA, habitoB) {
            return (
                habitoB.dataInicio -
                habitoA.dataInicio
            );
        });

        return;
    }

    habitos.sort(function (habitoA, habitoB) {
        return (
            habitoA.dataInicio -
            habitoB.dataInicio
        );
    });
}


// ============================
// MODAL
// ============================

// Fecha o modal sem realizar alterações
function fecharModal() {
    modalConfirmacao.classList.add("oculto");
    idHabitoPendente = null;
}


// ============================
// EVENTOS
// ============================

// Identifica qual ação foi clicada dentro de um cartão
function tratarCliqueNosCartoes(evento) {
    const botaoClicado =
        evento.target.closest("button");

    const cartao =
        evento.target.closest(".habit-card");

    if (!botaoClicado || !cartao) {
        return;
    }

    const idHabito = Number(
        cartao.id.replace("habito-", "")
    );

    if (botaoClicado.classList.contains(
        "btn-excluir"
    )) {
        excluirHabito(idHabito);
        return;
    }

    if (botaoClicado.classList.contains(
        "btn-reiniciar"
    )) {
        reiniciarHabito(idHabito);
        return;
    }

    if (botaoClicado.classList.contains(
        "btn-editar"
    )) {
        prepararEdicao(idHabito);
    }
}


// Registra os eventos usados pela aplicação
function registrarEventos() {
    botaoAdicionar.addEventListener(
        "click",
        adicionarHabito
    );

    botaoCancelar.addEventListener(
        "click",
        cancelarEdicao
    );

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

    campoBusca.addEventListener(
        "input",
        renderizarHabitos
    );

    campoOrdenacao.addEventListener(
        "change",
        function () {
            salvarOrdenacao();
            ordenarHabitos();
            renderizarHabitos();
        }
    );
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

    setInterval(
        atualizarContadores,
        1000
    );
}

iniciarAplicacao();