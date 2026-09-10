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
    WalletCards
} from "lucide-react";

import {
    buscarDashboard
} from "../../services/dashboardService";

import styles
    from "./Dashboard.module.css";


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


    return `${ano}-${mes}`;
}


const formasPagamento = {

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


function Dashboard() {

    const mesAtual =
        useMemo(
            () => dataLocalAtual(),
            []
        );


    const [
        mes,
        setMes
    ] = useState(
        mesAtual
    );


    const [
        dashboard,
        setDashboard
    ] = useState({

        resumo: {
            faturamento: 0,
            gastos: 0,
            vendas: 0,
            lucro: 0,
            saldo: 0,
            margem: 0,
            custo_vendas: 0,
            desperdicios: 0
        },

        gastos: {
            compras: 0,
            despesas_extras: 0,
            total: 0
        },

        indicadores: {
            pedidos_pagos: 0,
            itens_vendidos: 0,
            itens_sem_custo: 0
        },

        top_produtos: [],

        evolucao: [],

        ultimos_recebimentos: []
    });


    const [
        erro,
        setErro
    ] = useState("");


    const referencia =
        useMemo(
            () => (
                `${mes}-01`
            ),
            [mes]
        );


    const carregar =
        useCallback(
            async () => {

                try {

                    setErro("");


                    const dados =
                        await buscarDashboard(
                            referencia
                        );


                    setDashboard(
                        dados
                    );


                } catch (error) {

                    setErro(
                        error.response
                            ?.data
                            ?.erro

                        ||

                        "Não foi possível "
                        + "carregar o dashboard."
                    );
                }

            },
            [referencia]
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


    function dataBR(
        data
    ) {

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


    const resumo =
        dashboard.resumo;


    const gastos =
        dashboard.gastos;


    /*
     * Maior valor usado como referência
     * para o gráfico dos últimos meses.
     */
    const maximoGrafico =
        useMemo(
            () => {

                let maior = 0;


                dashboard
                    .evolucao
                    .forEach(
                        (item) => {

                            maior = Math.max(
                                maior,
                                Number(
                                    item.faturamento
                                    || 0
                                ),
                                Number(
                                    item.gastos
                                    || 0
                                ),
                                Math.abs(
                                    Number(
                                        item.lucro
                                        || 0
                                    )
                                )
                            );
                        }
                    );


                return maior || 1;

            },
            [dashboard.evolucao]
        );


    function larguraBarra(
        valor
    ) {

        const percentualBarra =
            (
                Math.abs(
                    Number(
                        valor || 0
                    )
                )
                /
                maximoGrafico
            )
            * 100;


        return {
            width:
                `${Math.max(
                    percentualBarra,
                    valor ? 2 : 0
                )}%`
        };
    }


    function porcentagemGasto(
        valor
    ) {

        if (
            !gastos.total
        ) {

            return 0;
        }


        return (
            Number(valor || 0)
            /
            Number(gastos.total)
        )
        * 100;
    }


    return (

        <div className={styles.page}>

            {/* CABEÇALHO */}

            <div className={styles.header}>

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Visão geral financeira
                        e comercial do negócio.
                    </p>

                </div>


                <div
                    className={
                        styles.monthFilter
                    }
                >

                    <CalendarDays
                        size={17}
                    />

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
                dashboard
                    .indicadores
                    .itens_sem_custo
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
                                dashboard
                                    .indicadores
                                    .itens_sem_custo
                            }
                        </strong>

                        {" "}item(ns) vendidos
                        sem custo salvo.

                    </div>
                )
            }


            {/* CARDS PRINCIPAIS */}

            <div className={styles.mainCards}>

                <div className={styles.mainCard}>

                    <div
                        className={
                            styles.iconBox
                        }
                    >
                        <TrendingUp
                            size={21}
                        />
                    </div>

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
                                resumo
                                    .faturamento
                            )
                        }
                    </strong>

                    <small>
                        Valores recebidos
                    </small>

                </div>


                <div className={styles.mainCard}>

                    <div
                        className={
                            styles.iconBox
                        }
                    >
                        <TrendingDown
                            size={21}
                        />
                    </div>

                    <span>
                        Gastos
                    </span>

                    <strong
                        className={
                            styles.negative
                        }
                    >
                        {
                            moeda(
                                resumo.gastos
                            )
                        }
                    </strong>

                    <small>
                        Compras + despesas
                    </small>

                </div>


                <div className={styles.mainCard}>

                    <div
                        className={
                            styles.iconBox
                        }
                    >
                        <ReceiptText
                            size={21}
                        />
                    </div>

                    <span>
                        Vendas
                    </span>

                    <strong>
                        {
                            resumo.vendas
                        }
                    </strong>

                    <small>
                        Pedidos pagos
                    </small>

                </div>


                <div className={styles.mainCard}>

                    <div
                        className={
                            styles.iconBox
                        }
                    >
                        <CircleDollarSign
                            size={21}
                        />
                    </div>

                    <span>
                        Lucro
                    </span>

                    <strong
                        className={
                            resumo.lucro >= 0
                                ? styles.positive
                                : styles.negative
                        }
                    >
                        {
                            moeda(
                                resumo.lucro
                            )
                        }
                    </strong>

                    <small>
                        Resultado gerencial
                    </small>

                </div>

            </div>


            {/* CARDS SECUNDÁRIOS */}

            <div
                className={
                    styles.secondaryCards
                }
            >

                <div>

                    <WalletCards
                        size={18}
                    />

                    <span>
                        Saldo financeiro
                    </span>

                    <strong
                        className={
                            resumo.saldo >= 0
                                ? styles.positive
                                : styles.negative
                        }
                    >
                        {
                            moeda(
                                resumo.saldo
                            )
                        }
                    </strong>

                </div>


                <div>

                    <Percent
                        size={18}
                    />

                    <span>
                        Margem
                    </span>

                    <strong>
                        {
                            percentual(
                                resumo.margem
                            )
                        }
                    </strong>

                </div>


                <div>

                    <ShoppingCart
                        size={18}
                    />

                    <span>
                        Custo das vendas
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .custo_vendas
                            )
                        }
                    </strong>

                </div>


                <div>

                    <PackageX
                        size={18}
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
                                resumo
                                    .desperdicios
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* GRÁFICO + GASTOS */}

            <div className={styles.gridTwo}>

                <section className={styles.card}>

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Evolução
                            </h2>

                            <p>
                                Últimos 6 meses
                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            styles.chartLegend
                        }
                    >

                        <span>
                            <i
                                className={
                                    styles.legendRevenue
                                }
                            />
                            Faturamento
                        </span>

                        <span>
                            <i
                                className={
                                    styles.legendExpense
                                }
                            />
                            Gastos
                        </span>

                        <span>
                            <i
                                className={
                                    styles.legendProfit
                                }
                            />
                            Lucro
                        </span>

                    </div>


                    <div
                        className={
                            styles.chart
                        }
                    >

                        {
                            dashboard
                                .evolucao
                                .map(
                                    (item) => (

                                        <div
                                            key={
                                                `${
                                                    item.ano
                                                }-${
                                                    item.mes
                                                }`
                                            }
                                            className={
                                                styles
                                                    .chartMonth
                                            }
                                        >

                                            <div
                                                className={
                                                    styles
                                                        .chartMonthName
                                                }
                                            >
                                                {
                                                    item.label
                                                }
                                            </div>


                                            <div
                                                className={
                                                    styles
                                                        .chartBars
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles
                                                            .barTrack
                                                    }
                                                    title={
                                                        `Faturamento: ${
                                                            moeda(
                                                                item
                                                                    .faturamento
                                                            )
                                                        }`
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles
                                                                .revenueBar
                                                        }
                                                        style={
                                                            larguraBarra(
                                                                item
                                                                    .faturamento
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div
                                                    className={
                                                        styles
                                                            .barTrack
                                                    }
                                                    title={
                                                        `Gastos: ${
                                                            moeda(
                                                                item.gastos
                                                            )
                                                        }`
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles
                                                                .expenseBar
                                                        }
                                                        style={
                                                            larguraBarra(
                                                                item.gastos
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div
                                                    className={
                                                        styles
                                                            .barTrack
                                                    }
                                                    title={
                                                        `Lucro: ${
                                                            moeda(
                                                                item.lucro
                                                            )
                                                        }`
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            item.lucro >= 0

                                                                ? styles
                                                                    .profitBar

                                                                : styles
                                                                    .lossBar
                                                        }
                                                        style={
                                                            larguraBarra(
                                                                item.lucro
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )
                        }

                    </div>

                </section>


                {/* COMPOSIÇÃO DOS GASTOS */}

                <section className={styles.card}>

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Composição dos gastos
                            </h2>

                            <p>
                                Saídas financeiras
                                do mês.
                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            styles.expenseComposition
                        }
                    >

                        <div
                            className={
                                styles.expenseItem
                            }
                        >

                            <div
                                className={
                                    styles
                                        .expenseItemHeader
                                }
                            >

                                <span>
                                    Compras
                                </span>

                                <strong>
                                    {
                                        moeda(
                                            gastos
                                                .compras
                                        )
                                    }
                                </strong>

                            </div>


                            <div
                                className={
                                    styles
                                        .progressTrack
                                }
                            >

                                <div
                                    className={
                                        styles
                                            .purchaseProgress
                                    }
                                    style={{
                                        width:
                                            `${
                                                porcentagemGasto(
                                                    gastos
                                                        .compras
                                                )
                                            }%`
                                    }}
                                />

                            </div>


                            <small>
                                {
                                    percentual(
                                        porcentagemGasto(
                                            gastos
                                                .compras
                                        )
                                    )
                                }
                            </small>

                        </div>


                        <div
                            className={
                                styles.expenseItem
                            }
                        >

                            <div
                                className={
                                    styles
                                        .expenseItemHeader
                                }
                            >

                                <span>
                                    Despesas extras
                                </span>

                                <strong>
                                    {
                                        moeda(
                                            gastos
                                                .despesas_extras
                                        )
                                    }
                                </strong>

                            </div>


                            <div
                                className={
                                    styles
                                        .progressTrack
                                }
                            >

                                <div
                                    className={
                                        styles
                                            .extraExpenseProgress
                                    }
                                    style={{
                                        width:
                                            `${
                                                porcentagemGasto(
                                                    gastos
                                                        .despesas_extras
                                                )
                                            }%`
                                    }}
                                />

                            </div>


                            <small>
                                {
                                    percentual(
                                        porcentagemGasto(
                                            gastos
                                                .despesas_extras
                                        )
                                    )
                                }
                            </small>

                        </div>


                        <div
                            className={
                                styles.expenseTotal
                            }
                        >

                            <span>
                                Total de gastos
                            </span>

                            <strong>
                                {
                                    moeda(
                                        gastos.total
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* PRODUTOS + PAGAMENTOS */}

            <div className={styles.gridTwo}>

                {/* TOP PRODUTOS */}

                <section className={styles.card}>

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Produtos mais vendidos
                            </h2>

                            <p>
                                Ranking do mês
                                selecionado.
                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            styles.tableWrapper
                        }
                    >

                        <table>

                            <thead>

                                <tr>
                                    <th>Produto</th>
                                    <th>Sabor</th>
                                    <th>Qtd.</th>
                                    <th>Valor</th>
                                </tr>

                            </thead>


                            <tbody>

                                {
                                    dashboard
                                        .top_produtos
                                        .length
                                    === 0

                                        ? (

                                            <tr>

                                                <td
                                                    colSpan="4"
                                                    className={
                                                        styles
                                                            .empty
                                                    }
                                                >
                                                    Nenhuma venda
                                                    neste mês.
                                                </td>

                                            </tr>
                                        )

                                        : dashboard
                                            .top_produtos
                                            .slice(
                                                0,
                                                5
                                            )
                                            .map(
                                                (
                                                    produto,
                                                    indice
                                                ) => (

                                                    <tr
                                                        key={
                                                            `${
                                                                produto
                                                                    .produto
                                                            }-${
                                                                produto
                                                                    .sabor
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
                                                                produto
                                                                    .sabor
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

                </section>


                {/* ÚLTIMOS RECEBIMENTOS */}

                <section className={styles.card}>

                    <div
                        className={
                            styles.cardHeader
                        }
                    >

                        <div>

                            <h2>
                                Últimos recebimentos
                            </h2>

                            <p>
                                Pagamentos mais
                                recentes do mês.
                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            styles.paymentsList
                        }
                    >

                        {
                            dashboard
                                .ultimos_recebimentos
                                .length
                            === 0

                                ? (

                                    <div
                                        className={
                                            styles.empty
                                        }
                                    >
                                        Nenhum pagamento
                                        recebido neste mês.
                                    </div>
                                )

                                : dashboard
                                    .ultimos_recebimentos
                                    .map(
                                        (pagamento) => (

                                            <div
                                                key={
                                                    pagamento.id
                                                }
                                                className={
                                                    styles
                                                        .paymentRow
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        Pedido #
                                                        {
                                                            pagamento
                                                                .numero_pedido
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            pagamento
                                                                .cliente
                                                        }
                                                    </span>

                                                </div>


                                                <div
                                                    className={
                                                        styles
                                                            .paymentMeta
                                                    }
                                                >

                                                    <strong
                                                        className={
                                                            styles
                                                                .positive
                                                        }
                                                    >
                                                        {
                                                            moeda(
                                                                pagamento
                                                                    .valor
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formasPagamento[
                                                                pagamento
                                                                    .forma
                                                            ]

                                                            ||

                                                            pagamento
                                                                .forma

                                                            ||

                                                            "-"
                                                        }

                                                        {" • "}

                                                        {
                                                            dataBR(
                                                                pagamento
                                                                    .data_pagamento
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>
                                        )
                                    )
                        }

                    </div>

                </section>

            </div>

        </div>
    );
}


export default Dashboard;