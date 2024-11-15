const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 800;
const objectsListElement = document.getElementById('objects-list');

// Definindo a origem (0,0) no centro do canvas
const originX = canvas.width / 2;
const originY = canvas.height / 2;

let displayList = []; // Lista global para armazenar 
let selectedObject = null;
let zoom = 1; // Nível de zoom inicial
let offsetX = 0; // Posição de rolagem horizontal
let offsetY = 0; // Posição de rolagem vertical


document.getElementById('add-point').addEventListener('click', addPoint);
document.getElementById('add-line').addEventListener('click', addLine);
document.getElementById('add-polyline').addEventListener('click', addPolyline);
document.getElementById('add-polygon').addEventListener('click', addPolygon);
document.getElementById('remove-object').addEventListener('click', removeObject);
document.getElementById('remove-all-objects').addEventListener('click', removeAllObjects);
document.getElementById('move-point').addEventListener('click', moveObject);
document.getElementById('reflect-object').addEventListener('click', reflectObject);
document.getElementById('shear-object').addEventListener('click', shearObject); 
document.getElementById('shear-matrix').addEventListener('click', shearMatrix);


canvas.addEventListener('click', selectPoint);
canvas.addEventListener('wheel', handleZoom);
canvas.addEventListener('mousedown', startPan);
canvas.addEventListener('mousemove', doPan);
canvas.addEventListener('mouseup', endPan);

// Adicionar eventos aos botões para realizar as transformações
document.getElementById('translate-object').addEventListener('click', translateObject);
document.getElementById('rotate-object').addEventListener('click', rotateObject);
document.getElementById('scale-object').addEventListener('click', scaleObject);

// Função para converter coordenadas cartesianas para coordenadas do canvas
function cartesianToCanvas(x, y) {
    // Ajuste as coordenadas conforme necessário para o seu canvas
    const canvasWidth = document.getElementById('viewport').width;
    const canvasHeight = document.getElementById('viewport').height;
    
    // Ajuste a origem (0, 0) para o centro ou canto do canvas conforme necessário
    const adjustedX = x + canvasWidth / 2; // Exemplo: desloca para o centro horizontalmente
    const adjustedY = canvasHeight / 2 - y; // Inverte Y para a coordenada do canvas

    return { x: adjustedX, y: adjustedY };
}

// Função para converter coordenadas do canvas para coordenadas cartesianas
function canvasToCartesian(x, y) {
    return {
        x: (x - originX) / zoom + offsetX,
        y: (originY - y) / zoom + offsetY
    };
}

// Exibir todos os botões ao clicar no botão "Mostrar Controles"
document.getElementById("show-all-buttons").addEventListener("click", function(event) {
    event.stopPropagation(); // Impede que o clique feche o menu
    const allControls = document.getElementById("all-controls");
    
    // Alterna a exibição dos controles
    if (allControls.style.display === "none" || allControls.style.display === "") {
        allControls.style.display = "block"; // Mostra todos os botões
    } else {
        allControls.style.display = "none"; // Oculta todos os botões
    }
});

// Exibir a tabela de objetos ao clicar no botão "Mostrar Tabela"
document.getElementById("show-table-button").addEventListener("click", function(event) {
    event.stopPropagation(); // Impede que o clique no botão feche a tabela
    const tableContainer = document.getElementById("table-container");
    
    // Alterna a exibição da tabela
    if (tableContainer.style.display === "none" || tableContainer.style.display === "") {
        tableContainer.style.display = "block"; // Mostra a tabela
        document.getElementById("object-table").style.display = "block";
        document.getElementById("add-controls").style.display = "none";
        document.getElementById("matrix-controls").style.display = "none";
        document.getElementById("transform-controls").style.display = "none"; // Minimiza outros menus, se estiverem abertos
    } else {
        tableContainer.style.display = "none"; // Oculta a tabela
        document.getElementById("object-table").style.display = "none"; // Oculta a tabela de objetos
    }
});


// Função para adicionar um ponto
function addPoint() {
    const name = prompt('Nome do Ponto:');//Função que define o nome
    const x = parseFloat(prompt('Coordenada X:'));  
    const y = parseFloat(prompt('Coordenada Y:'));

    if (name) {
        displayList.push({ name, type: 'point', coords: { x, y } });
        updateViewport();
        updateTable();
    }
}

