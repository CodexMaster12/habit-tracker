// ============================
// INTERFACE
// ============================

import {
    listaHabitos,
    estadoVazio,
    totalHabitos,
    estatisticaTotal,
    estatisticaMaior,
    estatisticaDestaque,
    campoBusca
} from "./elementos.js";

import { habitos } from "./estado.js";

import { filtrarHabitos } from "./filtros.js";

import {
    atualizarContadores,
    calcularTempoDecorrido,
    formatarUnidade
} from "./contador.js";


// ============================
// CARTÕES
// ============================

// Cria um cartão visual na tela
export function criarCartao(habito) {
    const cartao = document.createElement("section");

    cartao.classList.add("habit-card");
    cartao.id = `habito-${habito.id}`;
    cartao.innerHTML = gerarConteudoCartao(habito);

    listaHabitos.appendChild(cartao);
}


// Atualiza um cartão existente
export function atualizarCartao(habito) {
    const cartao = document.getElementById(
        `habito-${habito.id}`
    );

    if (!cartao) {
        criarCartao(habito);
        return;
    }

    cartao.innerHTML = gerarConteudoCartao(habito);
}


// Gera o HTML interno do cartão
function gerarConteudoCartao(habito) {
    return `
        <h2>🎯 Sem ${habito.nome}</h2>

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


// ============================
// RENDERIZAÇÃO DA LISTA
// ============================

// Redesenha todos os cartões visíveis
export function renderizarHabitos() {
    listaHabitos.innerHTML = "";

    const habitosFiltrados = filtrarHabitos();

    habitosFiltrados.forEach(function (habito) {
        criarCartao(habito);
    });

    atualizarContadores(habitos);
    atualizarEstadoVazio(habitosFiltrados);
    atualizarResumo(habitosFiltrados);
    atualizarEstatisticas();
}


// ============================
// ESTADO VAZIO
// ============================

// Mostra a mensagem adequada quando nenhum cartão está visível
export function atualizarEstadoVazio(
    habitosFiltrados = habitos
) {
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


// ============================
// RESUMO
// ============================

// Atualiza a quantidade total e visível de hábitos
export function atualizarResumo(
    habitosFiltrados = habitos
) {
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


// ============================
// ESTATÍSTICAS
// ============================

// Atualiza os dados gerais exibidos no topo
export function atualizarEstatisticas() {
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