//глобальные переменные
var lengthRowInside;  //количество клеток поля в длину без границ
var lengthColumnInside;  //количество клеток поля в высоту без границ
var lengthRow;  //количество клеток поля в длину с учётом границ, размерность рабочего поля = (lengthRow - 2) * (lengthColumn - 2)
var lengthColumn;  //количество клеток поля в высоту с учётом границ, размерность рабочего поля = (lengthRow - 2) * (lengthColumn - 2)
var firstCell;  //номер первой клетки рабочего поля игры
var lastCell;  //номер последней клетки рабочего поля игры
var fieldWidth;  //ширина блока, ограничивающего поле
var timerId;  //таймер итераций
var timerState;  //таймер при длительном наведении мышки на клетку

var createField = document.getElementById('createField');  //кнопка Создать поле
var start = document.getElementById('start');  //кнопка Старт
var stop = document.getElementById('stop');  //кнопка Стоп
var field = document.getElementById('field');  //поле
var elems;  //элементы поля



//события кнопок
createField.addEventListener("click", createFieldForGame);  //создание поля по клику на кнопке
start.addEventListener("click", startGame);  //активация начала игры по клику на кнопке
stop.addEventListener("click", stopGame);  //остановка игры по клику на кнопке



//функции
function createFieldForGame()  //создание поля и инициализация событий мыши до начала игры
{
  if (initializeFieldSizes() == 0)  //присвоение данных и проверка их на корректность
    return;  //данные некорректны, пользователь вводит новые значения
  for (var i = 0; i < lengthRow * lengthColumn; i++)  //создание клеток и границы внутри поля
  {
    var element = document.createElement('div');  //создание узла
    if ((i >= firstCell)  &&  (i <= lastCell)  &&  (i % lengthRow != 0)  &&  (i % lengthRow != (lengthRow - 1)))
      element.className = "alive";  //присвоение начального класса, по умолчанию - живая клетка
    else
      element.className = "edge";  //присвоение границы
    
    field.style.width = fieldWidth + "px";
    element.style.width = ((fieldWidth / lengthRow - 2) + "px");  //размеры ячеек для построения заданного количества в ряд
    element.style.height = element.style.width;
    field.appendChild(element);  //добавление узла в документ
  }
  elems = field.children;  //элементы поля
  
  createField.setAttribute("disabled", "1");  //смена доступных кнопок
  start.removeAttribute("disabled");
  stop.removeAttribute("disabled");
  for (var i = 0; i < elems.length; i++)  //смена состояния клетки до начала игры
  {
    elems[i].addEventListener("click", clickChangeState);
  }
}
function initializeFieldSizes()  //инициализация размеров поля
{
  fieldWidth = 600;  //ширина блока, ограничивающего поле
  field.style.width = fieldWidth + "px";
  if (checkCorrectData() == 0)  //присвоение данных и проверка их на корректность
    return 0;
  lengthRow = lengthRowInside + 2;  //количество клеток поля в длину с учётом границ, размерность рабочего поля = (lengthRow - 2) * (lengthColumn - 2)
  lengthColumn = lengthColumnInside + 2;  //количество клеток поля в высоту с учётом границ, размерность рабочего поля = (lengthRow - 2) * (lengthColumn - 2)
  firstCell = lengthRow + 1;  //номер первой клетки рабочего поля игры
  lastCell = lengthRow*(lengthColumn - 1);  //номер последней клетки рабочего поля игры
  return 1;
}
function checkCorrectData()  //проверка, правильные ли введены данные размеров поля
{
  lengthRowInside = Number(document.getElementById("lengthRowInside").value);  //количество клеток поля в длину без границ
  lengthColumnInside = Number(document.getElementById("lengthColumnInside").value);  //количество клеток поля в высоту без границ
  if (lengthRowInside < 2  ||  lengthRowInside > 100  ||  lengthColumnInside < 2  ||  lengthColumnInside > 100)
  {
    alert("Введены неправильные данные. Ширина и высота поля могут принимать значения только от 2 до 100.");
    return 0;
  }
  return 1;
}



function startGame()  //начало игры
{
  for (var i = 0; i < elems.length; i++)
  {
    elems[i].removeEventListener("click", clickChangeState);  //удаление доступа к изменению состояния клетки после начала игры
    elems[i].addEventListener("mouseover", timerGoes);  //изменение состояния клетки при длительном наведении мышки
    elems[i].addEventListener("mouseout", timerStop);
  }
  timerId = setInterval(iteration, document.getElementById("iterationTime").value*1000);  //запуск итераций
}
function timerGoes()  //установка счётчика времени при наведении мышки на клетку
{
  var t = this;
  this.setAttribute("state-mouse", "on");
  timerState = setTimeout(function() {changeState(t);}, 2000);
}
function timerStop()  //сброс счётчика времени при отводе мышки от клетки
{
  this.setAttribute("state-mouse", "off");
  clearTimeout(timerState);
}

function iteration()  //одна итерация в игре
{
  //old-state хранит прошлые состояния элементов, иначе возникнут конфликты при изменении состояния клетки сразу в поле без проверки остальных
  for (var i = firstCell; i < lastCell; i++)  //проверка каждой клетки поля
  {
    if (elems[i].className == "edge")  //пропуск неигровых клеток границы поля
      continue;
    var count = getAliveNeighbours(i);  //получить количество живых клеток
    if (elems[i].className == "dead"  &&  count == 3)  //клетка оживает при трёх живых соседях
    {
      changeState(elems[i]);
      elems[i].setAttribute("old-state", "dead");
    }
    else if (elems[i].className == "alive"  &&  (count < 2  ||  count > 3))  //клетка погибает при меньше 2 или больше 3 соседей
    {
      changeState(elems[i]);
      elems[i].setAttribute("old-state", "alive");
    }
    else  //если клетки не меняется, то прошлое состояние совпадает с настоящим
    {
      elems[i].setAttribute("old-state", elems[i].className);
    }
  }
}
function clickChangeState()  //функция changeState для обработки событий (чтобы передавалась функция, а не её результат, и очищались заданные события)
{
  changeState(this);
}
function changeState(e)  //изменить состояние клетки
{
  if (e === undefined)
    e = this;
  
  if (e.className == "dead")
  {
    e.className = "alive";
  }
  else if (e.className == "alive")
  {
    e.className = "dead";
  }
}
function getAliveNeighbours(k)  //получить количество живых соседей клетки k
{
  var count = 0;
  for (var j = -1; j < 2; j++)  //проход по столбцам куска поля 3x3 клеток-соседей переданной клетки, включая её саму
  {
    var index = k - lengthRow + j;
    if (elems[index].getAttribute("old-state") == "alive")  //верхний ряд соседей, которые уже могли поменяться
        count++;
    index = k + lengthRow + j;
    if (elems[index].className == "alive")  //нижний ряд соседей, ещё не менялись
      count++;
  }
  if (elems[k - 1].getAttribute("old-state") == "alive")  //средний ряд соседей, левый элемент (состояние могло поменяться)
      count++;
  if (elems[k + 1].className == "alive")  //средний ряд соседей, правый элемент (состояние не менялось)
      count++;
  return count;
}

function stopGame()  //конец игры
{
  clearInterval(timerId);
  for (var i = 0; i < elems.length; i++)
  {
    elems[i].addEventListener("click", clickChangeState);  //открытие доступа к изменению состояния клетки после остановки игры
    elems[i].removeEventListener("mouseover", timerGoes);  //отключение изменения состояния клетки при длительном наведении мышки
    elems[i].removeEventListener("mouseout", timerStop);
  }
}