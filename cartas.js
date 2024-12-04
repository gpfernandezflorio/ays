window.addEventListener('load', function(e) {
  let modo = AYS.parametroURL('modo');
  let y = 160;
  let x = 25;
  for (let arrastrable of document.getElementsByClassName('arrastrable')) {
    x += 110;
    arrastrable.style.top = `${y}px`;
    arrastrable.style.left = `${x}px`;
    arrastrable.style.zIndex = AYS.ZINDEX.idle;
    AYS.posicionesOriginales[arrastrable.id] = {x, y};
    arrastrable.addEventListener('mousedown', function(e) { AYS.empezarArrastre(arrastrable, e); });
    arrastrable.addEventListener('touchstart', function(e) { AYS.empezarArrastre(arrastrable, e); });
  }
  y = 20;
  x = 20;
  for (let soltable of document.getElementsByClassName('soltable')) {
    x += 110;
    soltable.style.top = `${y}px`;
    soltable.style.left = `${x}px`;
  }
  if (modo == 'in') {
    for (let i=1; i<=5; i++) {
      AYS.asignarArrastableASoltable(`a${i}`, `s${i}`);
      AYS.ubicarArrastrableEnSoltable(`a${i}`, `s${i}`);
    }
    // Sobreescribo la función
    AYS.cancelarArrastre = function(div_o_id) {
      let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
      if (div.id in AYS.asignaciones) {
        AYS.ubicarArrastrableEnSoltable(div.id, AYS.asignaciones[div.id]);
      }
    };
  }
});