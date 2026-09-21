from psycopg2.extras import RealDictCursor

from src.database import get_connection


class RelatorioRepository:

    # =========================================
    # FILTRO DE PERÍODO
    # =========================================

    @staticmethod
    def _filtro_periodo(
        campo,
        periodo
    ):

        if periodo == "DIARIO":

            return f"""
                {campo}::date = %s
            """


        if periodo == "MENSAL":

            return f"""
                DATE_TRUNC(
                    'month',
                    {campo}
                )
                =
                DATE_TRUNC(
                    'month',
                    %s::date
                )
            """


        if periodo == "ANUAL":

            return f"""
                EXTRACT(
                    YEAR FROM {campo}
                )
                =
                EXTRACT(
                    YEAR FROM %s::date
                )
            """


        return "1 = 1"


    # =========================================
    # GERAR RELATÓRIO
    # =========================================

    @staticmethod
    def gerar(
        periodo,
        data_referencia
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # =================================
                # 1. FATURAMENTO
                # =================================

                filtro_pagamento = (
                    RelatorioRepository
                    ._filtro_periodo(
                        "pg.data_pagamento",
                        periodo
                    )
                )


                cursor.execute(
                    f"""
                    SELECT

                        COALESCE(
                            SUM(pg.valor),
                            0
                        ) AS faturamento,

                        COUNT(
                            DISTINCT
                            pg.pedido_id
                        ) AS pedidos_pagos

                    FROM pagamentos pg

                    WHERE
                        pg.status = 'PAGO'

                        AND
                        pg.data_pagamento
                            IS NOT NULL

                        AND (
                            {filtro_pagamento}
                        )
                    """,
                    (
                        data_referencia,
                    )
                )


                pagamento = (
                    cursor.fetchone()
                )


                faturamento = float(
                    pagamento[
                        "faturamento"
                    ]
                    or 0
                )


                pedidos_pagos = int(
                    pagamento[
                        "pedidos_pagos"
                    ]
                    or 0
                )


                # =================================
                # 2. CUSTO UTILIZADO
                # =================================
                #
                # O custo oficial da venda é o
                # snapshot salvo no item do pedido.
                #
                # Não usamos views ou custo atual,
                # para não alterar o lucro histórico.
                # =================================

                expressao_custo = """
                    ip.custo_unitario
                """

                # =================================
                # 3. CUSTO DAS VENDAS
                # =================================

                cursor.execute(
                    f"""
                    SELECT

                        COALESCE(
                            SUM(
                                ip.quantidade
                                *
                                COALESCE(
                                    ip.custo_unitario,
                                    0
                                )
                            ),
                            0
                        ) AS custo_vendas,

                        COALESCE(
                            SUM(
                                ip.quantidade
                            ),
                            0
                        ) AS itens_vendidos,

                        COUNT(*)
                        FILTER (
                            WHERE
                                ip.custo_unitario
                                IS NULL
                        ) AS itens_sem_custo

                    FROM pagamentos pg

                    INNER JOIN itens_pedido ip
                        ON ip.pedido_id =
                            pg.pedido_id

                    WHERE
                        pg.status = 'PAGO'

                        AND pg.data_pagamento
                            IS NOT NULL

                        AND (
                            {filtro_pagamento}
                        )
                    """,
                    (
                        data_referencia,
                    )
                )


                custos = (
                    cursor.fetchone()
                )


                custo_vendas = float(
                    custos[
                        "custo_vendas"
                    ]
                    or 0
                )


                itens_vendidos = float(
                    custos[
                        "itens_vendidos"
                    ]
                    or 0
                )


                itens_sem_custo = int(
                    custos[
                        "itens_sem_custo"
                    ]
                    or 0
                )

                # =================================
                # 4. COMPRAS
                # =================================

                filtro_compra = (
                    RelatorioRepository
                    ._filtro_periodo(
                        "c.data_compra",
                        periodo
                    )
                )


                cursor.execute(
                    f"""
                    SELECT

                        COALESCE(
                            SUM(
                                resultado.valor
                            ),
                            0
                        ) AS compras,

                        COUNT(*)
                            AS quantidade_compras

                    FROM (

                        SELECT
                            c.id,

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
                                    c.desconto,
                                    0
                                ),

                                0

                            ) AS valor

                        FROM compras c

                        LEFT JOIN itens_compra ic
                            ON
                            ic.compra_id =
                            c.id

                        WHERE
                            c.status =
                            'CONFIRMADA'

                            AND (
                                {filtro_compra}
                            )

                        GROUP BY
                            c.id,
                            c.desconto

                    ) resultado
                    """,
                    (
                        data_referencia,
                    )
                )


                compra = (
                    cursor.fetchone()
                )


                compras = float(
                    compra[
                        "compras"
                    ]
                    or 0
                )


                quantidade_compras = int(
                    compra[
                        "quantidade_compras"
                    ]
                    or 0
                )


                # =================================
                # 5. DESPESAS EXTRAS
                # =================================

                filtro_despesa = (
                    RelatorioRepository
                    ._filtro_periodo(
                        "de.data",
                        periodo
                    )
                )


                cursor.execute(
                    f"""
                    SELECT

                        COALESCE(
                            SUM(
                                de.quantidade
                                *
                                de.valor_unitario
                            ),
                            0
                        ) AS despesas_extras,

                        COUNT(*)
                            AS quantidade_despesas

                    FROM despesas_extras de

                    WHERE
                        {filtro_despesa}
                    """,
                    (
                        data_referencia,
                    )
                )


                despesa = (
                    cursor.fetchone()
                )


                despesas_extras = float(
                    despesa[
                        "despesas_extras"
                    ]
                    or 0
                )


                quantidade_despesas = int(
                    despesa[
                        "quantidade_despesas"
                    ]
                    or 0
                )


                # =================================
                # 6. DESPERDÍCIOS
                # =================================

                filtro_desperdicio = (
                    RelatorioRepository
                    ._filtro_periodo(
                        "d.data",
                        periodo
                    )
                )


                cursor.execute(
                    f"""
                    SELECT

                        COALESCE(
                            SUM(
                                d.quantidade
                                *
                                d.custo_unitario
                            ),
                            0
                        ) AS desperdicios,

                        COUNT(*)
                            AS quantidade_desperdicios

                    FROM desperdicios d

                    WHERE
                        (
                            {filtro_desperdicio}
                        )

                        -- Compatível tanto com
                        -- tabela simples quanto
                        -- versões que possuam
                        -- status de estorno.

                        AND COALESCE(
                            to_jsonb(d)
                            ->>
                            'status',
                            'ATIVO'
                        )
                        NOT IN (
                            'ESTORNADO',
                            'CANCELADO'
                        )

                        AND COALESCE(
                            to_jsonb(d)
                            ->>
                            'cancelado_em',
                            ''
                        ) = ''

                        AND COALESCE(
                            NULLIF(
                                to_jsonb(d)
                                ->>
                                'ativo',
                                ''
                            )::BOOLEAN,
                            TRUE
                        ) = TRUE
                    """,
                    (
                        data_referencia,
                    )
                )


                desperdicio = (
                    cursor.fetchone()
                )


                desperdicios = float(
                    desperdicio[
                        "desperdicios"
                    ]
                    or 0
                )


                quantidade_desperdicios = int(
                    desperdicio[
                        "quantidade_desperdicios"
                    ]
                    or 0
                )


                # =================================
                # 7. TOP PRODUTOS
                # =================================

                cursor.execute(
                    f"""
                    SELECT

                        pv.id
                            AS produto_id,

                        pv.nome
                            AS produto,

                        pv.sabor
                            AS sabor,

                        COALESCE(
                            SUM(
                                ip.quantidade
                            ),
                            0
                        ) AS quantidade,

                        COALESCE(
                            SUM(
                                ip.quantidade
                                *
                                ip.valor_unitario
                            ),
                            0
                        ) AS valor_bruto

                    FROM pagamentos pg

                    INNER JOIN itens_pedido ip
                        ON ip.pedido_id =
                            pg.pedido_id

                    INNER JOIN produtos_venda pv
                        ON pv.id =
                            ip.produto_venda_id

                    WHERE
                        pg.status = 'PAGO'

                        AND pg.data_pagamento
                            IS NOT NULL

                        AND (
                            {filtro_pagamento}
                        )

                    GROUP BY
                        pv.id,
                        pv.nome,
                        pv.sabor

                    ORDER BY
                        quantidade DESC,
                        valor_bruto DESC
                    """,
                    (
                        data_referencia,
                    )
                )


                registros_produtos = (
                    cursor.fetchall()
                )


                top_produtos = []


                for produto in registros_produtos:

                    top_produtos.append({

                        "produto_id":
                            produto[
                                "produto_id"
                            ],

                        "produto":
                            produto[
                                "produto"
                            ],

                        "sabor":
                            produto[
                                "sabor"
                            ],

                        "quantidade":
                            float(
                                produto[
                                    "quantidade"
                                ]
                                or 0
                            ),

                        "valor_bruto":
                            float(
                                produto[
                                    "valor_bruto"
                                ]
                                or 0
                            )
                    })


                menos_produtos = sorted(
                    top_produtos,
                    key=lambda produto: (
                        float(
                            produto.get(
                                "quantidade",
                                0
                            )
                            or 0
                        ),
                        float(
                            produto.get(
                                "valor_bruto",
                                0
                            )
                            or 0
                        ),
                        str(
                            produto.get(
                                "produto",
                                ""
                            )
                        ).lower(),
                        str(
                            produto.get(
                                "sabor",
                                ""
                            )
                            or ""
                        ).lower()
                    )
                )


                # =================================
                # 8. CÁLCULOS FINAIS
                # =================================

                # Lucro:
                #
                # NÃO subtrai compras aqui.
                #
                # O custo das mercadorias
                # utilizadas na venda já está
                # em custo_vendas.

                lucro = (
                    faturamento
                    -
                    custo_vendas
                    -
                    despesas_extras
                    -
                    desperdicios
                )


                if faturamento > 0:

                    margem_percentual = (
                        lucro
                        /
                        faturamento
                    ) * 100

                else:

                    margem_percentual = 0


                # Fluxo de caixa:
                #
                # aqui compra é saída real
                # de dinheiro.

                saidas_caixa = (
                    compras
                    +
                    despesas_extras
                )


                saldo_financeiro = (
                    faturamento
                    -
                    saidas_caixa
                )


                return {

                    "resultado": {

                        "faturamento":
                            faturamento,

                        "custo_vendas":
                            custo_vendas,

                        "despesas_extras":
                            despesas_extras,

                        "desperdicios":
                            desperdicios,

                        "lucro":
                            lucro,

                        "margem_percentual":
                            margem_percentual
                    },


                    "fluxo": {

                        "entradas":
                            faturamento,

                        "compras":
                            compras,

                        "despesas_extras":
                            despesas_extras,

                        "saidas":
                            saidas_caixa,

                        "saldo":
                            saldo_financeiro
                    },


                    "indicadores": {

                        "pedidos_pagos":
                            pedidos_pagos,

                        "itens_vendidos":
                            itens_vendidos,

                        "itens_sem_custo":
                            itens_sem_custo,

                        "quantidade_compras":
                            quantidade_compras,

                        "quantidade_despesas":
                            quantidade_despesas,

                        "quantidade_desperdicios":
                            quantidade_desperdicios
                    },


                    "top_produtos":
                        top_produtos,


                    "menos_produtos":
                        menos_produtos
                }


        finally:

            connection.close()