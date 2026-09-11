import psycopg2

from src.config import Config


def get_connection():

    # ==========================================
    # PRODUÇÃO / DATABASE_URL
    # ==========================================

    if Config.DATABASE_URL:

        return psycopg2.connect(
            Config.DATABASE_URL
        )


    # ==========================================
    # DESENVOLVIMENTO / CAMPOS SEPARADOS
    # ==========================================

    if not Config.DB_PASSWORD:

        raise RuntimeError(
            "Configuração do banco inválida: "
            "DATABASE_URL ou DB_PASSWORD "
            "não foi informado."
        )


    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        dbname=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )