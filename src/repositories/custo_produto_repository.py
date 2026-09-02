from psycopg2.extras import RealDictCursor

from src.database import get_connection

from src.entities.ficha_tecnica import (
    FichaTecnica
)

from src.entities.item_ficha_tecnica import (
    ItemFichaTecnica
)


class CustoProdutoRepository:

    @staticmethod
    def listar_produtos():

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        pv.id,
                        pv.nome,
                        pv.sabor,
                        pv.tipo,
                        pv.preco_venda,

                        ft.id AS ficha_id,

                        ft.rendimento

                    FROM produtos_venda pv

                    LEFT JOIN fichas_tecnicas ft
                        ON ft.produto_venda_id = pv.id
                        AND ft.ativa = TRUE

                    WHERE pv.ativo = TRUE

                    ORDER BY
                        pv.nome,
                        pv.sabor
                    """
                )

                return cursor.fetchall()

        finally:

            connection.close()


    @staticmethod
    def buscar_produto(produto_id):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        nome,
                        sabor,
                        tipo,
                        preco_venda,
                        ativo

                    FROM produtos_venda

                    WHERE id = %s
                    LIMIT 1
                    """,
                    (produto_id,)
                )

                return cursor.fetchone()

        finally:

            connection.close()


    @staticmethod
    def buscar_ficha(produto_id):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        produto_venda_id,
                        nome,
                        rendimento,
                        ativa,
                        criado_em

                    FROM fichas_tecnicas

                    WHERE produto_venda_id = %s
                    AND ativa = TRUE

                    LIMIT 1
                    """,
                    (produto_id,)
                )

                registro = cursor.fetchone()

                if not registro:
                    return None

                return FichaTecnica(
                    id=registro["id"],

                    produto_venda_id=(
                        registro[
                            "produto_venda_id"
                        ]
                    ),

                    nome=registro["nome"],

                    rendimento=(
                        registro["rendimento"]
                    ),

                    ativa=registro["ativa"],

                    criado_em=(
                        registro["criado_em"]
                    )
                )

        finally:

            connection.close()


    @staticmethod
    def listar_itens(ficha_id):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        i.id,

                        i.ficha_tecnica_id,

                        i.produto_estoque_id,

                        pe.nome
                            AS produto_estoque_nome,

                        i.descricao,

                        i.quantidade,

                        i.unidade,

                        i.valor_unitario_manual,

                        i.criado_em

                    FROM itens_ficha_tecnica i

                    LEFT JOIN produtos_estoque pe
                        ON pe.id =
                        i.produto_estoque_id

                    WHERE
                        i.ficha_tecnica_id = %s

                    ORDER BY i.id
                    """,
                    (ficha_id,)
                )

                registros = cursor.fetchall()

                return [
                    ItemFichaTecnica(
                        id=registro["id"],

                        ficha_tecnica_id=(
                            registro[
                                "ficha_tecnica_id"
                            ]
                        ),

                        produto_estoque_id=(
                            registro[
                                "produto_estoque_id"
                            ]
                        ),

                        produto_estoque_nome=(
                            registro[
                                "produto_estoque_nome"
                            ]
                        ),

                        descricao=(
                            registro["descricao"]
                        ),

                        quantidade=(
                            registro["quantidade"]
                        ),

                        unidade=(
                            registro["unidade"]
                        ),

                        valor_unitario_manual=(
                            registro[
                                "valor_unitario_manual"
                            ]
                        ),

                        criado_em=(
                            registro["criado_em"]
                        )
                    )

                    for registro in registros
                ]

        finally:

            connection.close()


    @staticmethod
    def salvar_ficha(
        produto_id,
        nome_ficha,
        rendimento,
        itens
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                # Bloqueia o produto durante a operação.
                cursor.execute(
                    """
                    SELECT
                        id,
                        nome,
                        sabor

                    FROM produtos_venda

                    WHERE id = %s
                    AND ativo = TRUE

                    FOR UPDATE
                    """,
                    (produto_id,)
                )

                produto = cursor.fetchone()

                if not produto:

                    raise ValueError(
                        "Produto de venda "
                        "não encontrado."
                    )


                # Verifica se já existe ficha.
                cursor.execute(
                    """
                    SELECT id

                    FROM fichas_tecnicas

                    WHERE produto_venda_id = %s
                    AND ativa = TRUE

                    LIMIT 1
                    """,
                    (produto_id,)
                )

                ficha = cursor.fetchone()


                if ficha:

                    ficha_id = ficha["id"]

                    cursor.execute(
                        """
                        UPDATE fichas_tecnicas

                        SET
                            nome = %s,
                            rendimento = %s

                        WHERE id = %s
                        """,
                        (
                            nome_ficha,
                            rendimento,
                            ficha_id
                        )
                    )


                    # Vamos substituir os itens da
                    # ficha pela configuração atual.
                    cursor.execute(
                        """
                        DELETE FROM itens_ficha_tecnica

                        WHERE ficha_tecnica_id = %s
                        """,
                        (ficha_id,)
                    )

                else:

                    cursor.execute(
                        """
                        INSERT INTO fichas_tecnicas
                        (
                            produto_venda_id,
                            nome,
                            rendimento,
                            ativa
                        )

                        VALUES
                        (
                            %s,
                            %s,
                            %s,
                            TRUE
                        )

                        RETURNING id
                        """,
                        (
                            produto_id,
                            nome_ficha,
                            rendimento
                        )
                    )

                    ficha_id = (
                        cursor.fetchone()["id"]
                    )


                for item in itens:

                    cursor.execute(
                        """
                        INSERT INTO itens_ficha_tecnica
                        (
                            ficha_tecnica_id,
                            produto_estoque_id,
                            descricao,
                            quantidade,
                            unidade,
                            valor_unitario_manual
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
                            ficha_id,

                            item[
                                "produto_estoque_id"
                            ],

                            item[
                                "descricao"
                            ],

                            item[
                                "quantidade"
                            ],

                            item[
                                "unidade"
                            ],

                            item[
                                "valor_unitario"
                            ]
                        )
                    )


                connection.commit()

                return ficha_id

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()


    @staticmethod
    def remover_ficha(produto_id):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE fichas_tecnicas

                    SET ativa = FALSE

                    WHERE produto_venda_id = %s
                    AND ativa = TRUE
                    """,
                    (produto_id,)
                )

                alterados = cursor.rowcount

                connection.commit()

                return alterados > 0

        except Exception:

            connection.rollback()

            raise

        finally:

            connection.close()