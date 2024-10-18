window.addEventListener('load', function(e) {
  let y = document.getElementById('paleta').getBoundingClientRect().y;
  for (let arrastrable of document.getElementsByClassName('arrastrable')) {
    y += 20;
    arrastrable.style.top = `${y}px`;
    arrastrable.style.left = '40px';
    arrastrable.style.zIndex = 100;
    AYS.posicionesOriginales[arrastrable.id] = {x:40, y};
    arrastrable.addEventListener('mousedown', function(e) { AYS.empezarArrastre(arrastrable, e); });
  }
});