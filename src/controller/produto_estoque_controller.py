from flask import jsonify, request

from src.service.produto_estoque_service import (
    ProdutoEstoqueService
)


class ProdutoEstoqueController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            produtos = (
                ProdutoEstoqueService
                .listar(busca)
            )

            return jsonify(
                produtos
            ), 200

        except Exception as erro:

            print(
                f"Erro ao listar produtos: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(produto_id):

        try:

            produto = (
                ProdutoEstoqueService
                .buscar_por_id(produto_id)
            )

            return jsonify(
                produto.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


    @staticmethod
    def buscar_por_codigo():

        try:

            codigo = request.args.get(
                "codigo"
            )

            produto = (
                ProdutoEstoqueService
                .buscar_por_codigo(codigo)
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
                ProdutoEstoqueService
                .criar(dados)
            )

            return jsonify({
                "mensagem":
                    "Produto cadastrado com sucesso.",

                "produto":
                    produto.to_dict()
            }), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao criar produto: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(produto_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            produto = (
                ProdutoEstoqueService
                .atualizar(
                    produto_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Produto atualizado com sucesso.",

                "produto":
                    produto.to_dict()
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao atualizar produto: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(produto_id):

        try:

            ProdutoEstoqueService.excluir(
                produto_id
            )

            return jsonify({
                "mensagem":
                    "Produto excluído com sucesso."
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                f"Erro ao excluir produto: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500