from datetime import date

from dateutil.relativedelta import (
    relativedelta
)

from src.service.relatorio_service import (
    RelatorioService
)

from src.repositories.dashboard_repository import (
    DashboardRepository
)


class DashboardService:


    @staticmethod
    def _validar_data(
        data_referencia
    ):

        if not data_referencia:

            hoje = date.today()

            return hoje.replace(
                day=1
            )


        try:

            data = (
                date.fromisoformat(
                    data_referencia
                )
            )

            return data.replace(
                day=1
            )


        except ValueError:

            raise ValueError(
                "Data de referência "
                "inválida."
            )


    # ==========================================
    # MESES DO GRÁFICO
    # ==========================================

    @staticmethod
    def _validar_meses_grafico(
        valor
    ):

        try:

            meses = int(valor)

        except (
            TypeError,
            ValueError
        ):

            raise ValueError(
                "Período do gráfico "
                "inválido."
            )


        permitidos = {
            3,
            6,
            12,
            24
        }


        if meses not in permitidos:

            raise ValueError(
                "Período do gráfico "
                "inválido."
            )


        return meses


    # ==========================================
    # PERÍODO DO RANKING
    # ==========================================

    @staticmethod
    def _validar_ranking_periodo(
        valor
    ):

        periodo = (
            str(
                valor
                or "MENSAL"
            )
            .strip()
            .upper()
        )


        permitidos = {
            "MENSAL",
            "ANUAL",
            "TOTAL"
        }


        if periodo not in permitidos:

            raise ValueError(
                "Período do ranking "
                "inválido."
            )


        return periodo


    # ==========================================
    # NOME DO MÊS
    # ==========================================

    @staticmethod
    def _nome_mes(
        numero_mes
    ):

        meses = {
            1: "Jan",
            2: "Fev",
            3: "Mar",
            4: "Abr",
            5: "Mai",
            6: "Jun",
            7: "Jul",
            8: "Ago",
            9: "Set",
            10: "Out",
            11: "Nov",
            12: "Dez"
        }


        return meses.get(
            numero_mes,
            ""
        )


    # ==========================================
    # ORDENAÇÃO DOS PRODUTOS
    # ==========================================

    @staticmethod
    def _ordenar_produtos(
        produtos,
        crescente=False
    ):

        lista = list(
            produtos or []
        )


        lista.sort(
            key=lambda produto: (
                float(
                    produto.get(
                        "quantidade",
                        0
                    )
                    or 0
                ),
                float(
                    produto.get(
                        "valor_bruto",
                        0
                    )
                    or 0
                )
            ),
            reverse=not crescente
        )


        return lista

    # ==========================================
    # RANKING TOTAL
    # ==========================================

    @staticmethod
    def _ranking_total():

        primeira_data = (
            DashboardRepository
            .primeira_data_recebimento()
        )


        if not primeira_data:

            return []


        inicio = (
            primeira_data.replace(
                day=1
            )
        )


        fim = (
            date.today().replace(
                day=1
            )
        )


        produtos = {}


        mes_atual = inicio


        while mes_atual <= fim:

            relatorio_mes = (
                RelatorioService.gerar(
                    "MENSAL",
                    mes_atual.isoformat()
                )
            )


            produtos_mes = (
                relatorio_mes.get(
                    "top_produtos",
                    []
                )
                or []
            )


            for produto in produtos_mes:

                nome = (
                    produto.get(
                        "produto"
                    )
                    or ""
                )

                sabor = (
                    produto.get(
                        "sabor"
                    )
                    or ""
                )


                chave = (
                    nome,
                    sabor
                )


                if chave not in produtos:

                    produtos[chave] = {

                        "produto":
                            nome,

                        "sabor":
                            sabor,

                        "quantidade":
                            0,

                        "valor_bruto":
                            0
                    }


                produtos[chave][
                    "quantidade"
                ] += float(
                    produto.get(
                        "quantidade",
                        0
                    )
                    or 0
                )


                produtos[chave][
                    "valor_bruto"
                ] += float(
                    produto.get(
                        "valor_bruto",
                        0
                    )
                    or 0
                )


            mes_atual = (
                mes_atual
                + relativedelta(
                    months=1
                )
            )


        return list(
            produtos.values()
        )

    # ==========================================
    # RANKING ANUAL DE PRODUTOS
    # ==========================================

    @staticmethod
    def _ranking_anual(
        data_referencia
    ):

        produtos = {}


        for numero_mes in range(
            1,
            13
        ):

            mes_referencia = (
                data_referencia.replace(
                    month=numero_mes,
                    day=1
                )
            )


            relatorio_mes = (
                RelatorioService.gerar(
                    "MENSAL",
                    mes_referencia
                        .isoformat()
                )
            )


            produtos_mes = (
                relatorio_mes.get(
                    "top_produtos",
                    []
                )
                or []
            )


            for produto in produtos_mes:

                nome = (
                    produto.get(
                        "produto"
                    )
                    or ""
                )

                sabor = (
                    produto.get(
                        "sabor"
                    )
                    or ""
                )


                chave = (
                    nome,
                    sabor
                )


                if chave not in produtos:

                    produtos[chave] = {

                        "produto":
                            nome,

                        "sabor":
                            sabor,

                        "quantidade":
                            0,

                        "valor_bruto":
                            0
                    }


                produtos[chave][
                    "quantidade"
                ] += float(
                    produto.get(
                        "quantidade",
                        0
                    )
                    or 0
                )


                produtos[chave][
                    "valor_bruto"
                ] += float(
                    produto.get(
                        "valor_bruto",
                        0
                    )
                    or 0
                )


        return list(
            produtos.values()
        )

    # ==========================================
    # DASHBOARD
    # ==========================================

    @staticmethod
    def carregar(
        data_referencia,
        meses_grafico=6,
        ranking_periodo="MENSAL"
    ):

        data_referencia = (
            DashboardService
            ._validar_data(
                data_referencia
            )
        )


        meses_grafico = (
            DashboardService
            ._validar_meses_grafico(
                meses_grafico
            )
        )


        ranking_periodo = (
            DashboardService
            ._validar_ranking_periodo(
                ranking_periodo
            )
        )


        # ======================================
        # MÊS SELECIONADO
        # ======================================

        relatorio_atual = (
            RelatorioService.gerar(
                "MENSAL",
                data_referencia
                    .isoformat()
            )
        )


        resultado = (
            relatorio_atual[
                "resultado"
            ]
        )


        fluxo = (
            relatorio_atual[
                "fluxo"
            ]
        )


        indicadores = (
            relatorio_atual[
                "indicadores"
            ]
        )


        # ======================================
        # RANKING DE PRODUTOS
        # ======================================

        if (
            ranking_periodo
            == "MENSAL"
        ):

            produtos_ranking = (
                relatorio_atual.get(
                    "top_produtos",
                    []
                )
                or []
            )


        elif (
            ranking_periodo
            == "ANUAL"
        ):

            produtos_ranking = (
                DashboardService
                ._ranking_anual(
                    data_referencia
                )
            )


        elif (
                ranking_periodo
                == "TOTAL"
            ):

                produtos_ranking = (
                    DashboardService
                    ._ranking_total()
                )


        # MAIS VENDIDOS

        top_produtos = (
            DashboardService
            ._ordenar_produtos(
                produtos_ranking,
                crescente=False
            )
        )


        # MENOS VENDIDOS

        menos_produtos = (
            DashboardService
            ._ordenar_produtos(
                produtos_ranking,
                crescente=True
            )
        )

        # ======================================
        # EVOLUÇÃO
        # ======================================

        evolucao = []


        for deslocamento in range(
            meses_grafico - 1,
            -1,
            -1
        ):

            mes_referencia = (
                data_referencia
                -
                relativedelta(
                    months=
                        deslocamento
                )
            )


            relatorio_mes = (
                RelatorioService.gerar(
                    "MENSAL",
                    mes_referencia
                        .isoformat()
                )
            )


            resultado_mes = (
                relatorio_mes[
                    "resultado"
                ]
            )


            fluxo_mes = (
                relatorio_mes[
                    "fluxo"
                ]
            )


            indicadores_mes = (
                relatorio_mes[
                    "indicadores"
                ]
            )


            evolucao.append({

                "ano":
                    mes_referencia.year,

                "mes":
                    mes_referencia.month,

                "label": (
                    f"{
                        DashboardService
                        ._nome_mes(
                            mes_referencia
                                .month
                        )
                    }/"
                    f"{
                        str(
                            mes_referencia
                                .year
                        )[-2:]
                    }"
                ),

                "faturamento":
                    resultado_mes[
                        "faturamento"
                    ],

                "gastos":
                    fluxo_mes[
                        "saidas"
                    ],

                "lucro":
                    resultado_mes[
                        "lucro"
                    ],

                "vendas":
                    indicadores_mes[
                        "pedidos_pagos"
                    ]
            })


        # ======================================
        # RECEBIMENTOS
        # ======================================

        ultimos_recebimentos = (
            DashboardRepository
            .ultimos_recebimentos(
                data_referencia
            )
        )


        # ======================================
        # RESPOSTA
        # ======================================

        return {

            "data_referencia":
                data_referencia
                    .isoformat(),


            "filtros": {

                "meses_grafico":
                    meses_grafico,

                "ranking_periodo":
                    ranking_periodo
            },


            "resumo": {

                "faturamento":
                    resultado[
                        "faturamento"
                    ],

                "gastos":
                    fluxo[
                        "saidas"
                    ],

                "vendas":
                    indicadores[
                        "pedidos_pagos"
                    ],

                "lucro":
                    resultado[
                        "lucro"
                    ],

                "saldo":
                    fluxo[
                        "saldo"
                    ],

                "margem":
                    resultado[
                        "margem_percentual"
                    ],

                "custo_vendas":
                    resultado[
                        "custo_vendas"
                    ],

                "desperdicios":
                    resultado[
                        "desperdicios"
                    ]
            },


            "gastos": {

                "compras":
                    fluxo[
                        "compras"
                    ],

                "despesas_extras":
                    fluxo[
                        "despesas_extras"
                    ],

                "total":
                    fluxo[
                        "saidas"
                    ]
            },


            "indicadores":
                indicadores,


            "top_produtos":
                top_produtos,


            "menos_produtos":
                menos_produtos,


            "evolucao":
                evolucao,


            "ultimos_recebimentos":
                ultimos_recebimentos
        }