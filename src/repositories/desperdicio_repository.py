from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.desperdicio import Desperdicio


class DesperdicioRepository:

    @staticmethod
    def _converter(registro):

        if not registro:
            return None

        return Desperdicio(
            id=registro["id"],

            lote_id=registro["lote_id"],

            produto_estoque_id=(
                registro["produto_estoque_id"]
            ),

            produto_nome=(
                registro["produto_nome"]
            ),

            codigo_barras=(
                registro["codigo_barras"]
            ),

            quantidade=(
                registro["quantidade"]
            ),

            custo_unitario=(
                registro["custo_unitario"]
            ),

            valor_total=(
                registro["valor_total"]
            ),

            validade=(
                registro["validade"]
            ),

            motivo=(
                registro["motivo"]
            ),

            observacao=(
                registro["observacao"]
            ),

            data_desperdicio=(
                registro["data_desperdicio"]
            ),

            usuario_id=(
                registro["usuario_id"]
            ),

            ativo=(
                registro["ativo"]
            )
        )


    @staticmethod
    def _select_base():

        return """
            SELECT
                d.id,
                d.lote_id,

                l.produto_estoque_id,

                pe.nome
                    AS produto_nome,

                pe.codigo_barras,

                d.quantidade,
                d.custo_unitario,
                d.valor_total,

                l.validade,

                d.motivo,
                d.observacao,
                d.data_desperdicio,
                d.usuario_id,
                d.ativo

            FROM desperdicios d

            INNER JOIN lotes_estoque l
                ON l.id = d.lote_id

            INNER JOIN produtos_estoque pe
                ON pe.id =
                l.produto_estoque_id
        """


    @staticmethod
    def listar(
        busca=None,
        motivo=None
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = (
                    DesperdicioRepository
                    ._select_base()
                )

                sql += """
                    WHERE d.ativo = TRUE
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
                                d.id AS TEXT
                            ) ILIKE %s
                        )
                    """

                    parametros.extend([
                        termo,
                        termo,
                        termo
                    ])


                if motivo:

                    sql += """
                        AND d.motivo = %s
                    """

                    parametros.append(
                        motivo
                    )


                sql += """
                    ORDER BY
                        d.data_desperdicio DESC,
                        d.id DESC
                """


                cursor.execute(
                    sql,
                    parametros
                )

                registros = cursor.fetchall()

                return [
                    DesperdicioRepository
                    ._converter(registro)

                    for registro
                    in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def buscar_por_id(
        desperdicio_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                sql = (
                    DesperdicioRepository
                    ._select_base()
                )

                sql += """
                    WHERE d.id = %s
                    LIMIT 1
                """

                cursor.execute(
                    sql,
                    (desperdicio_id,)
                )

                return (
                    DesperdicioRepository
                    ._converter(
                        cursor.fetchone()
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def criar(
        lote_id,
        quantidade,
        motivo,
        observacao,
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
                        l.id,
                        l.quantidade_atual,
                        l.custo_unitario

                    FROM lotes_estoque l

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
                    quantidade
                    > lote["quantidade_atual"]
                ):

                    raise ValueError(
                        "Quantidade do desperdício "
                        "maior que o saldo disponível."
                    )


                custo_unitario = (
                    lote["custo_unitario"]
                )

                valor_total = (
                    quantidade
                    * custo_unitario
                )


                cursor.execute(
                    """
                    UPDATE lotes_estoque

                    SET
                        quantidade_atual =
                            quantidade_atual - %s

                    WHERE id = %s
                    """,
                    (
                        quantidade,
                        lote_id
                    )
                )


                cursor.execute(
                    """
                    INSERT INTO desperdicios
                    (
                        lote_id,
                        quantidade,
                        custo_unitario,
                        valor_total,
                        motivo,
                        observacao,
                        usuario_id,
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
                        %s,
                        TRUE
                    )

                    RETURNING id
                    """,
                    (
                        lote_id,
                        quantidade,
                        custo_unitario,
                        valor_total,
                        motivo,
                        observacao,
                        usuario_id
                    )
                )


                desperdicio_id = (
                    cursor.fetchone()["id"]
                )


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
                        'SAIDA_DESPERDICIO',
                        %s,
                        'DESPERDICIO',
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        lote_id,
                        quantidade,
                        desperdicio_id,
                        observacao,
                        usuario_id
                    )
                )


                connection.commit()

                return desperdicio_id

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def atualizar(
        desperdicio_id,
        novo_lote_id,
        nova_quantidade,
        motivo,
        observacao,
        usuario_id
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # Bloqueia o desperdício.
                cursor.execute(
                    """
                    SELECT
                        id,
                        lote_id,
                        quantidade,
                        ativo

                    FROM desperdicios

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (desperdicio_id,)
                )

                desperdicio = (
                    cursor.fetchone()
                )


                if (
                    not desperdicio
                    or not desperdicio["ativo"]
                ):

                    raise ValueError(
                        "Desperdício não encontrado."
                    )


                lote_antigo_id = (
                    desperdicio["lote_id"]
                )

                quantidade_antiga = (
                    desperdicio["quantidade"]
                )


                # Devolve primeiro o desperdício
                # anterior ao estoque.
                cursor.execute(
                    """
                    SELECT
                        id

                    FROM lotes_estoque

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (lote_antigo_id,)
                )


                if not cursor.fetchone():

                    raise ValueError(
                        "Lote original não encontrado."
                    )


                cursor.execute(
                    """
                    UPDATE lotes_estoque

                    SET
                        quantidade_atual =
                            quantidade_atual + %s

                    WHERE id = %s
                    """,
                    (
                        quantidade_antiga,
                        lote_antigo_id
                    )
                )


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
                        'ENTRADA_ESTORNO_DESPERDICIO',
                        %s,
                        'DESPERDICIO',
                        %s,
                        'Estorno para edição do desperdício',
                        %s
                    )
                    """,
                    (
                        lote_antigo_id,
                        quantidade_antiga,
                        desperdicio_id,
                        usuario_id
                    )
                )


                # Agora bloqueia o lote que será
                # usado na nova versão.
                cursor.execute(
                    """
                    SELECT
                        id,
                        quantidade_atual,
                        custo_unitario

                    FROM lotes_estoque

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (novo_lote_id,)
                )

                novo_lote = (
                    cursor.fetchone()
                )


                if not novo_lote:

                    raise ValueError(
                        "Novo lote não encontrado."
                    )


                if (
                    nova_quantidade
                    >
                    novo_lote[
                        "quantidade_atual"
                    ]
                ):

                    raise ValueError(
                        "Quantidade do desperdício "
                        "maior que o saldo disponível."
                    )


                custo_unitario = (
                    novo_lote[
                        "custo_unitario"
                    ]
                )

                valor_total = (
                    nova_quantidade
                    * custo_unitario
                )


                cursor.execute(
                    """
                    UPDATE lotes_estoque

                    SET
                        quantidade_atual =
                            quantidade_atual - %s

                    WHERE id = %s
                    """,
                    (
                        nova_quantidade,
                        novo_lote_id
                    )
                )


                cursor.execute(
                    """
                    UPDATE desperdicios

                    SET
                        lote_id = %s,
                        quantidade = %s,
                        custo_unitario = %s,
                        valor_total = %s,
                        motivo = %s,
                        observacao = %s,
                        usuario_id = %s,
                        atualizado_em =
                            CURRENT_TIMESTAMP

                    WHERE id = %s
                    """,
                    (
                        novo_lote_id,
                        nova_quantidade,
                        custo_unitario,
                        valor_total,
                        motivo,
                        observacao,
                        usuario_id,
                        desperdicio_id
                    )
                )


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
                        'SAIDA_DESPERDICIO',
                        %s,
                        'DESPERDICIO',
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        novo_lote_id,
                        nova_quantidade,
                        desperdicio_id,
                        observacao,
                        usuario_id
                    )
                )


                connection.commit()

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def excluir(
        desperdicio_id,
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
                        lote_id,
                        quantidade,
                        ativo

                    FROM desperdicios

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (desperdicio_id,)
                )

                desperdicio = (
                    cursor.fetchone()
                )


                if (
                    not desperdicio
                    or not desperdicio["ativo"]
                ):

                    raise ValueError(
                        "Desperdício não encontrado."
                    )


                cursor.execute(
                    """
                    SELECT id

                    FROM lotes_estoque

                    WHERE id = %s

                    FOR UPDATE
                    """,
                    (
                        desperdicio[
                            "lote_id"
                        ],
                    )
                )


                if not cursor.fetchone():

                    raise ValueError(
                        "Lote não encontrado."
                    )


                cursor.execute(
                    """
                    UPDATE lotes_estoque

                    SET
                        quantidade_atual =
                            quantidade_atual + %s

                    WHERE id = %s
                    """,
                    (
                        desperdicio[
                            "quantidade"
                        ],

                        desperdicio[
                            "lote_id"
                        ]
                    )
                )


                cursor.execute(
                    """
                    UPDATE desperdicios

                    SET
                        ativo = FALSE,
                        cancelado_em =
                            CURRENT_TIMESTAMP

                    WHERE id = %s
                    """,
                    (desperdicio_id,)
                )


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
                        'ENTRADA_ESTORNO_DESPERDICIO',
                        %s,
                        'DESPERDICIO',
                        %s,
                        'Estorno por exclusão do desperdício',
                        %s
                    )
                    """,
                    (
                        desperdicio[
                            "lote_id"
                        ],

                        desperdicio[
                            "quantidade"
                        ],

                        desperdicio_id,

                        usuario_id
                    )
                )


                connection.commit()

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()