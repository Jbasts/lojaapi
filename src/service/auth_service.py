import bcrypt

from flask_jwt_extended import create_access_token

from src.repositories.usuario_repository import UsuarioRepository


class AuthService:

    @staticmethod
    def login(
        email,
        senha
    ):

        if not email or not senha:

            raise ValueError(
                "Email e senha são obrigatórios."
            )

        usuario = UsuarioRepository.buscar_por_email(
            email.strip().lower()
        )

        if not usuario:

            return None

        if not usuario.ativo:

            raise ValueError(
                "Usuário desativado."
            )

        senha_valida = bcrypt.checkpw(
            senha.encode("utf-8"),
            usuario.senha_hash.encode("utf-8")
        )

        if not senha_valida:

            return None

        access_token = create_access_token(
            identity=str(usuario.id)
        )

        return {
            "access_token": access_token,
            "usuario": usuario.to_dict()
        }