from flask import (
    jsonify,
    request
)

from flask_jwt_extended import (
    get_jwt_identity
)

from src.service.pedido_service import (
    PedidoService
)


class PedidoController:

    # ==========================
    # LISTAR
    # ==========================

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            status = request.args.get(
                "status"
            )


            pedidos = (
                PedidoService.listar(
                    busca,
                    status
                )
            )


            return jsonify(
                pedidos
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao listar pedidos: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    # ==========================
    # BUSCAR
    # ==========================

    @staticmethod
    def buscar(
        pedido_id
    ):

        try:

            pedido = (
                PedidoService.buscar(
                    pedido_id
                )
            )


            return jsonify(
                pedido.to_dict()
            ), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


        except Exception as erro:

            print(
                "Erro ao buscar pedido: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    # ==========================
    # CRIAR
    # ==========================

    @staticmethod
    def criar():

        try:

            dados = request.get_json(
                silent=True
            ) or {}


            usuario_id = int(
                get_jwt_identity()
            )


            pedido = (
                PedidoService.criar(
                    usuario_id,
                    dados
                )
            )


            return jsonify({
                "mensagem":
                    "Pedido cadastrado "
                    "com sucesso.",

                "pedido":
                    pedido.to_dict()
            }), 201


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao criar pedido: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    # ==========================
    # ATUALIZAR
    # ==========================

    @staticmethod
    def atualizar(
        pedido_id
    ):

        try:

            dados = request.get_json(
                silent=True
            ) or {}


            pedido = (
                PedidoService.atualizar(
                    pedido_id,
                    dados
                )
            )


            return jsonify({
                "mensagem":
                    "Pedido atualizado "
                    "com sucesso.",

                "pedido":
                    pedido.to_dict()
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 409


        except Exception as erro:

            print(
                "Erro ao atualizar pedido: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    # ==========================
    # EXCLUIR / CANCELAR
    # ==========================

    @staticmethod
    def excluir(
        pedido_id
    ):

        try:

            PedidoService.excluir(
                pedido_id
            )


            return jsonify({
                "mensagem":
                    "Pedido excluído "
                    "com sucesso."
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 409


        except Exception as erro:

            print(
                "Erro ao excluir pedido: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    # ==========================
    # CONCLUIR
    # ==========================

    @staticmethod
    def concluir(
        pedido_id
    ):

        try:

            # O usuário que está logado
            # vem diretamente do JWT.
            usuario_id = int(
                get_jwt_identity()
            )


            pedido = (
                PedidoService.concluir(
                    pedido_id,
                    usuario_id
                )
            )


            return jsonify({
                "mensagem":
                    "Pedido concluído "
                    "com sucesso.",

                "pedido":
                    pedido.to_dict()
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 409


        except Exception as erro:

            print(
                "Erro ao concluir pedido: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500