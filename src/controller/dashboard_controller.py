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
                    "data"
                )
            )


            dashboard = (
                DashboardService
                .carregar(
                    data_referencia
                )
            )


            return jsonify(
                dashboard
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao carregar dashboard: "
                f"{erro}"
            )


            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500