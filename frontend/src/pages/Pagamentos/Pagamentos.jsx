import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CalendarDays,
    CircleCheck,
    RotateCcw,
    Search,
    X
} from "lucide-react";

import {
    estornarPagamento,
    listarPagamentos,
    pagarPedido
} from "../../services/pagamentoService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Pagamentos.module.css";


function dataLocalAtual() {

    const data = new Date();

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${ano}-${mes}-${dia}`;
}


const formasPagamento = {
    DINHEIRO:"Dinheiro",
    PIX:"Pix",
    CARTAO_CREDITO:"Cartão de crédito",
    CARTAO_DEBITO:"Cartão de débito",
    TRANSFERENCIA:"Transferência",
    OUTRO:"Outro"
};


function Pagamentos() {

    const hoje =
        useMemo(
            () => dataLocalAtual(),
            []
        );


    const [
        periodo,
        setPeriodo
    ] = useState("DIARIO");


    const [
        dia,
        setDia
    ] = useState(
        hoje
    );


    const [
        mes,
        setMes
    ] = useState(
        hoje.substring(
            0,
            7
        )
    );


    const [
        ano,
        setAno
    ] = useState(
        hoje.substring(
            0,
            4
        )
    );


    const [
        registros,
        setRegistros
    ] = useState([]);

    const [busca, setBusca] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [
        pedidoSelecionado,
        setPedidoSelecionado
    ] = useState(null);

    const [
        estornoSelecionado,
        setEstornoSelecionado
    ] = useState(null);

    const [
        forma,
        setForma
    ] = useState("PIX");

    const [observacao, setObservacao] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    // ==========================================
    // PAGINAÇÃO
    // ==========================================

    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    async function carregar(
        texto = busca,
        filtro = status
    ) {

        try {

            const dados =
                await listarPagamentos(
                    texto,
                    filtro
                );

            setRegistros(
                dados
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "os pagamentos."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregar("", "");

    }, []);


    function moeda(valor) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function dataBR(data) {

        if (!data) {
            return "-";
        }

        const [
            ano,
            mes,
            dia
        ] = data
            .substring(0, 10)
            .split("-");

        return `${dia}/${mes}/${ano}`;
    }


    function resetarPaginacaoPeriodo() {

        setPaginaAtual(
            1
        );

        setPedidoSelecionado(
            null
        );

        setEstornoSelecionado(
            null
        );
    }


    function alterarPeriodo(
        novoPeriodo
    ) {

        setPeriodo(
            novoPeriodo
        );

        resetarPaginacaoPeriodo();
    }


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;

        setBusca(valor);

        setPaginaAtual(1);

        setPedidoSelecionado(
            null
        );

        setEstornoSelecionado(
            null
        );

        await carregar(
            valor,
            status
        );
    }


    async function handleStatus(
        event
    ) {

        const valor =
            event.target.value;

        setStatus(valor);

        setPaginaAtual(1);

        setPedidoSelecionado(
            null
        );

        setEstornoSelecionado(
            null
        );

        await carregar(
            busca,
            valor
        );
    }


    function abrirPagamento(
        registro
    ) {

        setEstornoSelecionado(
            null
        );

        setPedidoSelecionado(
            registro
        );

        setForma(
            "PIX"
        );

        setObservacao("");

        setErro("");
        setMensagem("");
    }


    function cancelarPagamento() {

        setPedidoSelecionado(
            null
        );

        setForma(
            "PIX"
        );

        setObservacao("");
    }


    async function confirmarPagamento() {

        if (!pedidoSelecionado) {
            return;
        }


        setSalvando(true);
        setErro("");
        setMensagem("");


        try {

            await pagarPedido(
                pedidoSelecionado.pedido_id,
                {
                    forma,
                    observacao
                }
            );


            setMensagem(
                `Pedido #${
                    pedidoSelecionado
                        .numero_pedido
                } marcado como pago.`
            );


            cancelarPagamento();

            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível registrar "
                + "o pagamento."
            );

        } finally {

            setSalvando(false);
        }
    }

    function abrirEstorno(
        registro
    ) {

        setPedidoSelecionado(
            null
        );

        setEstornoSelecionado(
            registro
        );

        setErro("");
        setMensagem("");
    }


    function cancelarEstorno() {

        setEstornoSelecionado(
            null
        );
    }


    async function confirmarEstorno() {

        if (!estornoSelecionado) {
            return;
        }


        try {

            setSalvando(true);
            setErro("");
            setMensagem("");


            await estornarPagamento(
                estornoSelecionado.pagamento_id
            );


            setMensagem(
                `Pagamento do pedido #${
                    estornoSelecionado.numero_pedido
                } estornado com sucesso.`
            );


            cancelarEstorno();

            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível estornar "
                + "o pagamento."
            );

        } finally {

            setSalvando(false);
        }
    }

    const registrosFiltradosPeriodo =
        useMemo(
            () => {

                return registros.filter(
                    (item) => {

                        if (
                            !item.data_pedido
                        ) {
                            return false;
                        }


                        const dataPedido =
                            String(
                                item.data_pedido
                            ).substring(
                                0,
                                10
                            );


                        if (
                            periodo
                            === "DIARIO"
                        ) {

                            return (
                                dataPedido
                                === dia
                            );
                        }


                        if (
                            periodo
                            === "MENSAL"
                        ) {

                            return (
                                dataPedido.substring(
                                    0,
                                    7
                                )
                                === mes
                            );
                        }


                        return (
                            dataPedido.substring(
                                0,
                                4
                            )
                            === String(
                                ano
                            )
                        );
                    }
                );

            },
            [
                registros,
                periodo,
                dia,
                mes,
                ano
            ]
        );


    const resumo =
        useMemo(
            () => {

                return registrosFiltradosPeriodo.reduce(
                    (
                        acumulador,
                        item
                    ) => {

                        acumulador.total++;

                        if (
                            item.pagamento_status
                            === "PAGO"
                        ) {

                            acumulador.pagos++;

                            acumulador.recebido +=
                                Number(
                                    item.valor
                                    || 0
                                );

                        } else {

                            acumulador.pendentes++;

                            acumulador.pendente +=
                                Number(
                                    item.valor_pedido
                                    || 0
                                );
                        }


                        return acumulador;
                    },

                    {
                        total: 0,
                        pagos: 0,
                        pendentes: 0,
                        recebido: 0,
                        pendente: 0
                    }
                );

            },
            [registrosFiltradosPeriodo]
        );


    // ==========================================
    // PAGINAÇÃO
    // ==========================================

    const totalItens =
        registrosFiltradosPeriodo.length;


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalItens
                /
                itensPorPagina
            )
        );


    const paginaSegura =
        Math.min(
            paginaAtual,
            totalPaginas
        );


    const indiceInicial =
        (
            paginaSegura - 1
        )
        *
        itensPorPagina;


    const indiceFinal =
        indiceInicial
        +
        itensPorPagina;


    const registrosPaginados =
        registrosFiltradosPeriodo.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarItensPorPagina(
        quantidade
    ) {

        setItensPorPagina(
            quantidade
        );

        setPaginaAtual(
            1
        );

        setPedidoSelecionado(
            null
        );

        setEstornoSelecionado(
            null
        );
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Pagamentos
                    </h1>

                    <p>
                        Controle dos pagamentos
                        dos pedidos.
                    </p>

                </div>

            </div>


            {
                erro && (

                    <div className={styles.error}>
                        {erro}
                    </div>
                )
            }


            {
                mensagem && (

                    <div className={styles.success}>
                        {mensagem}
                    </div>
                )
            }


            <div
                className={
                    styles.periodTabs
                }
            >

                <button
                    type="button"
                    className={
                        periodo === "DIARIO"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "DIARIO"
                        )
                    }
                >
                    Dia
                </button>


                <button
                    type="button"
                    className={
                        periodo === "MENSAL"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "MENSAL"
                        )
                    }
                >
                    Mês
                </button>


                <button
                    type="button"
                    className={
                        periodo === "ANUAL"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "ANUAL"
                        )
                    }
                >
                    Ano
                </button>

            </div>


            <div
                className={
                    styles.periodFilter
                }
            >

                <CalendarDays
                    size={17}
                />


                {
                    periodo === "DIARIO"
                    && (

                        <input
                            type="date"
                            value={dia}
                            onChange={
                                (event) => {

                                    setDia(
                                        event.target.value
                                    );

                                    resetarPaginacaoPeriodo();
                                }
                            }
                        />
                    )
                }


                {
                    periodo === "MENSAL"
                    && (

                        <input
                            type="month"
                            value={mes}
                            onChange={
                                (event) => {

                                    setMes(
                                        event.target.value
                                    );

                                    resetarPaginacaoPeriodo();
                                }
                            }
                        />
                    )
                }


                {
                    periodo === "ANUAL"
                    && (

                        <input
                            type="number"
                            min="2000"
                            max="2100"
                            value={ano}
                            onChange={
                                (event) => {

                                    setAno(
                                        event.target.value
                                    );

                                    resetarPaginacaoPeriodo();
                                }
                            }
                        />
                    )
                }

            </div>


            <div className={styles.summary}>

                <div>

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        {resumo.total}
                    </strong>

                </div>


                <div>

                    <span>
                        Pagos
                    </span>

                    <strong>
                        {resumo.pagos}
                    </strong>

                </div>


                <div>

                    <span>
                        Pendentes
                    </span>

                    <strong>
                        {resumo.pendentes}
                    </strong>

                </div>


                <div>

                    <span>
                        Recebido
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo.recebido
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        A receber
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo.pendente
                            )
                        }
                    </strong>

                </div>

            </div>


            <div className={styles.filters}>

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar pedido ou cliente..."
                        }
                        value={busca}
                        onChange={handleBusca}
                    />

                </div>


                <select
                    value={status}
                    onChange={handleStatus}
                >

                    <option value="">
                        Todos
                    </option>

                    <option value="PENDENTE">
                        Pendentes
                    </option>

                    <option value="PAGO">
                        Pagos
                    </option>

                </select>

            </div>


            <section className={styles.card}>

                <div
                    className={
                        styles.tableWrapper
                    }
                >

                    <table>

                        <thead>

                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Valor</th>
                                <th>Data pedido</th>
                                <th>Status pedido</th>
                                <th>Pagamento</th>
                                <th>Forma</th>
                                <th>Data pagamento</th>
                                <th>Ação</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                registrosPaginados.length
                                === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum pedido encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : registrosPaginados.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.pedido_id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        #
                                                        {
                                                            item
                                                                .numero_pedido
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {
                                                        item
                                                            .cliente_nome
                                                    }
                                                </td>


                                                <td>
                                                    <strong>
                                                        {
                                                            moeda(
                                                                item
                                                                    .valor_pedido
                                                            )
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {
                                                        dataBR(
                                                            item
                                                                .data_pedido
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item
                                                                .pedido_status
                                                            === "CONCLUIDO"
                                                                ? styles.concluido
                                                                : styles.aberto
                                                        }
                                                    >
                                                        {
                                                            item
                                                                .pedido_status
                                                            === "CONCLUIDO"
                                                                ? "Concluído"
                                                                : "Aberto"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item
                                                                .pagamento_status
                                                            === "PAGO"
                                                                ? styles.pago
                                                                : styles.pendente
                                                        }
                                                    >
                                                        {
                                                            item
                                                                .pagamento_status
                                                            === "PAGO"
                                                                ? "Pago"
                                                                : "Pendente"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        item.forma
                                                            ? (
                                                                formasPagamento[
                                                                    item.forma
                                                                ]
                                                                ||
                                                                item.forma
                                                            )
                                                            : "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        dataBR(
                                                            item
                                                                .data_pagamento
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item
                                                            .pagamento_status
                                                        === "PENDENTE"
                                                            ? (

                                                                <button
                                                                    className={
                                                                        styles.payButton
                                                                    }
                                                                    onClick={() =>
                                                                        abrirPagamento(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <CircleCheck
                                                                        size={15}
                                                                    />

                                                                    Marcar pago

                                                                </button>
                                                            )

                                                            : (

                                                                <button
                                                                    className={
                                                                        styles.reverseButton
                                                                    }
                                                                    onClick={() =>
                                                                        abrirEstorno(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <RotateCcw
                                                                        size={15}
                                                                    />

                                                                    Estornar

                                                                </button>
                                                            )
                                                    }

                                                </td>

                                            </tr>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <Paginacao
                    paginaAtual={
                        paginaSegura
                    }
                    totalItens={
                        totalItens
                    }
                    itensPorPagina={
                        itensPorPagina
                    }
                    onPaginaChange={
                        (pagina) => {

                            setPaginaAtual(
                                pagina
                            );

                            setPedidoSelecionado(
                                null
                            );

                            setEstornoSelecionado(
                                null
                            );
                        }
                    }
                    onItensPorPaginaChange={
                        alterarItensPorPagina
                    }
                />

            </section>


            {
                pedidoSelecionado
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        role="presentation"
                        onMouseDown={
                            (event) => {

                                if (
                                    event.target
                                    === event.currentTarget
                                    &&
                                    !salvando
                                ) {

                                    cancelarPagamento();
                                }
                            }
                        }
                    >

                        <section
                            className={
                                styles.modal
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="tituloPagamento"
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2
                                        id="tituloPagamento"
                                    >
                                        Registrar Pagamento
                                    </h2>

                                    <p>
                                        Pedido #
                                        {
                                            pedidoSelecionado
                                                .numero_pedido
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    title="Fechar"
                                    onClick={
                                        cancelarPagamento
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    <X
                                        size={18}
                                    />

                                </button>

                            </div>


                            <div
                                className={
                                    styles.modalBody
                                }
                            >

                                <div
                                    className={
                                        styles.paymentValue
                                    }
                                >

                                    <span>
                                        Valor do pedido
                                    </span>

                                    <strong>
                                        {
                                            moeda(
                                                pedidoSelecionado
                                                    .valor_pedido
                                            )
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.paymentGrid
                                    }
                                >

                                    <div>

                                        <label>
                                            Cliente
                                        </label>

                                        <input
                                            value={
                                                pedidoSelecionado
                                                    .cliente_nome
                                            }
                                            disabled
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Forma de pagamento *
                                        </label>

                                        <select
                                            value={
                                                forma
                                            }
                                            onChange={
                                                (event) =>
                                                    setForma(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        >

                                            {
                                                Object.entries(
                                                    formasPagamento
                                                ).map(
                                                    ([
                                                        valor,
                                                        descricao
                                                    ]) => (

                                                        <option
                                                            key={valor}
                                                            value={valor}
                                                        >
                                                            {
                                                                descricao
                                                            }
                                                        </option>
                                                    )
                                                )
                                            }

                                        </select>

                                    </div>


                                    <div
                                        className={
                                            styles.observation
                                        }
                                    >

                                        <label>
                                            Observação
                                        </label>

                                        <input
                                            value={
                                                observacao
                                            }
                                            onChange={
                                                (event) =>
                                                    setObservacao(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                            placeholder="Opcional"
                                        />

                                    </div>

                                </div>


                                <p
                                    className={
                                        styles.dateInfo
                                    }
                                >
                                    A data do pagamento será
                                    registrada automaticamente.
                                </p>

                            </div>


                            <div
                                className={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        cancelarPagamento
                                    }
                                    disabled={
                                        salvando
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.confirmButton
                                    }
                                    onClick={
                                        confirmarPagamento
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    {
                                        salvando
                                            ? "Salvando..."
                                            : "Confirmar Pagamento"
                                    }

                                </button>

                            </div>

                        </section>

                    </div>
                )
            }


            {
                estornoSelecionado
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        role="presentation"
                        onMouseDown={
                            (event) => {

                                if (
                                    event.target
                                    === event.currentTarget
                                    &&
                                    !salvando
                                ) {

                                    cancelarEstorno();
                                }
                            }
                        }
                    >

                        <section
                            className={
                                `${styles.modal} `
                                + `${styles.reverseModal}`
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="tituloEstorno"
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2
                                        id="tituloEstorno"
                                    >
                                        Estornar Pagamento
                                    </h2>

                                    <p>
                                        Pedido #
                                        {
                                            estornoSelecionado
                                                .numero_pedido
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    title="Fechar"
                                    onClick={
                                        cancelarEstorno
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    <X
                                        size={18}
                                    />

                                </button>

                            </div>


                            <div
                                className={
                                    styles.modalBody
                                }
                            >

                                <div
                                    className={
                                        styles.reverseWarning
                                    }
                                >

                                    <RotateCcw
                                        size={18}
                                    />

                                    <div>

                                        <strong>
                                            Confirmar estorno
                                        </strong>

                                        <p>
                                            O pagamento será
                                            marcado como estornado
                                            e o pedido voltará a
                                            aparecer como pendente.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.reverseDetails
                                    }
                                >

                                    <div>

                                        <span>
                                            Cliente
                                        </span>

                                        <strong>
                                            {
                                                estornoSelecionado
                                                    .cliente_nome
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Valor pago
                                        </span>

                                        <strong>
                                            {
                                                moeda(
                                                    estornoSelecionado
                                                        .valor
                                                    ??
                                                    estornoSelecionado
                                                        .valor_pedido
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Forma
                                        </span>

                                        <strong>
                                            {
                                                formasPagamento[
                                                    estornoSelecionado
                                                        .forma
                                                ]
                                                ||
                                                estornoSelecionado
                                                    .forma
                                                ||
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Data do pagamento
                                        </span>

                                        <strong>
                                            {
                                                dataBR(
                                                    estornoSelecionado
                                                        .data_pagamento
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        cancelarEstorno
                                    }
                                    disabled={
                                        salvando
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.confirmReverseButton
                                    }
                                    onClick={
                                        confirmarEstorno
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    {
                                        salvando
                                            ? "Estornando..."
                                            : "Confirmar Estorno"
                                    }

                                </button>

                            </div>

                        </section>

                    </div>
                )
            }

        </div>
    );
}


export default Pagamentos;

