// ============================
// BUSCA E ORDENAÇÃO
// ============================

import {
    campoBusca,
    campoOrdenacao
} from "./elementos.js";

import { habitos } from "./estado.js";


// Retorna apenas os hábitos correspondentes à busca
export function filtrarHabitos() {
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
export function ordenarHabitos() {
    const ordem = campoOrdenacao.value;

    if (ordem === "mais-recente") {
        habitos.sort(function (habitoA, habitoB) {
            return habitoB.dataInicio - habitoA.dataInicio;
        });

        return;
    }

    habitos.sort(function (habitoA, habitoB) {
        return habitoA.dataInicio - habitoB.dataInicio;
    });
}