// Função para adicionar uma reta
function addLine() {
    const name = prompt('Nome da Reta:');
    const x1 = parseFloat(prompt('Coordenada X1:'));
    const y1 = parseFloat(prompt('Coordenada Y1:'));
    const x2 = parseFloat(prompt('Coordenada X2:'));
    const y2 = parseFloat(prompt('Coordenada Y2:'));

    if (name) {
        displayList.push({ name, type: 'line', coords: { x1, y1, x2, y2 } });
        updateViewport();
        updateTable();
    }
}

// Função para adicionar uma polilinha
function addPolyline() {
    const name = prompt('Nome da Polilinha:');
    let points = [];
    let addingPoints = true;

    while (addingPoints) {
        const x = parseFloat(prompt('Coordenada X (ou deixe em branco para terminar):'));
        if (isNaN(x)) {
            if (points.length >= 2) {
                addingPoints = false;
            } else {
                alert('Uma polilinha precisa de pelo menos 2 pontos.');
            }
        } else {
            const y = parseFloat(prompt('Coordenada Y:'));
            points.push({ x, y });
        }
    }

    if (name && points.length >= 2) {
        displayList.push({ name, type: 'polyline', coords: points });
        updateViewport();
        updateTable();
    }
}

// Função para adicionar um polígono
function addPolygon() {
    const name = prompt('Nome do Polígono:');
    let points = [];
    let addingPoints = true;

    while (addingPoints) {
        const x = parseFloat(prompt('Coordenada X (ou deixe em branco para terminar):'));
        if (isNaN(x)) {
            if (points.length >= 3) {
                addingPoints = false;
            } else {
                alert('Um polígono precisa de pelo menos 3 pontos.');
            }
        } else {
            const y = parseFloat(prompt('Coordenada Y:'));
            points.push({ x, y });
        }
    }

    if (name && points.length >= 3) {
        displayList.push({ name, type: 'polygon', coords: points });
        updateViewport();
        updateTable();
    }
}

// Função para selecionar um objeto pelo nome
function selectObjectByName(name) {
    selectedObject = displayList.find(obj => obj.name === name);

    if (selectedObject) {
        updateTable();  // Atualiza a tabela para destacar o objeto selecionado
    } else {
        alert('Objeto não encontrado.');
    }
}

// Função para remover um objeto
function removeObject() {
    if (selectedObject) {
        const confirmRemoval = confirm('Deseja remover o objeto selecionado "' + selectedObject.name + '"?');
        if (confirmRemoval) {
            displayList = displayList.filter(obj => obj.name !== selectedObject.name);
            selectedObject = null;  // Limpa a seleção
            updateViewport();
            updateTable();
        }
    } else {
        const name = prompt('Nome do Objeto a Remover:');
        if (name) {
            displayList = displayList.filter(obj => obj.name !== name);
            selectedObject = null;  // Limpa a seleção
            updateViewport();
            updateTable();
        }
    }
}


// Função para remover todos os objetos
function removeAllObjects() {
    displayList = [];
    selectedObject = null;  // Limpa a seleção
    updateViewport();
    updateTable();
}

// Função para selecionar um ponto
// Função para selecionar um ponto ao clicar no canvas
function selectPoint(event) {
    const rect = canvas.getBoundingClientRect();
    
    // Pega as coordenadas do clique no canvas
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Converte as coordenadas do clique no canvas para coordenadas cartesianas
    const clickCoords = canvasToCartesian(canvasX, canvasY);

    selectedObject = null; // Reinicia a seleção
    const pointRadius = 7 / zoom; // Ajusta o raio com base no nível de zoom

    // Percorre todos os objetos para verificar se algum ponto foi clicado
    displayList.forEach(obj => {
        if (obj.type === 'point') {
            const distance = Math.sqrt(
                Math.pow(clickCoords.x - obj.coords.x, 2) + 
                Math.pow(clickCoords.y - obj.coords.y, 2)
            );

            if (distance <= pointRadius) {
                selectedObject = obj;
                alert('Ponto ' + obj.name + ' selecionado.');
                updateTable(); // Atualiza a tabela para destacar o objeto selecionado
            }
        }
    });

    if (!selectedObject) {
        alert('Nenhum ponto selecionado.');
    }
}


