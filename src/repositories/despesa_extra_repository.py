from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.despesa_extra import DespesaExtra


class DespesaExtraRepository:

    @staticmethod
    def _converter_para_entity(registro):

        if registro is None:
            return None

        return DespesaExtra(
            id=registro["id"],
            nome=registro["nome"],
            quantidade=registro["quantidade"],
            valor_unitario=registro["valor_unitario"],
            categoria=registro["categoria"],
            data=registro["data"],
            observacao=registro["observacao"],
            criado_em=registro["criado_em"]
        )


    @staticmethod
    def listar(busca=None):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = """
                    SELECT
                        id,
                        nome,
                        quantidade,
                        valor_unitario,
                        categoria,
                        data,
                        observacao,
                        criado_em

                    FROM despesas_extras
                """

                parametros = []


                if busca:

                    sql += """
                        WHERE nome ILIKE %s
                    """

                    parametros.append(
                        f"%{busca}%"
                    )


                sql += """
                    ORDER BY
                        data DESC,
                        id DESC
                """


                cursor.execute(
                    sql,
                    parametros
                )

                registros = cursor.fetchall()

                return [
                    DespesaExtraRepository
                    ._converter_para_entity(
                        registro
                    )

                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(despesa_id):

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
                        quantidade,
                        valor_unitario,
                        categoria,
                        data,
                        observacao,
                        criado_em

                    FROM despesas_extras

                    WHERE id = %s

                    LIMIT 1
                    """,
                    (despesa_id,)
                )

                registro = cursor.fetchone()

                return (
                    DespesaExtraRepository
                    ._converter_para_entity(
                        registro
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def buscar_por_nome(
        nome,
        ignorar_id=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                if ignorar_id:

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            quantidade,
                            valor_unitario,
                            categoria,
                            data,
                            observacao,
                            criado_em

                        FROM despesas_extras

                        WHERE LOWER(nome) =
                            LOWER(%s)

                        AND id <> %s

                        LIMIT 1
                        """,
                        (
                            nome,
                            ignorar_id
                        )
                    )

                else:

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            quantidade,
                            valor_unitario,
                            categoria,
                            data,
                            observacao,
                            criado_em

                        FROM despesas_extras

                        WHERE LOWER(nome) =
                            LOWER(%s)

                        LIMIT 1
                        """,
                        (nome,)
                    )


                registro = cursor.fetchone()

                return (
                    DespesaExtraRepository
                    ._converter_para_entity(
                        registro
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def criar(despesa):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO despesas_extras
                    (
                        nome,
                        quantidade,
                        valor_unitario,
                        categoria,
                        observacao
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
                        quantidade,
                        valor_unitario,
                        categoria,
                        data,
                        observacao,
                        criado_em
                    """,
                    (
                        despesa.nome,
                        despesa.quantidade,
                        despesa.valor_unitario,
                        despesa.categoria,
                        despesa.observacao
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return (
                    DespesaExtraRepository
                    ._converter_para_entity(
                        registro
                    )
                )

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar(despesa):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    UPDATE despesas_extras

                    SET
                        nome = %s,
                        quantidade = %s,
                        valor_unitario = %s,
                        categoria = %s,
                        observacao = %s

                    WHERE id = %s

                    RETURNING
                        id,
                        nome,
                        quantidade,
                        valor_unitario,
                        categoria,
                        data,
                        observacao,
                        criado_em
                    """,
                    (
                        despesa.nome,
                        despesa.quantidade,
                        despesa.valor_unitario,
                        despesa.categoria,
                        despesa.observacao,
                        despesa.id
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return (
                    DespesaExtraRepository
                    ._converter_para_entity(
                        registro
                    )
                )

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def excluir(despesa_id):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    DELETE FROM despesas_extras
                    WHERE id = %s
                    """,
                    (despesa_id,)
                )

                alterados = cursor.rowcount

                connection.commit()

                return alterados > 0

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()