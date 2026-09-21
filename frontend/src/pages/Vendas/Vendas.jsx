import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Percent,
    ReceiptText,
    Search,
    WalletCards
} from "lucide-react";

import {
    buscarResumoVendas,
    listarVendas
} from "../../services/vendaService";

import styles
    from "./Vendas.module.css";


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


const formas = {

    DINHEIRO:
        "Dinheiro",

    PIX:
        "Pix",

    CARTAO_CREDITO:
        "Cartão de crédito",

    CARTAO_DEBITO:
        "Cartão de débito",

    TRANSFERENCIA:
        "Transferência",

    OUTRO:
        "Outro"
};


function Vendas() {

    const hoje =
        useMemo(
            () => dataLocalAtual(),
            []
        );


    const [periodo, setPeriodo] =
        useState("DIARIO");


    const [dia, setDia] =
        useState(hoje);


    const [mes, setMes] =
        useState(
            hoje.substring(
                0,
                7
            )
        );


    const [ano, setAno] =
        useState(
            hoje.substring(
                0,
                4
            )
        );


    const [busca, setBusca] =
        useState("");


    const [status, setStatus] =
        useState("");


    const [vendas, setVendas] =
        useState([]);


    const [
        pedidoAberto,
        setPedidoAberto
    ] = useState(null);


    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    const [
        quantidadePagina,
        setQuantidadePagina
    ] = useState("6");


    const [resumo, setResumo] =
        useState({
            quantidade_pedidos: 0,
            valor_bruto: 0,
            descontos: 0,
            valor_vendido: 0,
            recebido: 0,
            a_receber: 0
        });


    const [erro, setErro] =
        useState("");


    const referencia =
        useMemo(
            () => {

                if (
                    periodo === "DIARIO"
                ) {

                    return dia;
                }


                if (
                    periodo === "MENSAL"
                ) {

                    return `${mes}-01`;
                }


                return `${ano}-01-01`;

            },
            [
                periodo,
                dia,
                mes,
                ano
            ]
        );


    /*
     * useCallback impede que a função
     * seja recriada sem necessidade.
     *
     * Isso evita o looping de requisições
     * quando ela é usada pelo useEffect.
     */
    const carregar =
        useCallback(
            async () => {

                try {

                    setErro("");


                    const [
                        dadosVendas,
                        dadosResumo
                    ] = await Promise.all([

                        listarVendas(
                            periodo,
                            referencia,
                            busca,
                            status
                        ),

                        buscarResumoVendas(
                            periodo,
                            referencia
                        )
                    ]);


                    setVendas(
                        dadosVendas
                    );


                    setResumo(
                        dadosResumo
                    );

                } catch (error) {

                    setErro(
                        error.response
                            ?.data
                            ?.erro

                        ||

                        "Não foi possível "
                        + "carregar as vendas."
                    );
                }

            },
            [
                periodo,
                referencia,
                busca,
                status
            ]
        );


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregar();

        },
        [carregar]
    );


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaginaAtual(1);

            setPedidoAberto(null);

        },
        [
            periodo,
            dia,
            mes,
            ano,
            busca,
            status
        ]
    );


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
            anoData,
            mesData,
            diaData
        ] = data
            .substring(
                0,
                10
            )
            .split("-");


        return (
            `${diaData}/`
            + `${mesData}/`
            + `${anoData}`
        );
    }


    function descricaoDesconto(
        item
    ) {

        if (
            item.desconto_tipo
            === "PERCENTUAL"
        ) {

            return (
                `${item.desconto_valor}% `
                +
                `(${moeda(
                    item.valor_desconto
                )})`
            );
        }


        if (
            item.desconto_tipo
            === "VALOR"
        ) {

            return moeda(
                item.valor_desconto
            );
        }


        return "-";
    }


    function alternarPedido(
        pedidoId
    ) {

        setPedidoAberto(
            (atual) =>
                atual === pedidoId
                    ? null
                    : pedidoId
        );
    }


    // ==============================
    // PAGINAÇÃO
    // ==============================

    const totalItens =
        vendas.length;


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalItens
                /
                itensPorPagina
            )
        );


    const paginaExibida =
        Math.min(
            paginaAtual,
            totalPaginas
        );


    const indiceInicial =
        (
            paginaExibida - 1
        )
        *
        itensPorPagina;


    const indiceFinal =
        indiceInicial
        +
        itensPorPagina;


    const vendasPaginadas =
        vendas.slice(
            indiceInicial,
            indiceFinal
        );


    const primeiroItem =
        totalItens === 0
            ? 0
            : indiceInicial + 1;


    const ultimoItem =
        Math.min(
            indiceFinal,
            totalItens
        );


    function irParaPagina(
        pagina
    ) {

        if (
            pagina < 1
            ||
            pagina > totalPaginas
        ) {
            return;
        }


        setPaginaAtual(
            pagina
        );

        setPedidoAberto(
            null
        );
    }


    function aplicarQuantidadePagina() {

        const quantidade =
            Number(
                quantidadePagina
            );


        if (
            !Number.isInteger(
                quantidade
            )
            ||
            quantidade <= 0
        ) {

            setQuantidadePagina(
                String(
                    itensPorPagina
                )
            );

            return;
        }


        setItensPorPagina(
            quantidade
        );

        setPaginaAtual(
            1
        );

        setPedidoAberto(
            null
        );
    }


    function teclaQuantidadePagina(
        event
    ) {

        if (
            event.key === "Enter"
        ) {

            aplicarQuantidadePagina();

            event.currentTarget.blur();
        }
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Vendas
                    </h1>

                    <p>
                        Consulta dos pedidos
                        concluídos.
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


            <div className={styles.periodTabs}>

                <button
                    className={
                        periodo === "DIARIO"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        setPeriodo(
                            "DIARIO"
                        )
                    }
                >
                    Diário
                </button>


                <button
                    className={
                        periodo === "MENSAL"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        setPeriodo(
                            "MENSAL"
                        )
                    }
                >
                    Mensal
                </button>


                <button
                    className={
                        periodo === "ANUAL"
                            ? styles.activeTab
                            : ""
                    }
                    onClick={() =>
                        setPeriodo(
                            "ANUAL"
                        )
                    }
                >
                    Anual
                </button>

            </div>


            <div className={styles.periodFilter}>

                <CalendarDays size={17} />


                {
                    periodo === "DIARIO"
                    && (

                        <input
                            type="date"
                            value={dia}
                            onChange={
                                (event) =>
                                    setDia(
                                        event
                                            .target
                                            .value
                                    )
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
                                (event) =>
                                    setMes(
                                        event
                                            .target
                                            .value
                                    )
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
                                (event) =>
                                    setAno(
                                        event
                                            .target
                                            .value
                                    )
                            }
                        />
                    )
                }

            </div>


            <div className={styles.summary}>

                <div>

                    <ReceiptText size={19} />

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        {
                            resumo
                                .quantidade_pedidos
                        }
                    </strong>

                </div>


                <div>

                    <CircleDollarSign
                        size={19}
                    />

                    <span>
                        Valor vendido
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .valor_vendido
                            )
                        }
                    </strong>

                </div>


                <div>

                    <Percent size={19} />

                    <span>
                        Descontos
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .descontos
                            )
                        }
                    </strong>

                </div>


                <div>

                    <WalletCards size={19} />

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

                    <WalletCards size={19} />

                    <span>
                        A receber
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo.a_receber
                            )
                        }
                    </strong>

                </div>

            </div>


            <div className={styles.filters}>

                <div className={styles.searchBox}>

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar pedido, cliente, produto ou sabor..."
                        }
                        value={busca}
                        onChange={
                            (event) =>
                                setBusca(
                                    event
                                        .target
                                        .value
                                )
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={
                        (event) =>
                            setStatus(
                                event
                                    .target
                                    .value
                            )
                    }
                >

                    <option value="">
                        Todos
                    </option>

                    <option value="PAGO">
                        Pagos
                    </option>

                    <option value="PENDENTE">
                        Pendentes
                    </option>

                </select>

            </div>


            <section className={styles.card}>

                <div className={styles.tableWrapper}>

                    <table>

                        <thead>

                            <tr>

                                <th></th>

                                <th>
                                    Pedido
                                </th>

                                <th>
                                    Cliente
                                </th>

                                <th>
                                    Itens
                                </th>

                                <th>
                                    Valor bruto
                                </th>

                                <th>
                                    Desconto
                                </th>

                                <th>
                                    Valor final
                                </th>

                                <th>
                                    Data pedido
                                </th>

                                <th>
                                    Data pagamento
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                vendas.length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="10"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhuma venda
                                                encontrada neste
                                                período.
                                            </td>

                                        </tr>
                                    )

                                    : vendasPaginadas.map(
                                        (pedido) => (

                                            <Fragment
                                                key={
                                                    pedido
                                                        .pedido_id
                                                }
                                            >

                                                <tr>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={
                                                                styles
                                                                    .expandButton
                                                            }
                                                            onClick={() =>
                                                                alternarPedido(
                                                                    pedido
                                                                        .pedido_id
                                                                )
                                                            }
                                                        >

                                                            {
                                                                pedidoAberto
                                                                ===
                                                                pedido
                                                                    .pedido_id

                                                                    ? (
                                                                        <ChevronUp
                                                                            size={17}
                                                                        />
                                                                    )

                                                                    : (
                                                                        <ChevronDown
                                                                            size={17}
                                                                        />
                                                                    )
                                                            }

                                                        </button>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            #
                                                            {
                                                                pedido
                                                                    .numero_pedido
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            pedido
                                                                .cliente
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                styles
                                                                    .itemCount
                                                            }
                                                        >

                                                            {
                                                                pedido
                                                                    .quantidade_itens
                                                            }

                                                            {
                                                                pedido
                                                                    .quantidade_itens
                                                                === 1

                                                                    ? " item"
                                                                    : " itens"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>
                                                        {
                                                            moeda(
                                                                pedido
                                                                    .valor_bruto
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            moeda(
                                                                pedido
                                                                    .valor_desconto
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                moeda(
                                                                    pedido
                                                                        .valor_final
                                                                )
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            dataBR(
                                                                pedido
                                                                    .data_pedido
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            dataBR(
                                                                pedido
                                                                    .data_pagamento
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                pedido
                                                                    .status_pagamento
                                                                === "PAGO"

                                                                    ? styles
                                                                        .pago

                                                                    : styles
                                                                        .pendente
                                                            }
                                                        >

                                                            {
                                                                pedido
                                                                    .status_pagamento
                                                                === "PAGO"

                                                                    ? "Pago"

                                                                    : "Pendente"
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>


                                                {
                                                    pedidoAberto
                                                    ===
                                                    pedido
                                                        .pedido_id

                                                    && (

                                                        <tr
                                                            className={
                                                                styles
                                                                    .detailsRow
                                                            }
                                                        >

                                                            <td
                                                                colSpan="10"
                                                            >

                                                                <div
                                                                    className={
                                                                        styles
                                                                            .detailsContainer
                                                                    }
                                                                >

                                                                    <div
                                                                        className={
                                                                            styles
                                                                                .detailsHeader
                                                                        }
                                                                    >

                                                                        <div>

                                                                            <strong>
                                                                                Detalhes do pedido #
                                                                                {
                                                                                    pedido
                                                                                        .numero_pedido
                                                                                }
                                                                            </strong>

                                                                            <span>
                                                                                {
                                                                                    pedido
                                                                                        .cliente
                                                                                }
                                                                            </span>

                                                                        </div>


                                                                        <div
                                                                            className={
                                                                                styles
                                                                                    .paymentInfo
                                                                            }
                                                                        >

                                                                            <span>
                                                                                Pagamento:
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    pedido
                                                                                        .status_pagamento
                                                                                }
                                                                            </strong>


                                                                            <span>
                                                                                Forma:
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    formas[
                                                                                        pedido
                                                                                            .forma
                                                                                    ]

                                                                                    ||

                                                                                    "-"
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    </div>


                                                                    <div
                                                                        className={
                                                                            styles
                                                                                .detailsTableWrapper
                                                                        }
                                                                    >

                                                                        <table
                                                                            className={
                                                                                styles
                                                                                    .detailsTable
                                                                            }
                                                                        >

                                                                            <thead>

                                                                                <tr>
                                                                                    <th>Produto</th>
                                                                                    <th>Sabor</th>
                                                                                    <th>Qtd.</th>
                                                                                    <th>Valor unitário</th>
                                                                                    <th>Desconto</th>
                                                                                    <th>Valor bruto</th>
                                                                                    <th>Valor final</th>
                                                                                </tr>

                                                                            </thead>


                                                                            <tbody>

                                                                                {
                                                                                    pedido
                                                                                        .itens
                                                                                        .map(
                                                                                            (
                                                                                                item,
                                                                                                indice
                                                                                            ) => (

                                                                                                <tr
                                                                                                    key={
                                                                                                        `${
                                                                                                            pedido
                                                                                                                .pedido_id
                                                                                                        }-${
                                                                                                            item
                                                                                                                .produto_id
                                                                                                        }-${indice}`
                                                                                                    }
                                                                                                >

                                                                                                    <td>
                                                                                                        {
                                                                                                            item
                                                                                                                .produto
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            item
                                                                                                                .sabor
                                                                                                            || "-"
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            item
                                                                                                                .quantidade
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            moeda(
                                                                                                                item
                                                                                                                    .valor_unitario
                                                                                                            )
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            descricaoDesconto(
                                                                                                                item
                                                                                                            )
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            moeda(
                                                                                                                item
                                                                                                                    .valor_bruto
                                                                                                            )
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>

                                                                                                        <strong>
                                                                                                            {
                                                                                                                moeda(
                                                                                                                    item
                                                                                                                        .valor_final
                                                                                                                )
                                                                                                            }
                                                                                                        </strong>

                                                                                                    </td>

                                                                                                </tr>
                                                                                            )
                                                                                        )
                                                                                }

                                                                            </tbody>

                                                                        </table>

                                                                    </div>


                                                                    <div
                                                                        className={
                                                                            styles
                                                                                .detailsTotals
                                                                        }
                                                                    >

                                                                        <div>

                                                                            <span>
                                                                                Valor bruto
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    moeda(
                                                                                        pedido
                                                                                            .valor_bruto
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                        <div>

                                                                            <span>
                                                                                Desconto
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    moeda(
                                                                                        pedido
                                                                                            .valor_desconto
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>


                                                                        <div>

                                                                            <span>
                                                                                Valor final
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    moeda(
                                                                                        pedido
                                                                                            .valor_final
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    )
                                                }

                                            </Fragment>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div
                    className={
                        styles.pagination
                    }
                >

                    <div
                        className={
                            styles.paginationInfo
                        }
                    >

                        Mostrando{" "}

                        <strong>
                            {primeiroItem}
                        </strong>

                        {" - "}

                        <strong>
                            {ultimoItem}
                        </strong>

                        {" de "}

                        <strong>
                            {totalItens}
                        </strong>

                    </div>


                    <div
                        className={
                            styles.paginationControls
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida === 1
                            }
                            onClick={() =>
                                irParaPagina(1)
                            }
                            title="Primeira página"
                        >
                            &laquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida === 1
                            }
                            onClick={() =>
                                irParaPagina(
                                    paginaExibida - 1
                                )
                            }
                            title="Página anterior"
                        >
                            &lsaquo;
                        </button>


                        <span
                            className={
                                styles.paginationPage
                            }
                        >

                            Página{" "}

                            <strong>
                                {paginaExibida}
                            </strong>

                            {" de "}

                            <strong>
                                {totalPaginas}
                            </strong>

                        </span>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida
                                === totalPaginas
                            }
                            onClick={() =>
                                irParaPagina(
                                    paginaExibida + 1
                                )
                            }
                            title="Próxima página"
                        >
                            &rsaquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida
                                === totalPaginas
                            }
                            onClick={() =>
                                irParaPagina(
                                    totalPaginas
                                )
                            }
                            title="Última página"
                        >
                            &raquo;
                        </button>

                    </div>


                    <div
                        className={
                            styles.paginationSize
                        }
                    >

                        <label
                            htmlFor={
                                "itensPorPaginaVendas"
                            }
                        >
                            Itens por página
                        </label>


                        <input
                            id="itensPorPaginaVendas"
                            type="number"
                            min="1"
                            step="1"
                            value={
                                quantidadePagina
                            }
                            onChange={
                                (event) =>
                                    setQuantidadePagina(
                                        event.target.value
                                    )
                            }
                            onBlur={
                                aplicarQuantidadePagina
                            }
                            onKeyDown={
                                teclaQuantidadePagina
                            }
                        />

                    </div>

                </div>

            </section>

        </div>
    );
}


export default Vendas;