// Função para mover o objeto selecionado
function moveObject() {
    if (!selectedObject) {
        const name = prompt('Nenhum objeto selecionado. Insira o nome do objeto que deseja selecionar:');
        if (name) {
            selectObjectByName(name);
        }
    }
    if (selectedObject) {
        if (selectedObject.type === 'point') {
            const newX = parseFloat(prompt('Nova Coordenada X:', selectedObject.coords.x));
            const newY = parseFloat(prompt('Nova Coordenada Y:', selectedObject.coords.y));

            selectedObject.coords.x = newX;
            selectedObject.coords.y = newY;

        } else if (selectedObject.type === 'line') {
            const newX1 = parseFloat(prompt('Nova Coordenada X1:', selectedObject.coords.x1));
            const newY1 = parseFloat(prompt('Nova Coordenada Y1:', selectedObject.coords.y1));
            const newX2 = parseFloat(prompt('Nova Coordenada X2:', selectedObject.coords.x2));
            const newY2 = parseFloat(prompt('Nova Coordenada Y2:', selectedObject.coords.y2));

            selectedObject.coords.x1 = newX1;
            selectedObject.coords.y1 = newY1;
            selectedObject.coords.x2 = newX2;
            selectedObject.coords.y2 = newY2;

        } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
            selectedObject.coords.forEach((point, index) => {
                const newX = parseFloat(prompt(`Nova Coordenada X para ponto ${index + 1}:`, point.x));
                const newY = parseFloat(prompt(`Nova Coordenada Y para ponto ${index + 1}:`, point.y));

                point.x = newX;
                point.y = newY;
            });
        } else if (selectedObject instanceof Matrix) { // Novo caso para matrizes
            selectedObject.points.forEach((point, index) => {
                const newX = parseFloat(prompt(`Nova Coordenada X para ponto ${index + 1}:`, point[0]));
                const newY = parseFloat(prompt(`Nova Coordenada Y para ponto ${index + 1}:`, point[1]));

                point[0] = newX;
                point[1] = newY;
            });
        }

        updateViewport();
        updateTable();
    } else {
        alert('Nenhum objeto selecionado.');
    }
}

// Função para refletir objetos sobre o eixo X, Y ou ambos
function reflectObject() {
    if (selectedObject) {
        const reflectionAxis = prompt("Escolha os eixos de reflexão (X, Y, ou ambos):").toUpperCase();

        displayList.forEach(object => {
            if (object === selectedObject) {
                switch (reflectionAxis) {
                    case "X":
                        // Refletir sobre o eixo X (invertendo o valor de Y)
                        if (object.type === "point") {
                            object.coords.y = -object.coords.y;
                        } else if (object.type === "line") {
                            object.coords.y1 = -object.coords.y1;
                            object.coords.y2 = -object.coords.y2;
                        } else if (object.type === "polyline" || object.type === "polygon") {
                            // Refletir todos os pontos de polilinha ou polígono sobre o eixo X
                            object.coords.forEach(point => {
                                point.y = -point.y;
                            });
                        } else if (object instanceof Matrix) {
                            // Refletir sobre o eixo X para matrizes
                            object.points.forEach(point => {
                                point[1] = -point[1]; // Reflete a coordenada Y
                            });
                        }
                        break;

                    case "Y":
                        // Refletir sobre o eixo Y (invertendo o valor de X)
                        if (object.type === "point") {
                            object.coords.x = -object.coords.x;
                        } else if (object.type === "line") {
                            object.coords.x1 = -object.coords.x1;
                            object.coords.x2 = -object.coords.x2;
                        } else if (object.type === "polyline" || object.type === "polygon") {
                            // Refletir todos os pontos de polilinha ou polígono sobre o eixo Y
                            object.coords.forEach(point => {
                                point.x = -point.x;
                            });
                        } else if (object instanceof Matrix) {
                            // Refletir sobre o eixo Y para matrizes
                            object.points.forEach(point => {
                                point[0] = -point[0]; // Reflete a coordenada X
                            });
                        }
                        break;

                    case "AMBOS":
                        // Refletir sobre ambos os eixos X e Y (invertendo tanto X quanto Y)
                        if (object.type === "point") {
                            object.coords.x = -object.coords.x;
                            object.coords.y = -object.coords.y;
                        } else if (object.type === "line") {
                            object.coords.x1 = -object.coords.x1;
                            object.coords.y1 = -object.coords.y1;
                            object.coords.x2 = -object.coords.x2;
                            object.coords.y2 = -object.coords.y2;
                        } else if (object.type === "polyline" || object.type === "polygon") {
                            // Refletir todos os pontos de polilinha ou polígono sobre ambos os eixos
                            object.coords.forEach(point => {
                                point.x = -point.x;
                                point.y = -point.y;
                            });
                        } else if (object instanceof Matrix) {
                            // Refletir sobre ambos os eixos X e Y para matrizes
                            object.points.forEach(point => {
                                point[0] = -point[0]; // Reflete a coordenada X
                                point[1] = -point[1]; // Reflete a coordenada Y
                            });
                        }
                        break;

                    default:
                        alert("Eixo inválido! Escolha 'X', 'Y', ou 'AMBOS'.");
                        break;
                }
            }
        });

        updateViewport();
        updateTable();
    } else {
        alert("Nenhum objeto selecionado para reflexão.");
    }
}



