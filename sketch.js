// =========================================================
// ОБНОВЛЕННЫЕ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =========================================================
let tiles = {};

const COLS = 5;
const ROWS = 3;
let tileW, tileH;
const charMap = "0123456789+-*/=";

const UI = {
  eqH: 128,
  eqW: 0,
  nodeH: 90,
  nodeW: 0
};

let currentExample;
let answerInput;
let feedbackMessage = "";
let isSuccess = false;

// Массив для хранения наших кнопок-цифр
let numpadButtons = [];
const keys = ['1','2','3','4','5','6','7','8','9','C','0','OK'];

// =========================================================
// ИНИЦИАЛИЗАЦИЯ И СОЗДАНИЕ ИНТЕРФЕЙСА
// =========================================================
async function setup() {
  createCanvas(windowWidth, windowHeight);

  tiles.base = await loadImage('numbers_1.png');
  tiles.blue = await loadImage('numbers_2.png');
  tiles.red = await loadImage('numbers_3.png'); 
  tiles.green = await loadImage('numbers_4.png');

  tileW = tiles.base.width / COLS;
  tileH = tiles.base.height / ROWS;
  
  UI.eqW = UI.eqH * (tileW / tileH);
  UI.nodeW = UI.nodeH * (tileW / tileH);

  // 1. Поле ввода (в стиле современного приложения)
  answerInput = createInput('');
  answerInput.attribute('readonly', 'true'); 
  answerInput.style('font-size', '56px'); 
  answerInput.style('text-align', 'center');
  answerInput.style('border-radius', '16px');
  answerInput.style('border', '2px solid #ddd');
  answerInput.style('background-color', '#fff');
  answerInput.style('color', '#333');
  answerInput.style('box-shadow', 'inset 0 2px 4px rgba(0,0,0,0.05)'); // Внутренняя тень

  // 2. Создаем 12 красивых кнопок
  for(let i = 0; i < 12; i++) {
    let btn = createButton(keys[i]);
    
    // Базовые стили для всех кнопок
    btn.style('font-size', '48px');
    btn.style('font-weight', 'bold');
    btn.style('cursor', 'pointer');
    btn.style('border-radius', '16px'); // Сильное закругление
    btn.style('border', 'none');
    btn.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)'); // Внешняя тень (объем)
    
    // Раскрашиваем спец-кнопки
    if (keys[i] === 'C') {
      btn.style('background-color', '#ffebee'); // Светло-красный фон
      btn.style('color', '#d32f2f');            // Темно-красный текст
    } else if (keys[i] === 'OK') {
      btn.style('background-color', '#e8f5e9'); // Светло-зеленый фон
      btn.style('color', '#2e7d32');            // Темно-зеленый текст
    } else {
      btn.style('background-color', '#ffffff'); // Белые кнопки для цифр
      btn.style('color', '#333333');
    }

    btn.mousePressed(() => handleKeyPress(keys[i]));
    numpadButtons.push(btn);
  }

  generateRandomExample();
  noLoop();
}

// Обработчик нажатий нашей экранной клавиатуры
function handleKeyPress(k) {
  if (k === 'C') {
    answerInput.value(''); // Очищаем поле
  } else if (k === 'OK') {
    checkAnswer(); // Проверяем ответ
  } else {
    answerInput.value(answerInput.value() + k); // Дописываем цифру
  }
}


// =========================================================
// ГЛАВНЫЙ ЦИКЛ ОТРИСОВКИ
// =========================================================
// =========================================================
// ГЛАВНЫЙ ЦИКЛ ОТРИСОВКИ
// =========================================================
function draw() {
  background(250);
  if (!tiles.base || !currentExample) return;

  // ПРИЖИМАЕМ ВВЕРХ: Отступ теперь всего 0.8 (было 1.5)
  let eqY = UI.eqH * 0.8; 
  let centerX = width / 2;
  
  // Рисуем ТОЛЬКО знак операции строго по центру экрана
  drawNumberCentered(currentExample.op, centerX, eqY, UI.eqH, tiles.base);

  // Даем команду отрисовать деревья
  currentExample.leftTree.draw();
  currentExample.rightTree.draw();

  if (feedbackMessage !== "") {
    textSize(28);
    textAlign(CENTER, CENTER);
    fill(isSuccess ? '#4CAF50' : '#F44336');
    // Текст поднимаем чуть выше
    text(feedbackMessage, centerX, eqY - (UI.eqH * 0.5)); 
  }
}

