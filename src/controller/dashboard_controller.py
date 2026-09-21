from flask import (
    jsonify,
    request
)

from src.service.dashboard_service import (
    DashboardService
)


class DashboardController:

    @staticmethod
    def carregar():

        try:

            data_referencia = (
                request.args.get(
                    "data_referencia"
                )
            )


            meses_grafico = (
                request.args.get(
                    "meses_grafico",
                    "6"
                )
            )


            ranking_periodo = (
                request.args.get(
                    "ranking_periodo",
                    "MENSAL"
                )
            )


            dados = (
                DashboardService
                .carregar(
                    data_referencia,
                    meses_grafico,
                    ranking_periodo
                )
            )


            return jsonify(
                dados
            ), 200


        except ValueError as error:

            return jsonify({
                "erro": str(error)
            }), 400