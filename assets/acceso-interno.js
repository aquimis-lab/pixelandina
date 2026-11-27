/* PixelAndina · Acceso interno (puerta única a los dos paneles).
   acceso-interno.html: login de Firebase Auth; solo el correo del
   administrador ve las dos puertas (prospectos y clientes). No lee
   Firestore: la seguridad real de cada panel vive en sus reglas. */
(function(){
  "use strict";

  var ADMIN_EMAIL = "tonnylve2@gmail.com";

  var lock = document.getElementById("lockBox");
  var hub = document.getElementById("hubView");
  var denied = document.getElementById("deniedView");
  var lockForm = document.getElementById("lockForm");
  var lockErr = document.getElementById("lockErr");

  function showErr(msg){ if(lockErr){ lockErr.textContent = msg; lockErr.classList.add("show"); } }
  function hideErr(){ if(lockErr){ lockErr.textContent = ""; lockErr.classList.remove("show"); } }

  if(!window.PA_FIREBASE || !window.PA_FIREBASE.auth){
    if(lockForm) lockForm.style.display = "none";
    showErr("La conexión con el acceso no está configurada todavía.");
    return;
  }
  var auth = window.PA_FIREBASE.auth;

  function showOnly(el){
    [lock, hub, denied].forEach(function(x){ if(x) x.style.display = (x === el) ? "block" : "none"; });
  }

  var AUTH_ERRORS = {
    "auth/invalid-credential": "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
    "auth/wrong-password": "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
    "auth/user-not-found": "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
    "auth/invalid-email": "Escribe un correo válido.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    "auth/network-request-failed": "Sin conexión. Revisa tu internet e inténtalo de nuevo."
  };
  if(lockForm){
    lockForm.addEventListener("submit", function(e){
      e.preventDefault();
      hideErr();
      var email = (document.getElementById("loginEmail").value || "").trim();
      var pass = document.getElementById("loginPass").value || "";
      if(!email || !pass){ showErr("Escribe tu correo y tu contraseña."); return; }
      var btn = lockForm.querySelector("button[type='submit']");
      if(btn){ btn.disabled = true; btn.textContent = "Entrando…"; }
      auth.signInWithEmailAndPassword(email, pass).catch(function(err){
        showErr(AUTH_ERRORS[err && err.code] || "No se pudo iniciar sesión. Inténtalo de nuevo.");
      }).then(function(){
        if(btn){ btn.disabled = false; btn.textContent = "Entrar"; }
      });
    });
  }

  auth.onAuthStateChanged(function(user){
    if(!user){ showOnly(lock); return; }
    if((user.email || "").toLowerCase() === ADMIN_EMAIL) showOnly(hub);
    else showOnly(denied);
  });

  ["btnLogout", "btnLogout2"].forEach(function(id){
    var b = document.getElementById(id);
    if(b) b.addEventListener("click", function(){ auth.signOut(); });
  });
})();
