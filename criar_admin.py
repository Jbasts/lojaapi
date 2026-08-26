from getpass import getpass

from src.service.usuario_service import UsuarioService


print()
print("============================")
print("CRIAR ADMIN - MARDRI")
print("============================")
print()

nome = input(
    "Nome: "
)

sobrenome = input(
    "Sobrenome: "
)

email = input(
    "Email: "
)

senha = getpass(
    "Senha: "
)

confirmacao = getpass(
    "Confirme a senha: "
)


if senha != confirmacao:

    print(
        "As senhas não conferem."
    )

    exit()


try:

    usuario = UsuarioService.criar(
        nome=nome,
        sobrenome=sobrenome,
        email=email,
        senha=senha
    )

    print()
    print(
        "Administrador criado com sucesso!"
    )

    print(
        f"ID: {usuario.id}"
    )

    print(
        f"Email: {usuario.email}"
    )

except ValueError as erro:

    print(
        f"Erro: {erro}"
    )