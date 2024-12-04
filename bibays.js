AYS = {
  ocupados: {},
  asignaciones: {},
  posicionesOriginales: {},
  ZINDEX : {
    idle:100,
    animacion:101,
    arrastrando:102
  }
};

AYS.empezarArrastre = function(div, e) {
  e.preventDefault();
  let rect = div.getBoundingClientRect();
  let x = e.clientX || e.targetTouches[0].pageX;
  let y = e.clientY || e.targetTouches[0].pageY;
  AYS.arrastreActivo = {
    que:div, desde:{left:rect.left, top:rect.top, x, y},
    tamanio: {w:rect.width, h:rect.height}
  };
  div.style.left = `${rect.left}px`;
  div.style.top = `${rect.top}px`;
  div.style.zIndex = AYS.ZINDEX.arrastrando;
  window.addEventListener('mousemove', AYS.arrastrar);
  window.addEventListener('touchmove', AYS.arrastrar);
  window.addEventListener('mouseup', AYS.terminarArrastre);
  window.addEventListener('touchend', AYS.terminarArrastre);
};

AYS.arrastrar = function(e) {
  e.preventDefault();
  let x = e.clientX || e.targetTouches[0].pageX;
  let y = e.clientY || e.targetTouches[0].pageY;
  let que = AYS.arrastreActivo.que;
  let desde = AYS.arrastreActivo.desde;
  let nuevaPosicion = {x: desde.left + x - desde.x, y:desde.top + y - desde.y};
  let soltableCercano = AYS.soltableCercano(nuevaPosicion, AYS.arrastreActivo.tamanio);
  if (esNull(soltableCercano)) {
    AYS.desactivarObjetivo();
  } else {
    nuevaPosicion = AYS.posicionParaSoltar(que, soltableCercano);
    AYS.activarObjetivo(soltableCercano, que);
  }
  que.style.left = `${nuevaPosicion.x}px`;
  que.style.top = `${nuevaPosicion.y}px`;
};

AYS.terminarArrastre = function(e) {
  e.preventDefault();
  let que = AYS.arrastreActivo.que;
  que.style.zIndex = AYS.ZINDEX.idle;
  if ('objetivo' in AYS.arrastreActivo) {
    let objetivo = AYS.arrastreActivo.objetivo;
    if (objetivo.id in AYS.ocupados) {
      let arrastrableAnterior = AYS.ocupados[objetivo.id];
      AYS.quitarEfecto(arrastrableAnterior);
      if (que.id in AYS.asignaciones) {
        let soltableAnterior = AYS.asignaciones[que.id];
        AYS.asignarArrastableASoltable(arrastrableAnterior, soltableAnterior);
        AYS.ubicarArrastrableEnSoltable(arrastrableAnterior, soltableAnterior);
      } else {
        AYS.devolverALaPaleta(arrastrableAnterior);
        delete AYS.ocupados[AYS.asignaciones[arrastrableAnterior]];
        delete AYS.asignaciones[arrastrableAnterior];
      }
    } else if (que.id in AYS.asignaciones) {
      delete AYS.ocupados[AYS.asignaciones[que.id]];
    }
    AYS.asignarArrastableASoltable(que.id, objetivo.id);
  } else {
    AYS.cancelarArrastre(que);
  }
  delete AYS.arrastreActivo;
  window.removeEventListener('mouseup', AYS.terminarArrastre);
  window.removeEventListener('touchend', AYS.terminarArrastre);
  window.removeEventListener('mousemove', AYS.arrastrar);
  window.removeEventListener('touchmove', AYS.arrastrar);
};

AYS.asignarArrastableASoltable = function(arrastrable, soltable) {
  AYS.asignaciones[arrastrable] = soltable;
  AYS.ocupados[soltable] = arrastrable;
};

AYS.mostrarEfecto = function(div_o_id, objetivo) {
  let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
  let contenido = `@keyframes movimiento {from{left:${div.style.left};top:${div.style.top}}to{left:${objetivo.x};top:${objetivo.y}}}`;
  AYS.hojaDeEstilo('animacion_movimiento', contenido);
  div.classList.add('movimiento');
  div.style.zIndex = AYS.ZINDEX.animacion;
};

AYS.quitarEfecto = function(div_o_id) {
  let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
  div.classList.remove('movimiento');
  div.style.zIndex = AYS.ZINDEX.idle;
};

AYS.desactivarObjetivo = function() {
  if ('objetivo' in AYS.arrastreActivo) {
    let objetivo = AYS.arrastreActivo.objetivo;
    if (objetivo.id in AYS.ocupados && AYS.ocupados[objetivo.id] != AYS.arrastreActivo.que.id) {
      AYS.quitarEfecto(AYS.ocupados[objetivo.id]);
    }
    delete AYS.arrastreActivo.objetivo;
  }
};

