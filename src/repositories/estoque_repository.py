
from datetime import date
from decimal import Decimal

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

                            WHEN l.validade
                                <= CURRENT_DATE + 30
                                THEN 'PROXIMO_VALIDADE'

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


                elif status == "PROXIMOS_VALIDADE":

                    sql += """
                        AND l.validade
                            >= CURRENT_DATE

                        AND l.validade
                            <= CURRENT_DATE + 30
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
                                    >= CURRENT_DATE
                                AND validade
                                    <= CURRENT_DATE + 30
                        )
                        AS lotes_proximos_validade,

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

                    "lotes_proximos_validade":
                        registro[
                            "lotes_proximos_validade"
                        ],

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

                            WHEN l.validade
                                <= CURRENT_DATE + 30
                                THEN 'PROXIMO_VALIDADE'

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

    @staticmethod
    def listar_retiradas(
        data_inicio,
        data_fim
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        m.id,

                        m.data_movimentacao,

                        m.quantidade,

                        m.observacao,

                        m.origem_tipo,

                        l.id
                            AS lote_id,

                        pe.id
                            AS produto_estoque_id,

                        pe.nome
                            AS produto_nome,

                        pe.codigo_barras,

                        pe.unidade,

                        CASE
                            WHEN COALESCE(
                                m.observacao,
                                ''
                            ) ILIKE
                                'Retirada por receita:%%'
                            THEN 'RECEITA'

                            ELSE 'UNITARIO'
                        END
                            AS forma_retirada

                    FROM movimentacoes_estoque m

                    INNER JOIN lotes_estoque l
                        ON l.id =
                            m.lote_id

                    INNER JOIN produtos_estoque pe
                        ON pe.id =
                            l.produto_estoque_id

                    WHERE
                        m.tipo = 'SAIDA_USO'

                        AND m.data_movimentacao
                            >= %s

                        AND m.data_movimentacao
                            < %s

                    ORDER BY
                        m.data_movimentacao DESC,
                        m.id DESC
                    """,
                    (
                        data_inicio,
                        data_fim
                    )
                )

                registros = cursor.fetchall()


                retiradas = []

                grupos_receita = {}


                for registro in registros:

                    forma = (
                        registro[
                            "forma_retirada"
                        ]
                    )


                    item = {
                        "movimentacao_id":
                            registro["id"],

                        "produto_estoque_id":
                            registro[
                                "produto_estoque_id"
                            ],

                        "produto_nome":
                            registro[
                                "produto_nome"
                            ],

                        "codigo_barras":
                            registro[
                                "codigo_barras"
                            ],

                        "lote_id":
                            registro[
                                "lote_id"
                            ],

                        "quantidade":
                            float(
                                registro[
                                    "quantidade"
                                ]
                                or 0
                            ),

                        "unidade":
                            registro[
                                "unidade"
                            ]
                    }


                    if forma == "RECEITA":

                        chave = (
                            registro[
                                "data_movimentacao"
                            ],
                            registro[
                                "observacao"
                            ]
                        )


                        grupo = (
                            grupos_receita.get(
                                chave
                            )
                        )


                        if not grupo:

                            grupo = {
                                "id":
                                    (
                                        "receita-"
                                        + str(
                                            registro[
                                                "id"
                                            ]
                                        )
                                    ),

                                "data_movimentacao":
                                    (
                                        registro[
                                            "data_movimentacao"
                                        ].isoformat()
                                        if registro[
                                            "data_movimentacao"
                                        ]
                                        else None
                                    ),

                                "forma_retirada":
                                    "RECEITA",

                                "origem_tipo":
                                    registro[
                                        "origem_tipo"
                                    ],

                                "observacao":
                                    registro[
                                        "observacao"
                                    ],

                                "itens": []
                            }


                            grupos_receita[
                                chave
                            ] = grupo

                            retiradas.append(
                                grupo
                            )


                        grupo[
                            "itens"
                        ].append(
                            item
                        )


                    else:

                        retiradas.append({
                            "id":
                                (
                                    "unitario-"
                                    + str(
                                        registro[
                                            "id"
                                        ]
                                    )
                                ),

                            "data_movimentacao":
                                (
                                    registro[
                                        "data_movimentacao"
                                    ].isoformat()
                                    if registro[
                                        "data_movimentacao"
                                    ]
                                    else None
                                ),

                            "forma_retirada":
                                "UNITARIO",

                            "origem_tipo":
                                registro[
                                    "origem_tipo"
                                ],

                            "observacao":
                                registro[
                                    "observacao"
                                ],

                            "itens": [
                                item
                            ]
                        })


                for retirada in retiradas:

                    retirada[
                        "quantidade_itens"
                    ] = len(
                        retirada["itens"]
                    )


                return retiradas

        finally:

            connection.close()



    @staticmethod
    def listar_receitas():

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        pv.id
                            AS produto_venda_id,

                        pv.nome,
                        pv.sabor,

                        ft.id
                            AS ficha_id,

                        ft.nome
                            AS ficha_nome,

                        ft.rendimento

                    FROM produtos_venda pv

                    INNER JOIN fichas_tecnicas ft
                        ON ft.produto_venda_id =
                            pv.id

                        AND ft.ativa = TRUE

                    WHERE
                        pv.ativo = TRUE

                        AND EXISTS (

                            SELECT 1

                            FROM itens_ficha_tecnica ift

                            WHERE
                                ift.ficha_tecnica_id =
                                    ft.id
                        )

                    ORDER BY
                        pv.nome,
                        pv.sabor
                    """
                )

                registros = cursor.fetchall()

                return [
                    {
                        "produto_venda_id":
                            registro[
                                "produto_venda_id"
                            ],

                        "nome":
                            registro["nome"],

                        "sabor":
                            registro["sabor"],

                        "ficha_id":
                            registro["ficha_id"],

                        "ficha_nome":
                            registro["ficha_nome"],

                        "rendimento":
                            float(
                                registro[
                                    "rendimento"
                                ]
                                or 0
                            )
                    }

                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def buscar_receita(
        produto_venda_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        pv.id
                            AS produto_venda_id,

                        pv.nome,
                        pv.sabor,

                        ft.id
                            AS ficha_id,

                        ft.nome
                            AS ficha_nome,

                        ft.rendimento

                    FROM produtos_venda pv

                    INNER JOIN fichas_tecnicas ft
                        ON ft.produto_venda_id =
                            pv.id

                        AND ft.ativa = TRUE

                    WHERE
                        pv.id = %s

                        AND pv.ativo = TRUE

                    LIMIT 1
                    """,
                    (
                        produto_venda_id,
                    )
                )

                cabecalho = cursor.fetchone()

                if not cabecalho:
                    return None


                cursor.execute(
                    """
                    SELECT
                        ift.id,

                        ift.produto_estoque_id,

                        pe.nome
                            AS produto_estoque_nome,

                        pe.codigo_barras,

                        pe.unidade
                            AS unidade_estoque,

                        ift.descricao,

                        ift.quantidade,

                        ift.unidade

                    FROM itens_ficha_tecnica ift

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                            ift.produto_estoque_id

                    WHERE
                        ift.ficha_tecnica_id = %s

                    ORDER BY
                        ift.id
                    """,
                    (
                        cabecalho["ficha_id"],
                    )
                )

                registros = cursor.fetchall()

                itens = []

                for item in registros:

                    produto_estoque_id = (
                        item[
                            "produto_estoque_id"
                        ]
                    )

                    tipo_item = (
                        "ESTOQUE"
                        if produto_estoque_id
                        else "MANUAL"
                    )

                    lotes = []
                    saldo_disponivel = Decimal(
                        "0"
                    )


                    if produto_estoque_id:

                        cursor.execute(
                            """
                            SELECT
                                l.id,
                                l.quantidade_atual,
                                l.custo_unitario,
                                l.validade

                            FROM lotes_estoque l

                            WHERE
                                l.produto_estoque_id = %s

                                AND l.quantidade_atual > 0

                                AND (
                                    l.validade IS NULL
                                    OR l.validade
                                        >= CURRENT_DATE
                                )

                            ORDER BY

                                CASE
                                    WHEN l.validade IS NULL
                                        THEN 1
                                    ELSE 0
                                END,

                                l.validade,

                                l.id
                            """,
                            (
                                produto_estoque_id,
                            )
                        )

                        registros_lotes = (
                            cursor.fetchall()
                        )

                        for lote in registros_lotes:

                            quantidade_lote = Decimal(
                                str(
                                    lote[
                                        "quantidade_atual"
                                    ]
                                )
                            )

                            saldo_disponivel += (
                                quantidade_lote
                            )

                            lotes.append({
                                "id":
                                    lote["id"],

                                "quantidade_atual":
                                    float(
                                        quantidade_lote
                                    ),

                                "custo_unitario":
                                    float(
                                        lote[
                                            "custo_unitario"
                                        ]
                                        or 0
                                    ),

                                "validade":
                                    (
                                        lote["validade"]
                                        .isoformat()
                                        if lote[
                                            "validade"
                                        ]
                                        else None
                                    )
                            })


                    itens.append({
                        "id":
                            item["id"],

                        "tipo_item":
                            tipo_item,

                        "produto_estoque_id":
                            produto_estoque_id,

                        "produto_estoque_nome":
                            item[
                                "produto_estoque_nome"
                            ],

                        "codigo_barras":
                            item[
                                "codigo_barras"
                            ],

                        "unidade_estoque":
                            item[
                                "unidade_estoque"
                            ],

                        "descricao":
                            item["descricao"],

                        "quantidade":
                            float(
                                item[
                                    "quantidade"
                                ]
                                or 0
                            ),

                        "unidade":
                            item["unidade"],

                        "saldo_disponivel":
                            float(
                                saldo_disponivel
                            ),

                        "lotes":
                            lotes
                    })


                return {
                    "produto": {
                        "id":
                            cabecalho[
                                "produto_venda_id"
                            ],

                        "nome":
                            cabecalho["nome"],

                        "sabor":
                            cabecalho["sabor"]
                    },

                    "ficha": {
                        "id":
                            cabecalho["ficha_id"],

                        "nome":
                            cabecalho[
                                "ficha_nome"
                            ],

                        "rendimento":
                            float(
                                cabecalho[
                                    "rendimento"
                                ]
                                or 0
                            )
                    },

                    "possui_itens_manuais":
                        any(
                            item["tipo_item"]
                            == "MANUAL"
                            for item in itens
                        ),

                    "itens":
                        itens
                }

        finally:

            connection.close()


    @staticmethod
    def retirar_por_receita(
        produto_venda_id,
        quantidade_produzir,
        usuario_id,
        lotes_selecionados,
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
                        pv.id
                            AS produto_venda_id,

                        pv.nome,
                        pv.sabor,

                        ft.id
                            AS ficha_id,

                        ft.nome
                            AS ficha_nome,

                        ft.rendimento

                    FROM produtos_venda pv

                    INNER JOIN fichas_tecnicas ft
                        ON ft.produto_venda_id =
                            pv.id

                        AND ft.ativa = TRUE

                    WHERE
                        pv.id = %s

                        AND pv.ativo = TRUE

                    LIMIT 1

                    FOR UPDATE
                    """,
                    (
                        produto_venda_id,
                    )
                )

                ficha = cursor.fetchone()

                if not ficha:

                    raise ValueError(
                        "Produto não possui "
                        "receita ativa."
                    )


                rendimento = Decimal(
                    str(
                        ficha["rendimento"]
                        or 0
                    )
                )

                if rendimento <= 0:

                    raise ValueError(
                        "A receita possui "
                        "rendimento inválido."
                    )


                cursor.execute(
                    """
                    SELECT
                        ift.id,

                        ift.produto_estoque_id,

                        ift.descricao,

                        ift.quantidade,

                        ift.unidade,

                        pe.nome
                            AS produto_estoque_nome,

                        pe.unidade
                            AS unidade_estoque

                    FROM itens_ficha_tecnica ift

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                            ift.produto_estoque_id

                    WHERE
                        ift.ficha_tecnica_id = %s

                    ORDER BY
                        ift.id
                    """,
                    (
                        ficha["ficha_id"],
                    )
                )

                itens = cursor.fetchall()

                if not itens:

                    raise ValueError(
                        "A receita não possui "
                        "ingredientes cadastrados."
                    )


                selecionados = {}

                for selecao in (
                    lotes_selecionados
                    or []
                ):

                    try:

                        item_ficha_id = int(
                            selecao.get(
                                "item_ficha_id"
                            )
                        )

                        lote_id = int(
                            selecao.get(
                                "lote_id"
                            )
                        )

                    except (
                        TypeError,
                        ValueError,
                        AttributeError
                    ):

                        raise ValueError(
                            "Seleção de lote inválida."
                        )


                    selecionados[
                        item_ficha_id
                    ] = lote_id


                fator = (
                    quantidade_produzir
                    /
                    rendimento
                )

                necessidades_por_lote = {}
                itens_manuais = []
                itens_estoque = []


                for item in itens:

                    quantidade_item = Decimal(
                        str(
                            item["quantidade"]
                            or 0
                        )
                    )

                    necessaria = (
                        quantidade_item
                        *
                        fator
                    )


                    if necessaria <= 0:

                        descricao = (
                            item[
                                "produto_estoque_nome"
                            ]
                            or item["descricao"]
                            or "Item"
                        )

                        raise ValueError(
                            "Quantidade inválida "
                            f"na receita para "
                            f"{descricao}."
                        )


                    produto_estoque_id = (
                        item[
                            "produto_estoque_id"
                        ]
                    )


                    # Itens manuais fazem parte do
                    # custo/ficha, mas não possuem
                    # saldo físico para dar baixa.
                    if not produto_estoque_id:

                        itens_manuais.append({
                            "item_ficha_id":
                                item["id"],

                            "descricao":
                                (
                                    item["descricao"]
                                    or "Item manual"
                                ),

                            "quantidade":
                                float(
                                    necessaria
                                ),

                            "unidade":
                                item["unidade"]
                        })

                        continue


                    lote_id = selecionados.get(
                        item["id"]
                    )


                    if not lote_id:

                        raise ValueError(
                            "Selecione o lote de "
                            f"{item['produto_estoque_nome']}."
                        )


                    if (
                        lote_id
                        not in necessidades_por_lote
                    ):

                        necessidades_por_lote[
                            lote_id
                        ] = {
                            "produto_estoque_id":
                                produto_estoque_id,

                            "produto_nome":
                                item[
                                    "produto_estoque_nome"
                                ],

                            "quantidade":
                                Decimal("0"),

                            "itens":
                                []
                        }


                    plano_lote = (
                        necessidades_por_lote[
                            lote_id
                        ]
                    )


                    if (
                        plano_lote[
                            "produto_estoque_id"
                        ]
                        != produto_estoque_id
                    ):

                        raise ValueError(
                            "O lote selecionado não "
                            "corresponde ao produto "
                            "da receita."
                        )


                    plano_lote[
                        "quantidade"
                    ] += necessaria

                    plano_lote[
                        "itens"
                    ].append({
                        "item_ficha_id":
                            item["id"],

                        "quantidade":
                            necessaria
                    })


                    itens_estoque.append({
                        "item_ficha_id":
                            item["id"],

                        "produto_estoque_id":
                            produto_estoque_id,

                        "produto_nome":
                            item[
                                "produto_estoque_nome"
                            ],

                        "lote_id":
                            lote_id,

                        "quantidade":
                            necessaria,

                        "unidade":
                            item["unidade"]
                    })


                lotes_bloqueados = {}


                # Bloqueia e valida todos os lotes
                # antes de alterar qualquer saldo.
                for lote_id in sorted(
                    necessidades_por_lote
                ):

                    plano_lote = (
                        necessidades_por_lote[
                            lote_id
                        ]
                    )

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

                        WHERE
                            l.id = %s

                        FOR UPDATE
                        """,
                        (
                            lote_id,
                        )
                    )

                    lote = cursor.fetchone()

                    if not lote:

                        raise ValueError(
                            f"Lote #{lote_id} "
                            "não encontrado."
                        )


                    if (
                        lote[
                            "produto_estoque_id"
                        ]
                        != plano_lote[
                            "produto_estoque_id"
                        ]
                    ):

                        raise ValueError(
                            f"Lote #{lote_id} não "
                            "pertence ao produto "
                            f"{plano_lote['produto_nome']}."
                        )


                    if (
                        lote["validade"]
                        and lote["validade"]
                            < date.today()
                    ):

                        raise ValueError(
                            f"Lote #{lote_id} de "
                            f"{lote['produto_nome']} "
                            "está vencido."
                        )


                    saldo = Decimal(
                        str(
                            lote[
                                "quantidade_atual"
                            ]
                            or 0
                        )
                    )

                    necessario = (
                        plano_lote[
                            "quantidade"
                        ]
                    )


                    if saldo < necessario:

                        raise ValueError(
                            "Saldo insuficiente no "
                            f"lote #{lote_id} de "
                            f"{lote['produto_nome']}. "
                            f"Necessário: "
                            f"{float(necessario):g}; "
                            f"disponível: "
                            f"{float(saldo):g}."
                        )


                    lotes_bloqueados[
                        lote_id
                    ] = lote


                produto_descricao = (
                    ficha["nome"]
                )

                if ficha["sabor"]:

                    produto_descricao += (
                        f" - {ficha['sabor']}"
                    )


                observacao_movimento = (
                    "Retirada por receita: "
                    f"{produto_descricao}; "
                    f"produção: "
                    f"{float(quantidade_produzir):g}"
                )


                if observacao:

                    observacao_movimento += (
                        f"; {observacao}"
                    )


                retiradas = []


                for lote_id in sorted(
                    necessidades_por_lote
                ):

                    plano_lote = (
                        necessidades_por_lote[
                            lote_id
                        ]
                    )

                    quantidade_retirar = (
                        plano_lote[
                            "quantidade"
                        ]
                    )


                    cursor.execute(
                        """
                        UPDATE lotes_estoque

                        SET
                            quantidade_atual =
                                quantidade_atual
                                - %s

                        WHERE id = %s

                        RETURNING
                            quantidade_atual
                        """,
                        (
                            quantidade_retirar,
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
                            quantidade_retirar,
                            observacao_movimento,
                            usuario_id
                        )
                    )


                    retiradas.append({
                        "lote_id":
                            lote_id,

                        "produto_estoque_id":
                            plano_lote[
                                "produto_estoque_id"
                            ],

                        "produto_nome":
                            plano_lote[
                                "produto_nome"
                            ],

                        "quantidade_retirada":
                            float(
                                quantidade_retirar
                            ),

                        "quantidade_atual":
                            float(
                                atualizado[
                                    "quantidade_atual"
                                ]
                            )
                    })


                connection.commit()


                return {
                    "produto_venda_id":
                        produto_venda_id,

                    "produto":
                        produto_descricao,

                    "quantidade_produzir":
                        float(
                            quantidade_produzir
                        ),

                    "retiradas":
                        retiradas,

                    "itens_manuais_ignorados":
                        itens_manuais
                }

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()
