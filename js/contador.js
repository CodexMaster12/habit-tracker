// ============================
// CONTADORES E MARCOS
// ============================

// Formata singular e plural
export function formatarUnidade(valor, singular, plural) {
    return `${valor} ${valor === 1 ? singular : plural}`;
}


// Calcula o tempo decorrido entre duas datas
export function calcularTempoDecorrido(dataInicio, dataAtual) {
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


// Descobre o próximo marco do hábito
export function calcularProximoMarco(diasAtuais) {
    const marcos = [7, 30, 100, 365];

    const proximoMarco = marcos.find(function (marco) {
        return diasAtuais < marco;
    });

    return proximoMarco || null;
}


// Atualiza a barra de progresso de um hábito
export function atualizarProgressoMarco(habito, diasAtuais) {
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

    const proximoMarco = calcularProximoMarco(diasAtuais);

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


// Busca os elementos do contador de um hábito
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


// Atualiza o contador e o progresso dos cartões visíveis
export function atualizarContadores(habitos) {
    const agora = new Date();

    habitos.forEach(function (habito) {
        const elementos = obterElementosContador(habito.id);

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

        atualizarProgressoMarco(habito, tempo.dias);
    });
}