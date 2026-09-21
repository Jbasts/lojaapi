
from flask import jsonify, request

from flask_jwt_extended import (
    get_jwt_identity
)

from src.service.compra_service import (
    CompraService,
    CompraEmUsoError,
    ValidadeNaoInformadaError
)

from src.service.nota_fiscal_service import (
    NotaFiscalService
)


class CompraController:

    @staticmethod
    def listar():

        try:
            busca = request.args.get(
                "busca"
            )

            compras = CompraService.listar(
                busca
            )

            return jsonify(
                compras
            ), 200

        except Exception as erro:

            print(
                f"Erro ao listar compras: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(compra_id):

        try:
            compra = CompraService.buscar(
                compra_id
            )

            return jsonify(
                compra.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


    @staticmethod
    def ler_nota():

        try:

            arquivo = request.files.get(
                "arquivo"
            )

            resultado = (
                NotaFiscalService
                .ler(
                    arquivo
                )
            )

            return jsonify(
                resultado
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro":
                    str(erro)
            }), 400

        except Exception as erro:

            print(
                "Erro ao ler nota fiscal: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno ao ler "
                    "a nota fiscal."
            }), 500


    @staticmethod
    def criar():

        try:
            dados = request.get_json(
                silent=True
            ) or {}

            usuario_id = int(
                get_jwt_identity()
            )

            compra = CompraService.criar(
                usuario_id,
                dados
            )

            return jsonify({
                "mensagem":
                    "Compra registrada com sucesso.",

                "compra":
                    compra.to_dict()
            }), 201


        except ValidadeNaoInformadaError as erro:

            return jsonify({
                "erro": str(erro),
                "codigo":
                    "VALIDADE_NAO_INFORMADA"
            }), 409


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                f"Erro ao registrar compra: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(compra_id):

        try:
            dados = request.get_json(
                silent=True
            ) or {}

            compra = (
                CompraService.atualizar(
                    compra_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Compra atualizada com sucesso.",

                "compra":
                    compra.to_dict()
            }), 200


        except ValidadeNaoInformadaError as erro:

            return jsonify({
                "erro": str(erro),
                "codigo":
                    "VALIDADE_NAO_INFORMADA"
            }), 409


        except CompraEmUsoError as erro:

            return jsonify({
                "erro": str(erro),
                "codigo":
                    "COMPRA_EM_USO"
            }), 409


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                f"Erro ao atualizar compra: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(compra_id):

        try:
            CompraService.excluir(
                compra_id
            )

            return jsonify({
                "mensagem":
                    "Compra excluída com sucesso."
            }), 200


        except CompraEmUsoError as erro:

            return jsonify({
                "erro": str(erro),
                "codigo":
                    "COMPRA_EM_USO"
            }), 409


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


        except Exception as erro:

            print(
                f"Erro ao excluir compra: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500