// Função para aplicar cisalhamento, incluindo polilinhas e polígonos
function shearObject() {
    if (selectedObject) {
        const shearX = parseFloat(prompt("Digite o valor do cisalhamento no eixo X:"));
        const shearY = parseFloat(prompt("Digite o valor do cisalhamento no eixo Y:"));

        displayList.forEach(object => {
            if (object === selectedObject) {
                // Aplique o cisalhamento aos pontos do objeto selecionado
                switch (object.type) {
                    case "point":
                        // Para ponto, aplica o cisalhamento
                        object.coords.x += shearX * object.coords.y;
                        object.coords.y += shearY * object.coords.x;
                        break;

                    case "line":
                        // Para linha, aplica o cisalhamento nos dois pontos
                        object.coords.x1 += shearX * object.coords.y1;
                        object.coords.y1 += shearY * object.coords.x1;
                        object.coords.x2 += shearX * object.coords.y2;
                        object.coords.y2 += shearY * object.coords.x2;
                        break;

                    case "polyline":
                    case "polygon":
                        // Para polilinha e polígono, aplica o cisalhamento a cada ponto
                        object.coords.forEach(point => {
                            point.x += shearX * point.y;
                            point.y += shearY * point.x;
                        });
                        break;

                    default:
                        alert("Tipo de objeto não suportado para cisalhamento.");
                        break;
                }
            }
        });

        updateViewport(); // Atualiza o desenho no viewport
        updateTable();    // Atualiza a tabela de objetos
    }
}




// Função para transladar um objeto selecionado
function translateObject() {
    if (!selectedObject) {
        const name = prompt('Nenhum objeto selecionado. Insira o nome do objeto que deseja selecionar:');
        if (name) {
            selectObjectByName(name);
        }
    }
    if (selectedObject) {
        const dx = parseFloat(prompt('Transladar em X (Dx):'));
        const dy = parseFloat(prompt('Transladar em Y (Dy):'));

        // Verifica se Dx e Dy são números válidos e permite valores positivos ou negativos
        if (!isNaN(dx) && !isNaN(dy)) {
            if (selectedObject.type === 'point') {
                selectedObject.coords.x += dx;
                selectedObject.coords.y += dy;
            } else if (selectedObject.type === 'line') {
                selectedObject.coords.x1 += dx;
                selectedObject.coords.y1 += dy;
                selectedObject.coords.x2 += dx;
                selectedObject.coords.y2 += dy;
            } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                selectedObject.coords.forEach(point => {
                    point.x += dx;
                    point.y += dy;
                });
            } else if (selectedObject instanceof Matrix) { // Novo caso para matrizes
                selectedObject.points.forEach(point => {
                    point[0] += dx; // Translada coordenada x do ponto
                    point[1] += dy; // Translada coordenada y do ponto
                });
            }

            // Atualiza a visualização e a tabela com os novos valores
            updateViewport();
            updateTable();
        } else {
            alert('Valores inválidos para Dx e Dy.');
        }
    } else {
        alert('Nenhum objeto selecionado.');
    }
}

