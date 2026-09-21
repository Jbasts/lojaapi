import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CalendarDays,
    CircleDollarSign,
    PackageX,
    Percent,
    ReceiptText,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet
} from "lucide-react";

import {
    buscarRelatorio
} from "../../services/relatorioService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Relatorios.module.css";


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


function Relatorios() {

    const hoje =
        useMemo(
            () => dataLocalAtual(),
            []
        );


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


    const [
        relatorio,
        setRelatorio
    ] = useState({

        resultado: {
            faturamento: 0,
            custo_vendas: 0,
            despesas_extras: 0,
            desperdicios: 0,
            lucro: 0,
            margem_percentual: 0
        },

        fluxo: {
            entradas: 0,
            compras: 0,
            despesas_extras: 0,
            saidas: 0,
            saldo: 0
        },

        indicadores: {
            pedidos_pagos: 0,
            itens_vendidos: 0,
            itens_sem_custo: 0,
            quantidade_compras: 0,
            quantidade_despesas: 0,
            quantidade_desperdicios: 0
        },

        top_produtos: [],
        menos_produtos: []
    });


    const [
        erro,
        setErro
    ] = useState("");


    // ==========================================
    // PAGINAÇÃO - MAIS VENDIDOS
    // ==========================================

    const [
        paginaMaisVendidos,
        setPaginaMaisVendidos
    ] = useState(1);


    const [
        itensMaisVendidos,
        setItensMaisVendidos
    ] = useState(6);


    // ==========================================
    // PAGINAÇÃO - MENOS VENDIDOS
    // ==========================================

    const [
        paginaMenosVendidos,
        setPaginaMenosVendidos
    ] = useState(1);


    const [
        itensMenosVendidos,
        setItensMenosVendidos
    ] = useState(6);


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


    const carregar =
        useCallback(
            async () => {

                try {

                    setErro("");


                    const dados =
                        await buscarRelatorio(
                            periodo,
                            referencia
                        );


                    setRelatorio({

                        ...dados,

                        top_produtos:
                            Array.isArray(
                                dados.top_produtos
                            )
                                ? dados.top_produtos
                                : [],

                        menos_produtos:
                            Array.isArray(
                                dados.menos_produtos
                            )
                                ? dados.menos_produtos
                                : []
                    });


                } catch (error) {

                    setErro(
                        error.response
                            ?.data
                            ?.erro

                        ||

                        "Não foi possível "
                        + "carregar o relatório."
                    );
                }

            },
            [
                periodo,
                referencia
            ]
        );


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregar();

        },
        [carregar]
    );


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


    function percentual(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + "%";
    }


    function resetarPaginacoes() {

        setPaginaMaisVendidos(1);

        setPaginaMenosVendidos(1);
    }


    function alterarPeriodo(
        novoPeriodo
    ) {

        setPeriodo(
            novoPeriodo
        );

        resetarPaginacoes();
    }


    const resultado =
        relatorio.resultado;


    const fluxo =
        relatorio.fluxo;


    const indicadores =
        relatorio.indicadores;


    const topProdutos =
        Array.isArray(
            relatorio.top_produtos
        )
            ? relatorio.top_produtos
            : [];


    const menosProdutos =
        Array.isArray(
            relatorio.menos_produtos
        )
            ? relatorio.menos_produtos
            : [];


    // ==========================================
    // PAGINAÇÃO - MAIS VENDIDOS
    // ==========================================

    const totalMaisVendidos =
        topProdutos.length;


    const totalPaginasMaisVendidos =
        Math.max(
            1,
            Math.ceil(
                totalMaisVendidos
                /
                itensMaisVendidos
            )
        );


    const paginaMaisSegura =
        Math.min(
            paginaMaisVendidos,
            totalPaginasMaisVendidos
        );


    const inicioMais =
        (
            paginaMaisSegura - 1
        )
        *
        itensMaisVendidos;


    const produtosMaisPaginados =
        topProdutos.slice(
            inicioMais,
            inicioMais
            +
            itensMaisVendidos
        );


    // ==========================================
    // PAGINAÇÃO - MENOS VENDIDOS
    // ==========================================

    const totalMenosVendidos =
        menosProdutos.length;


    const totalPaginasMenosVendidos =
        Math.max(
            1,
            Math.ceil(
                totalMenosVendidos
                /
                itensMenosVendidos
            )
        );


    const paginaMenosSegura =
        Math.min(
            paginaMenosVendidos,
            totalPaginasMenosVendidos
        );


    const inicioMenos =
        (
            paginaMenosSegura - 1
        )
        *
        itensMenosVendidos;


    const produtosMenosPaginados =
        menosProdutos.slice(
            inicioMenos,
            inicioMenos
            +
            itensMenosVendidos
        );


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Relatórios
                    </h1>

                    <p>
                        Resultado financeiro,
                        custos e indicadores
                        do negócio.
                    </p>

                </div>

            </div>


            {
                erro && (

                    <div
                        className={
                            styles.error
                        }
                    >
                        {erro}
                    </div>
                )
            }


            {/* PERÍODO */}

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
                    Diário
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
                    Mensal
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
                    Anual
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

                                    resetarPaginacoes();
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

                                    resetarPaginacoes();
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

                                    resetarPaginacoes();
                                }
                            }
                        />
                    )
                }

            </div>


            {
                indicadores.itens_sem_custo
                > 0

                && (

                    <div
                        className={
                            styles.warning
                        }
                    >

                        Existem{" "}

                        <strong>
                            {
                                indicadores
                                    .itens_sem_custo
                            }
                        </strong>

                        {" "}item(ns) sem custo
                        cadastrado. O lucro pode
                        ficar maior que o valor real.

                    </div>
                )
            }


            {/* RESULTADO */}

            <div
                className={
                    styles.sectionTitle
                }
            >

                <div>

                    <h2>
                        Resultado gerencial
                    </h2>

                    <p>
                        Receita menos custos,
                        despesas e perdas.
                    </p>

                </div>

            </div>


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

                    <TrendingUp
                        size={21}
                    />

                    <span>
                        Faturamento
                    </span>

                    <strong
                        className={
                            styles.positive
                        }
                    >
                        {
                            moeda(
                                resultado
                                    .faturamento
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <ReceiptText
                        size={21}
                    />

                    <span>
                        Custo das vendas
                    </span>

                    <strong>
                        {
                            moeda(
                                resultado
                                    .custo_vendas
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
                                resultado
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

                    <PackageX
                        size={21}
                    />

                    <span>
                        Desperdícios
                    </span>

                    <strong
                        className={
                            styles.negative
                        }
                    >
                        {
                            moeda(
                                resultado
                                    .desperdicios
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
                        Lucro
                    </span>

                    <strong
                        className={
                            resultado.lucro
                            >= 0

                                ? styles.positive

                                : styles.negative
                        }
                    >
                        {
                            moeda(
                                resultado.lucro
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <Percent
                        size={21}
                    />

                    <span>
                        Margem
                    </span>

                    <strong
                        className={
                            resultado.lucro
                            >= 0

                                ? styles.positive

                                : styles.negative
                        }
                    >
                        {
                            percentual(
                                resultado
                                    .margem_percentual
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* COMPOSIÇÃO DO LUCRO */}

            <section
                className={
                    styles.card
                }
            >

                <div
                    className={
                        styles.cardHeader
                    }
                >

                    <h3>
                        Composição do resultado
                    </h3>

                </div>


                <div
                    className={
                        styles.resultList
                    }
                >

                    <div>

                        <span>
                            Faturamento recebido
                        </span>

                        <strong
                            className={
                                styles.positive
                            }
                        >
                            +
                            {
                                moeda(
                                    resultado
                                        .faturamento
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Custo das vendas
                        </span>

                        <strong
                            className={
                                styles.negative
                            }
                        >
                            -
                            {
                                moeda(
                                    resultado
                                        .custo_vendas
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Despesas extras
                        </span>

                        <strong
                            className={
                                styles.negative
                            }
                        >
                            -
                            {
                                moeda(
                                    resultado
                                        .despesas_extras
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Perdas por desperdício
                        </span>

                        <strong
                            className={
                                styles.negative
                            }
                        >
                            -
                            {
                                moeda(
                                    resultado
                                        .desperdicios
                                )
                            }
                        </strong>

                    </div>


                    <div
                        className={
                            styles.resultTotal
                        }
                    >

                        <span>
                            Lucro
                        </span>

                        <strong
                            className={
                                resultado.lucro
                                >= 0

                                    ? styles.positive

                                    : styles.negative
                            }
                        >
                            {
                                moeda(
                                    resultado.lucro
                                )
                            }
                        </strong>

                    </div>

                </div>

            </section>


            {/* FLUXO FINANCEIRO */}

            <div
                className={
                    styles.sectionTitle
                }
            >

                <div>

                    <h2>
                        Fluxo financeiro
                    </h2>

                    <p>
                        Dinheiro que efetivamente
                        entrou e saiu.
                    </p>

                </div>

            </div>


            <div
                className={
                    styles.flowGrid
                }
            >

                <div>

                    <TrendingUp
                        size={19}
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
                                fluxo.entradas
                            )
                        }
                    </strong>

                </div>


                <div>

                    <ShoppingCart
                        size={19}
                    />

                    <span>
                        Compras
                    </span>

                    <strong>
                        {
                            moeda(
                                fluxo.compras
                            )
                        }
                    </strong>

                </div>


                <div>

                    <Wallet
                        size={19}
                    />

                    <span>
                        Despesas extras
                    </span>

                    <strong>
                        {
                            moeda(
                                fluxo
                                    .despesas_extras
                            )
                        }
                    </strong>

                </div>


                <div>

                    <TrendingDown
                        size={19}
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
                                fluxo.saidas
                            )
                        }
                    </strong>

                </div>


                <div>

                    <CircleDollarSign
                        size={19}
                    />

                    <span>
                        Saldo financeiro
                    </span>

                    <strong
                        className={
                            fluxo.saldo >= 0

                                ? styles.positive

                                : styles.negative
                        }
                    >
                        {
                            moeda(
                                fluxo.saldo
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* INDICADORES */}

            <div
                className={
                    styles.sectionTitle
                }
            >

                <div>

                    <h2>
                        Indicadores
                    </h2>

                </div>

            </div>


            <div
                className={
                    styles.indicators
                }
            >

                <div>

                    <span>
                        Pedidos pagos
                    </span>

                    <strong>
                        {
                            indicadores
                                .pedidos_pagos
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Itens vendidos
                    </span>

                    <strong>
                        {
                            indicadores
                                .itens_vendidos
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Compras
                    </span>

                    <strong>
                        {
                            indicadores
                                .quantidade_compras
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Despesas
                    </span>

                    <strong>
                        {
                            indicadores
                                .quantidade_despesas
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Desperdícios
                    </span>

                    <strong>
                        {
                            indicadores
                                .quantidade_desperdicios
                        }
                    </strong>

                </div>

            </div>


            {/* RANKINGS */}

            <div
                className={
                    styles.sectionTitle
                }
            >

                <div>

                    <h2>
                        Produtos
                    </h2>

                    <p>
                        Ranking dos produtos vendidos
                        no período selecionado.
                    </p>

                </div>

            </div>


            <div
                className={
                    styles.rankingsGrid
                }
            >

                {/* MAIS VENDIDOS */}

                <section
                    className={`${styles.card} ${styles.rankingCard}`}
                >

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <h3>
                            Produtos mais vendidos
                        </h3>

                    </div>


                    <div
                        className={
                            styles.tableWrapper
                        }
                    >

                        <table>

                            <thead>

                                <tr>
                                    <th>
                                        Produto
                                    </th>

                                    <th>
                                        Sabor
                                    </th>

                                    <th>
                                        Quantidade
                                    </th>

                                    <th>
                                        Valor bruto
                                    </th>
                                </tr>

                            </thead>


                            <tbody>

                                {
                                    produtosMaisPaginados
                                        .length
                                    === 0

                                        ? (

                                            <tr>

                                                <td
                                                    colSpan="4"
                                                    className={
                                                        styles.empty
                                                    }
                                                >
                                                    Nenhum produto
                                                    encontrado no período.
                                                </td>

                                            </tr>
                                        )

                                        : produtosMaisPaginados
                                            .map(
                                                (
                                                    produto,
                                                    indice
                                                ) => (

                                                    <tr
                                                        key={
                                                            `mais-${
                                                                produto.produto_id
                                                                ?? produto.produto
                                                            }-${
                                                                produto.sabor
                                                                ?? ""
                                                            }-${indice}`
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    produto
                                                                        .produto
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                produto.sabor
                                                                || "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                produto
                                                                    .quantidade
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                moeda(
                                                                    produto
                                                                        .valor_bruto
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
                            paginaMaisSegura
                        }
                        totalItens={
                            totalMaisVendidos
                        }
                        itensPorPagina={
                            itensMaisVendidos
                        }
                        onPaginaChange={
                            setPaginaMaisVendidos
                        }
                        onItensPorPaginaChange={
                            (quantidade) => {

                                setItensMaisVendidos(
                                    quantidade
                                );

                                setPaginaMaisVendidos(
                                    1
                                );
                            }
                        }
                    />

                </section>


                {/* MENOS VENDIDOS */}

                <section
                    className={`${styles.card} ${styles.rankingCard}`}
                >

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <h3>
                            Produtos menos vendidos
                        </h3>

                    </div>


                    <div
                        className={
                            styles.tableWrapper
                        }
                    >

                        <table>

                            <thead>

                                <tr>
                                    <th>
                                        Produto
                                    </th>

                                    <th>
                                        Sabor
                                    </th>

                                    <th>
                                        Quantidade
                                    </th>

                                    <th>
                                        Valor bruto
                                    </th>
                                </tr>

                            </thead>


                            <tbody>

                                {
                                    produtosMenosPaginados
                                        .length
                                    === 0

                                        ? (

                                            <tr>

                                                <td
                                                    colSpan="4"
                                                    className={
                                                        styles.empty
                                                    }
                                                >
                                                    Nenhum produto
                                                    encontrado no período.
                                                </td>

                                            </tr>
                                        )

                                        : produtosMenosPaginados
                                            .map(
                                                (
                                                    produto,
                                                    indice
                                                ) => (

                                                    <tr
                                                        key={
                                                            `menos-${
                                                                produto.produto_id
                                                                ?? produto.produto
                                                            }-${
                                                                produto.sabor
                                                                ?? ""
                                                            }-${indice}`
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    produto
                                                                        .produto
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                produto.sabor
                                                                || "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                produto
                                                                    .quantidade
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                moeda(
                                                                    produto
                                                                        .valor_bruto
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
                            paginaMenosSegura
                        }
                        totalItens={
                            totalMenosVendidos
                        }
                        itensPorPagina={
                            itensMenosVendidos
                        }
                        onPaginaChange={
                            setPaginaMenosVendidos
                        }
                        onItensPorPaginaChange={
                            (quantidade) => {

                                setItensMenosVendidos(
                                    quantidade
                                );

                                setPaginaMenosVendidos(
                                    1
                                );
                            }
                        }
                    />

                </section>

            </div>

        </div>
    );
}


export default Relatorios;
