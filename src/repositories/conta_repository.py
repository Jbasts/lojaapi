from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.conta import ContaMovimento


class ContaRepository:

    @staticmethod
    def _cte_movimentos():

        return """
            WITH movimentos AS (

                -- =========================
                -- ENTRADAS
                -- PAGAMENTOS RECEBIDOS
                -- =========================

                SELECT
                    pg.id
                        AS origem_id,

                    'ENTRADA'
                        AS tipo,

                    'PAGAMENTO'
                        AS categoria,

                    pg.data_pagamento
                        AS data_movimento,

                    CONCAT(
                        'Pedido #',
                        p.numero
                    )
                        AS referencia,

                    CONCAT(
                        'Pagamento - ',
                        c.nome,
                        ' ',
                        c.sobrenome
                    )
                        AS descricao,

                    pg.valor
                        AS valor

                FROM pagamentos pg

                INNER JOIN pedidos p
                    ON p.id =
                        pg.pedido_id

                INNER JOIN clientes c
                    ON c.id =
                        p.cliente_id

                WHERE
                    pg.status = 'PAGO'

                    AND pg.data_pagamento
                        IS NOT NULL


                UNION ALL


                -- =========================
                -- SAÍDAS
                -- COMPRAS
                -- =========================

                SELECT
                    co.id
                        AS origem_id,

                    'SAIDA'
                        AS tipo,

                    'COMPRA'
                        AS categoria,

                    co.data_compra
                        AS data_movimento,

                    CONCAT(
                        'Compra #',
                        co.numero
                    )
                        AS referencia,

                    CONCAT(
                        'Compra #',
                        co.numero
                    )
                        AS descricao,

                    GREATEST(

                        COALESCE(
                            SUM(
                                ic.quantidade
                                *
                                ic.valor_unitario
                            ),
                            0
                        )

                        -

                        COALESCE(
                            co.desconto,
                            0
                        ),

                        0

                    )
                        AS valor

                FROM compras co

                LEFT JOIN itens_compra ic
                    ON ic.compra_id =
                        co.id

                WHERE
                    co.status =
                        'CONFIRMADA'

                GROUP BY
                    co.id,
                    co.numero,
                    co.data_compra,
                    co.desconto


                UNION ALL


                -- =========================
                -- SAÍDAS
                -- DESPESAS EXTRAS
                -- =========================

                SELECT
                    de.id
                        AS origem_id,

                    'SAIDA'
                        AS tipo,

                    'DESPESA_EXTRA'
                        AS categoria,

                    de.data
                        AS data_movimento,

                    CONCAT(
                        'Despesa #',
                        de.id
                    )
                        AS referencia,

                    de.nome
                        AS descricao,

                    (
                        de.quantidade
                        *
                        de.valor_unitario
                    )
                        AS valor

                FROM despesas_extras de
            )
        """


    @staticmethod
    def _adicionar_periodo(
        sql,
        parametros,
        periodo,
        data_referencia
    ):

        if periodo == "DIARIO":

            sql += """
                AND
                    m.data_movimento::date
                    = %s
            """

            parametros.append(
                data_referencia
            )


        elif periodo == "MENSAL":

            sql += """
                AND DATE_TRUNC(
                    'month',
                    m.data_movimento
                )
                =
                DATE_TRUNC(
                    'month',
                    %s::date
                )
            """

            parametros.append(
                data_referencia
            )


        elif periodo == "ANUAL":

            sql += """
                AND EXTRACT(
                    YEAR
                    FROM m.data_movimento
                )
                =
                EXTRACT(
                    YEAR
                    FROM %s::date
                )
            """

            parametros.append(
                data_referencia
            )


        return sql


    @staticmethod
    def listar(
        periodo,
        data_referencia,
        busca=None,
        tipo=None,
        categoria=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = (
                    ContaRepository
                    ._cte_movimentos()
                )

                sql += """
                    SELECT
                        m.origem_id,
                        m.tipo,
                        m.categoria,
                        m.data_movimento,
                        m.referencia,
                        m.descricao,
                        m.valor

                    FROM movimentos m

                    WHERE 1 = 1
                """

                parametros = []


                sql = (
                    ContaRepository
                    ._adicionar_periodo(
                        sql,
                        parametros,
                        periodo,
                        data_referencia
                    )
                )


                if busca:

                    termo = (
                        f"%{busca}%"
                    )

                    sql += """
                        AND (
                            m.referencia
                                ILIKE %s

                            OR m.descricao
                                ILIKE %s
                        )
                    """

                    parametros.extend([
                        termo,
                        termo
                    ])


                if tipo:

                    sql += """
                        AND m.tipo = %s
                    """

                    parametros.append(
                        tipo
                    )


                if categoria:

                    sql += """
                        AND m.categoria = %s
                    """

                    parametros.append(
                        categoria
                    )


                sql += """
                    ORDER BY
                        m.data_movimento DESC,
                        m.origem_id DESC
                """


                cursor.execute(
                    sql,
                    parametros
                )


                registros = (
                    cursor.fetchall()
                )


                movimentos = []


                for registro in registros:

                    movimentos.append(
                        ContaMovimento(
                            origem_id=(
                                registro[
                                    "origem_id"
                                ]
                            ),

                            tipo=(
                                registro[
                                    "tipo"
                                ]
                            ),

                            categoria=(
                                registro[
                                    "categoria"
                                ]
                            ),

                            data_movimento=(
                                registro[
                                    "data_movimento"
                                ]
                            ),

                            referencia=(
                                registro[
                                    "referencia"
                                ]
                            ),

                            descricao=(
                                registro[
                                    "descricao"
                                ]
                            ),

                            valor=(
                                registro[
                                    "valor"
                                ]
                            )
                        )
                    )


                return movimentos

        finally:

            connection.close()


    @staticmethod
    def resumo(
        periodo,
        data_referencia
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = (
                    ContaRepository
                    ._cte_movimentos()
                )


                sql += """
                    SELECT

                        COUNT(*)
                            AS quantidade_movimentos,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN
                                        m.tipo =
                                        'ENTRADA'
                                    THEN
                                        m.valor
                                    ELSE
                                        0
                                END
                            ),
                            0
                        )
                            AS entradas,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN
                                        m.categoria =
                                        'COMPRA'
                                    THEN
                                        m.valor
                                    ELSE
                                        0
                                END
                            ),
                            0
                        )
                            AS compras,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN
                                        m.categoria =
                                        'DESPESA_EXTRA'
                                    THEN
                                        m.valor
                                    ELSE
                                        0
                                END
                            ),
                            0
                        )
                            AS despesas_extras,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN
                                        m.tipo =
                                        'SAIDA'
                                    THEN
                                        m.valor
                                    ELSE
                                        0
                                END
                            ),
                            0
                        )
                            AS saidas,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN
                                        m.tipo =
                                        'ENTRADA'
                                    THEN
                                        m.valor

                                    WHEN
                                        m.tipo =
                                        'SAIDA'
                                    THEN
                                        -m.valor

                                    ELSE
                                        0
                                END
                            ),
                            0
                        )
                            AS saldo

                    FROM movimentos m

                    WHERE 1 = 1
                """

                parametros = []


                sql = (
                    ContaRepository
                    ._adicionar_periodo(
                        sql,
                        parametros,
                        periodo,
                        data_referencia
                    )
                )


                cursor.execute(
                    sql,
                    parametros
                )


                registro = (
                    cursor.fetchone()
                )


                return {
                    "quantidade_movimentos":
                        registro[
                            "quantidade_movimentos"
                        ],

                    "entradas":
                        float(
                            registro[
                                "entradas"
                            ]
                            or 0
                        ),

                    "compras":
                        float(
                            registro[
                                "compras"
                            ]
                            or 0
                        ),

                    "despesas_extras":
                        float(
                            registro[
                                "despesas_extras"
                            ]
                            or 0
                        ),

                    "saidas":
                        float(
                            registro[
                                "saidas"
                            ]
                            or 0
                        ),

                    "saldo":
                        float(
                            registro[
                                "saldo"
                            ]
                            or 0
                        )
                }

        finally:

            connection.close()


    @staticmethod
    def buscar_compra_detalhes(
        compra_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # ==========================
                # DADOS DA COMPRA
                # ==========================

                cursor.execute(
                    """
                    SELECT
                        c.id,
                        c.numero,
                        c.data_compra,
                        c.status,
                        c.desconto,
                        c.observacao,

                        COALESCE(
                            SUM(
                                ic.quantidade
                                *
                                ic.valor_unitario
                            ),
                            0
                        ) AS subtotal

                    FROM compras c

                    LEFT JOIN itens_compra ic
                        ON ic.compra_id =
                            c.id

                    WHERE
                        c.id = %s

                    GROUP BY
                        c.id,
                        c.numero,
                        c.data_compra,
                        c.status,
                        c.desconto,
                        c.observacao

                    LIMIT 1
                    """,
                    (
                        compra_id,
                    )
                )


                compra = (
                    cursor.fetchone()
                )


                if not compra:

                    return None


                # ==========================
                # ITENS
                # ==========================

                cursor.execute(
                    """
                    SELECT
                        ic.id,
                        ic.produto_estoque_id,

                        pe.nome
                            AS produto,

                        pe.codigo_barras,

                        ic.quantidade,
                        ic.valor_unitario,
                        ic.validade,

                        (
                            ic.quantidade
                            *
                            ic.valor_unitario
                        ) AS valor_total

                    FROM itens_compra ic

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                            ic.produto_estoque_id

                    WHERE
                        ic.compra_id = %s

                    ORDER BY
                        ic.id
                    """,
                    (
                        compra_id,
                    )
                )


                registros_itens = (
                    cursor.fetchall()
                )


                subtotal = float(
                    compra[
                        "subtotal"
                    ]
                    or 0
                )


                desconto = float(
                    compra[
                        "desconto"
                    ]
                    or 0
                )


                valor_total = max(
                    subtotal
                    -
                    desconto,
                    0
                )


                itens = []


                for item in registros_itens:

                    itens.append({

                        "id":
                            item["id"],

                        "produto_estoque_id":
                            item[
                                "produto_estoque_id"
                            ],

                        "produto":
                            item[
                                "produto"
                            ],

                        "codigo_barras":
                            item[
                                "codigo_barras"
                            ],

                        "quantidade":
                            float(
                                item[
                                    "quantidade"
                                ]
                                or 0
                            ),

                        "valor_unitario":
                            float(
                                item[
                                    "valor_unitario"
                                ]
                                or 0
                            ),

                        "valor_total":
                            float(
                                item[
                                    "valor_total"
                                ]
                                or 0
                            ),

                        "validade": (
                            item[
                                "validade"
                            ].isoformat()

                            if item[
                                "validade"
                            ]

                            else None
                        )
                    })


                return {

                    "id":
                        compra["id"],

                    "numero":
                        compra["numero"],

                    "data_compra": (
                        compra[
                            "data_compra"
                        ].isoformat()

                        if compra[
                            "data_compra"
                        ]

                        else None
                    ),

                    "status":
                        str(
                            compra["status"]
                        ),

                    "observacao":
                        compra[
                            "observacao"
                        ],

                    "subtotal":
                        subtotal,

                    "desconto":
                        desconto,

                    "valor_total":
                        valor_total,

                    "itens":
                        itens
                }


        finally:

            connection.close()