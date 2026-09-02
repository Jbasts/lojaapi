from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.compra import Compra
from src.entities.item_compra import ItemCompra


class CompraRepository:

    @staticmethod
    def listar(busca=None):

        connection = get_connection()

        try:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = """
                    SELECT
                        c.id,
                        c.numero,
                        c.data_compra,
                        c.status,
                        c.desconto,

                        COUNT(ic.id) AS quantidade_itens,

                        COALESCE(
                            SUM(
                                ic.quantidade
                                * ic.valor_unitario
                            ),
                            0
                        ) - c.desconto
                            AS valor_total

                    FROM compras c

                    LEFT JOIN itens_compra ic
                        ON ic.compra_id = c.id

                    WHERE c.status <> 'CANCELADA'
                """

                parametros = []

                if busca:
                    termo = f"%{busca}%"

                    sql += """
                        AND (
                            CAST(c.numero AS TEXT)
                                ILIKE %s

                            OR EXISTS (
                                SELECT 1

                                FROM itens_compra ic2

                                INNER JOIN produtos_estoque pe
                                    ON pe.id =
                                    ic2.produto_estoque_id

                                WHERE
                                    ic2.compra_id = c.id

                                AND (
                                    pe.nome ILIKE %s
                                    OR pe.codigo_barras
                                        ILIKE %s
                                )
                            )
                        )
                    """

                    parametros.extend([
                        termo,
                        termo,
                        termo
                    ])

                sql += """
                    GROUP BY
                        c.id,
                        c.numero,
                        c.data_compra,
                        c.status,
                        c.desconto

                    ORDER BY
                        c.data_compra DESC,
                        c.id DESC
                """

                cursor.execute(
                    sql,
                    parametros
                )

                registros = cursor.fetchall()

                return [
                    {
                        "id": r["id"],
                        "numero": r["numero"],
                        "data_compra":
                            r["data_compra"].isoformat(),
                        "status": r["status"],
                        "quantidade_itens":
                            r["quantidade_itens"],
                        "valor_total":
                            float(r["valor_total"] or 0)
                    }
                    for r in registros
                ]

        finally:
            connection.close()


    @staticmethod
    def buscar_por_id(compra_id):

        connection = get_connection()

        try:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        numero,
                        usuario_id,
                        data_compra,
                        status,
                        desconto,
                        observacao

                    FROM compras

                    WHERE id = %s
                    LIMIT 1
                    """,
                    (compra_id,)
                )

                registro = cursor.fetchone()

                if not registro:
                    return None

                compra = Compra(
                    id=registro["id"],
                    numero=registro["numero"],
                    usuario_id=registro["usuario_id"],
                    data_compra=registro["data_compra"],
                    status=registro["status"],
                    desconto=registro["desconto"],
                    observacao=registro["observacao"]
                )

                cursor.execute(
                    """
                    SELECT
                        ic.id,
                        ic.compra_id,
                        ic.produto_estoque_id,

                        pe.nome AS produto_nome,
                        pe.codigo_barras,

                        ic.quantidade,
                        ic.valor_unitario,
                        ic.validade,
                        ic.criado_em

                    FROM itens_compra ic

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                        ic.produto_estoque_id

                    WHERE ic.compra_id = %s

                    ORDER BY ic.id
                    """,
                    (compra_id,)
                )

                registros_itens = cursor.fetchall()

                compra.itens = [
                    ItemCompra(
                        id=r["id"],
                        compra_id=r["compra_id"],
                        produto_estoque_id=(
                            r["produto_estoque_id"]
                        ),
                        produto_nome=r["produto_nome"],
                        codigo_barras=r["codigo_barras"],
                        quantidade=r["quantidade"],
                        valor_unitario=r["valor_unitario"],
                        validade=r["validade"],
                        criado_em=r["criado_em"]
                    )
                    for r in registros_itens
                ]

                return compra

        finally:
            connection.close()


    @staticmethod
    def pode_alterar(compra_id):

        connection = get_connection()

        try:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT EXISTS (

                        SELECT 1

                        FROM itens_compra ic

                        WHERE ic.compra_id = %s

                        AND (
                            NOT EXISTS (
                                SELECT 1

                                FROM lotes_estoque l

                                WHERE
                                    l.item_compra_id = ic.id
                            )

                            OR EXISTS (
                                SELECT 1

                                FROM lotes_estoque l

                                WHERE
                                    l.item_compra_id = ic.id

                                AND (
                                    l.quantidade_atual
                                        <>
                                    l.quantidade_inicial

                                    OR EXISTS (
                                        SELECT 1

                                        FROM movimentacoes_estoque m

                                        WHERE
                                            m.lote_id = l.id

                                        AND m.tipo
                                            <>
                                            'ENTRADA_COMPRA'
                                    )
                                )
                            )
                        )
                    ) AS bloqueada
                    """,
                    (compra_id,)
                )

                resultado = cursor.fetchone()

                return not resultado["bloqueada"]

        finally:
            connection.close()


    @staticmethod
    def _inserir_itens_e_estoque(
        cursor,
        compra_id,
        itens
    ):

        for item in itens:

            cursor.execute(
                """
                INSERT INTO itens_compra
                (
                    compra_id,
                    produto_estoque_id,
                    quantidade,
                    valor_unitario,
                    validade
                )

                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )

                RETURNING id
                """,
                (
                    compra_id,
                    item["produto_estoque_id"],
                    item["quantidade"],
                    item["valor_unitario"],
                    item["validade"]
                )
            )

            item_compra_id = (
                cursor.fetchone()["id"]
            )


            cursor.execute(
                """
                INSERT INTO lotes_estoque
                (
                    item_compra_id,
                    produto_estoque_id,
                    quantidade_inicial,
                    quantidade_atual,
                    custo_unitario,
                    validade
                )

                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )

                RETURNING id
                """,
                (
                    item_compra_id,
                    item["produto_estoque_id"],
                    item["quantidade"],
                    item["quantidade"],
                    item["valor_unitario"],
                    item["validade"]
                )
            )

            lote_id = cursor.fetchone()["id"]


            cursor.execute(
                """
                INSERT INTO movimentacoes_estoque
                (
                    lote_id,
                    tipo,
                    quantidade,
                    origem_tipo,
                    origem_id,
                    observacao
                )

                VALUES
                (
                    %s,
                    'ENTRADA_COMPRA',
                    %s,
                    'COMPRA',
                    %s,
                    'Entrada gerada pela compra'
                )
                """,
                (
                    lote_id,
                    item["quantidade"],
                    compra_id
                )
            )


    @staticmethod
    def criar(
        usuario_id,
        itens
    ):

        connection = get_connection()

        try:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO compras
                    (
                        usuario_id,
                        status,
                        desconto
                    )

                    VALUES
                    (
                        %s,
                        'CONFIRMADA',
                        0
                    )

                    RETURNING id
                    """,
                    (usuario_id,)
                )

                compra_id = (
                    cursor.fetchone()["id"]
                )

                CompraRepository \
                    ._inserir_itens_e_estoque(
                        cursor,
                        compra_id,
                        itens
                    )

                connection.commit()

                return compra_id

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    @staticmethod
    def _remover_estoque_compra(
        cursor,
        compra_id
    ):

        cursor.execute(
            """
            DELETE FROM movimentacoes_estoque

            WHERE lote_id IN (
                SELECT l.id

                FROM lotes_estoque l

                INNER JOIN itens_compra ic
                    ON ic.id =
                    l.item_compra_id

                WHERE ic.compra_id = %s
            )
            """,
            (compra_id,)
        )


        cursor.execute(
            """
            DELETE FROM lotes_estoque

            WHERE item_compra_id IN (
                SELECT id

                FROM itens_compra

                WHERE compra_id = %s
            )
            """,
            (compra_id,)
        )


        cursor.execute(
            """
            DELETE FROM itens_compra
            WHERE compra_id = %s
            """,
            (compra_id,)
        )


    @staticmethod
    def atualizar(
        compra_id,
        itens
    ):

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT id

                    FROM compras

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (compra_id,)
                )

                if not cursor.fetchone():
                    raise ValueError(
                        "Compra não encontrada."
                    )

                CompraRepository \
                    ._remover_estoque_compra(
                        cursor,
                        compra_id
                    )

                CompraRepository \
                    ._inserir_itens_e_estoque(
                        cursor,
                        compra_id,
                        itens
                    )

                connection.commit()

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()


    @staticmethod
    def excluir(compra_id):

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                CompraRepository \
                    ._remover_estoque_compra(
                        cursor,
                        compra_id
                    )

                cursor.execute(
                    """
                    DELETE FROM compras
                    WHERE id = %s
                    """,
                    (compra_id,)
                )

                alterados = cursor.rowcount

                connection.commit()

                return alterados > 0

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()