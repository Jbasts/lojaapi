from flask import (
    jsonify,
    request
)

from src.service.conta_service import (
    ContaService
)


class ContaController:

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

            tipo = request.args.get(
                "tipo"
            )

            categoria = request.args.get(
                "categoria"
            )


            movimentos = (
                ContaService.listar(
                    periodo=periodo,

                    data_referencia=(
                        data_referencia
                    ),

                    busca=busca,

                    tipo=tipo,

                    categoria=(
                        categoria
                    )
                )
            )


            return jsonify(
                movimentos
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao listar contas: "
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
                ContaService.resumo(
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
                f"das contas: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar_compra(
        compra_id
    ):

        try:

            compra = (
                ContaService
                .buscar_compra(
                    compra_id
                )
            )


            return jsonify(
                compra
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 404


        except Exception as erro:

            print(
                "Erro ao buscar detalhes "
                f"da compra: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500