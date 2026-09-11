import os

from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)


load_dotenv(
    BASE_DIR / ".env"
)


def _booleano(
    valor,
    padrao=False
):

    if valor is None:
        return padrao

    return str(
        valor
    ).strip().lower() in (
        "1",
        "true",
        "yes",
        "sim",
        "on"
    )


class Config:

    # ==========================================
    # BANCO
    # ==========================================

    DATABASE_URL = os.getenv(
        "DATABASE_URL"
    )

    DB_HOST = os.getenv(
        "DB_HOST",
        "localhost"
    )

    DB_PORT = os.getenv(
        "DB_PORT",
        "5432"
    )

    DB_NAME = os.getenv(
        "DB_NAME",
        "mardri"
    )

    DB_USER = os.getenv(
        "DB_USER",
        "postgres"
    )

    DB_PASSWORD = os.getenv(
        "DB_PASSWORD"
    )


    # ==========================================
    # JWT
    # ==========================================

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "mardri-chave-local-desenvolvimento"
    )

    JWT_ACCESS_TOKEN_EXPIRES = (
        timedelta(
            hours=8
        )
    )


    # ==========================================
    # FRONTEND / CORS
    # ==========================================

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )


    # Aceita uma ou mais URLs separadas
    # por vírgula.
    #
    # Exemplo:
    # http://localhost:5173,https://mardri.com.br

    FRONTEND_ORIGINS = [
        url.strip()

        for url in FRONTEND_URL.split(",")

        if url.strip()
    ]


    # ==========================================
    # SERVIDOR
    # ==========================================

    DEBUG = _booleano(
        os.getenv(
            "FLASK_DEBUG"
        ),
        False
    )

    HOST = os.getenv(
        "HOST",
        "0.0.0.0"
    )

    PORT = int(
        os.getenv(
            "PORT",
            "5000"
        )
    )