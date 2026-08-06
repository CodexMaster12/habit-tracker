// ============================
// MODAL
// ============================

import {
    modalConfirmacao,
    mensagemModal
} from "./elementos.js";

import {
    obterIdHabitoPendente,
    definirIdHabitoPendente
} from "./estado.js";


// Abre o modal de reinício
export function abrirModalReinicio(habito) {
    definirIdHabitoPendente(habito.id);

    mensagemModal.textContent =
        `Deseja reiniciar a contagem de "${habito.nome}" a partir de agora?`;

    modalConfirmacao.classList.remove("oculto");
}


// Fecha o modal
export function fecharModal() {
    modalConfirmacao.classList.add("oculto");
    definirIdHabitoPendente(null);
}


// Retorna o identificador pendente
export function obterHabitoPendente() {
    return obterIdHabitoPendente();
}