from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.produto_venda import ProdutoVenda


class ProdutoVendaRepository:

    @staticmethod
    def _converter_para_entity(registro):

        if registro is None:
            return None

        return ProdutoVenda(
            id=registro["id"],

            produto_estoque_id=(
                registro["produto_estoque_id"]
            ),

            produto_estoque_nome=(
                registro.get(
                    "produto_estoque_nome"
                )
            ),

            nome=registro["nome"],

            sabor=registro["sabor"],

            tipo=registro["tipo"],

            unidade=registro["unidade"],

            preco_venda=(
                registro["preco_venda"]
            ),

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

                sql = """
                    SELECT
                        pv.id,

                        pv.produto_estoque_id,

                        pe.nome
                            AS produto_estoque_nome,

                        pv.nome,
                        pv.sabor,
                        pv.tipo,
                        pv.unidade,
                        pv.preco_venda,
                        pv.ativo,
                        pv.criado_em

                    FROM produtos_venda pv

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                        pv.produto_estoque_id

                    WHERE pv.ativo = TRUE
                """

                parametros = []

                if busca:

                    sql += """
                        AND (
                            pv.nome ILIKE %s
                            OR pv.sabor ILIKE %s
                            OR pv.tipo ILIKE %s
                            OR pe.nome ILIKE %s
                        )
                    """

                    termo = f"%{busca}%"

                    parametros.extend([
                        termo,
                        termo,
                        termo,
                        termo
                    ])

                sql += """
                    ORDER BY
                        pv.nome,
                        pv.sabor
                """

                cursor.execute(
                    sql,
                    parametros
                )

                registros = cursor.fetchall()

                return [
                    ProdutoVendaRepository
                    ._converter_para_entity(
                        registro
                    )
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
                        pv.id,

                        pv.produto_estoque_id,

                        pe.nome
                            AS produto_estoque_nome,

                        pv.nome,
                        pv.sabor,
                        pv.tipo,
                        pv.unidade,
                        pv.preco_venda,
                        pv.ativo,
                        pv.criado_em

                    FROM produtos_venda pv

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                        pv.produto_estoque_id

                    WHERE pv.id = %s

                    LIMIT 1
                    """,
                    (produto_id,)
                )

                registro = cursor.fetchone()

                return (
                    ProdutoVendaRepository
                    ._converter_para_entity(
                        registro
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def buscar_por_nome_sabor(
        nome,
        sabor
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        pv.id,

                        pv.produto_estoque_id,

                        pe.nome
                            AS produto_estoque_nome,

                        pv.nome,
                        pv.sabor,
                        pv.tipo,
                        pv.unidade,
                        pv.preco_venda,
                        pv.ativo,
                        pv.criado_em

                    FROM produtos_venda pv

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                        pv.produto_estoque_id

                    WHERE pv.ativo = TRUE

                    AND LOWER(pv.nome) =
                        LOWER(%s)

                    AND LOWER(
                        COALESCE(
                            pv.sabor,
                            ''
                        )
                    ) =
                    LOWER(
                        COALESCE(
                            %s,
                            ''
                        )
                    )

                    LIMIT 1
                    """,
                    (
                        nome,
                        sabor
                    )
                )

                registro = cursor.fetchone()

                return (
                    ProdutoVendaRepository
                    ._converter_para_entity(
                        registro
                    )
                )

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
                    INSERT INTO produtos_venda
                    (
                        produto_estoque_id,
                        nome,
                        sabor,
                        tipo,
                        unidade,
                        preco_venda,
                        ativo
                    )

                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        TRUE
                    )

                    RETURNING
                        id,
                        produto_estoque_id,
                        nome,
                        sabor,
                        tipo,
                        unidade,
                        preco_venda,
                        ativo,
                        criado_em
                    """,
                    (
                        produto.produto_estoque_id,
                        produto.nome,
                        produto.sabor,
                        produto.tipo,
                        produto.unidade,
                        produto.preco_venda
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                produto_criado = (
                    ProdutoVendaRepository
                    .buscar_por_id(
                        registro["id"]
                    )
                )

                return produto_criado

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
                    UPDATE produtos_venda

                    SET
                        produto_estoque_id = %s,
                        nome = %s,
                        sabor = %s,
                        tipo = %s,
                        preco_venda = %s

                    WHERE id = %s

                    RETURNING id
                    """,
                    (
                        produto.produto_estoque_id,
                        produto.nome,
                        produto.sabor,
                        produto.tipo,
                        produto.preco_venda,
                        produto.id
                    )
                )

                registro = cursor.fetchone()

                connection.commit()

                if not registro:
                    return None

                return (
                    ProdutoVendaRepository
                    .buscar_por_id(
                        registro["id"]
                    )
                )

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
                    UPDATE produtos_venda

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