from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity

from src.service.usuario_service import UsuarioService


class UsuarioController:

    @staticmethod
    def listar():

        try:

            usuarios = UsuarioService.listar()

            return jsonify(
                usuarios
            ), 200

        except Exception as erro:

            print(
                f"Erro ao listar usuários: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def buscar(usuario_id):

        try:

            usuario = UsuarioService.buscar_por_id(
                usuario_id
            )

            return jsonify(
                usuario.to_dict()
            ), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 404

        except Exception as erro:

            print(
                f"Erro ao buscar usuário: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def usuario_logado():

        try:

            usuario_id = int(
                get_jwt_identity()
            )

            usuario = UsuarioService.buscar_por_id(
                usuario_id
            )

            return jsonify(
                usuario.to_dict()
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

            usuario = UsuarioService.criar(
                nome=dados.get("nome"),
                sobrenome=dados.get("sobrenome"),
                email=dados.get("email"),
                senha=dados.get("senha")
            )

            return jsonify({
                "mensagem": "Usuário criado com sucesso.",
                "usuario": usuario.to_dict()
            }), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao criar usuário: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def atualizar(usuario_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            usuario = UsuarioService.atualizar(
                usuario_id=usuario_id,
                nome=dados.get("nome"),
                sobrenome=dados.get("sobrenome"),
                email=dados.get("email"),
                ativo=dados.get(
                    "ativo",
                    True
                ),
                senha=dados.get("senha")
            )

            return jsonify({
                "mensagem": "Usuário atualizado com sucesso.",
                "usuario": usuario.to_dict()
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao atualizar usuário: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500


    @staticmethod
    def desativar(usuario_id):

        try:

            usuario_logado_id = int(
                get_jwt_identity()
            )

            UsuarioService.desativar(
                usuario_id,
                usuario_logado_id
            )

            return jsonify({
                "mensagem": "Usuário desativado com sucesso."
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except Exception as erro:

            print(
                f"Erro ao desativar usuário: {erro}"
            )

            return jsonify({
                "erro": "Erro interno do servidor."
            }), 500