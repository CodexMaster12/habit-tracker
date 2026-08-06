// ============================
// HÁBITOS
// ============================

import {
    campoNome,
    campoData,
    campoHora,
    botaoAdicionar,
    botaoCancelar
} from "./elementos.js";

import {
    habitos,
    obterIdHabitoEmEdicao,
    definirIdHabitoEmEdicao,
    obterIdHabitoPendente
} from "./estado.js";

import {
    salvarHabitos
} from "./storage.js";

import {
    ordenarHabitos
} from "./filtros.js";

import {
    renderizarHabitos
} from "./interface.js";

import {
    abrirModalReinicio,
    fecharModal
} from "./modal.js";


// Busca um hábito pelo identificador
export function buscarHabito(idHabito) {
    return habitos.find(function (habito) {
        return habito.id === idHabito;
    });
}


// Lê os dados do formulário
function obterDadosFormulario() {
    return {
        nome: campoNome.value.trim(),
        data: campoData.value,
        hora: campoHora.value || "00:00"
    };
}


// Formata uma data para input date
function formatarDataParaInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


// Formata uma data para input time
function formatarHoraParaInput(data) {
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}`;
}


// Alterna entre criação e edição
export function definirModoEdicao(estaEditando) {
    botaoAdicionar.textContent = estaEditando
        ? "Salvar alterações"
        : "Adicionar hábito";

    botaoCancelar.classList.toggle(
        "oculto",
        !estaEditando
    );
}


// Cria ou atualiza um hábito
export function adicionarHabito() {
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

    const idEmEdicao = obterIdHabitoEmEdicao();

    if (idEmEdicao !== null) {
        salvarEdicao(dados.nome, dataInicio);
        return;
    }

    habitos.push({
        id: Date.now(),
        nome: dados.nome,
        dataInicio
    });

    ordenarHabitos();
    salvarHabitos();
    renderizarHabitos();
    limparFormulario();
}


// Exclui um hábito
export function excluirHabito(idHabito) {
    const indice = habitos.findIndex(function (habito) {
        return habito.id === idHabito;
    });

    if (indice === -1) {
        return;
    }

    habitos.splice(indice, 1);

    if (obterIdHabitoEmEdicao() === idHabito) {
        cancelarEdicao();
    }

    salvarHabitos();
    renderizarHabitos();
}


// Abre a confirmação de reinício
export function reiniciarHabito(idHabito) {
    const habito = buscarHabito(idHabito);

    if (!habito) {
        return;
    }

    abrirModalReinicio(habito);
}


// Confirma o reinício
export function confirmarReinicio() {
    const idHabito = obterIdHabitoPendente();
    const habito = buscarHabito(idHabito);

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


// Prepara o formulário para edição
export function prepararEdicao(idHabito) {
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

    definirIdHabitoEmEdicao(idHabito);
    definirModoEdicao(true);

    campoNome.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoNome.focus();
}


// Salva alterações
function salvarEdicao(nome, dataInicio) {
    const habito = buscarHabito(
        obterIdHabitoEmEdicao()
    );

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


// Cancela a edição
export function cancelarEdicao() {
    definirIdHabitoEmEdicao(null);

    limparFormulario();
    definirModoEdicao(false);
}


// Limpa os campos
function limparFormulario() {
    campoNome.value = "";
    campoData.value = "";
    campoHora.value = "";
}