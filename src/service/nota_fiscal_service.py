import io
import os
import re

from PIL import (
    Image,
    ImageEnhance,
    ImageFilter,
    ImageOps,
    UnidentifiedImageError
)

from src.repositories.produto_estoque_repository import (
    ProdutoEstoqueRepository
)


class NotaFiscalService:

    TAMANHO_MAXIMO = 10 * 1024 * 1024

    TIPOS_PERMITIDOS = (
        "image/png",
        "image/jpeg"
    )

    EXTENSOES_PERMITIDAS = (
        ".png",
        ".jpg",
        ".jpeg"
    )

    TAMANHOS_GTIN = (
        8,
        12,
        13,
        14
    )

    TROCAS_OCR_CODIGO = str.maketrans({
        "O": "0",
        "Q": "0",
        "I": "1",
        "L": "1",
        "|": "1",
        "Z": "2",
        "S": "5",
        "G": "6",
        "B": "8"
    })


    @staticmethod
    def _decimal_texto(valor):

        if valor is None:
            return None

        texto = str(valor).strip()

        if not texto:
            return None

        texto = (
            texto
            .replace("R$", "")
            .replace(" ", "")
        )

        if (
            "," in texto
            and "." in texto
        ):

            texto = (
                texto
                .replace(".", "")
                .replace(",", ".")
            )

        else:
            texto = texto.replace(",", ".")

        try:
            return float(texto)

        except ValueError:
            return None


    @staticmethod
    def _preparar_imagens(imagem):

        original = (
            ImageOps.exif_transpose(
                imagem
            )
            .convert("RGB")
        )

        largura, altura = original.size

        if largura > 2600:

            proporcao = 2600 / largura

            original = original.resize(
                (
                    2600,
                    max(
                        1,
                        int(
                            altura
                            * proporcao
                        )
                    )
                )
            )

        cinza = ImageOps.grayscale(
            original
        )

        cinza = ImageOps.autocontrast(
            cinza
        )

        if cinza.width < 1800:

            fator = 2

            cinza = cinza.resize(
                (
                    cinza.width
                    * fator,
                    cinza.height
                    * fator
                )
            )

        cinza = ImageEnhance.Contrast(
            cinza
        ).enhance(
            1.45
        )

        cinza = cinza.filter(
            ImageFilter.SHARPEN
        )

        limiar = cinza.point(
            lambda pixel:
                255
                if pixel > 170
                else 0
        )

        return (
            original,
            cinza,
            limiar
        )


    @staticmethod
    def _configurar_tesseract():

        try:
            import pytesseract

        except ImportError:

            raise ValueError(
                "Leitor OCR não instalado no servidor. "
                "Instale Pillow e pytesseract."
            )

        comando = os.getenv(
            "TESSERACT_CMD"
        )

        if comando:

            (
                pytesseract
                .pytesseract
                .tesseract_cmd
            ) = comando

        try:
            idiomas = set(
                pytesseract
                .get_languages(
                    config=""
                )
            )

        except (
            pytesseract
            .pytesseract
            .TesseractNotFoundError
        ):

            raise ValueError(
                "Tesseract OCR não encontrado. "
                "Instale o Tesseract no computador "
                "que executa o backend e configure "
                "TESSERACT_CMD se necessário."
            )

        except Exception:
            idiomas = set()

        if "por" in idiomas:
            idioma = "por"

        elif "eng" in idiomas:
            idioma = "eng"

        else:
            idioma = None

        return (
            pytesseract,
            idioma
        )


    @staticmethod
    def _ler_textos_ocr(
        cinza,
        limiar
    ):

        (
            pytesseract,
            idioma
        ) = (
            NotaFiscalService
            ._configurar_tesseract()
        )

        configuracoes = [
            (
                cinza,
                "--oem 3 --psm 6 "
                "-c preserve_interword_spaces=1"
            ),
            (
                cinza,
                "--oem 3 --psm 4 "
                "-c preserve_interword_spaces=1"
            ),
            (
                limiar,
                "--oem 3 --psm 11 "
                "-c preserve_interword_spaces=1"
            )
        ]

        textos = []

        for imagem, configuracao in configuracoes:

            try:

                kwargs = {
                    "config":
                        configuracao
                }

                if idioma:
                    kwargs[
                        "lang"
                    ] = idioma

                texto = (
                    pytesseract
                    .image_to_string(
                        imagem,
                        **kwargs
                    )
                )

                if texto.strip():
                    textos.append(
                        texto
                    )

            except (
                pytesseract
                .pytesseract
                .TesseractNotFoundError
            ):

                raise ValueError(
                    "Tesseract OCR não encontrado. "
                    "Instale o Tesseract no computador "
                    "que executa o backend e configure "
                    "TESSERACT_CMD se necessário."
                )

            except Exception:
                continue

        if not textos:

            raise ValueError(
                "Não foi possível extrair texto "
                "da imagem da nota."
            )

        return textos


    @staticmethod
    def _ler_codigos_imagem(imagem):

        codigos = []

        try:

            import zxingcpp

            resultados = (
                zxingcpp
                .read_barcodes(
                    imagem
                )
            )

            for resultado in resultados:

                codigo = str(
                    resultado.text
                    or ""
                ).strip()

                if (
                    codigo.isdigit()
                    and len(codigo)
                    in NotaFiscalService
                    .TAMANHOS_GTIN
                ):

                    codigos.append(
                        codigo
                    )

        except ImportError:
            pass

        except Exception:
            pass

        return codigos


    @staticmethod
    def _normalizar_codigo_ocr(
        valor
    ):

        if valor is None:
            return ""

        texto = (
            str(valor)
            .upper()
            .translate(
                NotaFiscalService
                .TROCAS_OCR_CODIGO
            )
        )

        return re.sub(
            r"\D",
            "",
            texto
        )


    @staticmethod
    def _gtin_valido(codigo):

        codigo = str(
            codigo or ""
        )

        if (
            not codigo.isdigit()
            or len(codigo)
            not in NotaFiscalService
            .TAMANHOS_GTIN
        ):
            return False

        corpo = codigo[:-1]

        soma = 0

        for indice, digito in enumerate(
            reversed(corpo)
        ):

            peso = (
                3
                if indice % 2 == 0
                else 1
            )

            soma += (
                int(digito)
                * peso
            )

        digito_calculado = (
            10
            - (
                soma
                % 10
            )
        ) % 10

        return (
            digito_calculado
            == int(
                codigo[-1]
            )
        )


    @staticmethod
    def _extrair_codigos_texto(texto):

        encontrados = []

        linhas = [
            linha
            for linha
            in texto.splitlines()
            if linha.strip()
        ]

        # Primeiro procura o padrão comum de NFC-e:
        # 001 7891234567890 DESCRICAO...
        padrao_item = re.compile(
            r"^\s*"
            r"\d{1,3}"
            r"\s+"
            r"([0-9OQILZSBG|]{8,16})",
            flags=re.IGNORECASE
        )

        for linha in linhas:

            correspondencia = (
                padrao_item.search(
                    linha
                )
            )

            if not correspondencia:
                continue

            codigo = (
                NotaFiscalService
                ._normalizar_codigo_ocr(
                    correspondencia.group(1)
                )
            )

            if (
                len(codigo)
                in NotaFiscalService
                .TAMANHOS_GTIN
            ):

                encontrados.append(
                    codigo
                )

        # Depois procura sequências numéricas normais.
        padrao_numerico = re.compile(
            r"(?<!\d)"
            r"(\d{8}|\d{12}|\d{13}|\d{14})"
            r"(?!\d)"
        )

        for correspondencia in (
            padrao_numerico
            .finditer(
                texto
            )
        ):

            codigo = (
                correspondencia
                .group(1)
            )

            # Fora do padrão de item, só aceitamos
            # candidatos com dígito verificador válido.
            if (
                NotaFiscalService
                ._gtin_valido(
                    codigo
                )
            ):

                encontrados.append(
                    codigo
                )

        # Por fim tenta corrigir confusões típicas
        # do OCR, como O/0, I/1 e S/5.
        padrao_misto = re.compile(
            r"(?<![A-Z0-9])"
            r"([0-9OQILZSBG|]{8,14})"
            r"(?![A-Z0-9])",
            flags=re.IGNORECASE
        )

        for correspondencia in (
            padrao_misto
            .finditer(
                texto.upper()
            )
        ):

            codigo = (
                NotaFiscalService
                ._normalizar_codigo_ocr(
                    correspondencia.group(1)
                )
            )

            if (
                len(codigo)
                in NotaFiscalService
                .TAMANHOS_GTIN
                and NotaFiscalService
                ._gtin_valido(
                    codigo
                )
            ):

                encontrados.append(
                    codigo
                )

        return encontrados


    @staticmethod
    def _linha_do_codigo(
        linhas,
        codigo
    ):

        for indice, linha in enumerate(
            linhas
        ):

            codigo_linha = (
                NotaFiscalService
                ._normalizar_codigo_ocr(
                    linha
                )
            )

            if codigo in codigo_linha:

                inicio = max(
                    0,
                    indice - 1
                )

                fim = min(
                    len(linhas),
                    indice + 3
                )

                return " ".join(
                    linhas[
                        inicio:fim
                    ]
                )

        return ""


    @staticmethod
    def _extrair_quantidade_valor(
        trecho,
        codigo
    ):

        if not trecho:
            return None, None

        texto = str(
            trecho
        ).replace(
            codigo,
            " "
        )

        padrao_multiplicacao = re.search(
            r"(?P<qtd>\d+(?:[.,]\d{1,4})?)"
            r"\s*(?:UN|UND|KG|G|L|ML|CX|PCT)?"
            r"\s*[xX]\s*"
            r"(?:R\$\s*)?"
            r"(?P<valor>\d+(?:[.,]\d{2,4}))",
            texto,
            flags=re.IGNORECASE
        )

        if padrao_multiplicacao:

            quantidade = (
                NotaFiscalService
                ._decimal_texto(
                    padrao_multiplicacao
                    .group("qtd")
                )
            )

            valor = (
                NotaFiscalService
                ._decimal_texto(
                    padrao_multiplicacao
                    .group("valor")
                )
            )

            return quantidade, valor

        padrao_qtd = re.search(
            r"(?:QTD|QTDE|QUANTIDADE)"
            r"\s*[:=\-]?\s*"
            r"(\d+(?:[.,]\d{1,4})?)",
            texto,
            flags=re.IGNORECASE
        )

        padrao_valor = re.search(
            r"(?:VL\.?\s*UNIT|"
            r"VLR\.?\s*UNIT|"
            r"VALOR\s*UNIT|"
            r"UNIT[ÁA]RIO)"
            r"\s*[:=\-]?\s*"
            r"(?:R\$\s*)?"
            r"(\d+(?:[.,]\d{2,4}))",
            texto,
            flags=re.IGNORECASE
        )

        quantidade = (
            NotaFiscalService
            ._decimal_texto(
                padrao_qtd.group(1)
            )
            if padrao_qtd
            else None
        )

        valor = (
            NotaFiscalService
            ._decimal_texto(
                padrao_valor.group(1)
            )
            if padrao_valor
            else None
        )

        if (
            quantidade is not None
            and valor is not None
        ):

            return quantidade, valor

        valores_monetarios = re.findall(
            r"(?<!\d)"
            r"\d+[.,]\d{2}"
            r"(?!\d)",
            texto
        )

        if valor is None:

            if len(
                valores_monetarios
            ) >= 2:

                valor = (
                    NotaFiscalService
                    ._decimal_texto(
                        valores_monetarios[
                            -2
                        ]
                    )
                )

            elif len(
                valores_monetarios
            ) == 1:

                valor = (
                    NotaFiscalService
                    ._decimal_texto(
                        valores_monetarios[
                            0
                        ]
                    )
                )

        if quantidade is None:

            padrao_unidade = re.search(
                r"(?<!\d)"
                r"(\d+(?:[.,]\d{1,4})?)"
                r"\s*"
                r"(?:UN|UND|KG|G|L|ML|CX|PCT)"
                r"(?![A-Z])",
                texto,
                flags=re.IGNORECASE
            )

            if padrao_unidade:

                quantidade = (
                    NotaFiscalService
                    ._decimal_texto(
                        padrao_unidade
                        .group(1)
                    )
                )

        return quantidade, valor


    @staticmethod
    def _produto_por_codigo(codigo):

        try:

            produto = (
                ProdutoEstoqueRepository
                .buscar_por_codigo(
                    codigo
                )
            )

        except Exception:
            produto = None

        if (
            not produto
            or not produto.ativo
        ):

            return None

        return produto


    @staticmethod
    def ler(arquivo):

        if not arquivo:

            raise ValueError(
                "Envie a imagem da nota fiscal."
            )

        nome = str(
            arquivo.filename
            or ""
        ).strip()

        extensao = os.path.splitext(
            nome.lower()
        )[1]

        if (
            extensao
            not in NotaFiscalService
            .EXTENSOES_PERMITIDAS
        ):

            raise ValueError(
                "Formato inválido. "
                "Envie PNG, JPG ou JPEG."
            )

        tipo = str(
            arquivo.mimetype
            or ""
        ).lower()

        if (
            tipo
            and tipo
            not in NotaFiscalService
            .TIPOS_PERMITIDOS
        ):

            raise ValueError(
                "O arquivo enviado não é "
                "uma imagem permitida."
            )

        conteudo = arquivo.read(
            NotaFiscalService
            .TAMANHO_MAXIMO
            + 1
        )

        if not conteudo:

            raise ValueError(
                "A imagem enviada está vazia."
            )

        if (
            len(conteudo)
            >
            NotaFiscalService
            .TAMANHO_MAXIMO
        ):

            raise ValueError(
                "A imagem da nota deve ter "
                "no máximo 10 MB."
            )

        try:

            imagem = Image.open(
                io.BytesIO(
                    conteudo
                )
            )

            imagem.load()

        except (
            UnidentifiedImageError,
            OSError
        ):

            raise ValueError(
                "Não foi possível abrir "
                "a imagem enviada."
            )

        (
            original,
            cinza,
            limiar
        ) = (
            NotaFiscalService
            ._preparar_imagens(
                imagem
            )
        )

        textos = (
            NotaFiscalService
            ._ler_textos_ocr(
                cinza,
                limiar
            )
        )

        linhas = []

        candidatos = []

        for texto in textos:

            linhas.extend([
                linha.strip()
                for linha
                in texto.splitlines()
                if linha.strip()
            ])

            candidatos.extend(
                NotaFiscalService
                ._extrair_codigos_texto(
                    texto
                )
            )

        candidatos.extend(
            NotaFiscalService
            ._ler_codigos_imagem(
                original
            )
        )

        codigos = []
        vistos = set()

        for codigo in candidatos:

            codigo = str(
                codigo
            ).strip()

            if (
                not codigo
                or codigo in vistos
            ):
                continue

            vistos.add(
                codigo
            )

            codigos.append(
                codigo
            )

        if not codigos:

            raise ValueError(
                "Nenhum código de produto "
                "foi identificado na imagem. "
                "Tente uma foto mais nítida, "
                "reta e com boa iluminação."
            )

        itens = []

        for codigo in codigos:

            trecho = (
                NotaFiscalService
                ._linha_do_codigo(
                    linhas,
                    codigo
                )
            )

            (
                quantidade,
                valor_unitario
            ) = (
                NotaFiscalService
                ._extrair_quantidade_valor(
                    trecho,
                    codigo
                )
            )

            produto = (
                NotaFiscalService
                ._produto_por_codigo(
                    codigo
                )
            )

            itens.append({
                "codigo_barras":
                    codigo,

                "codigo_valido":
                    NotaFiscalService
                    ._gtin_valido(
                        codigo
                    ),

                "produto_estoque_id":
                    (
                        produto.id
                        if produto
                        else None
                    ),

                "produto_nome":
                    (
                        produto.nome
                        if produto
                        else None
                    ),

                "registrado":
                    bool(produto),

                "quantidade":
                    quantidade,

                "valor_unitario":
                    valor_unitario
            })

        return {
            "arquivo":
                nome,

            "itens":
                itens,

            "quantidade_itens":
                len(itens),

            "quantidade_registrados":
                sum(
                    1
                    for item in itens
                    if item[
                        "registrado"
                    ]
                ),

            "quantidade_nao_registrados":
                sum(
                    1
                    for item in itens
                    if not item[
                        "registrado"
                    ]
                )
        }
