from flask import (
    jsonify,
    request
)

from src.service.despesa_extra_service import (
    DespesaExtraService,
    DespesaDuplicadaError
)


class DespesaExtraController:

    @staticmethod
    def listar():

        try:

            busca = request.args.get(
                "busca"
            )

            despesas = (
                DespesaExtraService
                .listar(busca)
            )

            return jsonify(
                despesas
            ), 200

        except Exception as erro:

            print(
                "Erro ao listar despesas: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(despesa_id):

        try:

            despesa = (
                DespesaExtraService
                .buscar_por_id(
                    despesa_id
                )
            )

            return jsonify(
                despesa.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                "Erro ao buscar despesa: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def criar():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            despesa = (
                DespesaExtraService
                .criar(dados)
            )

            return jsonify({
                "mensagem":
                    "Despesa cadastrada "
                    "com sucesso.",

                "despesa":
                    despesa.to_dict()
            }), 201


        except DespesaDuplicadaError as erro:

            return jsonify({
                "erro": str(erro),

                "codigo":
                    "DESPESA_DUPLICADA"
            }), 409


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao criar despesa: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(despesa_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            despesa = (
                DespesaExtraService
                .atualizar(
                    despesa_id,
                    dados
                )
            )

            return jsonify({
                "mensagem":
                    "Despesa atualizada "
                    "com sucesso.",

                "despesa":
                    despesa.to_dict()
            }), 200


        except DespesaDuplicadaError as erro:

            return jsonify({
                "erro": str(erro),

                "codigo":
                    "DESPESA_DUPLICADA"
            }), 409


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


        except Exception as erro:

            print(
                "Erro ao atualizar despesa: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500


    @staticmethod
    def excluir(despesa_id):

        try:

            DespesaExtraService.excluir(
                despesa_id
            )

            return jsonify({
                "mensagem":
                    "Despesa excluída "
                    "com sucesso."
            }), 200


        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404


        except Exception as erro:

            print(
                "Erro ao excluir despesa: "
                f"{erro}"
            )

            return jsonify({
                "erro":
                    "Erro interno do servidor."
            }), 500