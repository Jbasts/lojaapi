from psycopg2.extras import (
    RealDictCursor
)

from src.database import (
    get_connection
)


class DashboardRepository:


    # ==========================================
    # PRIMEIRO RECEBIMENTO REGISTRADO
    # ==========================================

    @staticmethod
    def primeira_data_recebimento():

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        MIN(
                            data_pagamento
                        )::date
                        AS primeira_data

                    FROM pagamentos

                    WHERE
                        status = 'PAGO'

                        AND data_pagamento
                            IS NOT NULL
                    """
                )


                registro = (
                    cursor.fetchone()
                )


                if (
                    not registro
                    or not registro[
                        "primeira_data"
                    ]
                ):

                    return None


                return registro[
                    "primeira_data"
                ]

        finally:

            connection.close()


    # ==========================================
    # RECEBIMENTOS DO MÊS
    # ==========================================

    @staticmethod
    def ultimos_recebimentos(
        data_referencia
    ):

        connection = (
            get_connection()
        )


        try:

            with connection.cursor(
                cursor_factory=
                    RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        pg.id,
                        pg.pedido_id,

                        p.numero
                            AS numero_pedido,

                        CONCAT(
                            c.nome,
                            ' ',
                            c.sobrenome
                        ) AS cliente,

                        pg.forma,
                        pg.valor,
                        pg.data_pagamento

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

                        AND DATE_TRUNC(
                            'month',
                            pg.data_pagamento
                        )
                        =
                        DATE_TRUNC(
                            'month',
                            %s::date
                        )

                    ORDER BY
                        pg.data_pagamento
                            DESC,

                        pg.id DESC
                    """,
                    (
                        data_referencia,
                    )
                )


                registros = (
                    cursor.fetchall()
                )


                resultado = []


                for registro in registros:

                    resultado.append({

                        "id":
                            registro["id"],

                        "pedido_id":
                            registro[
                                "pedido_id"
                            ],

                        "numero_pedido":
                            registro[
                                "numero_pedido"
                            ],

                        "cliente":
                            registro[
                                "cliente"
                            ],

                        "forma":
                            registro[
                                "forma"
                            ],

                        "valor":
                            float(
                                registro[
                                    "valor"
                                ]
                                or 0
                            ),

                        "data_pagamento": (
                            registro[
                                "data_pagamento"
                            ].isoformat()

                            if registro[
                                "data_pagamento"
                            ]

                            else None
                        )
                    })


                return resultado

        finally:

            connection.close()