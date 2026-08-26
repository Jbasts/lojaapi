class UsuarioAdmin:

    def __init__(
        self,
        id=None,
        nome=None,
        sobrenome=None,
        email=None,
        senha_hash=None,
        ativo=True,
        criado_em=None
    ):

        self.id = id
        self.nome = nome
        self.sobrenome = sobrenome
        self.email = email
        self.senha_hash = senha_hash
        self.ativo = ativo
        self.criado_em = criado_em


    def to_dict(self):

        return {
            "id": self.id,
            "nome": self.nome,
            "sobrenome": self.sobrenome,
            "email": self.email,
            "ativo": self.ativo,
            "criado_em": (
                self.criado_em.isoformat()
                if self.criado_em
                else None
            )
        }