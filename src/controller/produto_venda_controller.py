from flask import jsonify, request

from src.service.produto_venda_service import (
    ProdutoVendaService
)


class ProdutoVendaController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            produtos = (
                ProdutoVendaService
                .listar(busca)
            )

            return jsonify(
                produtos
            ), 200

        except Exception as erro:

            print(
                "Erro ao listar produtos "
                f"de venda: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(produto_id):

        try:

            produto = (
                ProdutoVendaService
                .buscar_por_id(
                    produto_id
                )
            )

            return jsonify(
                produto.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


    @staticmethod
    def criar():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            produto = (
                ProdutoVendaService
                .criar(dados)
            )

            return jsonify({
                "mensagem":
                    "Produto de venda "
                    "cadastrado com sucesso.",

                "produto":
                    produto.to_dict()
            }), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                "Erro ao cadastrar produto "
                f"de venda: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(produto_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            produto = (
                ProdutoVendaService
                .atualizar(
                    produto_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Produto atualizado "
                    "com sucesso.",

                "produto":
                    produto.to_dict()
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                "Erro ao atualizar produto "
                f"de venda: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(produto_id):

        try:

            ProdutoVendaService.excluir(
                produto_id
            )

            return jsonify({
                "mensagem":
                    "Produto excluído "
                    "com sucesso."
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                "Erro ao excluir produto "
                f"de venda: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500