/* ============================================================
   music.js — Lecteur musical discret et robuste (playlist)
   - Aucune lecture automatique : démarre uniquement sur action.
   - Gère une playlist de plusieurs morceaux (enchaînés, en boucle).
   - Si aucun fichier audio n'est disponible, l'état reste neutre
     et la lecture est désactivée, sans erreur.
   ============================================================ */
(function (global) {
  "use strict";

  var BSG = (global.BSG = global.BSG || {});

  function normaliserPistes(config) {
    // Priorité à une playlist "pistes", sinon repli sur "sources"
    // (utile pour plusieurs formats d'un même morceau).
    var brut = [];
    if (config && Array.isArray(config.pistes) && config.pistes.length) {
      brut = config.pistes;
    } else if (config && Array.isArray(config.sources)) {
      brut = config.sources;
    }
    return brut
      .map(function (p) {
        if (typeof p === "string") return { src: p, titre: "" };
        if (p && p.src) return { src: p.src, titre: p.titre || "" };
        return null;
      })
      .filter(function (p) { return p && p.src; });
  }

  function creerLecteur(config, ui) {
    var racine = document.getElementById("lecteur");
    var bouton = document.getElementById("lecteur-toggle");
    var etat = document.getElementById("lecteur-etat");
    var boutonMuet = document.getElementById("lecteur-muet");
    var volume = document.getElementById("lecteur-volume");
    var audio = document.getElementById("lecteur-audio");

    if (!racine || !bouton || !audio) return null;

    var pistes = normaliserPistes(config);
    var index = 0;
    var disponible = false;
    var boucle = !config || config.boucle !== false;

    function etatTexte(cle) {
      if (ui && ui[cle]) return ui[cle];
      return "";
    }

    function pisteCourante() {
      return pistes[index] || { src: "", titre: "" };
    }

    function rafraichirEtat() {
      var enLecture = !audio.paused && !audio.ended && disponible;
      racine.classList.toggle("est-en-lecture", enLecture);
      bouton.setAttribute("aria-pressed", enLecture ? "true" : "false");
      bouton.setAttribute(
        "aria-label",
        disponible
          ? enLecture
            ? etatTexte("pauseMusique")
            : etatTexte("jouerMusique")
          : etatTexte("etatIndisponible")
      );
      var p = pisteCourante().titre;
      if (etat) {
        etat.textContent = !disponible
          ? ""
          : enLecture
          ? etatTexte("etatLecture")
          : etatTexte("etatPause");
      }
      if (bouton && p) bouton.title = (etatTexte("lecteurMusique") || "Musique") + " : " + p;
    }

    function rendreIndisponible() {
      disponible = false;
      bouton.disabled = true;
      bouton.setAttribute("aria-disabled", "true");
      var details = racine.querySelector(".lecteur__details");
      if (details) details.hidden = true;
      if (etat) etat.textContent = "";
      rafraichirEtat();
    }

    function charger(i) {
      var piste = pistes[i];
      if (!piste) { rendreIndisponible(); return; }
      audio.src = piste.src;
      audio.load();
    }

    function avancer() {
      var n = (index + 1) % pistes.length;
      index = n;
      charger(index);
    }

    var echecs = 0;

    // --- Détection de la disponibilité ----------------------
    audio.addEventListener("loadedmetadata", function () {
      echecs = 0;
      disponible = true;
      bouton.disabled = false;
      bouton.removeAttribute("aria-disabled");
      rafraichirEtat();
    });

    // Un échec : on passe au morceau suivant ; si tout échoue, on
    // rend le lecteur indisponible (sans jamais lever d'erreur).
    audio.addEventListener("error", function () {
      echecs += 1;
      if (echecs >= pistes.length) {
        rendreIndisponible();
        return;
      }
      avancer();
      if (!audio.paused) {
        var p = audio.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      }
    });

    // --- Lecture / pause ------------------------------------
    bouton.addEventListener("click", function () {
      if (!disponible) return;
      if (audio.paused || audio.ended) {
        var p = audio.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () { rafraichirEtat(); });
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", rafraichirEtat);
    audio.addEventListener("pause", rafraichirEtat);

    // Fin d'un morceau : on enchaîne le suivant si la boucle est active.
    audio.addEventListener("ended", function () {
      if (!boucle && index === pistes.length - 1) {
        rafraichirEtat();
        return;
      }
      avancer();
      var p = audio.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    });

    // --- Volume ---------------------------------------------
    var volInitial = config && typeof config.volume === "number" ? config.volume : 0.6;
    audio.volume = Math.min(1, Math.max(0, volInitial));
    if (volume) {
      volume.value = String(audio.volume);
      volume.addEventListener("input", function () {
        audio.volume = Math.min(1, Math.max(0, parseFloat(volume.value)));
        if (audio.volume > 0) audio.muted = false;
        synchroniserMuet();
      });
    }

    // --- Son coupé ------------------------------------------
    function synchroniserMuet() {
      if (!boutonMuet) return;
      var muet = audio.muted || audio.volume === 0;
      boutonMuet.setAttribute("aria-pressed", muet ? "true" : "false");
      boutonMuet.textContent = muet ? etatTexte("sonMusique") : etatTexte("muetMusique");
      boutonMuet.setAttribute(
        "aria-label",
        muet ? etatTexte("sonMusique") : etatTexte("muetMusique")
      );
    }

    if (boutonMuet) {
      boutonMuet.addEventListener("click", function () {
        audio.muted = !audio.muted;
        if (!audio.muted && audio.volume === 0) {
          audio.volume = 0.5;
          if (volume) volume.value = "0.5";
        }
        synchroniserMuet();
      });
    }

    // --- Initialisation -------------------------------------
    if (!pistes.length) {
      rendreIndisponible();
    } else {
      audio.preload = "metadata";
      audio.loop = false; // géré manuellement par la playlist
      charger(0);
    }
    synchroniserMuet();
    rafraichirEtat();

    return {
      montrer: function () {
        racine.hidden = false;
        racine.removeAttribute("aria-hidden");
      },
      estDisponible: function () {
        return disponible;
      },
    };
  }

  BSG.musique = { creer: creerLecteur };
})(window);
