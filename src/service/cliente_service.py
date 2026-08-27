import re

from src.entities.cliente import Cliente
from src.repositories.cliente_repository import ClienteRepository


class ClienteService:

    @staticmethod
    def _texto_opcional(valor):

        if valor is None:
            return None

        valor = str(valor).strip()

        return valor if valor else None


    @staticmethod
    def _somente_numeros(valor):

        if not valor:
            return None

        return re.sub(
            r"\D",
            "",
            str(valor)
        )


    @staticmethod
    def listar(busca=None):

        clientes = ClienteRepository.listar(
            busca
        )

        return [
            cliente.to_dict()
            for cliente in clientes
        ]


    @staticmethod
    def buscar_por_id(cliente_id):

        cliente = ClienteRepository.buscar_por_id(
            cliente_id
        )

        if not cliente or not cliente.ativo:

            raise ValueError(
                "Cliente não encontrado."
            )

        return cliente


    @staticmethod
    def criar(dados):

        nome = dados.get("nome")
        sobrenome = dados.get("sobrenome")

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not sobrenome or not sobrenome.strip():

            raise ValueError(
                "Sobrenome é obrigatório."
            )

        email = ClienteService._texto_opcional(
            dados.get("email")
        )

        if email:
            email = email.lower()

        cpf = ClienteService._somente_numeros(
            dados.get("cpf")
        )

        cep = ClienteService._somente_numeros(
            dados.get("cep")
        )

        telefone = ClienteService._somente_numeros(
            dados.get("telefone")
        )

        if cpf and len(cpf) != 11:

            raise ValueError(
                "CPF deve possuir 11 números."
            )

        if cep and len(cep) != 8:

            raise ValueError(
                "CEP deve possuir 8 números."
            )

        if email:

            cliente_email = (
                ClienteRepository.buscar_por_email(
                    email
                )
            )

            if cliente_email:

                raise ValueError(
                    "Já existe um cliente com esse e-mail."
                )

        if cpf:

            cliente_cpf = (
                ClienteRepository.buscar_por_cpf(
                    cpf
                )
            )

            if cliente_cpf:

                raise ValueError(
                    "Já existe um cliente com esse CPF."
                )

        cliente = Cliente(
            nome=nome.strip(),
            sobrenome=sobrenome.strip(),
            telefone=telefone,
            email=email,
            cpf=cpf,
            cep=cep,
            bairro=ClienteService._texto_opcional(
                dados.get("bairro")
            ),
            rua=ClienteService._texto_opcional(
                dados.get("rua")
            ),
            numero_endereco=ClienteService._texto_opcional(
                dados.get("numero_endereco")
            ),
            complemento=ClienteService._texto_opcional(
                dados.get("complemento")
            )
        )

        return ClienteRepository.criar(
            cliente
        )


    @staticmethod
    def atualizar(cliente_id, dados):

        cliente_atual = (
            ClienteRepository.buscar_por_id(
                cliente_id
            )
        )

        if not cliente_atual:

            raise ValueError(
                "Cliente não encontrado."
            )

        nome = dados.get("nome")
        sobrenome = dados.get("sobrenome")

        if not nome or not nome.strip():

            raise ValueError(
                "Nome é obrigatório."
            )

        if not sobrenome or not sobrenome.strip():

            raise ValueError(
                "Sobrenome é obrigatório."
            )

        email = ClienteService._texto_opcional(
            dados.get("email")
        )

        if email:
            email = email.lower()

        cpf = ClienteService._somente_numeros(
            dados.get("cpf")
        )

        cep = ClienteService._somente_numeros(
            dados.get("cep")
        )

        telefone = ClienteService._somente_numeros(
            dados.get("telefone")
        )

        if cpf and len(cpf) != 11:

            raise ValueError(
                "CPF deve possuir 11 números."
            )

        if cep and len(cep) != 8:

            raise ValueError(
                "CEP deve possuir 8 números."
            )

        if email:

            cliente_email = (
                ClienteRepository.buscar_por_email(
                    email
                )
            )

            if (
                cliente_email
                and cliente_email.id != cliente_id
            ):

                raise ValueError(
                    "Já existe outro cliente com esse e-mail."
                )

        if cpf:

            cliente_cpf = (
                ClienteRepository.buscar_por_cpf(
                    cpf
                )
            )

            if (
                cliente_cpf
                and cliente_cpf.id != cliente_id
            ):

                raise ValueError(
                    "Já existe outro cliente com esse CPF."
                )

        cliente = Cliente(
            id=cliente_id,
            nome=nome.strip(),
            sobrenome=sobrenome.strip(),
            telefone=telefone,
            email=email,
            cpf=cpf,
            cep=cep,
            bairro=ClienteService._texto_opcional(
                dados.get("bairro")
            ),
            rua=ClienteService._texto_opcional(
                dados.get("rua")
            ),
            numero_endereco=ClienteService._texto_opcional(
                dados.get("numero_endereco")
            ),
            complemento=ClienteService._texto_opcional(
                dados.get("complemento")
            )
        )

        return ClienteRepository.atualizar(
            cliente
        )


    @staticmethod
    def excluir(cliente_id):

        cliente = ClienteRepository.buscar_por_id(
            cliente_id
        )

        if not cliente:

            raise ValueError(
                "Cliente não encontrado."
            )

        ClienteRepository.desativar(
            cliente_id
        )