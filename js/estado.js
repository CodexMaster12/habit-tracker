// ============================
// ESTADO DA APLICAÇÃO
// ============================

export const habitos = [];

let idHabitoPendente = null;
let idHabitoEmEdicao = null;


// Retorna o hábito que aguarda confirmação no modal
export function obterIdHabitoPendente() {
    return idHabitoPendente;
}


// Define o hábito que aguarda confirmação no modal
export function definirIdHabitoPendente(idHabito) {
    idHabitoPendente = idHabito;
}


// Retorna o hábito que está sendo editado
export function obterIdHabitoEmEdicao() {
    return idHabitoEmEdicao;
}


// Define o hábito que está sendo editado
export function definirIdHabitoEmEdicao(idHabito) {
    idHabitoEmEdicao = idHabito;
}