from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.usuario_admin import UsuarioAdmin


class UsuarioRepository:

    @staticmethod
    def _converter_para_entity(registro):

        if registro is None:
            return None

        return UsuarioAdmin(
            id=registro["id"],
            nome=registro["nome"],
            sobrenome=registro["sobrenome"],
            email=registro["email"],
            senha_hash=registro["senha_hash"],
            ativo=registro["ativo"],
            criado_em=registro["criado_em"]
        )


    @staticmethod
    def buscar_por_email(email):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo,
                        criado_em
                    FROM usuarios_admin
                    WHERE LOWER(email) = LOWER(%s)
                    LIMIT 1
                    """,
                    (email,)
                )

                registro = cursor.fetchone()

                return UsuarioRepository._converter_para_entity(
                    registro
                )

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(usuario_id):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo,
                        criado_em
                    FROM usuarios_admin
                    WHERE id = %s
                    """,
                    (usuario_id,)
                )

                registro = cursor.fetchone()

                return UsuarioRepository._converter_para_entity(
                    registro
                )

        finally:

            connection.close()


    @staticmethod
    def listar():

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo,
                        criado_em
                    FROM usuarios_admin
                    ORDER BY nome, sobrenome
                    """
                )

                registros = cursor.fetchall()

                return [
                    UsuarioRepository._converter_para_entity(
                        registro
                    )
                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def criar(usuario):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO usuarios_admin
                    (
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    RETURNING
                        id,
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo,
                        criado_em
                    """,
                    (
                        usuario.nome,
                        usuario.sobrenome,
                        usuario.email,
                        usuario.senha_hash,
                        usuario.ativo
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return UsuarioRepository._converter_para_entity(
                    registro
                )

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar(
        usuario_id,
        nome,
        sobrenome,
        email,
        ativo
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    UPDATE usuarios_admin

                    SET
                        nome = %s,
                        sobrenome = %s,
                        email = %s,
                        ativo = %s

                    WHERE id = %s

                    RETURNING
                        id,
                        nome,
                        sobrenome,
                        email,
                        senha_hash,
                        ativo,
                        criado_em
                    """,
                    (
                        nome,
                        sobrenome,
                        email,
                        ativo,
                        usuario_id
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return UsuarioRepository._converter_para_entity(
                    registro
                )

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar_senha(
        usuario_id,
        senha_hash
    ):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE usuarios_admin

                    SET senha_hash = %s

                    WHERE id = %s
                    """,
                    (
                        senha_hash,
                        usuario_id
                    )
                )

                connection.commit()

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def desativar(usuario_id):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE usuarios_admin

                    SET ativo = FALSE

                    WHERE id = %s
                    """,
                    (usuario_id,)
                )

                alterados = cursor.rowcount

                connection.commit()

                return alterados > 0

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()