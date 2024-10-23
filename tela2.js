// Função para gerar os campos de coordenadas com base no número de linhas e colunas
function generateCoordinateInputs() {
    const numRows = parseInt(document.getElementById('num-rows').value);
    const numCols = parseInt(document.getElementById('num-cols').value);

    if (isNaN(numRows) || isNaN(numCols) || numRows <= 0 || numCols <= 0) {
        alert('Por favor, insira números válidos para o número de linhas e colunas.');
        return;
    }

    // Limpa quaisquer entradas anteriores
    document.getElementById('coordinate-inputs').innerHTML = '';

    // Gera inputs para coordenadas baseados no número de linhas e colunas
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Coordenada [${i},${j}] (x,y)`;
            input.dataset.row = i;
            input.dataset.col = j;
            document.getElementById('coordinate-inputs').appendChild(input);
        }
        document.getElementById('coordinate-inputs').appendChild(document.createElement('br'));
    }

    // Re-adiciona o botão "Criar Matriz"
    const createButton = document.createElement('button');
    createButton.id = 'create-matrix-button';
    createButton.textContent = 'Criar Matriz';
    document.getElementById('coordinate-inputs').appendChild(createButton);
    
    // Adiciona o evento ao botão para criar a matriz
    createButton.addEventListener('click', createMatrix);
}

// Função para criar a matriz
function createMatrix() {
    const name = document.getElementById('matrix-name').value;
    const numRows = parseInt(document.getElementById('num-rows').value);
    const numCols = parseInt(document.getElementById('num-cols').value);

    // Coleta os pontos da matriz
    const points = [];
    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numCols; j++) {
            const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
            const coords = input.value.split(',').map(Number);
            row.push(coords); // Adiciona as coordenadas como [x, y]
        }
        points.push(row); // Adiciona a linha de coordenadas à matriz
    }

    // Verifica se todas as coordenadas foram inseridas corretamente
    if (points.some(row => row.some(point => point.length !== 2 || isNaN(point[0]) || isNaN(point[1])))) {
        alert('Certifique-se de que todas as coordenadas estejam no formato correto (x, y).');
        return;
    }

    // Cria a matriz e a desenha
    const matrix = new Matrix(name, points);
    const canvas = document.getElementById('viewport');
    const ctx = canvas.getContext('2d');
    matrix.drawLines(ctx);

    // Adiciona a matriz à lista de exibição (displayList)
    displayList.push(matrix);

    // Adiciona a matriz à tabela de objetos
    addMatrixToTable(matrix);
    
    // Fecha o modal
    document.getElementById('matrix-creation-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}