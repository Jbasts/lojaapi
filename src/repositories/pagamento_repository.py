from psycopg2.extras import (
    RealDictCursor
)

from src.database import (
    get_connection
)

from src.entities.pagamento import (
    Pagamento
)


class PagamentoRepository:

    @staticmethod
    def listar(
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
                        p.id AS pedido_id,
                        p.numero AS numero_pedido,
                        p.status AS pedido_status,
                        p.data_pedido,

                        CONCAT(
                            c.nome,
                            ' ',
                            c.sobrenome
                        ) AS cliente_nome,

                        COALESCE(
                            SUM(
                                ip.quantidade
                                *
                                ip.valor_unitario
                            ),
                            0
                        )
                        -
                        COALESCE(
                            SUM(
                                CASE

                                    WHEN
                                        ip.desconto_tipo
                                        = 'PERCENTUAL'

                                    THEN
                                        (
                                            ip.quantidade
                                            *
                                            ip.valor_unitario
                                        )
                                        *
                                        (
                                            ip.desconto_valor
                                            /
                                            100
                                        )

                                    WHEN
                                        ip.desconto_tipo
                                        = 'VALOR'

                                    THEN
                                        ip.desconto_valor

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS valor_pedido,

                        pg.id
                            AS pagamento_id,

                        pg.forma,

                        pg.valor,

                        pg.data_pagamento,

                        pg.status
                            AS pagamento_status,

                        pg.observacao

                    FROM pedidos p

                    INNER JOIN clientes c
                        ON c.id =
                        p.cliente_id

                    INNER JOIN itens_pedido ip
                        ON ip.pedido_id =
                        p.id

                    LEFT JOIN pagamentos pg
                        ON pg.pedido_id =
                            p.id

                        AND pg.status =
                            'PAGO'

                    WHERE
                        p.status
                        <> 'CANCELADO'
                """

                parametros = []


                if busca:

                    termo = (
                        f"%{busca}%"
                    )

                    sql += """
                        AND (
                            CAST(
                                p.numero AS TEXT
                            ) ILIKE %s

                            OR c.nome ILIKE %s

                            OR c.sobrenome ILIKE %s
                        )
                    """

                    parametros.extend([
                        termo,
                        termo,
                        termo
                    ])


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


                sql += """
                    GROUP BY
                        p.id,
                        p.numero,
                        p.status,
                        p.data_pedido,

                        c.nome,
                        c.sobrenome,

                        pg.id,
                        pg.forma,
                        pg.valor,
                        pg.data_pagamento,
                        pg.status,
                        pg.observacao

                    ORDER BY
                        p.data_pedido DESC,
                        p.id DESC
                """


                cursor.execute(
                    sql,
                    parametros
                )

                registros = (
                    cursor.fetchall()
                )


                resultado = []


                for registro in registros:

                    resultado.append({
                        "pedido_id":
                            registro[
                                "pedido_id"
                            ],

                        "numero_pedido":
                            registro[
                                "numero_pedido"
                            ],

                        "cliente_nome":
                            registro[
                                "cliente_nome"
                            ],

                        "pedido_status":
                            registro[
                                "pedido_status"
                            ],

                        "data_pedido":
                            registro[
                                "data_pedido"
                            ].isoformat(),

                        "valor_pedido":
                            float(
                                registro[
                                    "valor_pedido"
                                ]
                                or 0
                            ),

                        "pagamento_id":
                            registro[
                                "pagamento_id"
                            ],

                        "pagamento_status": (
                            "PAGO"
                            if registro[
                                "pagamento_id"
                            ]
                            else "PENDENTE"
                        ),

                        "forma":
                            registro[
                                "forma"
                            ],

                        "valor": (
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

                        "observacao":
                            registro[
                                "observacao"
                            ]
                    })


                return resultado

        finally:

            connection.close()


    @staticmethod
    def buscar_pagamento_ativo(
        pedido_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
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
                        ) AS cliente_nome,

                        pg.forma,
                        pg.valor,
                        pg.data_pagamento,
                        pg.status,
                        pg.observacao,
                        pg.usuario_id,
                        pg.criado_em,
                        pg.estornado_em

                    FROM pagamentos pg

                    INNER JOIN pedidos p
                        ON p.id =
                            pg.pedido_id

                    INNER JOIN clientes c
                        ON c.id =
                            p.cliente_id

                    WHERE
                        pg.pedido_id = %s

                        AND pg.status =
                            'PAGO'

                    LIMIT 1
                    """,
                    (pedido_id,)
                )


                registro = (
                    cursor.fetchone()
                )


                if not registro:

                    return None


                return Pagamento(
                    id=registro["id"],

                    pedido_id=(
                        registro[
                            "pedido_id"
                        ]
                    ),

                    numero_pedido=(
                        registro[
                            "numero_pedido"
                        ]
                    ),

                    cliente_nome=(
                        registro[
                            "cliente_nome"
                        ]
                    ),

                    forma=(
                        registro["forma"]
                    ),

                    valor=(
                        registro["valor"]
                    ),

                    data_pagamento=(
                        registro[
                            "data_pagamento"
                        ]
                    ),

                    status=(
                        registro["status"]
                    ),

                    observacao=(
                        registro[
                            "observacao"
                        ]
                    ),

                    usuario_id=(
                        registro[
                            "usuario_id"
                        ]
                    ),

                    criado_em=(
                        registro[
                            "criado_em"
                        ]
                    ),

                    estornado_em=(
                        registro[
                            "estornado_em"
                        ]
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(
        pagamento_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
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
                        ) AS cliente_nome,

                        pg.forma,
                        pg.valor,
                        pg.data_pagamento,
                        pg.status,
                        pg.observacao,
                        pg.usuario_id,
                        pg.criado_em,
                        pg.estornado_em

                    FROM pagamentos pg

                    INNER JOIN pedidos p
                        ON p.id =
                            pg.pedido_id

                    INNER JOIN clientes c
                        ON c.id =
                            p.cliente_id

                    WHERE
                        pg.id = %s

                    LIMIT 1
                    """,
                    (pagamento_id,)
                )


                registro = (
                    cursor.fetchone()
                )


                if not registro:

                    return None


                return Pagamento(
                    id=registro["id"],

                    pedido_id=(
                        registro[
                            "pedido_id"
                        ]
                    ),

                    numero_pedido=(
                        registro[
                            "numero_pedido"
                        ]
                    ),

                    cliente_nome=(
                        registro[
                            "cliente_nome"
                        ]
                    ),

                    forma=(
                        registro["forma"]
                    ),

                    valor=(
                        registro["valor"]
                    ),

                    data_pagamento=(
                        registro[
                            "data_pagamento"
                        ]
                    ),

                    status=(
                        registro["status"]
                    ),

                    observacao=(
                        registro[
                            "observacao"
                        ]
                    ),

                    usuario_id=(
                        registro[
                            "usuario_id"
                        ]
                    ),

                    criado_em=(
                        registro[
                            "criado_em"
                        ]
                    ),

                    estornado_em=(
                        registro[
                            "estornado_em"
                        ]
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def calcular_valor_pedido(
        pedido_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        p.id,
                        p.status,

                        COALESCE(
                            SUM(
                                (
                                    ip.quantidade
                                    *
                                    ip.valor_unitario
                                )
                                -
                                CASE

                                    WHEN
                                        ip.desconto_tipo
                                        = 'PERCENTUAL'

                                    THEN
                                        (
                                            ip.quantidade
                                            *
                                            ip.valor_unitario
                                        )
                                        *
                                        (
                                            ip.desconto_valor
                                            /
                                            100
                                        )

                                    WHEN
                                        ip.desconto_tipo
                                        = 'VALOR'

                                    THEN
                                        ip.desconto_valor

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS valor_total

                    FROM pedidos p

                    LEFT JOIN itens_pedido ip
                        ON ip.pedido_id =
                            p.id

                    WHERE
                        p.id = %s

                    GROUP BY
                        p.id,
                        p.status
                    """,
                    (pedido_id,)
                )


                return (
                    cursor.fetchone()
                )

        finally:

            connection.close()


    @staticmethod
    def registrar(
        pedido_id,
        usuario_id,
        forma,
        valor,
        observacao=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        status

                    FROM pedidos

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (pedido_id,)
                )


                pedido = (
                    cursor.fetchone()
                )


                if not pedido:

                    raise ValueError(
                        "Pedido não encontrado."
                    )


                if (
                    pedido["status"]
                    == "CANCELADO"
                ):

                    raise ValueError(
                        "Pedido cancelado não "
                        "pode ser pago."
                    )



                cursor.execute(
                    """
                    SELECT id

                    FROM pagamentos

                    WHERE
                        pedido_id = %s

                        AND status = 'PAGO'

                    LIMIT 1
                    """,
                    (pedido_id,)
                )


                if cursor.fetchone():

                    raise ValueError(
                        "Este pedido já está pago."
                    )

                cursor.execute(
                    """
                    INSERT INTO pagamentos
                    (
                        pedido_id,
                        forma,
                        valor,
                        status,
                        data_pagamento,
                        usuario_id,
                        observacao
                    )

                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        'PAGO',
                        CURRENT_TIMESTAMP,
                        %s,
                        %s
                    )

                    RETURNING id
                    """,
                    (
                        pedido_id,
                        forma,
                        valor,
                        usuario_id,
                        observacao
                    )
                )


                pagamento_id = (
                    cursor.fetchone()["id"]
                )


                connection.commit()


                return pagamento_id

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()



    @staticmethod
    def estornar(
        pagamento_id,
        usuario_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        pedido_id,
                        status

                    FROM pagamentos

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (pagamento_id,)
                )


                pagamento = (
                    cursor.fetchone()
                )


                if not pagamento:

                    raise ValueError(
                        "Pagamento não encontrado."
                    )


                if (
                    pagamento["status"]
                    != "PAGO"
                ):

                    raise ValueError(
                        "Pagamento já foi estornado."
                    )


                cursor.execute(
                    """
                    UPDATE pagamentos

                    SET
                        status = 'ESTORNADO',

                        estornado_em =
                            CURRENT_TIMESTAMP

                    WHERE id = %s
                    """,
                    (pagamento_id,)
                )


                connection.commit()


                return (
                    pagamento[
                        "pedido_id"
                    ]
                )

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()