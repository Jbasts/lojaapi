from decimal import Decimal

from psycopg2.extras import (
    RealDictCursor
)

from src.database import (
    get_connection
)

from src.entities.pedido import (
    Pedido
)

from src.entities.item_pedido import (
    ItemPedido
)


class PedidoRepository:

    @staticmethod
    def buscar_por_numero(
        numero
    ):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT id

                    FROM pedidos

                    WHERE numero = %s

                    LIMIT 1
                    """,
                    (str(numero),)
                )

                return cursor.fetchone()

        finally:

            connection.close()


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
                        p.id,
                        p.numero,
                        p.data_pedido,
                        p.status,

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
                        ) AS subtotal,

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
                        ) AS desconto_total,

                        CASE

                            WHEN EXISTS (

                                SELECT 1

                                FROM pagamentos pg

                                WHERE
                                    pg.pedido_id = p.id

                                    AND pg.status = 'PAGO'

                            )

                            THEN 'PAGO'

                            ELSE 'PENDENTE'

                        END AS pagamento_status

                    FROM pedidos p

                    INNER JOIN clientes c
                        ON c.id =
                        p.cliente_id

                    LEFT JOIN itens_pedido ip
                        ON ip.pedido_id =
                        p.id

                    WHERE 1 = 1
                """

                parametros = []


                if status:

                    sql += """
                        AND p.status = %s
                    """

                    parametros.append(
                        status
                    )

                else:

                    sql += """
                        AND p.status
                            <> 'CANCELADO'
                    """


                if busca:

                    termo = f"%{busca}%"

                    sql += """
                        AND (
                            CAST(
                                p.numero AS TEXT
                            ) ILIKE %s

                            OR c.nome
                                ILIKE %s

                            OR c.sobrenome
                                ILIKE %s

                            OR EXISTS (

                                SELECT 1

                                FROM itens_pedido ip2

                                INNER JOIN
                                    produtos_venda pv2

                                    ON pv2.id =
                                    ip2.produto_venda_id

                                WHERE
                                    ip2.pedido_id =
                                    p.id

                                AND (
                                    pv2.nome
                                        ILIKE %s

                                    OR pv2.sabor
                                        ILIKE %s
                                )
                            )
                        )
                    """

                    parametros.extend([
                        termo,
                        termo,
                        termo,
                        termo,
                        termo
                    ])


                sql += """
                    GROUP BY
                        p.id,
                        p.numero,
                        p.data_pedido,
                        p.status,
                        c.nome,
                        c.sobrenome

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

                    subtotal = Decimal(
                        str(
                            registro[
                                "subtotal"
                            ]
                            or 0
                        )
                    )

                    desconto = Decimal(
                        str(
                            registro[
                                "desconto_total"
                            ]
                            or 0
                        )
                    )

                    resultado.append({
                        "id":
                            registro["id"],

                        "numero":
                            registro["numero"],

                        "cliente_nome":
                            registro[
                                "cliente_nome"
                            ],

                        "data_pedido":
                            registro[
                                "data_pedido"
                            ].isoformat(),

                        "status":
                            registro["status"],

                        "pagamento_status":
                            registro[
                                "pagamento_status"
                            ],

                        "subtotal":
                            float(subtotal),

                        "desconto_total":
                            float(desconto),

                        "valor_total":
                            float(
                                subtotal
                                - desconto
                            )
                    })


                return resultado

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(
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
                        p.numero,
                        p.cliente_id,
                        p.usuario_id,
                        p.data_pedido,
                        p.status,
                        p.concluido_em,

                        CONCAT(
                            c.nome,
                            ' ',
                            c.sobrenome
                        ) AS cliente_nome,

                        CASE

                            WHEN EXISTS (

                                SELECT 1

                                FROM pagamentos pg

                                WHERE
                                    pg.pedido_id = p.id

                                    AND pg.status = 'PAGO'

                            )

                            THEN 'PAGO'

                            ELSE 'PENDENTE'

                        END AS pagamento_status

                    FROM pedidos p

                    INNER JOIN clientes c
                        ON c.id =
                        p.cliente_id

                    WHERE p.id = %s

                    LIMIT 1
                    """,
                    (pedido_id,)
                )

                registro = cursor.fetchone()


                if not registro:
                    return None


                pedido = Pedido(
                    id=registro["id"],

                    numero=registro["numero"],

                    cliente_id=(
                        registro["cliente_id"]
                    ),

                    cliente_nome=(
                        registro["cliente_nome"]
                    ),

                    usuario_id=(
                        registro["usuario_id"]
                    ),

                    data_pedido=(
                        registro["data_pedido"]
                    ),

                    status=(
                        registro["status"]
                    ),

                    concluido_em=(
                        registro["concluido_em"]
                    ),

                    pagamento_status=(
                        registro[
                            "pagamento_status"
                        ]
                    )
                )


                cursor.execute(
                    """
                    SELECT
                        ip.id,
                        ip.pedido_id,
                        ip.produto_venda_id,

                        pv.nome
                            AS produto_nome,

                        pv.sabor,

                        pv.tipo
                            AS tipo_produto,

                        ip.quantidade,
                        ip.valor_unitario,
                        ip.desconto_tipo,
                        ip.desconto_valor

                    FROM itens_pedido ip

                    INNER JOIN produtos_venda pv
                        ON pv.id =
                        ip.produto_venda_id

                    WHERE
                        ip.pedido_id = %s

                    ORDER BY ip.id
                    """,
                    (pedido_id,)
                )

                itens = cursor.fetchall()


                pedido.itens = [

                    ItemPedido(
                        id=item["id"],

                        pedido_id=(
                            item["pedido_id"]
                        ),

                        produto_venda_id=(
                            item[
                                "produto_venda_id"
                            ]
                        ),

                        produto_nome=(
                            item[
                                "produto_nome"
                            ]
                        ),

                        sabor=(
                            item["sabor"]
                        ),

                        tipo_produto=(
                            item[
                                "tipo_produto"
                            ]
                        ),

                        quantidade=(
                            item["quantidade"]
                        ),

                        valor_unitario=(
                            item[
                                "valor_unitario"
                            ]
                        ),

                        desconto_tipo=(
                            item[
                                "desconto_tipo"
                            ]
                        ),

                        desconto_valor=(
                            item[
                                "desconto_valor"
                            ]
                        )
                    )

                    for item in itens
                ]


                return pedido

        finally:

            connection.close()


    @staticmethod
    def _inserir_itens(
        cursor,
        pedido_id,
        itens
    ):

        for item in itens:

            cursor.execute(
                """
                INSERT INTO itens_pedido
                (
                    pedido_id,
                    produto_venda_id,
                    quantidade,
                    valor_unitario,
                    desconto_tipo,
                    desconto_valor
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
                """,
                (
                    pedido_id,

                    item[
                        "produto_venda_id"
                    ],

                    item[
                        "quantidade"
                    ],

                    item[
                        "valor_unitario"
                    ],

                    item[
                        "desconto_tipo"
                    ],

                    item[
                        "desconto_valor"
                    ]
                )
            )


    @staticmethod
    def criar(
        numero,
        usuario_id,
        cliente_id,
        itens
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO pedidos
                    (
                        numero,
                        cliente_id,
                        usuario_id,
                        status
                    )

                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        'ABERTO'
                    )

                    RETURNING id
                    """,
                    (
                        numero,
                        cliente_id,
                        usuario_id
                    )
                )

                pedido_id = (
                    cursor.fetchone()["id"]
                )


                PedidoRepository \
                    ._inserir_itens(
                        cursor,
                        pedido_id,
                        itens
                    )


                connection.commit()

                return pedido_id

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar(
        pedido_id,
        cliente_id,
        itens
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

                pedido = cursor.fetchone()


                if not pedido:

                    raise ValueError(
                        "Pedido não encontrado."
                    )


                if (
                    pedido["status"]
                    != "ABERTO"
                ):

                    raise ValueError(
                        "Pedido concluído não "
                        "pode ser editado."
                    )


                cursor.execute(
                    """
                    UPDATE pedidos

                    SET cliente_id = %s

                    WHERE id = %s
                    """,
                    (
                        cliente_id,
                        pedido_id
                    )
                )


                cursor.execute(
                    """
                    DELETE
                    FROM itens_pedido

                    WHERE pedido_id = %s
                    """,
                    (pedido_id,)
                )


                PedidoRepository \
                    ._inserir_itens(
                        cursor,
                        pedido_id,
                        itens
                    )


                connection.commit()

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def cancelar(
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
                        id,
                        status

                    FROM pedidos

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (pedido_id,)
                )

                pedido = cursor.fetchone()


                if not pedido:

                    raise ValueError(
                        "Pedido não encontrado."
                    )


                if (
                    pedido["status"]
                    == "CONCLUIDO"
                ):

                    raise ValueError(
                        "Pedido concluído não "
                        "pode ser excluído."
                    )


                cursor.execute(
                    """
                    SELECT EXISTS (

                        SELECT 1

                        FROM pagamentos

                        WHERE
                            pedido_id = %s

                            AND status = 'PAGO'

                    ) AS pago
                    """,
                    (pedido_id,)
                )

                pagamento = cursor.fetchone()


                if pagamento["pago"]:

                    raise ValueError(
                        "Pedido pago não pode "
                        "ser excluído."
                    )


                cursor.execute(
                    """
                    UPDATE pedidos

                    SET
                        status = 'CANCELADO',
                        cancelado_em =
                            CURRENT_TIMESTAMP

                    WHERE id = %s
                    """,
                    (pedido_id,)
                )


                connection.commit()

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def concluir(
        pedido_id,
        usuario_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # ======================================
                # BLOQUEIA O PEDIDO
                # ======================================

                cursor.execute(
                    """
                    SELECT
                        id,
                        status

                    FROM pedidos

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (
                        pedido_id,
                    )
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
                    != "ABERTO"
                ):

                    raise ValueError(
                        "Somente pedidos abertos "
                        "podem ser concluídos."
                    )


                # ======================================
                # BUSCA OS ITENS E CALCULA
                # O CUSTO UNITÁRIO DA FICHA
                # ======================================

                cursor.execute(
                    """
                    SELECT
                        ip.id AS item_id,

                        ip.produto_venda_id,

                        pv.nome
                            AS produto_nome,

                        pv.sabor,

                        ft.id
                            AS ficha_id,

                        ft.rendimento,

                        CASE

                            WHEN ft.id IS NULL
                                THEN NULL

                            WHEN ft.rendimento IS NULL
                                THEN NULL

                            WHEN ft.rendimento <= 0
                                THEN NULL

                            WHEN COUNT(
                                ift.id
                            ) = 0
                                THEN NULL

                            WHEN COUNT(
                                ift.id
                            )
                            FILTER (
                                WHERE
                                    ift.valor_unitario_manual
                                    IS NULL
                            ) > 0
                                THEN NULL

                            ELSE

                                ROUND(
                                    SUM(
                                        ift.quantidade
                                        *
                                        ift.valor_unitario_manual
                                    )
                                    /
                                    ft.rendimento,
                                    4
                                )

                        END AS custo_unitario

                    FROM itens_pedido ip

                    INNER JOIN produtos_venda pv
                        ON pv.id =
                            ip.produto_venda_id


                    LEFT JOIN LATERAL (

                        SELECT
                            f.id,
                            f.rendimento

                        FROM fichas_tecnicas f

                        WHERE
                            f.produto_venda_id =
                                ip.produto_venda_id

                            AND f.ativa = TRUE

                        ORDER BY
                            f.id DESC

                        LIMIT 1

                    ) ft
                        ON TRUE


                    LEFT JOIN itens_ficha_tecnica ift
                        ON ift.ficha_tecnica_id =
                            ft.id


                    WHERE
                        ip.pedido_id = %s


                    GROUP BY
                        ip.id,
                        ip.produto_venda_id,
                        pv.nome,
                        pv.sabor,
                        ft.id,
                        ft.rendimento


                    ORDER BY
                        ip.id
                    """,
                    (
                        pedido_id,
                    )
                )


                itens = (
                    cursor.fetchall()
                )


                # ======================================
                # PEDIDO PRECISA TER ITEM
                # ======================================

                if not itens:

                    raise ValueError(
                        "Pedido não possui itens."
                    )


                # ======================================
                # TODOS OS PRODUTOS PRECISAM
                # POSSUIR CUSTO CADASTRADO
                # ======================================

                for item in itens:

                    if (
                        item[
                            "custo_unitario"
                        ]
                        is None
                    ):

                        produto = (
                            item[
                                "produto_nome"
                            ]
                        )


                        sabor = (
                            item[
                                "sabor"
                            ]
                        )


                        descricao = produto


                        if sabor:

                            descricao += (
                                f" - {sabor}"
                            )


                        raise ValueError(
                            f"O produto "
                            f"'{descricao}' "
                            "não possui um custo "
                            "válido cadastrado. "
                            "Cadastre o custo do "
                            "produto antes de "
                            "concluir o pedido."
                        )


                # ======================================
                # CONGELA O CUSTO HISTÓRICO
                # EM CADA ITEM
                # ======================================

                for item in itens:

                    cursor.execute(
                        """
                        UPDATE itens_pedido

                        SET
                            custo_unitario = %s

                        WHERE
                            id = %s
                        """,
                        (
                            item[
                                "custo_unitario"
                            ],

                            item[
                                "item_id"
                            ]
                        )
                    )


                # ======================================
                # CONCLUI O PEDIDO
                #
                # NÃO CONSULTA ESTOQUE
                # NÃO ALTERA LOTE
                # NÃO GERA SAÍDA DE VENDA
                # ======================================

                cursor.execute(
                    """
                    UPDATE pedidos

                    SET
                        status =
                            'CONCLUIDO',

                        concluido_em =
                            CURRENT_TIMESTAMP

                    WHERE
                        id = %s
                    """,
                    (
                        pedido_id,
                    )
                )


                connection.commit()


        except Exception:

            connection.rollback()

            raise


        finally:

            connection.close()