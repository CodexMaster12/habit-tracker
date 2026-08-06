// ============================
// PERSISTÊNCIA
// ============================

import {
    campoOrdenacao
} from "./elementos.js";

import {
    habitos
} from "./estado.js";

import {
    ordenarHabitos
} from "./filtros.js";


// Salva os hábitos no navegador
export function salvarHabitos() {
    localStorage.setItem(
        "habitos",
        JSON.stringify(habitos)
    );
}


// Carrega os hábitos salvos para o array compartilhado
export function carregarHabitosSalvos() {
    const dadosSalvos = localStorage.getItem("habitos");

    if (!dadosSalvos) {
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

        ordenarHabitos();
    } catch (erro) {
        console.error(
            "Não foi possível carregar os hábitos:",
            erro
        );
    }
}


// Salva a opção escolhida no seletor
export function salvarOrdenacao() {
    localStorage.setItem(
        "ordem-habitos",
        campoOrdenacao.value
    );
}


// Carrega a preferência de ordenação
export function carregarOrdenacao() {
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