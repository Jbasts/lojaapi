from flask import (
    jsonify,
    request
)

from src.service.relatorio_service import (
    RelatorioService
)


class RelatorioController:

    @staticmethod
    def gerar():

        try:

            periodo = request.args.get(
                "periodo",
                "DIARIO"
            )


            data_referencia = (
                request.args.get(
                    "data"
                )
            )


            relatorio = (
                RelatorioService
                .gerar(
                    periodo,
                    data_referencia
                )
            )


            return jsonify(
                relatorio
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao gerar relatório: "
                f"{erro}"
            )


            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500