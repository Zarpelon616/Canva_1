// Classe para a Matriz
class Matrix {
    constructor(name, points) {
        this.name = name;
        this.points = points; // Um array de coordenadas (x, y)
    }

    drawLines(ctx) {
        if (this.points.length < 4) return; // Precisamos de pelo menos 4 pontos

        ctx.beginPath();
        // Usar a função cartesianToCanvas para obter as coordenadas corretas do canvas
        const startCanvasCoords = cartesianToCanvas(this.points[0][0], this.points[0][1]);
        ctx.moveTo(startCanvasCoords.x, startCanvasCoords.y);

        for (let i = 1; i < this.points.length; i++) {
            const pointCanvasCoords = cartesianToCanvas(this.points[i][0], this.points[i][1]);
            ctx.lineTo(pointCanvasCoords.x, pointCanvasCoords.y);
        }

        // Volta ao primeiro ponto para fechar a matriz
        ctx.lineTo(startCanvasCoords.x, startCanvasCoords.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();


        // Desenha os pontos destacados
        this.drawPoints(ctx);
    }
    drawPoints(ctx) {
        ctx.fillStyle = 'black'; // Cor dos pontos destacados
        const pointRadius = 5; // Raio dos pontos

        for (const point of this.points) {
            const canvasCoords = cartesianToCanvas(point[0], point[1]);
            ctx.beginPath();
            ctx.arc(canvasCoords.x, canvasCoords.y, pointRadius, 0, Math.PI * 2); // Desenha um círculo
            ctx.fill(); // Preenche o círculo
        }
    }
}

// Função para abrir o modal
document.getElementById('add-matrix').addEventListener('click', function() {
    document.getElementById('matrix-creation-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block'; // Mostra o overlay
    document.getElementById('coordinate-inputs').innerHTML = ''; // Limpa entradas anteriores
    for (let i = 0; i < 4; i++) { 
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Coordenadas do Ponto ${i + 1} (x,y)`;
        document.getElementById('coordinate-inputs').appendChild(input);
    }
});

// Função para criar a matriz
document.getElementById('create-matrix-button').addEventListener('click', function() {
    const name = document.getElementById('matrix-name').value;
    const points = Array.from(document.querySelectorAll('#coordinate-inputs input')).map(input => {
        const coords = input.value.split(',').map(Number);
        return coords; // [x, y]
    });

    // Verifica se há pelo menos 4 pontos
    if (points.length < 4) {
        alert("Você deve fornecer pelo menos 4 pontos para criar uma matriz.");
        return;
    }

    const matrix = new Matrix(name, points);
    const canvas = document.getElementById('viewport');
    const ctx = canvas.getContext('2d');
    matrix.drawLines(ctx);
    
    // Adiciona a matriz à lista de exibição (displayList)
    displayList.push(matrix);

    // Adiciona a matriz à tabela de objetos
    addMatrixToTable(matrix);
    
    document.getElementById('matrix-creation-modal').style.display = 'none'; // Fecha o modal
    document.getElementById('modal-overlay').style.display = 'none'; // Oculta o overlay
});

// Cancelar a criação da matriz
document.getElementById('cancel-matrix-creation').addEventListener('click', function() {
    document.getElementById('matrix-creation-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none'; // Oculta o overlay
});

// Ocultar o modal ao clicar no overlay
document.getElementById('modal-overlay').addEventListener('click', function() {
    document.getElementById('matrix-creation-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none'; // Oculta o overlay
});

// Função para adicionar uma matriz à tabela de objetos
function addMatrixToTable(matrix) {
    const tableBody = document.querySelector('#object-table tbody');

    // Cria uma nova linha
    const newRow = document.createElement('tr');

    // Adiciona células com informações da matriz
    const nameCell = document.createElement('td');
    nameCell.textContent = matrix.name; // Nome da matriz
    newRow.appendChild(nameCell);

    const typeCell = document.createElement('td');
    typeCell.textContent = 'Matriz'; // Tipo é 'Matriz'
    newRow.appendChild(typeCell);

    const coordsCell = document.createElement('td');
    // Converte as coordenadas da matriz em uma string
    const coordsString = matrix.points.map(point => `(${point[0]}, ${point[1]})`).join(', ');
    coordsCell.textContent = coordsString; // Adiciona as coordenadas formatadas
    newRow.appendChild(coordsCell);

    // Adiciona a nova linha à tabela
    tableBody.appendChild(newRow);
}

// Função para multiplicar matrizes
function multiplyMatrices(matrixA, matrixB) {
    const numRowsA = matrixA.points.length;
    const numColsA = matrixA.points[0].length;
    const numRowsB = matrixB.points.length;
    const numColsB = matrixB.points[0].length;

    // Verifica se as matrizes podem ser multiplicadas
    if (numColsA !== numRowsB) {
        alert('As matrizes não podem ser multiplicadas: o número de colunas da primeira matriz deve ser igual ao número de linhas da segunda matriz.');
        return null;
    }

    // Cria uma matriz de resultado com o tamanho apropriado
    const resultPoints = Array.from({ length: numRowsA }, () => Array(numColsB).fill(0));

    //Multiplicação
    for (let i = 0; i < numRowsA; i++) {
        for (let j = 0; j < numColsB; j++) {
            for (let k = 0; k < numColsA; k++) {
                resultPoints[i][j] += matrixA.points[i][k] * matrixB.points[k][j];
            }
        }
    }

    
    const resultMatrix = new Matrix('Resultado', resultPoints);
    return resultMatrix;
}

// Adicionando o botão para multiplicar matrizes
document.getElementById('multiply-matrices').addEventListener('click', function() {
    const nameA = prompt('Digite o nome da primeira matriz:');
    const nameB = prompt('Digite o nome da segunda matriz:');

    const matrixA = displayList.find(matrix => matrix.name === nameA);
    const matrixB = displayList.find(matrix => matrix.name === nameB);

    if (matrixA && matrixB) {
        const resultMatrix = multiplyMatrices(matrixA, matrixB);
        if (resultMatrix) {
            // Adiciona a matriz resultante à tabela de objetos
            addMatrixToTable(resultMatrix);
            // Desenha a matriz resultante no canvas
            const canvas = document.getElementById('viewport');
            const ctx = canvas.getContext('2d');
            resultMatrix.drawLines(ctx);
        }
    } else {
        alert('Uma ou ambas as matrizes não foram encontradas.');
    }
});

// Função para imprimir a matriz em formato de texto
function printMatrix(matrix) {
    let textRepresentation = `Matriz: ${matrix.name}\n`;
    
    matrix.points.forEach(row => {
        textRepresentation += row.join('\t') + '\n'; // Adiciona cada linha da matriz
    });

    alert(textRepresentation); // Exibe a matriz em um alerta
}

// Adiciona o evento ao botão de impressão
document.getElementById('print-matrix-button').addEventListener('click', function() {
    const selectedMatrixName = prompt('Digite o nome da matriz que deseja imprimir:');
    const matrixToPrint = displayList.find(matrix => matrix.name === selectedMatrixName);

    if (matrixToPrint) {
        printMatrix(matrixToPrint);
    } else {
        alert('Matriz não encontrada. Verifique o nome e tente novamente.');
    }
});

// Função para atualizar o viewport
function updateViewport() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Salva o estado atual do contexto
    ctx.save();

    // Aplica o deslocamento e o zoom
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    // Desenhar os eixos X e Y
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Desenhar os objetos no displayList
    displayList.forEach(obj => {
        if (obj.type === 'point') {
            const canvasCoords = cartesianToCanvas(obj.coords.x, obj.coords.y);
            ctx.beginPath();
            ctx.arc(canvasCoords.x, canvasCoords.y, 7 / zoom, 0, 2 * Math.PI);
            ctx.fill();
        } else if (obj.type === 'line') {
            const start = cartesianToCanvas(obj.coords.x1, obj.coords.y1);
            const end = cartesianToCanvas(obj.coords.x2, obj.coords.y2);

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else if (obj.type === 'polyline') {
            ctx.beginPath();
            const firstPoint = cartesianToCanvas(obj.coords[0].x, obj.coords[0].y);
            ctx.moveTo(firstPoint.x, firstPoint.y);
            obj.coords.forEach(point => {
                const canvasCoords = cartesianToCanvas(point.x, point.y);
                ctx.lineTo(canvasCoords.x, canvasCoords.y);
            });
            ctx.stroke();
        } else if (obj.type === 'polygon') {
            ctx.beginPath();
            const firstPoint = cartesianToCanvas(obj.coords[0].x, obj.coords[0].y);
            ctx.moveTo(firstPoint.x, firstPoint.y);
            obj.coords.forEach(point => {
                const canvasCoords = cartesianToCanvas(point.x, point.y);
                ctx.lineTo(canvasCoords.x, canvasCoords.y);
            });
            ctx.closePath(); // Fecha o caminho para formar o polígono
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Cor de preenchimento com transparência
            ctx.fill(); // Preenche o polígono
        } else if (obj.type === 'matrix') { // Supondo que você tenha um tipo 'matrix'
            drawMatrix(obj); // Chama uma função para desenhar a matriz
        }
    });

    ctx.restore(); // Restaura o estado do contexto

    // Atualiza a tabela ao final da renderização
    updateTable();
}
