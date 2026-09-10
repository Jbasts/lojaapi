class Cliente:

    def __init__(
        self,
        id=None,
        nome=None,
        sobrenome=None,
        telefone=None,
        email=None,
        cpf=None,
        cep=None,
        bairro=None,
        rua=None,
        cidade=None,
        estado=None,
        numero_endereco=None,
        complemento=None,
        ativo=True,
        criado_em=None,
        **kwargs
    ):
        self.id = id
        self.nome = nome
        self.sobrenome = sobrenome
        self.telefone = telefone
        self.email = email
        self.cpf = cpf
        self.cep = cep
        self.bairro = bairro
        self.rua = rua
        self.cidade = cidade
        self.estado = estado
        self.numero_endereco = numero_endereco
        self.complemento = complemento
        self.ativo = ativo
        self.criado_em = criado_em

    def to_dict(self):

        return {
            "id": self.id,
            "nome": self.nome,
            "sobrenome": self.sobrenome,
            "telefone": self.telefone,
            "email": self.email,
            "cpf": self.cpf,
            "cep": self.cep,
            "bairro": self.bairro,
            "rua": self.rua,
            "cidade": self.cidade,
            "estado": self.estado,
            "numero_endereco": self.numero_endereco,
            "complemento": self.complemento,
            "ativo": self.ativo,
            "criado_em": (
                self.criado_em.isoformat()
                if hasattr(
                    self.criado_em,
                    "isoformat"
                )
                else self.criado_em
            )
        }