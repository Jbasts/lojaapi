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

            data = date.fromisoformat(
                data_referencia
            )

            return data.replace(
                day=1
            )


        except ValueError:

            raise ValueError(
                "Data de referência inválida."
            )


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
    # DASHBOARD
    # ==========================================

    @staticmethod
    def carregar(
        data_referencia
    ):

        data_referencia = (
            DashboardService
            ._validar_data(
                data_referencia
            )
        )


        # ======================================
        # MÊS ATUAL SELECIONADO
        # ======================================

        relatorio_atual = (
            RelatorioService.gerar(
                "MENSAL",
                data_referencia.isoformat()
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
        # EVOLUÇÃO DOS ÚLTIMOS 6 MESES
        # ======================================

        evolucao = []


        for deslocamento in range(
            5,
            -1,
            -1
        ):

            mes_referencia = (
                data_referencia
                -
                relativedelta(
                    months=deslocamento
                )
            )


            relatorio_mes = (
                RelatorioService.gerar(
                    "MENSAL",
                    mes_referencia.isoformat()
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
                    f"{DashboardService._nome_mes(
                        mes_referencia.month
                    )}/{str(
                        mes_referencia.year
                    )[-2:]}"
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
        # ÚLTIMOS RECEBIMENTOS
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
                relatorio_atual[
                    "top_produtos"
                ],


            "evolucao":
                evolucao,


            "ultimos_recebimentos":
                ultimos_recebimentos
        }