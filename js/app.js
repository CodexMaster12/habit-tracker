// ============================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================

import {
    botaoAdicionar,
    botaoCancelar,
    listaHabitos,
    botaoCancelarModal,
    botaoConfirmarModal,
    campoBusca,
    campoOrdenacao
} from "./elementos.js";

import {
    habitos
} from "./estado.js";

import {
    carregarHabitosSalvos,
    carregarOrdenacao,
    salvarOrdenacao
} from "./storage.js";

import {
    ordenarHabitos
} from "./filtros.js";

import {
    renderizarHabitos,
    atualizarEstatisticas
} from "./interface.js";

import {
    atualizarContadores
} from "./contador.js";

import {
    adicionarHabito,
    excluirHabito,
    reiniciarHabito,
    prepararEdicao,
    cancelarEdicao,
    confirmarReinicio,
    definirModoEdicao
} from "./habitos.js";

import {
    fecharModal
} from "./modal.js";


// Identifica o botão clicado em um cartão
function tratarCliqueNosCartoes(evento) {
    const botao = evento.target.closest("button");
    const cartao = evento.target.closest(".habit-card");

    if (!botao || !cartao) {
        return;
    }

    const idHabito = Number(
        cartao.id.replace("habito-", "")
    );

    if (botao.classList.contains("btn-excluir")) {
        excluirHabito(idHabito);
        return;
    }

    if (botao.classList.contains("btn-reiniciar")) {
        reiniciarHabito(idHabito);
        return;
    }

    if (botao.classList.contains("btn-editar")) {
        prepararEdicao(idHabito);
    }
}


// Registra os eventos
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


// Inicia o sistema
function iniciarAplicacao() {
    registrarEventos();
    carregarOrdenacao();
    carregarHabitosSalvos();
    definirModoEdicao(false);
    renderizarHabitos();

    setInterval(function () {
        atualizarContadores(habitos);
        atualizarEstatisticas();
    }, 1000);
}

iniciarAplicacao();