// =========================================================
// ЛОГИКА ИНТЕРФЕЙСА: ГЕНЕРАЦИЯ И ПРОВЕРКА
// =========================================================

// =========================================================
// ЛОГИКА ИНТЕРФЕЙСА
// =========================================================

function positionUI() {
  let centerX = width / 2;
  
  let gap = 10;
  let inputH = 80;

  // ДЕЛАЕМ КНОПКИ ПРЯМОУГОЛЬНЫМИ:
  // Ширина зависит от экрана (занимаем около 88% ширины в три колонки)
  let btnW = (width * 0.88 - (gap * 2)) / 3; 
  let btnH = btnW*0.65; // Фиксированная высота (меньше ширины — получаются прямоугольники)

  // Высчитываем общую высоту блока клавиатуры (4 ряда прямоугольных кнопок + поле ввода)
  let padHeight = (btnH * 4) + (gap * 3);
  let totalUiHeight = padHeight + gap + inputH;

  // Прижимаем к низу экрана с отступом 20px
  let bottomPadding = 20; 
  let uiStartY = height - totalUiHeight - bottomPadding; 
  
  // Левый край клавиатуры по центру экрана
  let padX = centerX - (btnW * 1.5 + gap); 
  
  // Поле ввода растягиваем ровно по ширине всей клавиатуры
  let inputW = btnW * 3 + gap * 2;
  answerInput.position(padX, uiStartY); 
  answerInput.size(inputW, inputH);
  
  // Расставляем прямоугольные кнопки сеткой 3x4
  let padY = uiStartY + inputH + gap; 
  for(let i = 0; i < 12; i++) {
    let col = i % 3;
    let row = Math.floor(i / 3);
    
    let x = padX + col * (btnW + gap);
    let y = padY + row * (btnH + gap);
    
    numpadButtons[i].position(x, y);
    for(let i = 0; i < 12; i++) {
    let col = i % 3;
    let row = Math.floor(i / 3);
    
    let x = padX + col * (btnW + gap);
    let y = padY + row * (btnH + gap);
    
    numpadButtons[i].position(x, y);
    numpadButtons[i].size(btnW, btnH); // ИСПРАВЛЕНИЕ: вызываем size у конкретной кнопки [i]
  }
  }
}

function generateRandomExample() {
  let isPlus = random([true, false]);
  let a, b, op;

  if (isPlus) {
    op = '+'; a = floor(random(11, 80)); b = floor(random(11, 100 - a));
  } else {
    op = '-'; a = floor(random(21, 99)); b = floor(random(11, a));
  }

  // ПРИЖИМАЕМ ВВЕРХ: Здесь тоже меняем отступ на 0.8
  let eqY = UI.eqH * 0.8;
  currentExample = buildMathTree(a, op, b, eqY); 

  positionUI();
  answerInput.value('');
  feedbackMessage = "";
  isSuccess = false;
  
  answerInput.removeAttribute('disabled');
  for(let btn of numpadButtons) {
    btn.removeAttribute('disabled');
  }
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
  if (currentExample) {
    // ПРИЖИМАЕМ ВВЕРХ: И здесь меняем отступ на 0.8
    let eqY = UI.eqH * 0.8;
    currentExample = buildMathTree(currentExample.a, currentExample.op, currentExample.b, eqY);
  }
  redraw();
}

