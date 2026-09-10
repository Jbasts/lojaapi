from psycopg2.extras import RealDictCursor

from src.database import get_connection


class VendaRepository:

    # ==========================================
    # FILTRO DE PERÍODO
    # ==========================================

    @staticmethod
    def _filtro_periodo(
        periodo
    ):

        if periodo == "DIARIO":

            return """
                AND v.data_pedido::date = %s
            """


        if periodo == "MENSAL":

            return """
                AND DATE_TRUNC(
                    'month',
                    v.data_pedido
                )
                =
                DATE_TRUNC(
                    'month',
                    %s::date
                )
            """


        if periodo == "ANUAL":

            return """
                AND EXTRACT(
                    YEAR FROM v.data_pedido
                )
                =
                EXTRACT(
                    YEAR FROM %s::date
                )
            """


        return ""


    # ==========================================
    # LISTAR VENDAS
    #
    # Retorna:
    #
    # 1 pedido
    #   └── vários itens
    # ==========================================

    @staticmethod
    def listar(
        periodo,
        data_referencia,
        busca=None,
        status_pagamento=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = """
                    SELECT
                        v.pedido_id,
                        v.numero_pedido,
                        v.cliente_id,
                        v.cliente,

                        v.produto_id,
                        v.produto,
                        v.sabor,

                        v.quantidade,
                        v.valor_unitario,

                        v.desconto_tipo,
                        v.desconto_valor,

                        v.valor_bruto,
                        v.valor_desconto,
                        v.valor_final,

                        v.data_pedido,
                        v.concluido_em,

                        pg.forma,
                        pg.valor,
                        pg.data_pagamento,

                        CASE

                            WHEN pg.id IS NOT NULL
                            THEN 'PAGO'

                            ELSE 'PENDENTE'

                        END AS status_pagamento

                    FROM vw_vendas v

                    LEFT JOIN pagamentos pg
                        ON pg.pedido_id =
                            v.pedido_id

                        AND pg.status =
                            'PAGO'

                    WHERE 1 = 1
                """

                parametros = []


                # ==============================
                # PERÍODO
                # ==============================

                sql += (
                    VendaRepository
                    ._filtro_periodo(
                        periodo
                    )
                )

                parametros.append(
                    data_referencia
                )


                # ==============================
                # BUSCA
                #
                # Se encontrar um produto/sabor,
                # retorna TODOS os itens
                # daquele pedido.
                # ==============================

                if busca:

                    termo = (
                        f"%{busca}%"
                    )


                    sql += """
                        AND (

                            CAST(
                                v.numero_pedido
                                AS TEXT
                            ) ILIKE %s

                            OR v.cliente
                                ILIKE %s

                            OR EXISTS (

                                SELECT 1

                                FROM vw_vendas busca_venda

                                WHERE
                                    busca_venda.pedido_id =
                                        v.pedido_id

                                    AND (

                                        busca_venda.produto
                                            ILIKE %s

                                        OR COALESCE(
                                            busca_venda.sabor,
                                            ''
                                        ) ILIKE %s
                                    )
                            )
                        )
                    """


                    parametros.extend([
                        termo,
                        termo,
                        termo,
                        termo
                    ])


                # ==============================
                # STATUS DO PAGAMENTO
                # ==============================

                if (
                    status_pagamento
                    == "PAGO"
                ):

                    sql += """
                        AND pg.id IS NOT NULL
                    """


                elif (
                    status_pagamento
                    == "PENDENTE"
                ):

                    sql += """
                        AND pg.id IS NULL
                    """


                # ==============================
                # ORDENAÇÃO
                # ==============================

                sql += """
                    ORDER BY
                        v.data_pedido DESC,
                        v.pedido_id DESC,
                        v.produto,
                        v.sabor
                """


                cursor.execute(
                    sql,
                    parametros
                )


                registros = (
                    cursor.fetchall()
                )


                # ==============================
                # AGRUPAR POR PEDIDO
                # ==============================

                pedidos = {}


                for registro in registros:

                    pedido_id = (
                        registro[
                            "pedido_id"
                        ]
                    )


                    if (
                        pedido_id
                        not in pedidos
                    ):

                        pedidos[
                            pedido_id
                        ] = {

                            "pedido_id":
                                pedido_id,

                            "numero_pedido":
                                registro[
                                    "numero_pedido"
                                ],

                            "cliente_id":
                                registro[
                                    "cliente_id"
                                ],

                            "cliente":
                                registro[
                                    "cliente"
                                ],

                            "data_pedido": (
                                registro[
                                    "data_pedido"
                                ].isoformat()

                                if registro[
                                    "data_pedido"
                                ]

                                else None
                            ),

                            "concluido_em": (
                                registro[
                                    "concluido_em"
                                ].isoformat()

                                if registro[
                                    "concluido_em"
                                ]

                                else None
                            ),

                            "forma":
                                registro[
                                    "forma"
                                ],

                            "valor_pagamento": (
                                float(
                                    registro[
                                        "valor"
                                    ]
                                )

                                if registro[
                                    "valor"
                                ] is not None

                                else None
                            ),

                            "data_pagamento": (
                                registro[
                                    "data_pagamento"
                                ].isoformat()

                                if registro[
                                    "data_pagamento"
                                ]

                                else None
                            ),

                            "status_pagamento":
                                registro[
                                    "status_pagamento"
                                ],

                            "quantidade_itens":
                                0,

                            "valor_bruto":
                                0.0,

                            "valor_desconto":
                                0.0,

                            "valor_final":
                                0.0,

                            "itens":
                                []
                        }


                    pedido = (
                        pedidos[
                            pedido_id
                        ]
                    )


                    item = {

                        "produto_id":
                            registro[
                                "produto_id"
                            ],

                        "produto":
                            registro[
                                "produto"
                            ],

                        "sabor":
                            registro[
                                "sabor"
                            ],

                        "quantidade":
                            float(
                                registro[
                                    "quantidade"
                                ]
                                or 0
                            ),

                        "valor_unitario":
                            float(
                                registro[
                                    "valor_unitario"
                                ]
                                or 0
                            ),

                        "desconto_tipo":
                            registro[
                                "desconto_tipo"
                            ],

                        "desconto_valor":
                            float(
                                registro[
                                    "desconto_valor"
                                ]
                                or 0
                            ),

                        "valor_bruto":
                            float(
                                registro[
                                    "valor_bruto"
                                ]
                                or 0
                            ),

                        "valor_desconto":
                            float(
                                registro[
                                    "valor_desconto"
                                ]
                                or 0
                            ),

                        "valor_final":
                            float(
                                registro[
                                    "valor_final"
                                ]
                                or 0
                            )
                    }


                    pedido[
                        "itens"
                    ].append(
                        item
                    )


                    pedido[
                        "quantidade_itens"
                    ] += 1


                    pedido[
                        "valor_bruto"
                    ] += item[
                        "valor_bruto"
                    ]


                    pedido[
                        "valor_desconto"
                    ] += item[
                        "valor_desconto"
                    ]


                    pedido[
                        "valor_final"
                    ] += item[
                        "valor_final"
                    ]


                return list(
                    pedidos.values()
                )


        finally:

            connection.close()


    # ==========================================
    # RESUMO DAS VENDAS
    # ==========================================

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

                sql = """
                    WITH pedidos_vendas AS (

                        SELECT
                            v.pedido_id,

                            SUM(
                                v.valor_bruto
                            ) AS valor_bruto,

                            SUM(
                                v.valor_desconto
                            ) AS descontos,

                            SUM(
                                v.valor_final
                            ) AS valor_final

                        FROM vw_vendas v

                        WHERE 1 = 1
                """


                # Mesmo filtro utilizado
                # na listagem.

                sql += (
                    VendaRepository
                    ._filtro_periodo(
                        periodo
                    )
                )


                sql += """
                        GROUP BY
                            v.pedido_id
                    )

                    SELECT

                        COUNT(*)
                            AS quantidade_pedidos,

                        COALESCE(
                            SUM(
                                pv.valor_bruto
                            ),
                            0
                        )
                            AS valor_bruto,

                        COALESCE(
                            SUM(
                                pv.descontos
                            ),
                            0
                        )
                            AS descontos,

                        COALESCE(
                            SUM(
                                pv.valor_final
                            ),
                            0
                        )
                            AS valor_vendido,

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN pg.id
                                        IS NOT NULL

                                    THEN
                                        pg.valor

                                    ELSE
                                        0

                                END
                            ),
                            0
                        )
                            AS recebido,

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN pg.id
                                        IS NULL

                                    THEN
                                        pv.valor_final

                                    ELSE
                                        0

                                END
                            ),
                            0
                        )
                            AS a_receber

                    FROM pedidos_vendas pv

                    LEFT JOIN pagamentos pg
                        ON pg.pedido_id =
                            pv.pedido_id

                        AND pg.status =
                            'PAGO'
                """


                cursor.execute(
                    sql,
                    (
                        data_referencia,
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                return {

                    "quantidade_pedidos":
                        int(
                            registro[
                                "quantidade_pedidos"
                            ]
                            or 0
                        ),

                    "valor_bruto":
                        float(
                            registro[
                                "valor_bruto"
                            ]
                            or 0
                        ),

                    "descontos":
                        float(
                            registro[
                                "descontos"
                            ]
                            or 0
                        ),

                    "valor_vendido":
                        float(
                            registro[
                                "valor_vendido"
                            ]
                            or 0
                        ),

                    "recebido":
                        float(
                            registro[
                                "recebido"
                            ]
                            or 0
                        ),

                    "a_receber":
                        float(
                            registro[
                                "a_receber"
                            ]
                            or 0
                        )
                }


        finally:

            connection.close()