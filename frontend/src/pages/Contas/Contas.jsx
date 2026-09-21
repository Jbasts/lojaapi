import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ArrowDownCircle,
    ArrowUpCircle,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Search,
    ShoppingCart,
    Wallet
} from "lucide-react";

import {
    buscarDetalhesCompra,
    buscarResumoContas,
    listarContas
} from "../../services/contaService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Contas.module.css";


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


const nomesCategorias = {

    PAGAMENTO:
        "Pagamento",

    COMPRA:
        "Compra",

    DESPESA_EXTRA:
        "Despesa extra"
};


function Contas() {

    const hoje =
        useMemo(
            () => dataLocalAtual(),
            []
        );


    // ==========================================
    // PERÍODO
    // ==========================================

    const [
        periodo,
        setPeriodo
    ] = useState(
        "DIARIO"
    );


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


    // ==========================================
    // FILTROS
    // ==========================================

    const [
        busca,
        setBusca
    ] = useState("");


    const [
        tipo,
        setTipo
    ] = useState("");


    const [
        categoria,
        setCategoria
    ] = useState("");


    const [
        ordenacao,
        setOrdenacao
    ] = useState("");


    // ==========================================
    // DADOS
    // ==========================================

    const [
        movimentos,
        setMovimentos
    ] = useState([]);


    const [
        resumo,
        setResumo
    ] = useState({

        quantidade_movimentos:
            0,

        entradas:
            0,

        compras:
            0,

        despesas_extras:
            0,

        saidas:
            0,

        saldo:
            0
    });


    // ==========================================
    // DETALHES DAS COMPRAS
    // ==========================================

    const [
        compraAberta,
        setCompraAberta
    ] = useState(
        null
    );


    const [
        detalhesCompras,
        setDetalhesCompras
    ] = useState({});


    const [
        carregandoCompra,
        setCarregandoCompra
    ] = useState(
        null
    );


    // ==========================================
    // MENSAGENS
    // ==========================================

    const [
        erro,
        setErro
    ] = useState("");


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


    // ==========================================
    // DATA DE REFERÊNCIA
    // ==========================================

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


    // ==========================================
    // CARREGAR CONTAS
    // ==========================================

    const carregar =
        useCallback(
            async () => {

                try {

                    setErro("");


                    const [
                        dadosMovimentos,
                        dadosResumo
                    ] = await Promise.all([

                        listarContas(
                            periodo,
                            referencia,
                            busca,
                            tipo,
                            categoria
                        ),

                        buscarResumoContas(
                            periodo,
                            referencia
                        )
                    ]);


                    setMovimentos(
                        Array.isArray(
                            dadosMovimentos
                        )
                            ? dadosMovimentos
                            : []
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
                        + "carregar as contas."
                    );
                }

            },
            [
                periodo,
                referencia,
                busca,
                tipo,
                categoria
            ]
        );


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregar();

        },
        [carregar]
    );


    // ==========================================
    // FORMATAÇÃO
    // ==========================================

    function moeda(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );
    }


    function dataBR(
        data
    ) {

        if (!data) {

            return "-";
        }


        const dataPura =
            data.substring(
                0,
                10
            );


        const [
            anoData,
            mesData,
            diaData
        ] = dataPura.split(
            "-"
        );


        return (
            `${diaData}/`
            + `${mesData}/`
            + `${anoData}`
        );
    }


    // ==========================================
    // FECHAR DETALHES / RESETAR PÁGINA
    // ==========================================

    function resetarPagina() {

        setPaginaAtual(1);

        setCompraAberta(null);
    }


    // ==========================================
    // ALTERAR PERÍODO
    // ==========================================

    function alterarPeriodo(
        novoPeriodo
    ) {

        setPeriodo(
            novoPeriodo
        );

        resetarPagina();
    }


    // ==========================================
    // ABRIR / FECHAR COMPRA
    // ==========================================

    async function alternarCompra(
        movimento
    ) {

        const compraId =
            movimento.origem_id;


        if (
            compraAberta
            === compraId
        ) {

            setCompraAberta(
                null
            );

            return;
        }


        try {

            setErro("");


            if (
                !detalhesCompras[
                    compraId
                ]
            ) {

                setCarregandoCompra(
                    compraId
                );


                const dados =
                    await buscarDetalhesCompra(
                        compraId
                    );


                setDetalhesCompras(
                    (anterior) => ({

                        ...anterior,

                        [compraId]:
                            dados
                    })
                );
            }


            setCompraAberta(
                compraId
            );


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível "
                + "carregar os detalhes "
                + "da compra."
            );


        } finally {

            setCarregandoCompra(
                null
            );
        }
    }


    // ==========================================
    // ORDENAÇÃO
    // ==========================================

    const movimentosOrdenados =
        useMemo(
            () => {

                const lista = [
                    ...movimentos
                ];


                if (
                    ordenacao
                    === "VALOR_MAIOR"
                ) {

                    lista.sort(
                        (a, b) =>
                            Number(
                                b.valor
                                || 0
                            )
                            -
                            Number(
                                a.valor
                                || 0
                            )
                    );
                }


                if (
                    ordenacao
                    === "VALOR_MENOR"
                ) {

                    lista.sort(
                        (a, b) =>
                            Number(
                                a.valor
                                || 0
                            )
                            -
                            Number(
                                b.valor
                                || 0
                            )
                    );
                }


                return lista;

            },
            [
                movimentos,
                ordenacao
            ]
        );


    // ==========================================
    // PAGINAÇÃO
    // ==========================================

    const totalItens =
        movimentosOrdenados.length;


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


    const movimentosPaginados =
        movimentosOrdenados.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarItensPorPagina(
        quantidade
    ) {

        setItensPorPagina(
            quantidade
        );

        setPaginaAtual(1);

        setCompraAberta(null);
    }


    // ==========================================
    // JSX
    // ==========================================

    return (

        <div
            className={
                styles.page
            }
        >

            {/* =====================
                CABEÇALHO
            ===================== */}

            <div
                className={
                    styles.header
                }
            >

                <div>

                    <h1>
                        Contas
                    </h1>

                    <p>
                        Controle das entradas
                        e saídas financeiras.
                    </p>

                </div>

            </div>


            {/* =====================
                ERRO
            ===================== */}

            {
                erro
                && (

                    <div
                        className={
                            styles.error
                        }
                    >
                        {erro}
                    </div>
                )
            }


            {/* =====================
                PERÍODO
            ===================== */}

            <div
                className={
                    styles.periodTabs
                }
            >

                <button
                    type="button"
                    className={
                        periodo
                        === "DIARIO"

                            ? styles.activeTab

                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "DIARIO"
                        )
                    }
                >
                    Diário
                </button>


                <button
                    type="button"
                    className={
                        periodo
                        === "MENSAL"

                            ? styles.activeTab

                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "MENSAL"
                        )
                    }
                >
                    Mensal
                </button>


                <button
                    type="button"
                    className={
                        periodo
                        === "ANUAL"

                            ? styles.activeTab

                            : ""
                    }
                    onClick={() =>
                        alterarPeriodo(
                            "ANUAL"
                        )
                    }
                >
                    Anual
                </button>

            </div>


            {/* =====================
                DATA
            ===================== */}

            <div
                className={
                    styles.periodFilter
                }
            >

                <CalendarDays
                    size={17}
                />


                {
                    periodo
                    === "DIARIO"

                    && (

                        <input
                            type="date"
                            value={dia}
                            onChange={
                                (event) => {

                                    setDia(
                                        event
                                            .target
                                            .value
                                    );

                                    resetarPagina();
                                }
                            }
                        />
                    )
                }


                {
                    periodo
                    === "MENSAL"

                    && (

                        <input
                            type="month"
                            value={mes}
                            onChange={
                                (event) => {

                                    setMes(
                                        event
                                            .target
                                            .value
                                    );

                                    resetarPagina();
                                }
                            }
                        />
                    )
                }


                {
                    periodo
                    === "ANUAL"

                    && (

                        <input
                            type="number"
                            min="2000"
                            max="2100"
                            value={ano}
                            onChange={
                                (event) => {

                                    setAno(
                                        event
                                            .target
                                            .value
                                    );

                                    resetarPagina();
                                }
                            }
                        />
                    )
                }

            </div>


            {/* =====================
                RESUMO
            ===================== */}

            <div
                className={
                    styles.summary
                }
            >

                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <ArrowUpCircle
                        size={21}
                    />

                    <span>
                        Entradas
                    </span>

                    <strong
                        className={
                            styles.positive
                        }
                    >
                        {
                            moeda(
                                resumo
                                    .entradas
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <ShoppingCart
                        size={21}
                    />

                    <span>
                        Compras
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .compras
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <Wallet
                        size={21}
                    />

                    <span>
                        Despesas extras
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .despesas_extras
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <ArrowDownCircle
                        size={21}
                    />

                    <span>
                        Saídas
                    </span>

                    <strong
                        className={
                            styles.negative
                        }
                    >
                        {
                            moeda(
                                resumo
                                    .saidas
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <CircleDollarSign
                        size={21}
                    />

                    <span>
                        Saldo
                    </span>

                    <strong
                        className={
                            resumo.saldo
                            >= 0

                                ? styles.positive

                                : styles.negative
                        }
                    >
                        {
                            moeda(
                                resumo
                                    .saldo
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* =====================
                FILTROS
            ===================== */}

            <div
                className={
                    styles.filters
                }
            >

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search
                        size={17}
                    />

                    <input
                        type="text"
                        placeholder={
                            "Buscar referência ou descrição..."
                        }
                        value={busca}
                        onChange={
                            (event) => {

                                setBusca(
                                    event
                                        .target
                                        .value
                                );

                                resetarPagina();
                            }
                        }
                    />

                </div>


                <select
                    value={tipo}
                    onChange={
                        (event) => {

                            setTipo(
                                event
                                    .target
                                    .value
                            );

                            resetarPagina();
                        }
                    }
                >

                    <option value="">
                        Entradas e saídas
                    </option>

                    <option
                        value="ENTRADA"
                    >
                        Entradas
                    </option>

                    <option
                        value="SAIDA"
                    >
                        Saídas
                    </option>

                </select>


                <select
                    value={
                        categoria
                    }
                    onChange={
                        (event) => {

                            setCategoria(
                                event
                                    .target
                                    .value
                            );

                            resetarPagina();
                        }
                    }
                >

                    <option value="">
                        Todas categorias
                    </option>

                    <option
                        value="PAGAMENTO"
                    >
                        Pagamentos
                    </option>

                    <option
                        value="COMPRA"
                    >
                        Compras
                    </option>

                    <option
                        value="DESPESA_EXTRA"
                    >
                        Despesas extras
                    </option>

                </select>


                <select
                    value={
                        ordenacao
                    }
                    onChange={
                        (event) => {

                            setOrdenacao(
                                event
                                    .target
                                    .value
                            );

                            resetarPagina();
                        }
                    }
                >

                    <option value="">
                        Ordenação padrão
                    </option>

                    <option
                        value="VALOR_MAIOR"
                    >
                        Maior valor
                    </option>

                    <option
                        value="VALOR_MENOR"
                    >
                        Menor valor
                    </option>

                </select>

            </div>


            {/* =====================
                TABELA
            ===================== */}

            <section
                className={
                    styles.card
                }
            >

                <div
                    className={
                        styles.tableWrapper
                    }
                >

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Data
                                </th>

                                <th>
                                    Tipo
                                </th>

                                <th>
                                    Categoria
                                </th>

                                <th>
                                    Referência
                                </th>

                                <th>
                                    Descrição
                                </th>

                                <th>
                                    Valor
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                movimentosPaginados
                                    .length
                                === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className={
                                                    styles
                                                        .empty
                                                }
                                            >
                                                Nenhum movimento
                                                encontrado neste
                                                período.
                                            </td>

                                        </tr>
                                    )

                                    : movimentosPaginados
                                        .map(
                                            (
                                                movimento,
                                                indice
                                            ) => (

                                                <Fragment
                                                    key={
                                                        `${
                                                            movimento
                                                                .categoria
                                                        }-${
                                                            movimento
                                                                .origem_id
                                                        }-${indice}`
                                                    }
                                                >

                                                    {/* LINHA PRINCIPAL */}

                                                    <tr
                                                        className={
                                                            styles
                                                                .mainRow
                                                        }
                                                    >

                                                        <td>

                                                            {
                                                                dataBR(
                                                                    movimento
                                                                        .data_movimento
                                                                )
                                                            }

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    movimento
                                                                        .tipo
                                                                    === "ENTRADA"

                                                                        ? styles
                                                                            .entrada

                                                                        : styles
                                                                            .saida
                                                                }
                                                            >

                                                                {
                                                                    movimento
                                                                        .tipo
                                                                    === "ENTRADA"

                                                                        ? "Entrada"

                                                                        : "Saída"
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* CATEGORIA */}

                                                        <td>

                                                            <div
                                                                className={
                                                                    styles
                                                                        .categoryCell
                                                                }
                                                            >

                                                                {
                                                                    movimento
                                                                        .categoria
                                                                    === "COMPRA"

                                                                    && (

                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles
                                                                                    .expandButton
                                                                            }
                                                                            onClick={() =>
                                                                                alternarCompra(
                                                                                    movimento
                                                                                )
                                                                            }
                                                                            title={
                                                                                compraAberta
                                                                                ===
                                                                                movimento
                                                                                    .origem_id

                                                                                    ? "Ocultar detalhes"

                                                                                    : "Mostrar detalhes"
                                                                            }
                                                                        >

                                                                            {
                                                                                carregandoCompra
                                                                                ===
                                                                                movimento
                                                                                    .origem_id

                                                                                    ? (

                                                                                        <span
                                                                                            className={
                                                                                                styles
                                                                                                    .loadingDot
                                                                                            }
                                                                                        >
                                                                                            ...
                                                                                        </span>
                                                                                    )

                                                                                    : compraAberta
                                                                                    ===
                                                                                    movimento
                                                                                        .origem_id

                                                                                        ? (

                                                                                            <ChevronUp
                                                                                                size={16}
                                                                                            />
                                                                                        )

                                                                                        : (

                                                                                            <ChevronDown
                                                                                                size={16}
                                                                                            />
                                                                                        )
                                                                            }

                                                                        </button>
                                                                    )
                                                                }


                                                                <span>

                                                                    {
                                                                        nomesCategorias[
                                                                            movimento
                                                                                .categoria
                                                                        ]

                                                                        ||

                                                                        movimento
                                                                            .categoria
                                                                    }

                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    movimento
                                                                        .referencia
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            {
                                                                movimento
                                                                    .descricao
                                                            }

                                                        </td>


                                                        <td>

                                                            <strong
                                                                className={
                                                                    movimento
                                                                        .tipo
                                                                    === "ENTRADA"

                                                                        ? styles
                                                                            .positive

                                                                        : styles
                                                                            .negative
                                                                }
                                                            >

                                                                {
                                                                    movimento
                                                                        .tipo
                                                                    === "ENTRADA"

                                                                        ? "+"

                                                                        : "-"
                                                                }

                                                                {
                                                                    moeda(
                                                                        movimento
                                                                            .valor
                                                                    )
                                                                }

                                                            </strong>

                                                        </td>

                                                    </tr>


                                                    {/* DETALHES COMPRA */}

                                                    {
                                                        movimento
                                                            .categoria
                                                        === "COMPRA"

                                                        &&

                                                        compraAberta
                                                        ===
                                                        movimento
                                                            .origem_id

                                                        &&

                                                        detalhesCompras[
                                                            movimento
                                                                .origem_id
                                                        ]

                                                        && (

                                                            <tr
                                                                className={
                                                                    styles
                                                                        .detailsRow
                                                                }
                                                            >

                                                                <td
                                                                    colSpan="6"
                                                                >

                                                                    <div
                                                                        className={
                                                                            styles
                                                                                .purchaseDetails
                                                                        }
                                                                    >

                                                                        {/* CABEÇALHO */}

                                                                        <div
                                                                            className={
                                                                                styles
                                                                                    .detailsHeader
                                                                            }
                                                                        >

                                                                            <div>

                                                                                <strong>
                                                                                    Compra #
                                                                                    {
                                                                                        detalhesCompras[
                                                                                            movimento
                                                                                                .origem_id
                                                                                        ]
                                                                                            .numero
                                                                                    }
                                                                                </strong>

                                                                                <span>

                                                                                    Data:{" "}

                                                                                    {
                                                                                        dataBR(
                                                                                            detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .data_compra
                                                                                        )
                                                                                    }

                                                                                </span>

                                                                            </div>


                                                                            <span
                                                                                className={
                                                                                    styles
                                                                                        .purchaseStatus
                                                                                }
                                                                            >

                                                                                {
                                                                                    detalhesCompras[
                                                                                        movimento
                                                                                            .origem_id
                                                                                    ]
                                                                                        .status
                                                                                }

                                                                            </span>

                                                                        </div>


                                                                        {/* PRODUTOS */}

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

                                                                                        <th>
                                                                                            Produto
                                                                                        </th>

                                                                                        <th>
                                                                                            Código de barras
                                                                                        </th>

                                                                                        <th>
                                                                                            Quantidade
                                                                                        </th>

                                                                                        <th>
                                                                                            Valor unitário
                                                                                        </th>

                                                                                        <th>
                                                                                            Subtotal
                                                                                        </th>

                                                                                        <th>
                                                                                            Validade
                                                                                        </th>

                                                                                    </tr>

                                                                                </thead>


                                                                                <tbody>

                                                                                    {
                                                                                        detalhesCompras[
                                                                                            movimento
                                                                                                .origem_id
                                                                                        ]
                                                                                            .itens
                                                                                            .length
                                                                                        === 0

                                                                                            ? (

                                                                                                <tr>

                                                                                                    <td
                                                                                                        colSpan="6"
                                                                                                        className={
                                                                                                            styles
                                                                                                                .emptyDetails
                                                                                                        }
                                                                                                    >
                                                                                                        Nenhum produto
                                                                                                        encontrado nesta
                                                                                                        compra.
                                                                                                    </td>

                                                                                                </tr>
                                                                                            )

                                                                                            : detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .itens
                                                                                                .map(
                                                                                                    (
                                                                                                        item
                                                                                                    ) => (

                                                                                                        <tr
                                                                                                            key={
                                                                                                                item.id
                                                                                                            }
                                                                                                        >

                                                                                                            <td>

                                                                                                                <strong>
                                                                                                                    {
                                                                                                                        item
                                                                                                                            .produto
                                                                                                                    }
                                                                                                                </strong>

                                                                                                            </td>


                                                                                                            <td>

                                                                                                                {
                                                                                                                    item
                                                                                                                        .codigo_barras
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

                                                                                                                <strong>
                                                                                                                    {
                                                                                                                        moeda(
                                                                                                                            item
                                                                                                                                .valor_total
                                                                                                                        )
                                                                                                                    }
                                                                                                                </strong>

                                                                                                            </td>


                                                                                                            <td>

                                                                                                                {
                                                                                                                    dataBR(
                                                                                                                        item
                                                                                                                            .validade
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


                                                                        {/* TOTAIS */}

                                                                        <div
                                                                            className={
                                                                                styles
                                                                                    .purchaseTotals
                                                                            }
                                                                        >

                                                                            <div>

                                                                                <span>
                                                                                    Subtotal
                                                                                </span>

                                                                                <strong>
                                                                                    {
                                                                                        moeda(
                                                                                            detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .subtotal
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
                                                                                            detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .desconto
                                                                                        )
                                                                                    }
                                                                                </strong>

                                                                            </div>


                                                                            <div
                                                                                className={
                                                                                    styles
                                                                                        .totalFinal
                                                                                }
                                                                            >

                                                                                <span>
                                                                                    Valor total
                                                                                </span>

                                                                                <strong>
                                                                                    {
                                                                                        moeda(
                                                                                            detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .valor_total
                                                                                        )
                                                                                    }
                                                                                </strong>

                                                                            </div>

                                                                        </div>


                                                                        {/* OBSERVAÇÃO */}

                                                                        {
                                                                            detalhesCompras[
                                                                                movimento
                                                                                    .origem_id
                                                                            ]
                                                                                .observacao

                                                                            && (

                                                                                <div
                                                                                    className={
                                                                                        styles
                                                                                            .observation
                                                                                    }
                                                                                >

                                                                                    <strong>
                                                                                        Observação:
                                                                                    </strong>

                                                                                    <span>
                                                                                        {
                                                                                            detalhesCompras[
                                                                                                movimento
                                                                                                    .origem_id
                                                                                            ]
                                                                                                .observacao
                                                                                        }
                                                                                    </span>

                                                                                </div>
                                                                            )
                                                                        }

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


                {/* PAGINAÇÃO */}

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

                            setCompraAberta(
                                null
                            );
                        }
                    }
                    onItensPorPaginaChange={
                        alterarItensPorPagina
                    }
                />

            </section>

        </div>
    );
}


export default Contas;