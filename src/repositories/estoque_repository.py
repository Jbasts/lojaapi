from datetime import date

from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.lote_estoque import LoteEstoque


class EstoqueRepository:

    @staticmethod
    def _converter_lote(registro):

        if registro is None:
            return None

        return LoteEstoque(
            id=registro["id"],

            item_compra_id=(
                registro["item_compra_id"]
            ),

            produto_estoque_id=(
                registro[
                    "produto_estoque_id"
                ]
            ),

            produto_nome=(
                registro["produto_nome"]
            ),

            codigo_barras=(
                registro["codigo_barras"]
            ),

            unidade=(
                registro["unidade"]
            ),

            quantidade_inicial=(
                registro[
                    "quantidade_inicial"
                ]
            ),

            quantidade_atual=(
                registro[
                    "quantidade_atual"
                ]
            ),

            custo_unitario=(
                registro["custo_unitario"]
            ),

            validade=(
                registro["validade"]
            ),

            compra_id=(
                registro["compra_id"]
            ),

            compra_numero=(
                registro["compra_numero"]
            ),

            data_compra=(
                registro["data_compra"]
            )
        )


    @staticmethod
    def listar(
        busca=None,
        status=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = """
                    SELECT
                        l.id,
                        l.item_compra_id,
                        l.produto_estoque_id,

                        pe.nome
                            AS produto_nome,

                        pe.codigo_barras,

                        pe.unidade,

                        l.quantidade_inicial,
                        l.quantidade_atual,
                        l.custo_unitario,
                        l.validade,

                        ic.compra_id,

                        c.numero
                            AS compra_numero,

                        c.data_compra,

                        CASE
                            WHEN l.validade IS NULL
                                THEN 'SEM_VALIDADE'

                            WHEN l.validade
                                < CURRENT_DATE
                                THEN 'VENCIDO'

                            ELSE 'VALIDO'
                        END AS status_validade

                    FROM lotes_estoque l

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                        l.produto_estoque_id

                    LEFT JOIN itens_compra ic
                        ON ic.id =
                        l.item_compra_id

                    LEFT JOIN compras c
                        ON c.id =
                        ic.compra_id

                    WHERE
                        l.quantidade_atual > 0
                        AND pe.ativo = TRUE
                """

                parametros = []


                if busca:

                    termo = f"%{busca}%"

                    sql += """
                        AND (
                            pe.nome ILIKE %s
                            OR pe.codigo_barras
                                ILIKE %s
                            OR CAST(
                                l.id AS TEXT
                            ) ILIKE %s
                        )
                    """

                    parametros.extend([
                        termo,
                        termo,
                        termo
                    ])


                if status == "VALIDO":

                    sql += """
                        AND l.validade
                            >= CURRENT_DATE
                    """


                elif status == "VENCIDO":

                    sql += """
                        AND l.validade
                            < CURRENT_DATE
                    """


                elif status == "SEM_VALIDADE":

                    sql += """
                        AND l.validade IS NULL
                    """


                sql += """
                    ORDER BY
                        pe.nome,

                        CASE
                            WHEN l.validade IS NULL
                                THEN 1
                            ELSE 0
                        END,

                        l.validade,

                        l.id
                """


                cursor.execute(
                    sql,
                    parametros
                )

                registros = (
                    cursor.fetchall()
                )


                return [
                    {
                        **(
                            EstoqueRepository
                            ._converter_lote(
                                registro
                            )
                            .to_dict()
                        ),

                        "status_validade":
                            registro[
                                "status_validade"
                            ]
                    }

                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def resumo():

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT

                        COUNT(
                            DISTINCT
                            produto_estoque_id
                        )
                        FILTER (
                            WHERE
                                quantidade_atual > 0
                        )
                        AS produtos,

                        COUNT(*)
                        FILTER (
                            WHERE
                                quantidade_atual > 0
                        )
                        AS lotes,

                        COALESCE(
                            SUM(
                                quantidade_atual
                            )
                            FILTER (
                                WHERE
                                    quantidade_atual > 0
                            ),
                            0
                        )
                        AS quantidade_total,

                        COALESCE(
                            SUM(
                                quantidade_atual
                                * custo_unitario
                            )
                            FILTER (
                                WHERE
                                    quantidade_atual > 0
                            ),
                            0
                        )
                        AS valor_estoque,

                        COUNT(*)
                        FILTER (
                            WHERE
                                quantidade_atual > 0
                                AND validade
                                    < CURRENT_DATE
                        )
                        AS lotes_vencidos

                    FROM lotes_estoque
                    """
                )

                registro = cursor.fetchone()

                return {
                    "produtos":
                        registro["produtos"],

                    "lotes":
                        registro["lotes"],

                    "quantidade_total":
                        float(
                            registro[
                                "quantidade_total"
                            ]
                            or 0
                        ),

                    "valor_estoque":
                        float(
                            registro[
                                "valor_estoque"
                            ]
                            or 0
                        ),

                    "lotes_vencidos":
                        registro[
                            "lotes_vencidos"
                        ]
                }

        finally:

            connection.close()


    @staticmethod
    def listar_lotes_produto(
        produto_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        l.id,
                        l.item_compra_id,
                        l.produto_estoque_id,

                        pe.nome
                            AS produto_nome,

                        pe.codigo_barras,

                        pe.unidade,

                        l.quantidade_inicial,
                        l.quantidade_atual,
                        l.custo_unitario,
                        l.validade,

                        ic.compra_id,

                        c.numero
                            AS compra_numero,

                        c.data_compra,

                        CASE
                            WHEN l.validade IS NULL
                                THEN 'SEM_VALIDADE'

                            WHEN l.validade
                                < CURRENT_DATE
                                THEN 'VENCIDO'

                            ELSE 'VALIDO'
                        END AS status_validade

                    FROM lotes_estoque l

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                        l.produto_estoque_id

                    LEFT JOIN itens_compra ic
                        ON ic.id =
                        l.item_compra_id

                    LEFT JOIN compras c
                        ON c.id =
                        ic.compra_id

                    WHERE
                        l.produto_estoque_id = %s

                        AND l.quantidade_atual > 0

                    ORDER BY

                        CASE
                            WHEN l.validade IS NULL
                                THEN 1
                            ELSE 0
                        END,

                        l.validade,

                        l.id
                    """,
                    (produto_id,)
                )

                registros = cursor.fetchall()


                return [
                    {
                        **(
                            EstoqueRepository
                            ._converter_lote(
                                registro
                            )
                            .to_dict()
                        ),

                        "status_validade":
                            registro[
                                "status_validade"
                            ]
                    }

                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def retirar_para_uso(
        lote_id,
        quantidade,
        usuario_id,
        observacao=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # Bloqueia o lote enquanto
                # fazemos a retirada.
                cursor.execute(
                    """
                    SELECT
                        l.id,
                        l.produto_estoque_id,
                        l.quantidade_atual,
                        l.validade,

                        pe.nome
                            AS produto_nome

                    FROM lotes_estoque l

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                        l.produto_estoque_id

                    WHERE l.id = %s

                    FOR UPDATE
                    """,
                    (lote_id,)
                )

                lote = cursor.fetchone()


                if not lote:

                    raise ValueError(
                        "Lote não encontrado."
                    )


                if (
                    lote["validade"]
                    and lote["validade"]
                        < date.today()
                ):

                    raise ValueError(
                        "Produto vencido não pode "
                        "ser retirado para uso. "
                        "Registre-o como desperdício."
                    )


                if (
                    quantidade
                    > lote["quantidade_atual"]
                ):

                    raise ValueError(
                        "Quantidade solicitada "
                        "maior que o saldo "
                        "disponível no lote."
                    )


                cursor.execute(
                    """
                    UPDATE lotes_estoque

                    SET
                        quantidade_atual =
                            quantidade_atual - %s

                    WHERE id = %s

                    RETURNING
                        quantidade_atual
                    """,
                    (
                        quantidade,
                        lote_id
                    )
                )

                atualizado = cursor.fetchone()


                cursor.execute(
                    """
                    INSERT INTO movimentacoes_estoque
                    (
                        lote_id,
                        tipo,
                        quantidade,
                        origem_tipo,
                        origem_id,
                        observacao,
                        usuario_id
                    )

                    VALUES
                    (
                        %s,
                        'SAIDA_USO',
                        %s,
                        'USO',
                        NULL,
                        %s,
                        %s
                    )
                    """,
                    (
                        lote_id,
                        quantidade,
                        observacao,
                        usuario_id
                    )
                )


                connection.commit()


                return {
                    "lote_id":
                        lote_id,

                    "produto_estoque_id":
                        lote[
                            "produto_estoque_id"
                        ],

                    "produto_nome":
                        lote["produto_nome"],

                    "quantidade_retirada":
                        float(quantidade),

                    "quantidade_atual":
                        float(
                            atualizado[
                                "quantidade_atual"
                            ]
                        )
                }

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()