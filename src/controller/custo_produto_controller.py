from flask import (
    jsonify,
    request
)

from src.service.custo_produto_service import (
    CustoProdutoService
)


class CustoProdutoController:

    @staticmethod
    def listar():

        try:

            produtos = (
                CustoProdutoService
                .listar()
            )

            return jsonify(
                produtos
            ), 200

        except Exception as erro:

            print(
                "Erro ao listar custos: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(produto_id):

        try:

            dados = (
                CustoProdutoService
                .buscar(produto_id)
            )

            return jsonify(
                dados
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                "Erro ao buscar custo: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def salvar(produto_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            resultado = (
                CustoProdutoService
                .salvar(
                    produto_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Ficha de custo "
                    "salva com sucesso.",

                "dados":
                    resultado
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                "Erro ao salvar custo: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def remover(produto_id):

        try:

            CustoProdutoService.remover(
                produto_id
            )

            return jsonify({
                "mensagem":
                    "Ficha de custo "
                    "removida com sucesso."
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                "Erro ao remover custo: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500