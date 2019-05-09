var start = document.getElementById('start');
start.addEventListener("click", startGame);  //активация начала игры по клику на кнопке
var stop = document.getElementById('stop');
stop.addEventListener("click", stopGame);  //остановка игры по клику на кнопке

var elems = document.getElementById('field').children;
for (var i = 0; i < elems.length; i++)  //смена состояния клетки до начала игры
{
  elems[i].addEventListener("click", clickChangeState);
}

var timerId;
var timerState;
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


var sizeField = 6;  //размерность поля с учётом границ, размерность рабочего поля = (sizeField - 2) 
var beginField = sizeField + 1;  //начало рабочего поля игры
var finishField = sizeField*(sizeField - 1);  //конец рабочего поля игры
function iteration()  //одна итерация в игре
{
  var newElems = [];  //массив новых состояний элементов, иначе возникнут конфликты при изменении состояния клетки сразу в поле без проверки остальных
  for (var i = beginField; i < finishField; i++)  //проверка каждой клетки поля
  {
    if (elems[i].className == "edge")
      continue;
    var count = getAliveNeighbours(i);
    if (elems[i].className == "dead"  &&  count == 3)  //клетка оживает при трёх живых соседях
    {
      newElems[i] = 1;
    }
    else if (elems[i].className == "alive"  &&  (count < 2  ||  count > 3))  //клетка погибает при меньше 2 или больше 3 соседей
      newElems[i] = 1;
  }
  for (var i = 0; i < elems.length; i++)  //присвоение изменённых значений каждой клетки поля
  {
    if (newElems[i] == 1)
      changeState(elems[i]);
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
    e.className = "alive";
  else if (e.className == "alive")
    e.className = "dead";
}
function getAliveNeighbours(k)  //получить количество живых соседей клетки k
{
  var count = 0;
  for (var j = -1; j < 2; j++)  //проверка каждой клетки поля
  {
    var index = k - sizeField + j;
    if (elems[index].className == "alive")  //верхний ряд соседей
      count++;
    index = k + j;
    if (elems[index].className == "alive")  //средний ряд соседей
      count++;
    index = k + sizeField + j;
    if (elems[index].className == "alive")  //нижний ряд соседей
      count++;
  }
  if (elems[k].className == "alive")  //вычитание учтённого состояния самой клетки
    count--;
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