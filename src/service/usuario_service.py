import bcrypt

from src.entities.usuario_admin import UsuarioAdmin
from src.repositories.usuario_repository import UsuarioRepository


class UsuarioService:

    @staticmethod
    def listar():

        usuarios = UsuarioRepository.listar()

        return [
            usuario.to_dict()
            for usuario in usuarios
        ]


    @staticmethod
    def buscar_por_id(usuario_id):

        usuario = UsuarioRepository.buscar_por_id(
            usuario_id
        )

        if not usuario:

            raise ValueError(
                "Usuário não encontrado."
            )

        return usuario


    @staticmethod
    def criar(
        nome,
        sobrenome,
        email,
        senha
    ):

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not sobrenome or not sobrenome.strip():

            raise ValueError(
                "Sobrenome é obrigatório."
            )

        if not email or not email.strip():

            raise ValueError(
                "Email é obrigatório."
            )

        if not senha:

            raise ValueError(
                "Senha é obrigatória."
            )

        if len(senha) < 6:

            raise ValueError(
                "A senha deve possuir pelo menos 6 caracteres."
            )

        email = email.strip().lower()

        usuario_existente = (
            UsuarioRepository.buscar_por_email(
                email
            )
        )

        if usuario_existente:

            raise ValueError(
                "Já existe um usuário com esse email."
            )

        senha_hash = bcrypt.hashpw(
            senha.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        usuario = UsuarioAdmin(
            nome=nome.strip(),
            sobrenome=sobrenome.strip(),
            email=email,
            senha_hash=senha_hash,
            ativo=True
        )

        usuario = UsuarioRepository.criar(
            usuario
        )

        return usuario


    @staticmethod
    def atualizar(
        usuario_id,
        nome,
        sobrenome,
        email,
        ativo=True,
        senha=None
    ):

        usuario_atual = (
            UsuarioRepository.buscar_por_id(
                usuario_id
            )
        )

        if not usuario_atual:

            raise ValueError(
                "Usuário não encontrado."
            )

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not sobrenome or not sobrenome.strip():

            raise ValueError(
                "Sobrenome é obrigatório."
            )

        if not email or not email.strip():

            raise ValueError(
                "Email é obrigatório."
            )

        email = email.strip().lower()

        usuario_email = (
            UsuarioRepository.buscar_por_email(
                email
            )
        )

        if (
            usuario_email
            and usuario_email.id != usuario_id
        ):

            raise ValueError(
                "Já existe outro usuário com esse email."
            )

        usuario = UsuarioRepository.atualizar(
            usuario_id=usuario_id,
            nome=nome.strip(),
            sobrenome=sobrenome.strip(),
            email=email,
            ativo=ativo
        )

        if senha:

            if len(senha) < 6:

                raise ValueError(
                    "A senha deve possuir pelo menos 6 caracteres."
                )

            senha_hash = bcrypt.hashpw(
                senha.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            UsuarioRepository.atualizar_senha(
                usuario_id,
                senha_hash
            )

        return usuario


    @staticmethod
    def desativar(
        usuario_id,
        usuario_logado_id
    ):

        if usuario_id == usuario_logado_id:

            raise ValueError(
                "Você não pode desativar seu próprio usuário."
            )

        usuario = UsuarioRepository.buscar_por_id(
            usuario_id
        )

        if not usuario:

            raise ValueError(
                "Usuário não encontrado."
            )

        UsuarioRepository.desativar(
            usuario_id
        )