// Função para rotacionar um objeto selecionado ao redor de um ponto qualquer, origem ou centro do objeto
function rotateObject() {
    if (!selectedObject) {
        const name = prompt('Nenhum objeto selecionado. Insira o nome do objeto que deseja selecionar:');
        if (name) {
            selectObjectByName(name);
        }
    }
    if (selectedObject) {
        const angle = parseFloat(prompt('Rotacionar por um ângulo (em graus):'));
        const radians = angle * (Math.PI / 180); // Converte graus para radianos

        // Pergunta ao usuário o centro de rotação
        const rotationCenter = prompt('Digite "o" para rotacionar ao redor da origem, "c" para rotacionar ao redor do centro do objeto, ou "p" para um ponto específico:').toLowerCase();

        let centerX = 0, centerY = 0;

        if (!isNaN(radians)) {
            // Função para rotacionar um ponto (x, y) em torno de um centro (cx, cy)
            const rotatePoint = (x, y, cx, cy) => {
                const translatedX = x - cx;
                const translatedY = y - cy;
                const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
                const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);
                return { x: rotatedX + cx, y: rotatedY + cy };
            };

            // Define o centro da rotação com base na escolha do usuário
            if (rotationCenter === 'c') {
                if (selectedObject.type === 'point') {
                    centerX = selectedObject.coords.x;
                    centerY = selectedObject.coords.y;
                } else if (selectedObject.type === 'line') {
                    centerX = (selectedObject.coords.x1 + selectedObject.coords.x2) / 2;
                    centerY = (selectedObject.coords.y1 + selectedObject.coords.y2) / 2;
                } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                    const numPoints = selectedObject.coords.length;
                    centerX = selectedObject.coords.reduce((sum, point) => sum + point.x, 0) / numPoints;
                    centerY = selectedObject.coords.reduce((sum, point) => sum + point.y, 0) / numPoints;
                } else if (selectedObject instanceof Matrix) {
                    const numPoints = selectedObject.points.length;
                    centerX = selectedObject.points.reduce((sum, point) => sum + point[0], 0) / numPoints;
                    centerY = selectedObject.points.reduce((sum, point) => sum + point[1], 0) / numPoints;
                }
            } else if (rotationCenter === 'p') {
                // Se o usuário escolher "ponto", pede as coordenadas
                centerX = parseFloat(prompt('Digite a coordenada X do ponto de rotação:'));
                centerY = parseFloat(prompt('Digite a coordenada Y do ponto de rotação:'));
                if (isNaN(centerX) || isNaN(centerY)) {
                    alert('Coordenadas inválidas para o ponto de rotação.');
                    return;
                }
            }
            // Aplica a rotação ao redor do centro definido
            if (selectedObject.type === 'point') {
                const newCoords = rotatePoint(selectedObject.coords.x, selectedObject.coords.y, centerX, centerY);
                selectedObject.coords.x = newCoords.x;
                selectedObject.coords.y = newCoords.y;
            } else if (selectedObject.type === 'line') {
                const start = rotatePoint(selectedObject.coords.x1, selectedObject.coords.y1, centerX, centerY);
                const end = rotatePoint(selectedObject.coords.x2, selectedObject.coords.y2, centerX, centerY);
                selectedObject.coords.x1 = start.x;
                selectedObject.coords.y1 = start.y;
                selectedObject.coords.x2 = end.x;
                selectedObject.coords.y2 = end.y;
            } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                selectedObject.coords.forEach(point => {
                    const newCoords = rotatePoint(point.x, point.y, centerX, centerY);
                    point.x = newCoords.x;
                    point.y = newCoords.y;
                });
            } else if (selectedObject instanceof Matrix) {
                selectedObject.points.forEach(point => {
                    const newCoords = rotatePoint(point[0], point[1], centerX, centerY);
                    point[0] = newCoords.x;
                    point[1] = newCoords.y;
                });
            }

            updateViewport();
            updateTable();
        } else {
            alert('Valor inválido para o ângulo.');
        }
    } else {
        alert('Nenhum objeto selecionado.');
    }
}

