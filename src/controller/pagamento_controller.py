from flask import (
    jsonify,
    request
)

from flask_jwt_extended import (
    get_jwt_identity
)

from src.service.pagamento_service import (
    PagamentoService
)


class PagamentoController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            status = request.args.get(
                "status"
            )


            dados = (
                PagamentoService.listar(
                    busca,
                    status
                )
            )


            return jsonify(
                dados
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao listar pagamentos: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def pagar(
        pedido_id
    ):

        try:

            usuario_id = int(
                get_jwt_identity()
            )


            dados = request.get_json(
                silent=True
            ) or {}


            pagamento = (
                PagamentoService.pagar(
                    pedido_id,
                    usuario_id,
                    dados
                )
            )


            return jsonify({
                "mensagem":
                    "Pagamento registrado "
                    "com sucesso.",

                "pagamento":
                    pagamento.to_dict()
            }), 201


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 409


        except Exception as erro:

            print(
                "Erro ao registrar pagamento: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500

    @staticmethod
    def estornar(
        pagamento_id
    ):

        try:

            usuario_id = int(
                get_jwt_identity()
            )


            PagamentoService.estornar(
                pagamento_id,
                usuario_id
            )


            return jsonify({
                "mensagem":
                    "Pagamento estornado "
                    "com sucesso."
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 409


        except Exception as erro:

            print(
                "Erro ao estornar pagamento: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500