function checkAnswer() {
  let userAnswer = parseInt(answerInput.value(), 10);
  if (isNaN(userAnswer)) {
    feedbackMessage = "Введи число!";
    isSuccess = false;
    redraw();
    return;
  }

  if (userAnswer === currentExample.result) {
    feedbackMessage = "Правильно! Молодец!";
    isSuccess = true;
    
    // Блокируем клавиатуру после правильного ответа
    answerInput.attribute('disabled', 'true');
    for(let btn of numpadButtons) btn.attribute('disabled', 'true');
    
    setTimeout(generateRandomExample, 1500);
  } else {
    feedbackMessage = "Ошибка. Подумай еще!";
    isSuccess = false;
  }
  redraw(); 
}

// =========================================================
// 4. КЛАСС УЗЛА (Графический элемент)
// =========================================================
class MathNode {
  constructor(value, x, y, img = tiles.base, h = UI.nodeH) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.img = img; 
    this.h = h; 
    this.underline = false; 
    this.children = [];
  }

  addChild(childNode, drawLine = true) {
    this.children.push({ node: childNode, drawLine: drawLine });
  }

  draw() {
    for (let childObj of this.children) {
      if (childObj.drawLine) {
        noFill(); // Отключаем заливку для самой линии
        stroke(120);
        strokeWeight(2);
        
        let y1 = this.y + (this.h * 0.7);
        let y2 = childObj.node.y - (childObj.node.h * 0.7);
        
        // Вычисляем контрольную точку (ровно посередине между цифрами по высоте)
        let cpY = y1 + (y2 - y1) / 2; 
        
        // Рисуем S-образную кривую Безье (половина фигурной скобки)
        // Она идет вниз, плавно изгибается в сторону ребенка и снова идет вниз
        bezier(this.x, y1, this.x, cpY, childObj.node.x, cpY, childObj.node.x, y2);
        
        // Рисуем стрелочку на конце (вместо кружка)
        fill(120);
        noStroke();
        push();
        translate(childObj.node.x, y2+10); // Перемещаем "кисть" в конец линии
        triangle(0, 0, -5, -10, 5, -10); // Рисуем треугольник острием вниз
        pop();
      }
      childObj.node.draw();
    }

    if (this.underline) {
      stroke(120);
      strokeWeight(2);
      let lineW = this.value.length * (this.h * (tileW / tileH)) * 1.2; 
      let lineY = this.y + (this.h * 0.55); 
      line(this.x - lineW / 2, lineY, this.x + lineW / 2, lineY);
    }

    drawNumberCentered(this.value, this.x, this.y, this.h, this.img);
  }
}

// =========================================================
// АЛГОРИТМ-ГЕНЕРАТОР
// =========================================================

