import random

# --- Classe Base: SorteadorBingo (Projeto 03) ---

class SorteadorBingo:
    """
    Classe base responsável por realizar sorteios de números para jogos de Bingo.
    Implementa a lógica básica de sorteio, controle de números e status.
    """

    def __init__(self, qtd_numeros: int):
        """
        Construtor da classe SorteadorBingo.

        :param qtd_numeros: Quantidade total de números no bingo.
        """
        # Propriedades Privadas
        self.__qtd_numeros = qtd_numeros 
        self.__qtd_bolinhas_sorteadas = 0  
        self.__bolinhas_sorteadas = []  
        self.__numeros = list(range(1, self.__qtd_numeros + 1))  
        self.__qtd_bolinhas_nao_sorteadas = len(self.__numeros)  
        self.__ultimo_numero_sorteado = None  
        self.__todos_numeros_sorteados = False  

    # --- Decoradores @property ---

    @property
    def qtd_numeros(self):
        return self.__qtd_numeros

    @property
    def qtd_bolinhas_sorteadas(self):
        return self.__qtd_bolinhas_sorteadas

    @property
    def bolinhas_sorteadas(self):
        # Retorna uma cópia ordenada
        return sorted(self.__bolinhas_sorteadas)

    @property
    def qtd_bolinhas_nao_sorteadas(self):
        return self.__qtd_bolinhas_nao_sorteadas

    @property
    def ultimo_numero_sorteado(self):
        return self.__ultimo_numero_sorteado

    @property
    def todos_numeros_sorteados(self):
        return self.__todos_numeros_sorteados

    # --- Função Principal: sortear_numero() ---

    def sortear_numero(self) -> bool:
        """
        Realiza o sorteio de um novo número e atualiza todas as propriedades de status.

        :return: True se o sorteio foi realizado, False se não há mais números.
        """
        if self.__qtd_bolinhas_nao_sorteadas == 0:
            self.__todos_numeros_sorteados = True
            return False

        numero_sorteado = random.choice(self.__numeros)
        self.__ultimo_numero_sorteado = numero_sorteado

        self.__numeros.remove(numero_sorteado)
        self.__qtd_bolinhas_sorteadas += 1
        self.__bolinhas_sorteadas.append(numero_sorteado)
        self.__qtd_bolinhas_nao_sorteadas = len(self.__numeros)

        if self.__qtd_bolinhas_nao_sorteadas == 0:
            self.__todos_numeros_sorteados = True

        return True


# --- Classe Filha: SorteadorBingoBrasileiro (Projeto 04) ---

class SorteadorBingoBrasileiro(SorteadorBingo):
    """
    Classe herdeira do SorteadorBingo, adaptada para as regras do Bingo Brasileiro (75 números).
    Inclui letra (B-I-N-G-O) e controle de tipo de vitória.
    """

    def __init__(self):
        """
        Chama o construtor da superclasse (1 a 75) e inicializa propriedades adicionais.
        """
        super().__init__(qtd_numeros=75)

        self._letras_bingo = {
            'B': (1, 15), 'I': (16, 30), 'N': (31, 45), 'G': (46, 60), 'O': (61, 75)
        }
        
        self.__letra = None
        self.__formas_vitoria = ["Quina e Bingo", "Bingo"]
        self.__tipo_vitoria = 0 # 0=Quina e Bingo, 1=Bingo


    # --- Decoradores @property e @setter ---

    @property
    def letra(self):
        return self.__letra

    @property
    def tipo_vitoria(self):
        return self.__formas_vitoria[self.__tipo_vitoria]

    @tipo_vitoria.setter
    def tipo_vitoria(self, novo_tipo: int):
        if 0 <= novo_tipo < len(self.__formas_vitoria):
            self.__tipo_vitoria = novo_tipo

    # --- Sobrescreve a função sortear_numero() ---

    def sortear_numero(self) -> bool:
        """
        Realiza o sorteio e, adicionalmente, define a letra do número sorteado.
        """
        sorteado = super().sortear_numero()

        if sorteado:
            numero = self.ultimo_numero_sorteado
            self.__letra = self._encontrar_letra(numero)

        return sorteado

    # --- Método Auxiliar e Estático ---

    def _encontrar_letra(self, numero: int) -> str:
        """Determina a letra do Bingo (B-I-N-G-O) para o número dado."""
        for letra, (minimo, maximo) in self._letras_bingo.items():
            if minimo <= numero <= maximo:
                return letra
        return "ERRO" 

    @staticmethod
    def gerar_cartela():
        """
        Gera uma cartela padrão de Bingo Brasileiro (5x5).
        """
        cartela = {
            'B': random.sample(range(1, 16), 5),
            'I': random.sample(range(16, 31), 5),
            'N': random.sample(range(31, 46), 5),
            'G': random.sample(range(46, 61), 5),
            'O': random.sample(range(61, 76), 5)
        }
        cartela['N'][2] = 'FREE' 
        return cartela