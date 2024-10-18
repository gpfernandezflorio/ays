window.addEventListener('load', function(e) {
  let juego = AYS.parametroURL('juego');
  if (!esNull(juego)) {
    AYS.redirigir('jugar.html' + location.search);
  }
});