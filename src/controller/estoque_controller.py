from flask import (
    jsonify,
    request
)

from flask_jwt_extended import (
    get_jwt_identity
)

from src.service.estoque_service import (
    EstoqueService
)


class EstoqueController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            status = request.args.get(
                "status"
            )

            lotes = (
                EstoqueService.listar(
                    busca=busca,
                    status=status
                )
            )

            return jsonify(
                lotes
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao listar estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def resumo():

        try:

            dados = (
                EstoqueService.resumo()
            )

            return jsonify(
                dados
            ), 200

        except Exception as erro:

            print(
                f"Erro ao carregar resumo "
                f"do estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar_por_codigo():

        try:

            codigo = request.args.get(
                "codigo"
            )

            dados = (
                EstoqueService
                .buscar_por_codigo(
                    codigo
                )
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
                f"Erro ao buscar produto "
                f"no estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def retirar_para_uso():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            usuario_id = int(
                get_jwt_identity()
            )

            resultado = (
                EstoqueService
                .retirar_para_uso(
                    usuario_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Produto retirado do "
                    "estoque com sucesso.",

                "movimentacao":
                    resultado
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao retirar produto "
                f"do estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500

    @staticmethod
    def listar_retiradas():

        try:

            periodo = request.args.get(
                "periodo",
                "DIARIO"
            )

            referencia = request.args.get(
                "referencia"
            )


            dados = (
                EstoqueService
                .listar_retiradas(
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
                f"Erro ao listar retiradas "
                f"do estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500



    @staticmethod
    def listar_receitas():

        try:

            dados = (
                EstoqueService
                .listar_receitas()
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
                f"Erro ao listar receitas "
                f"do estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar_receita(
        produto_id
    ):

        try:

            dados = (
                EstoqueService
                .buscar_receita(
                    produto_id
                )
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
                f"Erro ao buscar receita "
                f"do estoque: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def retirar_por_receita():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            usuario_id = int(
                get_jwt_identity()
            )

            resultado = (
                EstoqueService
                .retirar_por_receita(
                    usuario_id,
                    dados
                )
            )

            possui_manuais = bool(
                resultado.get(
                    "itens_manuais_ignorados"
                )
            )

            possui_retiradas = bool(
                resultado.get(
                    "retiradas"
                )
            )


            if (
                possui_retiradas
                and possui_manuais
            ):

                mensagem = (
                    "Produtos do estoque "
                    "retirados com sucesso. "
                    "Itens manuais foram "
                    "ignorados."
                )

            elif possui_retiradas:

                mensagem = (
                    "Produtos do estoque "
                    "retirados com sucesso."
                )

            else:

                mensagem = (
                    "Nenhum item de estoque "
                    "precisou ser retirado. "
                    "Os itens manuais foram "
                    "ignorados."
                )


            return jsonify({
                "mensagem":
                    mensagem,

                "producao":
                    resultado
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao retirar estoque "
                f"por receita: {erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500

