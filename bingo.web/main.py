import os
# AQUI O IMPORT FOI ATUALIZADO PARA O NOVO NOME DO ARQUIVO
from bingo_poo_profissional_module import SorteadorBingoBrasileiro 

# Gera uma cartela de exemplo no início
CARTELA_EXEMPLO = SorteadorBingoBrasileiro.gerar_cartela()

def limpar_tela():
    """Limpa a tela do console/terminal."""
    os.system('cls' if os.name == 'nt' else 'clear')

def exibir_cartela(cartela, numeros_chamados):
    """
    Exibe a cartela de exemplo formatada no terminal, marcando os números chamados.
    """
    chamados_set = set(numeros_chamados)
    matriz = []

    for i in range(5):
        linha = []
        for letra in ['B', 'I', 'N', 'G', 'O']:
            
            item_valor = cartela[letra][i]
            item_str = str(item_valor)
            
            if item_str == 'FREE':
                item_formatado = '[FREE]' 
            elif isinstance(item_valor, int) and item_valor in chamados_set:
                item_formatado = f'[{item_str.center(3)}]' 
            else:
                item_formatado = item_str.center(6) 
            
            linha.append(item_formatado)
        matriz.append(linha)

    print("=" * 70)
    print("           🎲 CARTELA DE EXEMPLO DO SORTEADOR 🎲")
    print("=" * 70)
    print(" |   B    |   I    |   N    |   G    |   O    |")
    print("-" * 50)

    for linha in matriz:
        print(f" |{'|'.join(linha)}|")
    print("-" * 50)


def exibir_tela(bingo):
    """Exibe o título e as informações de status do Bingo."""
    limpar_tela()

    exibir_cartela(CARTELA_EXEMPLO, bingo.bolinhas_sorteadas) 

    # O TÍTULO FOI ATUALIZADO
    print("\n              🎉 BINGO POO PROFISSIONAL - Módulo Sorteador 🎉") 
    print("=" * 70)

    # ... (Restante da exibição de status, que é o mesmo)
    if bingo.ultimo_numero_sorteado is not None:
        letra = bingo.letra 
        numero = bingo.ultimo_numero_sorteado
        print(f"\n✨ ÚLTIMO SORTEIO: [{letra}] - NÚMERO **{numero}**")
        print("-" * 70)
    else:
        print("\n✨ STATUS: Preparando para o primeiro sorteio...")
        print("-" * 70)

    print(f"Bolinhas sorteadas até agora: {bingo.qtd_bolinhas_sorteadas} de {bingo.qtd_numeros}")
    print(f"Tipo de Vitória Ativo: {bingo.tipo_vitoria}")
    print("-" * 70)

    bolinhas_str = ", ".join(map(str, bingo.bolinhas_sorteadas))
    print(f"▶ HISTÓRICO: [{bolinhas_str}]")
    print("=" * 70)

    # Menu
    print("\nEscolha uma opção:")
    print("  1 - Sortear um novo número (Continuar)") 
    print("  2 - Finalizar o Bingo") 
    print("  3 - Alternar Tipo de Vitória (Quina e Bingo / Bingo)")
    print("-" * 70)

def main():
    bingo = SorteadorBingoBrasileiro()
    opcao = None
    
    while opcao != '2':
        exibir_tela(bingo)

        if bingo.todos_numeros_sorteados:
            print("\n❌ ATENÇÃO: TODOS OS NÚMEROS FORAM SORTEADOS! O BINGO TERMINOU.")
            break

        try:
            opcao = input("Digite sua opção (1, 2 ou 3): ").strip()
        except EOFError: 
            opcao = '2'

        if opcao == '1':
            sucesso = bingo.sortear_numero()
            if not sucesso:
                continue

        elif opcao == '3':
            # Usa o nome 'mangled' da propriedade privada para acessá-la
            novo_indice = (bingo._SorteadorBingoBrasileiro__tipo_vitoria + 1) % 2
            bingo.tipo_vitoria = novo_indice
            print(f"\n✅ O tipo de vitória foi alterado para: {bingo.tipo_vitoria}")
            input("Pressione ENTER para continuar...") 

        elif opcao == '2':
            print("\n👋 BINGO FINALIZADO! Obrigado por jogar.")
            break
        
        else:
            print("\n⚠️ Opção inválida. Digite 1, 2 ou 3.")
            input("Pressione ENTER para tentar novamente...")

if __name__ == "__main__":
    main()