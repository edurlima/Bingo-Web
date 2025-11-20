// ==============================================================================
// 1. CLASSE SorteadorBingo (Lógica Base POO)
// ==============================================================================

class SorteadorBingo {
    #qtdNumeros; #qtdBolinhasSorteadas; #bolinhasSorteadas; #numeros;
    #qtdBolinhasNaoSortadas; #ultimoNumeroSorteado; #todosNumerosSortadas;

    constructor(qtdNumeros) {
        this.#qtdNumeros = qtdNumeros;
        this.#qtdBolinhasSorteadas = 0;
        this.#bolinhasSorteadas = [];
        this.#numeros = Array.from({ length: qtdNumeros }, (_, i) => i + 1);
        this.#qtdBolinhasNaoSortadas = qtdNumeros;
        this.#ultimoNumeroSorteado = null;
        this.#todosNumerosSortadas = false;
    }

    get qtdNumeros() { return this.#qtdNumeros; }
    get qtdBolinhasSorteadas() { return this.#qtdBolinhasSorteadas; }
    get bolinhasSorteadas() { return [...this.#bolinhasSorteadas].sort((a, b) => a - b); }
    get ultimoNumeroSorteado() { return this.#ultimoNumeroSorteado; }
    get todosNumerosSortadas() { return this.#todosNumerosSortadas; }
    
    sortearNumero() {
        if (this.#qtdBolinhasNaoSortadas === 0) {
            this.#todosNumerosSortadas = true;
            return false;
        }

        const indiceSorteado = Math.floor(Math.random() * this.#numeros.length);
        const numeroSorteado = this.#numeros[indiceSorteado];
        this.#ultimoNumeroSorteado = numeroSorteado;

        this.#numeros.splice(indiceSorteado, 1);
        this.#qtdBolinhasSorteadas++;
        this.#bolinhasSorteadas.push(numeroSorteado);
        this.#qtdBolinhasNaoSortadas = this.#numeros.length;

        if (this.#qtdBolinhasNaoSortadas === 0) {
            this.#todosNumerosSortadas = true;
        }

        return true;
    }
}


// ==============================================================================
// 2. CLASSE SorteadorBingoBrasileiro (Herança, Lógica de Vitória e Geração HTML)
// ==============================================================================

class SorteadorBingoBrasileiro extends SorteadorBingo {
    #letra; #formasVitoria; #tipoVitoria;

    constructor() {
        super(75);
        this.#letra = null;
        this.#formasVitoria = ["Quina e Bingo", "Bingo"];
        this.#tipoVitoria = 0;
        
        this._letrasBingo = {
            'B': [1, 15], 'I': [16, 30], 'N': [31, 45], 'G': [46, 60], 'O': [61, 75]
        };
    }

    get letra() { return this.#letra; }
    get tipoVitoria() { return this.#formasVitoria[this.#tipoVitoria]; }
    get tipoVitoriaIndice() { return this.#tipoVitoria; }
    
    set tipoVitoria(novoTipo) { 
        if (novoTipo >= 0 && novoTipo < this.#formasVitoria.length) {
            this.#tipoVitoria = novoTipo; 
        }
    }

    sortearNumero() {
        const sorteado = super.sortearNumero();
        if (sorteado) {
            this.#letra = this.#encontrarLetra(this.ultimoNumeroSorteado);
        }
        return sorteado;
    }
    
    #encontrarLetra(numero) {
        for (const letra in this._letrasBingo) {
            const [min, max] = this._letrasBingo[letra];
            if (numero >= min && numero <= max) {
                return letra;
            }
        }
        return "ERRO";
    }

    static gerarCartela(idCartela) {
        const cartela = {};
        const rangeMap = {
            'B': [1, 15], 'I': [16, 30], 'N': [31, 45], 'G': [46, 60], 'O': [61, 75]
        };

        for (const letra in rangeMap) {
            const [min, max] = rangeMap[letra];
            const numeros = [];
            while (numeros.length < 5) {
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!numeros.includes(num)) {
                    numeros.push(num);
                }
            }
            cartela[letra] = numeros.sort((a, b) => a - b);
        }
        cartela['N'][2] = 'FREE';
        
        return cartela; // Retorna apenas o objeto de dados
    }
    
    static montarCartelaHTML(cartelaData, id) { 
        const letras = ['B', 'I', 'N', 'G', 'O'];
        let html = `<table class="cartela-exemplo" id="${id}">`; 
        
        html += '<thead><tr>';
        letras.forEach(letra => { html += `<th>${letra}</th>`; });
        html += '</tr></thead>';
        
        html += '<tbody>';
        for (let i = 0; i < 5; i++) {
            html += '<tr>';
            letras.forEach(letra => {
                const valor = cartelaData[letra][i];
                const isFree = valor === 'FREE';
                const idCelula = `${id}-${letra}-${i}`;
                
                const classeInicial = isFree ? 'marcado' : ''; 
                
                html += `<td id="${idCelula}" class="cartela-celula ${classeInicial}" data-numero="${valor}">${valor}</td>`;
            });
            html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
    }

    static verificarVitoria(bingoInstance, cartela, numerosSorteados) {
        const chamadosSet = new Set(numerosSorteados);
        const letras = ['B', 'I', 'N', 'G', 'O'];
        const isMarcado = (val) => val === 'FREE' || chamadosSet.has(val);

        let quinaEncontrada = false;
        
        // Checagem de Quina (Linhas, Colunas, Diagonais)
        for (let i = 0; i < 5; i++) {
            let acertosLinha = 0;
            let acertosColuna = 0;
            
            for (let j = 0; j < 5; j++) {
                if (isMarcado(cartela[letras[j]][i])) { acertosLinha++; }
                if (isMarcado(cartela[letras[i]][letras.indexOf(letras[j])])) { acertosColuna++; }
            }
            if (acertosLinha === 5 || acertosColuna === 5) { quinaEncontrada = true; }
        }
        
        let acertosDiagPrincipal = 0;
        let acertosDiagSecundaria = 0;
        for (let i = 0; i < 5; i++) {
            if (isMarcado(cartela[letras[i]][i])) { acertosDiagPrincipal++; }
            if (isMarcado(cartela[letras[4 - i]][i])) { acertosDiagSecundaria++; }
        }
        if (acertosDiagPrincipal === 5 || acertosDiagSecundaria === 5) { quinaEncontrada = true; }


        // 1. Se o modo é "Quina e Bingo" (índice 0) E houve quina, retornamos Quina
        if (bingoInstance.tipoVitoriaIndice === 0 && quinaEncontrada) {
            return { tipo: "Quina", detalhe: "Horizontal/Vertical/Diagonal" };
        }
        
        // Checagem de BINGO (24 números marcados)
        const totalMarcado = letras.reduce((count, letra) => {
            return count + cartela[letra].filter(isMarcado).length;
        }, 0);
        
        if (totalMarcado >= 24) { 
            return { tipo: "Bingo", detalhe: "Cartela Completa" };
        }

        return { tipo: "Nenhum", detalhe: "" };
    }
}


// ==============================================================================
// 3. OBJETO DE TRADUÇÃO E CONFIGURAÇÃO DE IDIOMA
// ==============================================================================

const TRADUCOES = {
    'pt-br': {
        SAUDACAO: 'Bem-vindo! Tudo pronto para começar.',
        CHAMANDO: (letra, numero) => `Chamando: [${letra}] - ${numero}! Fique de olho na sua cartela.`,
        QUINA_MSG: '✨ QUINA! QUINA! Quase lá!',
        BINGO_MSG: 'BINGO!!! 🎉🎉🎉 VENCEDOR!',
        FIM_JOGO: 'FIM DE JOGO! Todos os números foram sorteados.',
        PLACEHOLDER_INICIAL: 'Clique em "Sortear" para começar!',
        BOTOES: { SORTEAR: 'Sortear Próximo Número', REINICIAR: 'Reiniciar Bingo', TITULO_B: 'Bingo POO Profissional', TITULO_PL: 'Sorteador' }
    },
    'en-us': { 
        SAUDACAO: 'Welcome! Everything is ready to start.',
        CHAMANDO: (letter, number) => `Calling: [${letter}] - ${number}! Check your card.`,
        QUINA_MSG: '✨ QUINA! QUINA! Almost there!',
        BINGO_MSG: 'BINGO!!! 🎉🎉🎉 WINNER!',
        FIM_JOGO: 'GAME OVER! All numbers have been drawn.',
        PLACEHOLDER_INICIAL: 'Click "Draw" to start!',
        BOTOES: { SORTEAR: 'Draw Next Number', REINICIAR: 'Restart Bingo', TITULO_B: 'POO Professional Bingo', TITULO_PL: 'Sorteador' }
    },
    'es-es': { 
        SAUDACAO: '¡Bienvenido! Todo listo para empezar.',
        CHAMANDO: (letra, numero) => `Llamando: [${letra}] - ${numero}! Revisa tu cartón.`,
        QUINA_MSG: '✨ ¡QUINA! ¡QUINA! ¡Casi lo logras!',
        BINGO_MSG: '¡¡¡BINGO!!! 🎉🎉🎉 ¡GANADOR!',
        FIM_JUEGO: 'FIN DEL JUEGO! Todos los números han sido sorteados.',
        PLACEHOLDER_INICIAL: '¡Haz clic en "Sortear" para empezar!',
        BOTOES: { SORTEAR: 'Sortear Siguiente Número', REINICIAR: 'Reiniciar Bingo', TITULO_B: 'Bingo POO Profesional', TITULO_PL: 'Sorteador' }
    },
    'zh-cn': { 
        SAUDACAO: '欢迎! 一切准备就绪。',
        CHAMANDO: (letra, numero) => `叫号: [${letra}] - ${numero}! 请检查您的卡片。`,
        QUINA_MSG: '✨ 连线! 连线! 马上成功!',
        BINGO_MSG: '宾果!!! 🎉🎉🎉 赢家!',
        FIM_JOGO: '游戏结束! 所有号码都已摇出。',
        PLACEHOLDER_INICIAL: '点击 "抽奖" 开始!',
        BOTOES: { SORTEAR: '摇出下一个号码', REINICIAR: '重新开始宾果', TITULO_B: 'POO 专业宾果', TITULO_PL: '抽奖机' }
    }
};

let idiomaAtual = 'pt-br'; 
let cartelaCounter = 1; 


// ==============================================================================
// 4. VARIÁVEIS DE CONTROLE GLOBAL E FUNÇÕES (NÃO DEPENDEM DO DOM)
// ==============================================================================

const bingo = new SorteadorBingoBrasileiro();
const ID_PRIMEIRA_CARTELA = "cartela-exemplo-id"; 
const BINGO_CARTELA_DATA = SorteadorBingoBrasileiro.gerarCartela(null); 
const CARTELA_EXEMPLO = SorteadorBingoBrasileiro.montarCartelaHTML(BINGO_CARTELA_DATA, ID_PRIMEIRA_CARTELA); 

// Variáveis DOM serão definidas dentro do DOMContentLoaded
let btnSortear; 
let btnReiniciar; 
let btnAddCartela; 
let numeroSorteadoDisplay;
let cartelasAgrupadasDiv;
let tipoVitoriaAtualSpan;
let btnAlternarVitoria;
let notificacaoToast;
let notificacaoMensagem;

// --- Função de Notificação Customizada (Substitui o alert()) ---

/**
 * Exibe uma notificação Toast customizada no lugar do alert().
 * @param {string} mensagem - A mensagem a ser exibida.
 * @param {string} tipo - 'quina', 'bingo' ou 'alerta' para cores diferentes.
 */
function mostrarNotificacao(mensagem, tipo) {
    if (notificacaoToast && notificacaoMensagem) {
        // Define a mensagem e o estilo
        notificacaoMensagem.textContent = mensagem;
        
        // Limpa classes anteriores
        notificacaoToast.classList.remove('show', 'quina', 'bingo', 'alerta');

        // Adiciona a classe de estilo
        if (tipo) {
            notificacaoToast.classList.add(tipo);
        } else {
             // Default para alerta se o tipo não for especificado
            notificacaoToast.classList.add('alerta'); 
        }

        // 1. Mostra o Toast
        setTimeout(() => {
            notificacaoToast.classList.add('show');
        }, 10); 

        // 2. Esconde o Toast após 3 segundos
        setTimeout(() => {
            notificacaoToast.classList.remove('show');
        }, 3000); 
    }
}


// --- Funções de Renderização e Lógica ---

function renderCartela() {
    const numerosChamados = new Set(bingo.bolinhasSorteadas);
    const cartelaHTML = document.getElementById(ID_PRIMEIRA_CARTELA);
    
    if (!cartelaHTML) return;

    cartelaHTML.classList.remove('efeito-quina', 'efeito-bingo');

    cartelaHTML.querySelectorAll('.cartela-celula').forEach(celula => {
        const valor = celula.getAttribute('data-numero');
        
        if (valor === 'FREE' || numerosChamados.has(Number(valor))) {
            celula.classList.add('marcado');
        } else {
            celula.classList.remove('marcado');
        }
    });
    
    const resultadoVitoria = SorteadorBingoBrasileiro.verificarVitoria(bingo, BINGO_CARTELA_DATA, bingo.bolinhasSorteadas);
    
    // === DISPARO DA NOTIFICAÇÃO DE VITÓRIA (QUINA/BINGO) ===
    if (resultadoVitoria.tipo === "Quina") {
        cartelaHTML.classList.add('efeito-quina');
        mostrarNotificacao(TRADUCOES[idiomaAtual].QUINA_MSG, 'quina');
        
    } else if (resultadoVitoria.tipo === "Bingo") {
        cartelaHTML.classList.add('efeito-bingo');
        mostrarNotificacao(TRADUCOES[idiomaAtual].BINGO_MSG, 'bingo');
        btnSortear.disabled = true;
    }
    // ======================================
}

function renderHeader() {
    const LANG = TRADUCOES[idiomaAtual];
    const titulo = document.querySelector('header h1');
    if (titulo) {
        titulo.textContent = `🎉 ${LANG.BOTOES.TITULO_B} - Módulo ${LANG.BOTOES.TITULO_PL} 🎉`;
    }
    if (btnSortear) {
        btnSortear.textContent = LANG.BOTOES.SORTEAR;
    }
    if (btnReiniciar) {
        btnReiniciar.textContent = LANG.BOTOES.REINICIAR;
    }
}


function renderPlacar() {
    const ultimoNum = bingo.ultimoNumeroSorteado;
    const letra = bingo.letra;
    
    if (numeroSorteadoDisplay) {
        if (ultimoNum) {
            numeroSorteadoDisplay.textContent = `${letra} ${ultimoNum}`; 
        } else {
            numeroSorteadoDisplay.textContent = '--';
        }
    }
    
    if (bingo.todosNumerosSortadas && btnSortear) {
        btnSortear.disabled = true;
    }
}

function mudarIdioma(novoIdioma) {
    if (TRADUCOES[novoIdioma]) {
        idiomaAtual = novoIdioma;
        renderHeader(); 
        renderPlacar(); 
        if (tipoVitoriaAtualSpan) {
            tipoVitoriaAtualSpan.textContent = bingo.tipoVitoria;
        }
    }
}

function adicionarNovaCartela() {
    cartelaCounter++;
    const novoID = `cartela-${cartelaCounter}-id`;
    
    const novaCartelaData = SorteadorBingoBrasileiro.gerarCartela(null);
    const novaCartelaHTML = SorteadorBingoBrasileiro.montarCartelaHTML(novaCartelaData, novoID); 
    
    if (cartelasAgrupadasDiv) {
        cartelasAgrupadasDiv.innerHTML += novaCartelaHTML;
    }
}


// ==============================================================================
// 5. INICIALIZAÇÃO E CONEXÃO DOS BOTÕES (ISOLADO PARA SEGURANÇA)
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERÊNCIAS DOM: Conexão segura
    btnSortear = document.getElementById('btnSortear'); 
    btnReiniciar = document.getElementById('btnReiniciar'); 
    btnAddCartela = document.getElementById('btnAddCartela'); 
    numeroSorteadoDisplay = document.querySelector('.numero-sorteado');
    cartelasAgrupadasDiv = document.querySelector('.cartelas-agrupadas');
    tipoVitoriaAtualSpan = document.getElementById('tipo-vitoria-atual');
    btnAlternarVitoria = document.getElementById('btnAlternarVitoria');
    notificacaoToast = document.getElementById('notificacao-vitoria'); 
    notificacaoMensagem = document.getElementById('notificacao-mensagem'); 


    // 2. ADICIONAR CARTELA INICIAL
    if (cartelasAgrupadasDiv) {
        cartelasAgrupadasDiv.innerHTML = CARTELA_EXEMPLO; 
    }
    
    // 3. EVENT LISTENERS FINAIS
    
    // Sortear
    if (btnSortear) {
        btnSortear.addEventListener('click', () => {
            if (bingo.sortearNumero()) {
                renderPlacar();
                renderCartela();
            } else {
                // FIM DE JOGO
                mostrarNotificacao(TRADUCOES[idiomaAtual].FIM_JOGO, 'alerta'); 
            }
        });
    }

    // Reiniciar
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            if (confirm(TRADUCOES[idiomaAtual].BOTOES.REINICIAR + '?')) {
                location.reload();
            }
        });
    }

    // Adicionar Cartela
    if (btnAddCartela) {
        btnAddCartela.addEventListener('click', adicionarNovaCartela);
    }

    // Seleção de Idioma
    document.querySelectorAll('.idioma-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            let idioma = event.target.getAttribute('data-lang');
            
            if (!idioma) {
                const texto = event.target.textContent.toLowerCase().trim();
                const mapaTextos = {
                    'português br': 'pt-br',
                    'english us': 'en-us',
                    'español es': 'es-es',
                    '中文 (zh) cn': 'zh-cn',
                    '中文 (zh)': 'zh-cn' 
                };
                idioma = mapaTextos[texto] || 'pt-br';
            }
            
            mudarIdioma(idioma); 
        });
    });

    // Alternar Tipo de Vitória
    if (btnAlternarVitoria && tipoVitoriaAtualSpan) {
        btnAlternarVitoria.addEventListener('click', () => {
            bingo.tipoVitoria = (bingo.tipoVitoriaIndice + 1) % 2; 
            tipoVitoriaAtualSpan.textContent = bingo.tipoVitoria;
        });
    }


    // 4. INICIALIZAÇÃO DOS RENDERIZADORES
    renderHeader(); 
    renderPlacar();
    renderCartela();
    
    if (tipoVitoriaAtualSpan) {
         tipoVitoriaAtualSpan.textContent = bingo.tipoVitoria;
    }
});