// Função para escalonar um objeto selecionado em relação ao centro do objeto ou à origem
function scaleObject() {
    if (!selectedObject) {
        const name = prompt('Nenhum objeto selecionado. Insira o nome do objeto que deseja selecionar:');
        if (name) {
            selectObjectByName(name);
        }
    }

    if (selectedObject) {
        const scale = parseFloat(prompt('Fator de escalonamento:'));
        const referencePoint = prompt('Escalonar em relação ao "centro" ou "origem"?').toLowerCase();

        if (!isNaN(scale) && scale > 0) {
            let centerX = 0, centerY = 0;

            // Calcula o centro do objeto ou a origem, se for o ponto de referência escolhido
            if (referencePoint === 'centro') {
                if (selectedObject.type === 'point') {
                    centerX = selectedObject.coords.x;
                    centerY = selectedObject.coords.y;
                } else if (selectedObject.type === 'line') {
                    centerX = (selectedObject.coords.x1 + selectedObject.coords.x2) / 2;
                    centerY = (selectedObject.coords.y1 + selectedObject.coords.y2) / 2;
                } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                    selectedObject.coords.forEach(point => {
                        centerX += point.x;
                        centerY += point.y;
                    });
                    centerX /= selectedObject.coords.length;
                    centerY /= selectedObject.coords.length;
                } else if (selectedObject instanceof Matrix) {
                    // A origem é o primeiro ponto na matriz
                    centerX = selectedObject.points[0][0];
                    centerY = selectedObject.points[0][1];
                }
            } else if (referencePoint === 'origem') {
                // Para outros tipos de objetos, a origem é o primeiro ponto
                if (selectedObject.type === 'point') {
                    centerX = selectedObject.coords.x;
                    centerY = selectedObject.coords.y;
                } else if (selectedObject.type === 'line') {
                    centerX = selectedObject.coords.x1;
                    centerY = selectedObject.coords.y1;
                } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                    centerX = selectedObject.coords[0].x;
                    centerY = selectedObject.coords[0].y;
                } else if (selectedObject instanceof Matrix) {
                    centerX = selectedObject.points[0][0];
                    centerY = selectedObject.points[0][1];
                }
            }

            // Função para escalonar um ponto em relação ao centro ou à origem
            const scalePoint = (x, y) => ({
                x: centerX + (x - centerX) * scale,
                y: centerY + (y - centerY) * scale
            });

            // Aplica o escalonamento com base na referência escolhida
            if (selectedObject.type === 'point') {
                const newCoords = scalePoint(selectedObject.coords.x, selectedObject.coords.y);
                selectedObject.coords.x = newCoords.x;
                selectedObject.coords.y = newCoords.y;
            } else if (selectedObject.type === 'line') {
                const newCoords1 = scalePoint(selectedObject.coords.x1, selectedObject.coords.y1);
                const newCoords2 = scalePoint(selectedObject.coords.x2, selectedObject.coords.y2);
                selectedObject.coords.x1 = newCoords1.x;
                selectedObject.coords.y1 = newCoords1.y;
                selectedObject.coords.x2 = newCoords2.x;
                selectedObject.coords.y2 = newCoords2.y;
            } else if (selectedObject.type === 'polyline' || selectedObject.type === 'polygon') {
                selectedObject.coords = selectedObject.coords.map(point => 
                    scalePoint(point.x, point.y)
                );
            } else if (selectedObject instanceof Matrix) {
                selectedObject.points = selectedObject.points.map(point => 
                    [centerX + (point[0] - centerX) * scale, centerY + (point[1] - centerY) * scale]
                );
            }

            updateViewport();
            updateTable();
        } else {
            alert('Valor inválido para o fator de escalonamento.');
        }
    } else {
        alert('Nenhum objeto selecionado.');
    }
}


// Classe para a Matriz
class Matrix {
    constructor(name, points) {
        this.name = name;
        this.points = points.map(point => [...point, 1]); // Adiciona a coordenada w = 1 para cada ponto
        this.type = 'matrix'; // Identificador de tipo para seleção
    }

    drawLines(ctx) {
        if (this.points.length < 2) return; // Precisamos de pelo menos 2 pontos

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
    generateCoordinateInputs(); // Gera os campos de coordenadas
});


