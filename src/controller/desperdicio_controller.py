from flask import (
    jsonify,
    request
)

from flask_jwt_extended import (
    get_jwt_identity
)

from src.service.desperdicio_service import (
    DesperdicioService
)


class DesperdicioController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            motivo = request.args.get(
                "motivo"
            )

            periodo = request.args.get(
                "periodo",
                "TOTAL"
            )

            referencia = request.args.get(
                "referencia"
            )


            dados = (
                DesperdicioService
                .listar(
                    busca=busca,
                    motivo=motivo,
                    periodo=periodo,
                    referencia=referencia
                )
            )

            return jsonify(
                dados
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao listar desperdícios: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(
        desperdicio_id
    ):

        try:

            desperdicio = (
                DesperdicioService
                .buscar(
                    desperdicio_id
                )
            )

            return jsonify(
                desperdicio.to_dict()
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


    @staticmethod
    def criar():

        try:

            usuario_id = int(
                get_jwt_identity()
            )

            dados = request.get_json(
                silent=True
            ) or {}


            desperdicio = (
                DesperdicioService
                .criar(
                    usuario_id,
                    dados
                )
            )


            return jsonify({
                "mensagem":
                    "Desperdício registrado "
                    "com sucesso.",

                "desperdicio":
                    desperdicio.to_dict()
            }), 201


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao criar desperdício: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(
        desperdicio_id
    ):

        try:

            usuario_id = int(
                get_jwt_identity()
            )

            dados = request.get_json(
                silent=True
            ) or {}


            desperdicio = (
                DesperdicioService
                .atualizar(
                    desperdicio_id,
                    usuario_id,
                    dados
                )
            )


            return jsonify({
                "mensagem":
                    "Desperdício atualizado "
                    "com sucesso.",

                "desperdicio":
                    desperdicio.to_dict()
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao atualizar desperdício: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(
        desperdicio_id
    ):

        try:

            usuario_id = int(
                get_jwt_identity()
            )


            DesperdicioService.excluir(
                desperdicio_id,
                usuario_id
            )


            return jsonify({
                "mensagem":
                    "Desperdício excluído e "
                    "estoque estornado com sucesso."
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


        except Exception as erro:

            print(
                "Erro ao excluir desperdício: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500
