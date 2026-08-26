from flask import jsonify, request

from src.service.auth_service import AuthService


class AuthController:

    @staticmethod
    def login():

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            resultado = AuthService.login(
                email=dados.get("email"),
                senha=dados.get("senha")
            )

            if not resultado:

                return jsonify({
                    "erro": "Email ou senha inválidos."
                }), 401

            return jsonify(
                resultado
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro no login: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500