function buildMathTree(a, op, b, eqY) {
  let aTens = Math.floor(a / 10);
  let aUnits = a % 10;
  let bTens = Math.floor(b / 10);
  let bUnits = b % 10;

  let stepY = UI.nodeH * 1.25; 
  let firstStepY = UI.nodeH * 2.2; 
  let stepX = UI.nodeW * 1.1; 

  let centerX = width / 2;

  // ВОТ ЭТА СТРОКА ДОЛЖНА БЫТЬ ОБЯЗАТЕЛЬНО:
  let splitX = UI.nodeW * 1.15;
  
  // ИДЕАЛЬНАЯ СИММЕТРИЯ
  // Разносим левое и правое число на одинаковое расстояние от центра (на 2.8 ширины цифры)
  let xA = centerX - (UI.eqW * 2); 
  let xB = centerX + (UI.eqW * 2); 

  let nodeA = new MathNode(a.toString(), xA, eqY, tiles.base, UI.eqH);
  let nodeB = new MathNode(b.toString(), xB, eqY, tiles.base, UI.eqH);

  // ==================== СЛОЖЕНИЕ ====================
  if (op === '+') {
    
    // --- ЛЕВОЕ ДЕРЕВО (A) - ТЕПЕРЬ С УСАМИ ---
    if (aTens > 0) {
      // Если есть единицы, сдвигаем десяток влево. Если круглое число — оставляем по центру.
      let tX = aUnits > 0 ? nodeA.x - stepX : nodeA.x;
      let nA_tens = new MathNode((aTens * 10).toString(), tX, nodeA.y + firstStepY, tiles.blue);
      nodeA.addChild(nA_tens); // Теперь здесь рисуется линия (ус)!
    }
    
    if (aUnits > 0) {
      let nUnitsX = aTens > 0 ? nodeA.x + stepX : nodeA.x;
      let nA_units = new MathNode(aUnits.toString(), nUnitsX, nodeA.y + firstStepY, tiles.green);
      nodeA.addChild(nA_units);
    }

    // --- ПРАВОЕ ДЕРЕВО (B) ---
    let nB_units = null;
    
    if (bTens > 0) {
      let tX = bUnits > 0 ? nodeB.x - stepX : nodeB.x;
      let nB_tens = new MathNode((bTens * 10).toString(), tX, nodeB.y + firstStepY, tiles.blue);
      nodeB.addChild(nB_tens);
    }
    
    if (bUnits > 0) {
      let nUnitsX = bTens > 0 ? nodeB.x + stepX : nodeB.x;
      
      // 1. Проверяем, нужно ли разбивать единицы на усы?
      let isSplitting = (aUnits + bUnits > 10 && aUnits !== 0);
      
      // 2. Если разбиваем, сама цифра обычная. Если нет — она зеленая!
      let bUnitsColor = isSplitting ? tiles.base : tiles.green;
      
      nB_units = new MathNode(bUnits.toString(), nUnitsX, nodeB.y + firstStepY, bUnitsColor);
      nodeB.addChild(nB_units);

      // 3. Рисуем нижние усы только если нужен переход через десяток
      if (isSplitting) {
        let needToTen = 10 - aUnits;         
        let remainder = bUnits - needToTen;  
        
        // Используем резиновый масштаб для усов вместо +70
        let secondStepY = stepY * 1.8; 
        
        let nPart1 = new MathNode(needToTen.toString(), nB_units.x - stepX, nB_units.y + secondStepY, tiles.green);
        let nPart2 = new MathNode(remainder.toString(), nB_units.x + stepX, nB_units.y + secondStepY, tiles.red);
        nB_units.addChild(nPart1);
        nB_units.addChild(nPart2);
      }
    }
  }

  // ==================== ВЫЧИТАНИЕ ====================
  else if (op === '-') {
    if (aUnits < bUnits) {
      // --- СОСТОЯНИЕ 3: Вычитание с переходом ---
      // ==================== ВЫЧИТАНИЕ С ПЕРЕХОДОМ ====================
      let subTens = bTens * 10;
      let part1 = aUnits;
      let part2 = bUnits - aUnits;
      
      let intermediate = a - subTens; // Промежуточный ответ (например, 31)
      let baseTensLeft = intermediate - part1;

      // --- Правое дерево (B) ---
      if (subTens > 0) {
        let nSubTens = new MathNode(subTens.toString(), nodeB.x - stepX, nodeB.y + firstStepY, tiles.blue);
        nodeB.addChild(nSubTens);
      }
      let nUnitsX = subTens > 0 ? nodeB.x + stepX : nodeB.x;
      let unitsColor = (part1 > 0) ? tiles.base : tiles.red;
      let nUnits = new MathNode(bUnits.toString(), nUnitsX, nodeB.y + firstStepY, unitsColor);
      nodeB.addChild(nUnits);

      if (part1 > 0) {
        let whiskersY = nodeB.y + firstStepY + (stepY * 1.8);
        nUnits.addChild(new MathNode(part1.toString(), nUnits.x - splitX, whiskersY, tiles.green));
        nUnits.addChild(new MathNode(part2.toString(), nUnits.x + splitX, whiskersY, tiles.red));
      }

      // --- Левое дерево (A) ---
      let currentNode = nodeA;
      let colY = currentNode.y;

      if (subTens > 0) {
        colY += firstStepY; 
        let n1 = new MathNode(subTens.toString(), currentNode.x, colY, tiles.blue);
        n1.underline = true; // Черта под вычитанием десятков (например, под 60)
        currentNode.addChild(n1, false);
        
        // Рисуем промежуточный ответ (например, 31)
        colY += stepY;
        let nInter = new MathNode(intermediate.toString(), currentNode.x, colY);
        n1.addChild(nInter, false); // Без линии, просто следующий шаг вниз
        
        // ТЕПЕРЬ ОТ 31 РИСУЕМ УСЫ (1 и 30)
        if (part1 > 0) {
          let leftBranchY = colY + (stepY * 1.5);
          
          // Левый ус: единицы (зеленый)
          let nLeftLeaf = new MathNode(part1.toString(), nInter.x - splitX, leftBranchY, tiles.green);
          // Правый ус: оставшиеся десятки (красный) — например, 30
          let nRightLeaf = new MathNode(baseTensLeft.toString(), nInter.x + splitX, leftBranchY, tiles.red);
          
          nInter.addChild(nLeftLeaf, true);  // true включит отрисовку красивой скобки-усика со стрелкой
          nInter.addChild(nRightLeaf, true);
        }
      }

    } else {
      // --- СОСТОЯНИЕ 4: Вычитание без перехода ---
      let subTens = bTens * 10;

      if (subTens > 0) {
        let remainderA = a - subTens;
        let nA_1 = new MathNode(subTens.toString(), nodeA.x, nodeA.y + firstStepY, tiles.blue);
        
        // ИСПРАВЛЕНИЕ 1: Включаем горизонтальную черту в простом вычитании!
        nA_1.underline = true; 
        
        let nA_2 = new MathNode(remainderA.toString(), nodeA.x, nodeA.y + firstStepY + stepY, tiles.green);
        nodeA.addChild(nA_1, false);
        nA_1.addChild(nA_2, false);
      }

      if (subTens > 0) {
        let tX = bUnits > 0 ? nodeB.x - stepX : nodeB.x;
        let nB_tens = new MathNode(subTens.toString(), tX, nodeB.y + firstStepY, tiles.blue);
        nodeB.addChild(nB_tens);
      }

      if (bUnits > 0) {
        let nUnitsX = subTens > 0 ? nodeB.x + stepX : nodeB.x;
        let nB_units = new MathNode(bUnits.toString(), nUnitsX, nodeB.y + firstStepY, tiles.green);
        nodeB.addChild(nB_units);
      }
    }
  }

  return {
    leftTree: nodeA, rightTree: nodeB, a: a, b: b, op: op,
    result: op === '+' ? (a + b) : (a - b)
  };
}

// =========================================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ОТРИСОВКИ ИЗ ТАЙЛМАПА
// =========================================================
function drawNumberCentered(str, centerX, centerY, height, img = tiles.base) {
  let drawWidth = height * (tileW / tileH);
  let totalWidth = str.length * drawWidth;
  let startX = centerX - (totalWidth / 2);

  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') {
      startX += drawWidth / 6;
      continue;
    }
    // Передаем img дальше
    drawChar(str[i], startX + drawWidth / 2, centerY, drawWidth, height, img);
    startX += drawWidth;
  }
}

function drawChar(char, x, y, dw, dh, img = tiles.base) {
  let index = charMap.indexOf(char);
  if (index === -1) return;

  let col = index % COLS;
  let row = Math.floor(index / COLS);
  let sx = col * tileW;
  let sy = row * tileH;

  push();
  imageMode(CENTER);
  // Используем переданный img вместо глобального tilemapBase
  image(img, x, y, dw, dh, sx, sy, tileW, tileH);
  pop();
}
