from psycopg2.extras import RealDictCursor

from src.database import get_connection
from src.entities.cliente import Cliente


class ClienteRepository:

    # ==========================================
    # CONVERTER REGISTRO DO BANCO PARA ENTITY
    # ==========================================

    @staticmethod
    def _converter_para_entity(registro):

        if registro is None:
            return None

        return Cliente(
            id=registro["id"],
            nome=registro["nome"],
            sobrenome=registro["sobrenome"],
            telefone=registro["telefone"],
            email=registro["email"],
            cpf=registro["cpf"],
            cep=registro["cep"],
            bairro=registro["bairro"],
            rua=registro["rua"],
            cidade=registro["cidade"],
            estado=registro["estado"],
            numero_endereco=registro[
                "numero_endereco"
            ],
            complemento=registro[
                "complemento"
            ],
            ativo=registro["ativo"],
            criado_em=registro["criado_em"]
        )


    # ==========================================
    # LISTAR
    # ==========================================

    @staticmethod
    def listar(busca=None):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                if busca:

                    termo = f"%{busca}%"

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            sobrenome,
                            telefone,
                            email,
                            cpf,
                            cep,
                            bairro,
                            rua,
                            cidade,
                            estado,
                            numero_endereco,
                            complemento,
                            ativo,
                            criado_em

                        FROM clientes

                        WHERE
                            ativo = TRUE

                            AND (
                                nome ILIKE %s

                                OR sobrenome
                                    ILIKE %s

                                OR email
                                    ILIKE %s

                                OR telefone
                                    ILIKE %s

                                OR cpf
                                    ILIKE %s

                                OR cidade
                                    ILIKE %s

                                OR estado
                                    ILIKE %s
                            )

                        ORDER BY
                            nome,
                            sobrenome
                        """,
                        (
                            termo,
                            termo,
                            termo,
                            termo,
                            termo,
                            termo,
                            termo
                        )
                    )

                else:

                    cursor.execute(
                        """
                        SELECT
                            id,
                            nome,
                            sobrenome,
                            telefone,
                            email,
                            cpf,
                            cep,
                            bairro,
                            rua,
                            cidade,
                            estado,
                            numero_endereco,
                            complemento,
                            ativo,
                            criado_em

                        FROM clientes

                        WHERE
                            ativo = TRUE

                        ORDER BY
                            nome,
                            sobrenome
                        """
                    )


                registros = (
                    cursor.fetchall()
                )


                return [
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                    for registro
                    in registros
                ]


        finally:

            connection.close()


    # ==========================================
    # BUSCAR POR ID
    # ==========================================

    @staticmethod
    def buscar_por_id(
        cliente_id
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
                        nome,
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento,
                        ativo,
                        criado_em

                    FROM clientes

                    WHERE
                        id = %s

                    LIMIT 1
                    """,
                    (
                        cliente_id,
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                return (
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                )


        finally:

            connection.close()


    # ==========================================
    # BUSCAR POR EMAIL
    # ==========================================

    @staticmethod
    def buscar_por_email(
        email
    ):

        if not email:
            return None


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
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento,
                        ativo,
                        criado_em

                    FROM clientes

                    WHERE
                        LOWER(email)
                        =
                        LOWER(%s)

                    LIMIT 1
                    """,
                    (
                        email,
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                return (
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                )


        finally:

            connection.close()


    # ==========================================
    # BUSCAR POR CPF
    # ==========================================

    @staticmethod
    def buscar_por_cpf(
        cpf
    ):

        if not cpf:
            return None


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
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento,
                        ativo,
                        criado_em

                    FROM clientes

                    WHERE
                        cpf = %s

                    LIMIT 1
                    """,
                    (
                        cpf,
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                return (
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                )


        finally:

            connection.close()


    # ==========================================
    # CRIAR
    #
    # AGORA RECEBE OBJETO Cliente
    # ==========================================

    @staticmethod
    def criar(
        cliente
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    INSERT INTO clientes (
                        nome,
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento
                    )

                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )

                    RETURNING
                        id,
                        nome,
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento,
                        ativo,
                        criado_em
                    """,
                    (
                        cliente.nome,
                        cliente.sobrenome,
                        cliente.telefone,
                        cliente.email,
                        cliente.cpf,
                        cliente.cep,
                        cliente.bairro,
                        cliente.rua,
                        cliente.cidade,
                        cliente.estado,
                        cliente.numero_endereco,
                        cliente.complemento
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                connection.commit()


                return (
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                )


        except Exception:

            connection.rollback()

            raise


        finally:

            connection.close()


    # ==========================================
    # ATUALIZAR
    #
    # AGORA RECEBE APENAS objeto Cliente
    # ==========================================

    @staticmethod
    def atualizar(
        cliente
    ):

        connection = get_connection()

        try:

            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    UPDATE clientes

                    SET
                        nome = %s,
                        sobrenome = %s,
                        telefone = %s,
                        email = %s,
                        cpf = %s,
                        cep = %s,
                        bairro = %s,
                        rua = %s,
                        cidade = %s,
                        estado = %s,
                        numero_endereco = %s,
                        complemento = %s

                    WHERE
                        id = %s

                    RETURNING
                        id,
                        nome,
                        sobrenome,
                        telefone,
                        email,
                        cpf,
                        cep,
                        bairro,
                        rua,
                        cidade,
                        estado,
                        numero_endereco,
                        complemento,
                        ativo,
                        criado_em
                    """,
                    (
                        cliente.nome,
                        cliente.sobrenome,
                        cliente.telefone,
                        cliente.email,
                        cliente.cpf,
                        cliente.cep,
                        cliente.bairro,
                        cliente.rua,
                        cliente.cidade,
                        cliente.estado,
                        cliente.numero_endereco,
                        cliente.complemento,
                        cliente.id
                    )
                )


                registro = (
                    cursor.fetchone()
                )


                if not registro:

                    connection.rollback()

                    return None


                connection.commit()


                return (
                    ClienteRepository
                    ._converter_para_entity(
                        registro
                    )
                )


        except Exception:

            connection.rollback()

            raise


        finally:

            connection.close()


    # ==========================================
    # DESATIVAR
    # ==========================================

    @staticmethod
    def desativar(
        cliente_id
    ):

        connection = get_connection()

        try:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE clientes

                    SET
                        ativo = FALSE

                    WHERE
                        id = %s
                    """,
                    (
                        cliente_id,
                    )
                )


                alterados = (
                    cursor.rowcount
                )


                connection.commit()


                return (
                    alterados > 0
                )


        except Exception:

            connection.rollback()

            raise


        finally:

            connection.close()