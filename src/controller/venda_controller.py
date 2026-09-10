from flask import (
    jsonify,
    request
)

from src.service.venda_service import (
    VendaService
)


class VendaController:

    @staticmethod
    def listar():

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

            busca = request.args.get(
                "busca"
            )

            status = request.args.get(
                "status"
            )


            vendas = (
                VendaService.listar(
                    periodo=periodo,

                    data_referencia=(
                        data_referencia
                    ),

                    busca=busca,

                    status=status
                )
            )


            return jsonify(
                vendas
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao listar vendas: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def resumo():

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


            resumo = (
                VendaService.resumo(
                    periodo,
                    data_referencia
                )
            )


            return jsonify(
                resumo
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao carregar resumo "
                f"das vendas: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500