// Função para gerar os campos de coordenadas com base no número de pontos
function generateCoordinateInputs() {
    const numPoints = parseInt(prompt("Quantos pontos deseja adicionar? (mínimo 2)"), 10);

    if (isNaN(numPoints) || numPoints < 2) {
        alert('Por favor, insira um número válido para o número de pontos (mínimo 2).');
        return;
    }

    // Limpa quaisquer entradas anteriores
    document.getElementById('coordinate-inputs').innerHTML = '';

    // Gera inputs para coordenadas baseados no número de pontos
    for (let i = 0; i < numPoints; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Coordenadas do Ponto ${i + 1} (x,y)`;
        document.getElementById('coordinate-inputs').appendChild(input);
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
    const points = Array.from(document.querySelectorAll('#coordinate-inputs input')).map(input => {
        const coords = input.value.split(',').map(Number);
        return coords; // [x, y]
    });

    // Verifica se há pelo menos 4 pontos
    if (points.length < 2) {
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
    
    // Fecha o modal
    document.getElementById('matrix-creation-modal').style.display = 'none'; 
    document.getElementById('modal-overlay').style.display = 'none'; 
}


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
    const table = document.getElementById('object-table');
    
    if (!table) {
        console.error("Tabela de objetos não encontrada.");
        return;
    }

    // Verificar se a matriz já está na tabela
    const existingRow = Array.from(table.rows).find(row => row.cells[0].textContent === matrix.name);
    if (existingRow) {
        console.log('Matriz já existe na tabela.');
        return; // Se a matriz já existe, não adicione novamente
    }

    const row = table.insertRow();

    // Nome da matriz
    const nameCell = row.insertCell();
    nameCell.textContent = matrix.name;

    // Tipo de objeto
    const typeCell = row.insertCell();
    typeCell.textContent = matrix.type;

    // Coordenadas da matriz
    const coordsCell = row.insertCell();
    coordsCell.textContent = matrix.points.map(point => `(${point[0]}, ${point[1]})`).join(', ');

    // Define o evento de seleção de objeto
    row.onclick = () => selectObjectFromTable(matrix.name);
}

// Função para selecionar um objeto pelo nome, incluindo matrizes
function selectObjectFromTable(name) {
    const table = document.getElementById('object-table');
    const rows = table.rows;

    // Limpar a seleção de qualquer objeto previamente selecionado
    Array.from(rows).forEach(row => row.classList.remove('selected'));

    // Encontrar o objeto no displayList
    selectedObject = displayList.find(obj => obj.name === name);

    if (selectedObject) {
        // Encontrar a linha correspondente ao objeto e adicionar a classe 'selected'
        const row = Array.from(rows).find(row => row.cells[0].textContent === name);
        if (row) {
            row.classList.add('selected');
        }
        updateTable();  // Atualiza a tabela para destacar o objeto selecionado
    } else {
        alert('Objeto não encontrado.');
    }
}

// Função para atualizar a tabela (caso haja algum outro processamento necessário)
function updateTable() {
    // Exemplo: Atualização de algo na tabela, como re-exibir as matrizes ou outros objetos
    console.log('Tabela atualizada.');
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

// Função para exibir uma matriz no console
function exibirMatriz(matriz) {
    matriz.forEach(linha => {
        console.log(linha.join('\t'));
    });
    console.log('\n');
}

// Matrizes de exemplo
const matrizA = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

const matrizB = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1]
];

console.log("Matriz A:");
exibirMatriz(matrizA);

console.log("Matriz B:");
exibirMatriz(matrizB);

try {
    const resultado = multiplicarMatrizes(matrizA, matrizB);
    console.log("Resultado da multiplicação:");
    exibirMatriz(resultado);
} catch (error) {
    console.error(error.message);
}

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
        ctx.save(); // Salva o estado do contexto para cada objeto

        // Ajusta a transformação de cada objeto se necessário
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
            obj.drawLines(ctx); // Chama o método drawLines da classe Matrix
        }

        ctx.restore(); // Restaura o estado do contexto para o próximo objeto
    });

    ctx.restore(); // Restaura o estado do contexto geral

    // Atualiza a tabela ao final da renderização
    updateTable();
}

// Função para desenhar a matriz com deslocamento e zoom
function drawMatrix(matrix) {
    const cellSize = 30; // Tamanho da célula da matriz

    matrix.coords.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            // Calcula as coordenadas da célula (sem aplicar zoom e offset aqui)
            const x = colIndex * cellSize;
            const y = rowIndex * cellSize;

            // Desenha o retângulo da célula
            ctx.strokeRect(x, y, cellSize, cellSize);

            // Desenha o valor da célula, centralizado
            ctx.fillText(value, x + cellSize / 2, y + cellSize / 2);
        });
    });
}

    
// Função para atualizar a tabela
function updateTable() {
    const tbody = document.querySelector('#object-table tbody');
    tbody.innerHTML = '';  // Limpar a tabela

    displayList.forEach(obj => {
        const row = document.createElement('tr');
        row.dataset.name = obj.name;

        // Destaca a linha se o objeto estiver selecionado
        if (selectedObject && selectedObject.name === obj.name) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }

        const nameCell = document.createElement('td');
        const typeCell = document.createElement('td');
        const coordsCell = document.createElement('td');

        nameCell.textContent = obj.name;
        
        // Verificação e definição do tipo do objeto
        typeCell.textContent = 
            obj.type === 'point' ? 'Ponto' : 
            obj.type === 'line' ? 'Reta' : 
            obj.type === 'polyline' ? 'Polilinha' : 
            obj.type === 'polygon' ? 'Polígono' : 
            obj.type === 'matrix' ? 'Matriz' : 
            'Desconhecido';

        // Formatando coordenadas para cada tipo de objeto
        if (obj.type === 'point') {
            coordsCell.textContent = `(${obj.coords.x}, ${obj.coords.y})`;
        } else if (obj.type === 'line') {
            coordsCell.textContent = `[(${obj.coords.x1}, ${obj.coords.y1}) - (${obj.coords.x2}, ${obj.coords.y2})]`;
        } else if (obj.type === 'polyline' || obj.type === 'polygon') {
            coordsCell.textContent = obj.coords.map(point => `(${point.x}, ${point.y})`).join(' - ');
        } else if (obj.type === 'matrix') {
            coordsCell.textContent = obj.points.map(point => `(${point[0]}, ${point[1]})`).join(' - ');
        } else {
            coordsCell.textContent = 'Coordenadas não disponíveis';
        }

        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(coordsCell);

        // Adiciona evento de clique para selecionar o objeto
        row.addEventListener('click', () => selectObjectFromTable(obj.name));

        tbody.appendChild(row);
    });
}



function handleZoom(event) {
    event.preventDefault();
    const zoomFactor = 0.1; // Fator de zoom
    const oldZoom = zoom; // Salva o nível de zoom anterior

    // Pega as coordenadas do mouse no canvas
    const mousePos = canvasToCartesian(
        event.clientX - canvas.getBoundingClientRect().left,
        event.clientY - canvas.getBoundingClientRect().top
    );

    // Ajusta o nível de zoom
    if (event.deltaY < 0) {
        zoom *= (1 + zoomFactor); // Zoom in
    } else {
        zoom *= (1 - zoomFactor); // Zoom out
    }
    
    // Limita o zoom entre 0.1 e 10
    zoom = Math.max(0.1, Math.min(zoom, 10));

    // Corrige o offset para centralizar o zoom no mouse
    offsetX = mousePos.x - (mousePos.x - offsetX) * (zoom / oldZoom);
    offsetY = mousePos.y - (mousePos.y - offsetY) * (zoom / oldZoom);

    // Atualiza a visualização do canvas
    updateViewport();
}

let isPanning = false;
let startPanX, startPanY;

// Função para iniciar o panning
function startPan(event) {
    isPanning = true;
    // Pega a posição inicial do mouse em relação ao deslocamento atual
    startPanX = event.clientX - offsetX;
    startPanY = event.clientY - offsetY;
}

// Função para executar o panning
function doPan(event) {
    if (isPanning) {
        // Calcula o novo deslocamento com base na posição atual do mouse
        offsetX = event.clientX - startPanX;
        offsetY = event.clientY - startPanY;

        // Atualiza a visualização com o novo deslocamento
        updateViewport();
    }
}

// Função para finalizar o panning
function endPan() {
    isPanning = false; // Finaliza o modo de arrastar
}


// Inicializar o canvas com os eixos
updateViewport();
