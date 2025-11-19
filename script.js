// --- 1. CLASSE SorteadorBingo (Lógica Base POO) ---

class SorteadorBingo {
    #qtdNumeros; #qtdBolinhasSorteadas; #bolinhasSorteadas; #numeros;
    #qtdBolinhasNaoSorteadas; #ultimoNumeroSorteado; #todosNumerosSortadas;

    constructor(qtdNumeros) {
        this.#qtdNumeros = qtdNumeros;
        this.#qtdBolinhasSorteadas = 0;
        this.#bolinhasSorteadas = [];
        this.#numeros = Array.from({ length: qtdNumeros }, (_, i) => i + 1);
        this.#qtdBolinhasNaoSorteadas = qtdNumeros;
        this.#ultimoNumeroSorteado = null;
        this.#todosNumerosSortadas = false;
    }

    // Getters (@property)
    get qtdNumeros() { return this.#qtdNumeros; }
    get qtdBolinhasSorteadas() { return this.#qtdBolinhasSorteadas; }
    get bolinhasSorteadas() { return [...this.#bolinhasSorteadas].sort((a, b) => a - b); }
    get ultimoNumeroSorteado() { return this.#ultimoNumeroSorteado; }
    get todosNumerosSortadas() { return this.#todosNumerosSortadas; }
    
    // Método principal: sortear_numero()
    sortearNumero() {
        if (this.#qtdBolinhasNaoSorteadas === 0) {
            this.#todosNumerosSortadas = true;
            return false;
        }

        const indiceSorteado = Math.floor(Math.random() * this.#numeros.length);
        const numeroSorteado = this.#numeros[indiceSorteado];
        this.#ultimoNumeroSorteado = numeroSorteado;

        this.#numeros.splice(indiceSorteado, 1);
        this.#qtdBolinhasSorteadas++;
        this.#bolinhasSorteadas.push(numeroSorteado);
        this.#qtdBolinhasNaoSorteadas = this.#numeros.length;

        if (this.#qtdBolinhasNaoSorteadas === 0) {
            this.#todosNumerosSortadas = true;
        }

        return true;
    }
}


// --- 2. CLASSE SorteadorBingoBrasileiro (Herança e Lógica de Vitória) ---

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
    set tipoVitoria(novoTipo) { 
        if (novoTipo >= 0 && novoTipo < this.#formasVitoria.length) {
            this.#tipoVitoria = novoTipo; 
        }
    }
    get tipoVitoriaIndice() { return this.#tipoVitoria; }

    sortearNumero() {
        const sorteado = super.sortearNumero();

        if (sorteado) {
            const numero = this.ultimoNumeroSorteado;
            this.#letra = this.#encontrarLetra(numero);
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

    static gerarCartela() {
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
        return cartela;
    }
    
    // Método Estático: Checa se a cartela fez Quina ou Bingo
    static verificarVitoria(cartela, numerosSorteados) {
        const chamadosSet = new Set(numerosSorteados);
        const letras = ['B', 'I', 'N', 'G', 'O'];

        const isMarcado = (val) => val === 'FREE' || chamadosSet.has(val);

        let quinaEncontrada = false;
        
        // Checagem de Linhas e Colunas (Quinas)
        for (let i = 0; i < 5; i++) {
            let acertosLinha = 0;
            let acertosColuna = 0;
            
            for (const letra of letras) {
                if (isMarcado(cartela[letra][i])) {
                    acertosLinha++;
                }
                if (isMarcado(cartela[letras[i]][letras.indexOf(letra)])) {
                    acertosColuna++;
                }
            }
            if (acertosLinha === 5 || acertosColuna === 5) {
                quinaEncontrada = true;
            }
        }
        
        // Checagem de Diagonais (Quinas Diagonais)
        let acertosDiagPrincipal = 0;
        let acertosDiagSecundaria = 0;
        for (let i = 0; i < 5; i++) {
            if (isMarcado(cartela[letras[i]][i])) { 
                acertosDiagPrincipal++;
            }
            if (isMarcado(cartela[letras[4 - i]][i])) { 
                acertosDiagSecundaria++;
            }
        }
        if (acertosDiagPrincipal === 5 || acertosDiagSecundaria === 5) {
            quinaEncontrada = true;
        }

        if (quinaEncontrada) {
            return { tipo: "Quina", detalhe: "Horizontal/Vertical/Diagonal" };
        }
        
        // Checagem de BINGO
        const totalRequired = 24; 
        const numerosNaCartela = letras.reduce((acc, letra) => {
            cartela[letra].forEach(val => {
                if (val !== 'FREE' && chamadosSet.has(val)) {
                    acc.add(val);
                }
            });
            return acc;
        }, new Set());

        if (numerosNaCartela.size >= totalRequired) {
            return { tipo: "Bingo", detalhe: "Cartela Completa" };
        }

        return { tipo: "Nenhum", detalhe: "" };
    }
}


// --- 3. OBJETO DE TRADUÇÃO E CONFIGURAÇÃO DE IDIOMA (4 IDIOMAS) ---

const TRADUCOES = {
    // -------------------------------------------------------------------
    // 1. PORTUGUÊS (pt-br)
    // -------------------------------------------------------------------
    'pt-br': {
        SAUDACAO: 'Bem-vindo! Tudo pronto para começar.',
        CHAMANDO: (letra, numero) => `Chamando: [${letra}] - ${numero}! Fique de olho na sua cartela.`,
        QUINA_MSG: '✨ QUINA! QUINA! Quase lá! Mascote celebra!',
        BINGO_MSG: 'BINGO!!! 🎉🎉🎉 VENCEDOR! Que sorte!',
        FIM_JOGO: 'FIM DE JOGO! Todos os números foram sorteados.',
        PLACEHOLDER_INICIAL: 'Clique em "Sortear" para começar!',
        MSG_ALERTA_CARTELA: (tipo) => `Atenção: A cartela de exemplo fez uma ${tipo}!`,
        EMOJIS: {
            INICIAL: '💖',
            CHAMANDO: '📣',
            QUINA: '🌟',
            BINGO: '👑'
        },
        BOTOES: {
            TITULO_PL: 'Sorteador',
            TITULO_B: 'Bingo POO Profissional',
            SORTEAR: 'Sortear Próximo Número',
            TIPO_VITORIA: 'Tipo de Vitória',
            REINICIAR: 'Reiniciar Bingo',
            TITULO_MENU: 'Selecione o Idioma:'
        }
    },
    // -------------------------------------------------------------------
    // 2. INGLÊS (en-us)
    // -------------------------------------------------------------------
    'en-us': {
        SAUDACAO: 'Welcome! Everything is ready to start.',
        CHAMANDO: (letter, number) => `Calling: [${letter}] - ${number}! Check your card.`,
        QUINA_MSG: '✨ QUINA! QUINA! Almost there! Mascot celebrates!',
        BINGO_MSG: 'BINGO!!! 🎉🎉🎉 WINNER! What luck!',
        FIM_JOGO: 'GAME OVER! All numbers have been drawn.',
        PLACEHOLDER_INICIAL: 'Click "Draw" to start!',
        MSG_ALERTA_CARTELA: (type) => `Attention: The sample card scored a ${type}!`,
        EMOJIS: {
            INICIAL: '💖',
            CHAMANDO: '📣',
            QUINA: '🌟',
            BINGO: '👑'
        },
        BOTOES: {
            TITULO_PL: 'Sorteador',
            TITULO_B: 'POO Professional Bingo',
            SORTEAR: 'Draw Next Number',
            TIPO_VITORIA: 'Victory Type',
            REINICIAR: 'Restart Bingo',
            TITULO_MENU: 'Select Language:'
        }
    },
    // -------------------------------------------------------------------
    // 3. ESPANHOL (es-es)
    // -------------------------------------------------------------------
    'es-es': {
        SAUDACAO: '¡Bienvenido! Todo listo para empezar.',
        CHAMANDO: (letra, numero) => `Llamando: [${letra}] - ${numero}! Revisa tu cartón.`,
        QUINA_MSG: '✨ ¡QUINA! ¡QUINA! ¡Casi lo logras! ¡La mascota celebra!',
        BINGO_MSG: '¡¡¡BINGO!!! 🎉🎉🎉 ¡GANADOR! ¡Qué suerte!',
        FIM_JOGO: 'FIN DEL JUEGO! Todos los números han sido sorteados.',
        PLACEHOLDER_INICIAL: '¡Haz clic en "Sortear" para empezar!',
        MSG_ALERTA_CARTELA: (tipo) => `Atención: ¡El cartón de ejemplo hizo un ${tipo}!`,
        EMOJIS: {
            INICIAL: '💖',
            CHAMANDO: '📣',
            QUINA: '🌟',
            BINGO: '👑'
        },
        BOTOES: {
            TITULO_PL: 'Sorteador',
            TITULO_B: 'Bingo POO Profesional',
            SORTEAR: 'Sortear Siguiente Número',
            TIPO_VITORIA: 'Tipo de Victoria',
            REINICIAR: 'Reiniciar Bingo',
            TITULO_MENU: 'Selecciona el Idioma:'
        }
    },
    // -------------------------------------------------------------------
    // 4. CHINÊS SIMPLIFICADO (zh-cn)
    // -------------------------------------------------------------------
    'zh-cn': {
        SAUDACAO: '欢迎! 一切准备就绪。',
        CHAMANDO: (letra, numero) => `叫号: [${letra}] - ${numero}! 请检查您的卡片。`,
        QUINA_MSG: '✨ 连线! 连线! 马上成功! 吉祥物庆祝!',
        BINGO_MSG: '宾果!!! 🎉🎉🎉 赢家! 好运气!',
        FIM_JOGO: '游戏结束! 所有号码都已摇出。',
        PLACEHOLDER_INICIAL: '点击 "抽奖" 开始!',
        MSG_ALERTA_CARTELA: (tipo) => `注意: 示例卡片获得了 ${tipo}!`,
        EMOJIS: {
            INICIAL: '💖',
            CHAMANDO: '📣',
            QUINA: '🌟',
            BINGO: '👑'
        },
        BOTOES: {
            TITULO_PL: '抽奖机',
            TITULO_B: 'POO 专业宾果',
            SORTEAR: '摇出下一个号码',
            TIPO_VITORIA: '获胜类型',
            REINICIAR: '重新开始宾果',
            TITULO_MENU: '选择语言:'
        }
    }
};

let idiomaAtual = 'pt-br'; 

// --- 4. CONTROLE DOM E LÓGICA DE INTERAÇÃO (Traduzido) ---

const bingo = new SorteadorBingoBrasileiro();
const CARTELA_EXEMPLO = SorteadorBingoBrasileiro.gerarCartela();

// Referências DOM
const btnSortear = document.getElementById('btn-sortear');
const btnAlternarVitoria = document.getElementById('btn-alternar-vitoria');
const tipoVitoriaAtualSpan = document.getElementById('tipo-vitoria-atual');
const letraSorteadaSpan = document.getElementById('letra-sorteada');
const numeroSorteadoSpan = document.getElementById('numero-sorteado');
const statusTexto = document.getElementById('status-texto');
const qtdSorteadasSpan = document.getElementById('qtd-sorteadas');
const bolinhasContainer = document.getElementById('bolinhas-container');
const cartelaContainer = document.getElementById('bingo-card');

const alertaMascoteDiv = document.getElementById('alerta-mascote');
const mascoteEmojiSpan = document.getElementById('mascote-emoji');
const mensagemAlertaDiv = document.getElementById('mensagem-alerta');


function mudarIdioma(novoIdioma) {
    if (TRADUCOES[novoIdioma]) {
        idiomaAtual = novoIdioma;
        renderHeader(); // Renderiza cabeçalhos e textos estáticos
        renderPlacar(); // Renderiza placar e mensagens dinâmicas
    }
}


function renderCartela() {
    cartelaContainer.querySelectorAll('.cartela-celula').forEach(c => c.remove()); 

    const numerosChamados = new Set(bingo.bolinhasSorteadas);
    const letras = ['B', 'I', 'N', 'G', 'O'];

    for (let i = 0; i < 5; i++) {
        for (const letra of letras) {
            const valor = CARTELA_EXEMPLO[letra][i];
            const celula = document.createElement('div');
            celula.classList.add('cartela-celula');
            
            celula.textContent = valor;
            
            if (valor === 'FREE') {
                celula.classList.add('celula-free', 'celula-marcada');
            } else if (typeof valor === 'number' && numerosChamados.has(valor)) {
                celula.classList.add('celula-marcada');
            }
            
            cartelaContainer.appendChild(celula);
        }
    }
}

// Função para o mascote e alertas (com lógica de animação e tradução)
function atualizarMascote(tipoVitoria, ultimoNumero) {
    const LANG = TRADUCOES[idiomaAtual];
    let emoji = LANG.EMOJIS.INICIAL;
    let mensagem = LANG.SAUDACAO;
    let classeAlerta = '';

    if (tipoVitoria === "Quina") {
        emoji = LANG.EMOJIS.QUINA;
        mensagem = LANG.QUINA_MSG;
        classeAlerta = 'alerta-vitoria';
    } else if (tipoVitoria === "Bingo") {
        emoji = LANG.EMOJIS.BINGO;
        mensagem = LANG.BINGO_MSG;
        classeAlerta = 'alerta-vitoria';
    } else if (ultimoNumero) {
        emoji = LANG.EMOJIS.CHAMANDO;
        // Usa a função dentro do objeto de tradução para construir a string
        mensagem = LANG.CHAMANDO(bingo.letra, ultimoNumero); 
    }

    mascoteEmojiSpan.textContent = emoji;
    mensagemAlertaDiv.textContent = mensagem;

    // Remove classes de alerta e animação
    alertaMascoteDiv.classList.remove('alerta-vitoria');
    mascoteEmojiSpan.classList.remove('animar-mascote'); 

    // Adiciona classes de alerta (cor) e dispara animação se for vitória
    if (classeAlerta) {
        alertaMascoteDiv.classList.add(classeAlerta);
        
        if (tipoVitoria === "Quina" || tipoVitoria === "Bingo") {
             // Usa setTimeout para forçar o reset da animação e dispará-la novamente
             setTimeout(() => {
                mascoteEmojiSpan.classList.add('animar-mascote');
             }, 0);
        }
    }
}

// NOVO: Função para renderizar textos estáticos (cabeçalhos, botões)
function renderHeader() {
    const LANG = TRADUCOES[idiomaAtual];
    
    // Atualiza o Título na aba do Navegador
    document.title = `${LANG.BOTOES.TITULO_B} - ${LANG.BOTOES.TITULO_PL}`;
    
    // Atualiza o Título Principal
    document.querySelector('header h1').textContent = `🎉 ${LANG.BOTOES.TITULO_B} - Módulo ${LANG.BOTOES.TITULO_PL} 🎉`;
    document.querySelector('header p').textContent = 'Desenvolvido com lógica de Orientação a Objetos (POO) em JavaScript';
    
    // Atualiza textos estáticos dos controles
    document.getElementById('btn-sortear').textContent = LANG.BOTOES.SORTEAR;
    document.getElementById('btn-reiniciar').textContent = LANG.BOTOES.REINICIAR;
    document.querySelector('#seletor-idioma p').textContent = LANG.BOTOES.TITULO_MENU;

    // Atualiza o subtítulo do Histórico
    document.querySelector('#historico h2').textContent = `${LANG.BOTOES.TITULO_B} Sorteadas (${bingo.qtdBolinhasSorteadas}/75)`;
}


function renderPlacar() {
    const LANG = TRADUCOES[idiomaAtual];

    letraSorteadaSpan.textContent = bingo.letra || 'B';
    numeroSorteadoSpan.textContent = bingo.ultimoNumeroSorteado || '00';
    qtdSorteadasSpan.textContent = bingo.qtdBolinhasSorteadas;
    tipoVitoriaAtualSpan.textContent = bingo.tipoVitoria;
    
    // Atualiza o texto do botão de vitória
    document.getElementById('btn-alternar-vitoria').textContent = 
        `${LANG.BOTOES.TIPO_VITORIA}: ${bingo.tipoVitoria}`;

    let resultadoVitoria = { tipo: "Nenhum" };

    if (bingo.ultimoNumeroSorteado) {
        resultadoVitoria = SorteadorBingoBrasileiro.verificarVitoria(CARTELA_EXEMPLO, bingo.bolinhasSorteadas);
        
        if (resultadoVitoria.tipo !== "Nenhum") {
            atualizarMascote(resultadoVitoria.tipo);
            statusTexto.textContent = LANG.MSG_ALERTA_CARTELA(resultadoVitoria.tipo);
        } else {
            atualizarMascote(null, bingo.ultimoNumeroSorteado); 
            statusTexto.textContent = LANG.CHAMANDO(bingo.letra, bingo.ultimoNumeroSorteado);
        }

    } else {
        atualizarMascote(null, null); 
        statusTexto.textContent = LANG.PLACEHOLDER_INICIAL;
    }


    if (bingo.todosNumerosSorteadas) {
        btnSortear.disabled = true;
        statusTexto.textContent = LANG.FIM_JOGO;
        atualizarMascote(null, null);
    }
}

function renderHistorico() {
    bolinhasContainer.innerHTML = '';
    
    bingo.bolinhasSorteadas.forEach(num => {
        const bolinha = document.createElement('div');
        bolinha.classList.add('bolinha');
        bolinha.textContent = num;
        bolinhasContainer.appendChild(bolinha);
    });
    bolinhasContainer.scrollTop = bolinhasContainer.scrollHeight;
    
    // Garante que a contagem no histórico seja traduzida
    document.querySelector('#historico h2').textContent = `${TRADUCOES[idiomaAtual].BOTOES.TITULO_B} Sorteadas (${bingo.qtdBolinhasSorteadas}/75)`;
}


// --- Event Listeners ---

btnSortear.addEventListener('click', () => {
    if (bingo.sortearNumero()) {
        renderPlacar();
        renderHistorico();
        renderCartela();
    } else {
        alert(TRADUCOES[idiomaAtual].FIM_JOGO);
    }
});

btnAlternarVitoria.addEventListener('click', () => {
    const novoIndice = (bingo.tipoVitoriaIndice + 1) % 2; 
    bingo.tipoVitoria = novoIndice;
    tipoVitoriaAtualSpan.textContent = bingo.tipoVitoria;
    alert(`${TRADUCOES[idiomaAtual].BOTOES.TIPO_VITORIA} alterado para: ${bingo.tipoVitoria}`);
});

document.getElementById('btn-reiniciar').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja REINICIAR o Bingo?')) {
        location.reload();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderCartela();
    renderHeader(); 
    renderPlacar();
    renderHistorico();
});