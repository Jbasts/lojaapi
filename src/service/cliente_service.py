import re

from src.entities.cliente import Cliente
from src.repositories.cliente_repository import (
    ClienteRepository
)


class ClienteService:

    # ==========================================
    # TEXTO OPCIONAL
    # ==========================================

    @staticmethod
    def _texto_opcional(
        valor
    ):

        if valor is None:
            return None


        valor = str(
            valor
        ).strip()


        return (
            valor
            if valor
            else None
        )


    # ==========================================
    # SOMENTE NÚMEROS
    # ==========================================

    @staticmethod
    def _somente_numeros(
        valor
    ):

        if not valor:
            return None


        numeros = re.sub(
            r"\D",
            "",
            str(valor)
        )


        return (
            numeros
            if numeros
            else None
        )


    # ==========================================
    # ESTADO / UF
    # ==========================================

    @staticmethod
    def _normalizar_estado(
        valor
    ):

        estado = (
            ClienteService
            ._texto_opcional(
                valor
            )
        )


        if not estado:
            return None


        estado = (
            estado.upper()
        )


        if not re.fullmatch(
            r"[A-Z]{2}",
            estado
        ):

            raise ValueError(
                "Estado deve possuir "
                "uma UF válida."
            )


        return estado


    # ==========================================
    # LISTAR
    # ==========================================

    @staticmethod
    def listar(
        busca=None
    ):

        clientes = (
            ClienteRepository.listar(
                busca
            )
        )


        return [
            cliente.to_dict()
            for cliente
            in clientes
        ]


    # ==========================================
    # BUSCAR POR ID
    # ==========================================

    @staticmethod
    def buscar_por_id(
        cliente_id
    ):

        cliente = (
            ClienteRepository
            .buscar_por_id(
                cliente_id
            )
        )


        if (
            not cliente
            or
            not cliente.ativo
        ):

            raise ValueError(
                "Cliente não encontrado."
            )


        return cliente


    # ==========================================
    # CRIAR
    # ==========================================

    @staticmethod
    def criar(
        dados
    ):

        nome = (
            dados.get(
                "nome"
            )
        )


        sobrenome = (
            dados.get(
                "sobrenome"
            )
        )


        if (
            not nome
            or
            not nome.strip()
        ):

            raise ValueError(
                "Nome é obrigatório."
            )


        if (
            not sobrenome
            or
            not sobrenome.strip()
        ):

            raise ValueError(
                "Sobrenome é obrigatório."
            )


        # ======================================
        # EMAIL
        # ======================================

        email = (
            ClienteService
            ._texto_opcional(
                dados.get(
                    "email"
                )
            )
        )


        if email:

            email = (
                email.lower()
            )


        # ======================================
        # CPF
        # ======================================

        cpf = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "cpf"
                )
            )
        )


        if (
            cpf
            and
            len(cpf) != 11
        ):

            raise ValueError(
                "CPF deve possuir "
                "11 números."
            )


        # ======================================
        # CEP
        # ======================================

        cep = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "cep"
                )
            )
        )


        if (
            cep
            and
            len(cep) != 8
        ):

            raise ValueError(
                "CEP deve possuir "
                "8 números."
            )


        # ======================================
        # TELEFONE
        # ======================================

        telefone = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "telefone"
                )
            )
        )


        # ======================================
        # ESTADO
        #
        # NÃO usar _somente_numeros aqui.
        # ======================================

        estado = (
            ClienteService
            ._normalizar_estado(
                dados.get(
                    "estado"
                )
            )
        )


        # ======================================
        # EMAIL DUPLICADO
        # ======================================

        if email:

            cliente_email = (
                ClienteRepository
                .buscar_por_email(
                    email
                )
            )


            if cliente_email:

                raise ValueError(
                    "Já existe um cliente "
                    "com esse e-mail."
                )


        # ======================================
        # CPF DUPLICADO
        # ======================================

        if cpf:

            cliente_cpf = (
                ClienteRepository
                .buscar_por_cpf(
                    cpf
                )
            )


            if cliente_cpf:

                raise ValueError(
                    "Já existe um cliente "
                    "com esse CPF."
                )


        # ======================================
        # ENTITY
        # ======================================

        cliente = Cliente(

            nome=nome.strip(),

            sobrenome=
                sobrenome.strip(),

            telefone=
                telefone,

            email=
                email,

            cpf=
                cpf,

            cep=
                cep,

            bairro=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "bairro"
                    )
                )
            ),

            rua=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "rua"
                    )
                )
            ),

            cidade=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "cidade"
                    )
                )
            ),

            estado=
                estado,

            numero_endereco=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "numero_endereco"
                    )
                )
            ),

            complemento=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "complemento"
                    )
                )
            )
        )


        return (
            ClienteRepository.criar(
                cliente
            )
        )


    # ==========================================
    # ATUALIZAR
    # ==========================================

    @staticmethod
    def atualizar(
        cliente_id,
        dados
    ):

        cliente_atual = (
            ClienteRepository
            .buscar_por_id(
                cliente_id
            )
        )


        if not cliente_atual:

            raise ValueError(
                "Cliente não encontrado."
            )


        nome = (
            dados.get(
                "nome"
            )
        )


        sobrenome = (
            dados.get(
                "sobrenome"
            )
        )


        if (
            not nome
            or
            not nome.strip()
        ):

            raise ValueError(
                "Nome é obrigatório."
            )


        if (
            not sobrenome
            or
            not sobrenome.strip()
        ):

            raise ValueError(
                "Sobrenome é obrigatório."
            )


        # ======================================
        # EMAIL
        # ======================================

        email = (
            ClienteService
            ._texto_opcional(
                dados.get(
                    "email"
                )
            )
        )


        if email:

            email = (
                email.lower()
            )


        # ======================================
        # CPF
        # ======================================

        cpf = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "cpf"
                )
            )
        )


        if (
            cpf
            and
            len(cpf) != 11
        ):

            raise ValueError(
                "CPF deve possuir "
                "11 números."
            )


        # ======================================
        # CEP
        # ======================================

        cep = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "cep"
                )
            )
        )


        if (
            cep
            and
            len(cep) != 8
        ):

            raise ValueError(
                "CEP deve possuir "
                "8 números."
            )


        # ======================================
        # TELEFONE
        # ======================================

        telefone = (
            ClienteService
            ._somente_numeros(
                dados.get(
                    "telefone"
                )
            )
        )


        # ======================================
        # ESTADO
        # ======================================

        estado = (
            ClienteService
            ._normalizar_estado(
                dados.get(
                    "estado"
                )
            )
        )


        # ======================================
        # EMAIL DUPLICADO
        # ======================================

        if email:

            cliente_email = (
                ClienteRepository
                .buscar_por_email(
                    email
                )
            )


            if (
                cliente_email
                and
                cliente_email.id
                != cliente_id
            ):

                raise ValueError(
                    "Já existe outro cliente "
                    "com esse e-mail."
                )


        # ======================================
        # CPF DUPLICADO
        # ======================================

        if cpf:

            cliente_cpf = (
                ClienteRepository
                .buscar_por_cpf(
                    cpf
                )
            )


            if (
                cliente_cpf
                and
                cliente_cpf.id
                != cliente_id
            ):

                raise ValueError(
                    "Já existe outro cliente "
                    "com esse CPF."
                )


        # ======================================
        # ENTITY
        # ======================================

        cliente = Cliente(

            id=cliente_id,

            nome=
                nome.strip(),

            sobrenome=
                sobrenome.strip(),

            telefone=
                telefone,

            email=
                email,

            cpf=
                cpf,

            cep=
                cep,

            bairro=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "bairro"
                    )
                )
            ),

            rua=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "rua"
                    )
                )
            ),

            cidade=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "cidade"
                    )
                )
            ),

            estado=
                estado,

            numero_endereco=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "numero_endereco"
                    )
                )
            ),

            complemento=(
                ClienteService
                ._texto_opcional(
                    dados.get(
                        "complemento"
                    )
                )
            )
        )


        return (
            ClienteRepository
            .atualizar(
                cliente
            )
        )


    # ==========================================
    # EXCLUIR / DESATIVAR
    # ==========================================

    @staticmethod
    def excluir(
        cliente_id
    ):

        cliente = (
            ClienteRepository
            .buscar_por_id(
                cliente_id
            )
        )


        if not cliente:

            raise ValueError(
                "Cliente não encontrado."
            )


        resultado = (
            ClienteRepository
            .desativar(
                cliente_id
            )
        )


        if not resultado:

            raise ValueError(
                "Não foi possível "
                "excluir o cliente."
            )


        return True