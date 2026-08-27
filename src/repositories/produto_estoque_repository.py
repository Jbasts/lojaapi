from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.produto_estoque import ProdutoEstoque


class ProdutoEstoqueRepository:

    @staticmethod
    def _converter_para_entity(registro):

        if registro is None:
            return None

        return ProdutoEstoque(
            id=registro["id"],
            nome=registro["nome"],
            codigo_barras=registro["codigo_barras"],
            unidade=registro["unidade"],
            controla_validade=registro["controla_validade"],
            estoque_minimo=registro["estoque_minimo"],
            ativo=registro["ativo"],
            criado_em=registro["criado_em"]
        )


    @staticmethod
    def listar(busca=None):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                if busca:

                    termo = f"%{busca}%"

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            codigo_barras,
                            unidade,
                            controla_validade,
                            estoque_minimo,
                            ativo,
                            criado_em
                        FROM produtos_estoque
                        WHERE ativo = TRUE
                        AND (
                            nome ILIKE %s
                            OR codigo_barras ILIKE %s
                        )
                        ORDER BY nome
                        """,
                        (
                            termo,
                            termo
                        )
                    )

                else:

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            codigo_barras,
                            unidade,
                            controla_validade,
                            estoque_minimo,
                            ativo,
                            criado_em
                        FROM produtos_estoque
                        WHERE ativo = TRUE
                        ORDER BY nome
                        """
                    )

                registros = cursor.fetchall()

                return [
                    ProdutoEstoqueRepository
                    ._converter_para_entity(registro)
                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(produto_id):

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
                        codigo_barras,
                        unidade,
                        controla_validade,
                        estoque_minimo,
                        ativo,
                        criado_em
                    FROM produtos_estoque
                    WHERE id = %s
                    LIMIT 1
                    """,
                    (produto_id,)
                )

                registro = cursor.fetchone()

                return ProdutoEstoqueRepository \
                    ._converter_para_entity(registro)

        finally:

            connection.close()


    @staticmethod
    def buscar_por_codigo(codigo_barras):

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
                        codigo_barras,
                        unidade,
                        controla_validade,
                        estoque_minimo,
                        ativo,
                        criado_em
                    FROM produtos_estoque
                    WHERE codigo_barras = %s
                    LIMIT 1
                    """,
                    (codigo_barras,)
                )

                registro = cursor.fetchone()

                return ProdutoEstoqueRepository \
                    ._converter_para_entity(registro)

        finally:

            connection.close()


    @staticmethod
    def criar(produto):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO produtos_estoque
                    (
                        nome,
                        codigo_barras,
                        unidade,
                        controla_validade,
                        estoque_minimo,
                        ativo
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        TRUE
                    )
                    RETURNING
                        id,
                        nome,
                        codigo_barras,
                        unidade,
                        controla_validade,
                        estoque_minimo,
                        ativo,
                        criado_em
                    """,
                    (
                        produto.nome,
                        produto.codigo_barras,
                        produto.unidade,
                        produto.controla_validade,
                        produto.estoque_minimo
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return ProdutoEstoqueRepository \
                    ._converter_para_entity(registro)

        except Exception:

            connection.rollback()
            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar(produto):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    UPDATE produtos_estoque

                    SET
                        nome = %s,
                        codigo_barras = %s

                    WHERE id = %s

                    RETURNING
                        id,
                        nome,
                        codigo_barras,
                        unidade,
                        controla_validade,
                        estoque_minimo,
                        ativo,
                        criado_em
                    """,
                    (
                        produto.nome,
                        produto.codigo_barras,
                        produto.id
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                return ProdutoEstoqueRepository \
                    ._converter_para_entity(registro)

        except Exception:

            connection.rollback()
            raise

        finally:

            connection.close()


    @staticmethod
    def desativar(produto_id):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE produtos_estoque
                    SET ativo = FALSE
                    WHERE id = %s
                    """,
                    (produto_id,)
                )

                alterados = cursor.rowcount

                connection.commit()

                return alterados > 0

        except Exception:

            connection.rollback()
            raise

        finally:

            connection.close()