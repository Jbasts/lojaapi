from flask import jsonify, request

from src.service.cliente_service import ClienteService


class ClienteController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            clientes = ClienteService.listar(
                busca
            )

            return jsonify(
                clientes
            ), 200

        except Exception as erro:

            print(
                f"Erro ao listar clientes: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(cliente_id):

        try:

            cliente = ClienteService.buscar_por_id(
                cliente_id
            )

            return jsonify(
                cliente.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                f"Erro ao buscar cliente: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def criar():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            cliente = ClienteService.criar(
                dados
            )

            return jsonify({
                "mensagem": "Cliente cadastrado com sucesso.",
                "cliente": cliente.to_dict()
            }), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao criar cliente: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(cliente_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            cliente = ClienteService.atualizar(
                cliente_id,
                dados
            )

            return jsonify({
                "mensagem": "Cliente atualizado com sucesso.",
                "cliente": cliente.to_dict()
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao atualizar cliente: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(cliente_id):

        try:

            ClienteService.excluir(
                cliente_id
            )

            return jsonify({
                "mensagem": "Cliente excluído com sucesso."
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                f"Erro ao excluir cliente: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500