AYS.activarObjetivo = function(soltable, desde) {
  AYS.arrastreActivo.objetivo = soltable;
  if (soltable.id in AYS.ocupados && AYS.ocupados[soltable.id] != desde.id) {
    let arrastrable = AYS.ocupados[soltable.id];
    let otroObjetivo = desde.id in AYS.asignaciones
      ? AYS.posicionParaSoltar(arrastrable, AYS.asignaciones[desde.id])
      : AYS.posicionOriginal(arrastrable)
    ;
    AYS.mostrarEfecto(arrastrable, otroObjetivo);
  }
};

AYS.cancelarArrastre = function(div_o_id) {
  let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
  if (div.id in AYS.asignaciones) {
    delete AYS.ocupados[AYS.asignaciones[div.id]];
    delete AYS.asignaciones[div.id];
  }
  AYS.devolverALaPaleta(div);
};

AYS.soltableCercano = function(posicion, tamanio) {
  let soltables = document.getElementsByClassName('soltable').filter(
    function(soltable) { return AYS.cercaComoParaSoltar(posicion, tamanio, soltable)}
  );
  return soltables.length > 0 ? soltables.minimo(function(a, b) {
    return distancia(posicion, a.getBoundingClientRect()) <= distancia(posicion, b.getBoundingClientRect()) ? a : b;
  }) : null;
};

AYS.posicionParaSoltar = function(div_o_id_arrastrable, div_o_id_soltable) {
  let arrastrable = typeof div_o_id_arrastrable === 'string' ? document.getElementById(div_o_id_arrastrable) : div_o_id_arrastrable;
  let soltable = typeof div_o_id_soltable === 'string' ? document.getElementById(div_o_id_soltable) : div_o_id_soltable;
  let posicionSoltable = soltable.getBoundingClientRect();
  let posicionArrastrable = arrastrable.getBoundingClientRect();
  return {
    x:posicionSoltable.x+(posicionSoltable.width-posicionArrastrable.width)/2,
    y:posicionSoltable.y+(posicionSoltable.height-posicionArrastrable.height)/2
  };
};

AYS.cercaComoParaSoltar = function(posicion, tamanio, soltable) {
  let posicionSoltable = soltable.getBoundingClientRect();
  let M = 20;
  return Math.abs(posicion.x+tamanio.w/2 - (posicionSoltable.x+posicionSoltable.width/2)) < M
    && Math.abs(posicion.y+tamanio.h/2 - (posicionSoltable.y+posicionSoltable.height/2)) < M;
};

AYS.posicionOriginal = function(div_o_id) {
  let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
  return {
    x:AYS.posicionesOriginales[div.id].x,
    y:AYS.posicionesOriginales[div.id].y
  };
};

AYS.devolverALaPaleta = function(div_o_id) {
  let div = typeof div_o_id === 'string' ? document.getElementById(div_o_id) : div_o_id;
  let posicionOriginal = AYS.posicionOriginal(div.id);
  div.style.left = `${posicionOriginal.x}px`;
  div.style.top = `${posicionOriginal.y}px`;
};

AYS.ubicarArrastrableEnSoltable = function(div_o_id_arrastrable, div_o_id_soltable) {
  let arrastrable = typeof div_o_id_arrastrable === 'string' ? document.getElementById(div_o_id_arrastrable) : div_o_id_arrastrable;
  let soltable = typeof div_o_id_soltable === 'string' ? document.getElementById(div_o_id_soltable) : div_o_id_soltable;
  let nuevaPosicion = AYS.posicionParaSoltar(arrastrable, soltable);
  arrastrable.style.left = `${nuevaPosicion.x}px`;
  arrastrable.style.top = `${nuevaPosicion.y}px`;
};

AYS.hojaDeEstilo = function(clave, contenido) {
  let hoja = document.getElementById(`css_${clave}`);
  if (!esNull(hoja)) {
    hoja.parentNode.removeChild(hoja);
  }
  hoja = document.createElement('style')
  hoja.setAttribute('id', `css_${clave}`);
  hoja.innerHTML = contenido;
  document.body.appendChild(hoja);
};

AYS.parametroURL = function(clave) {
  let url = location.href;
  clave = clave.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
  var regexS = "[\\?&]"+clave+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
};

AYS.redirigir = function(destino) {
  window.location.replace(destino);
};

Array.prototype.minimo = function(opt_comparador=null) {
  let comparador = esNull(opt_comparador) ? function(a, b) { return a <= b ? a : b; } : opt_comparador;
  let resultado = this[0];
  for (let otro of this.slice(1)) {
    resultado = comparador(resultado, otro);
  }
  return resultado;
};

HTMLCollection.prototype.filter = Array.prototype.filter;

function distancia(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))
};

function esNull(expresion) {
  return expresion === null;
};