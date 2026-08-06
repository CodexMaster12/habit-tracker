import {
    campoNome,
    botaoAdicionar,
    listaHabitos
} from "./elementos.js";

import {
    habitos,
    obterIdHabitoPendente,
    obterIdHabitoEmEdicao
} from "./estado.js";

console.log("Módulos carregados com sucesso.");

console.log({
    campoNome,
    botaoAdicionar,
    listaHabitos,
    habitos,
    idHabitoPendente: obterIdHabitoPendente(),
    idHabitoEmEdicao: obterIdHabitoEmEdicao()
});