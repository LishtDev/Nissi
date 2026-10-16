/* ============================================================
   game.js — « Les étoiles de Barbichou »
   - 5 étoiles à révéler, sans limite de temps.
   - Fonctionne au clavier (boutons natifs), à la souris et au toucher.
   - Aucun score en ligne, aucune collecte : tout reste local.
   ============================================================ */
(function (global) {
  "use strict";

  var BSG = (global.BSG = global.BSG || {});

  function format(gabarit, remplacements) {
    return String(gabarit || "").replace(/\{(\w+)\}/g, function (m, cle) {
      return Object.prototype.hasOwnProperty.call(remplacements, cle)
        ? remplacements[cle]
        : m;
    });
  }

  function creerJeu(config, ui) {
    var ciel = document.getElementById("jeu-ciel");
    var progression = document.getElementById("jeu-progression");
    var message = document.getElementById("jeu-message");
    var boutonSuivant = document.getElementById("jeu-suivant");
    if (!ciel) return null;

    var messages = (config && config.etoiles) || [];
    var total = messages.length;
    var trouvees = 0;

    // Positions fixes (en %) : lisibles, prévisibles et sans hasard.
    // Celles-ci tiennent compte de la taille des étoiles sur petit écran.
    var positions = [
      { left: 16, top: 28 },
      { left: 46, top: 62 },
      { left: 74, top: 24 },
      { left: 30, top: 74 },
      { left: 80, top: 64 },
    ];

    function majProgression() {
      if (progression) {
        progression.textContent = format(ui && ui.progressionJeu, {
          n: trouvees,
          total: total,
        });
      }
      if (boutonSuivant) boutonSuivant.disabled = trouvees < total;
    }

    function reveler(btn, index) {
      if (btn.classList.contains("est-trouvee")) return;
      btn.classList.add("est-trouvee");
      btn.setAttribute("aria-disabled", "true");
      trouvees += 1;

      if (message) {
        message.textContent = messages[index] || "";
      }
      majProgression();
    }

    function construire() {
      while (ciel.firstChild) ciel.removeChild(ciel.firstChild);
      trouvees = 0;
      if (message) { message.textContent = ""; delete message.dataset.fin; }

      positions.slice(0, total).forEach(function (pos, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "etoile";
        btn.style.left = pos.left + "%";
        btn.style.top = pos.top + "%";
        btn.style.transform = "translate(-50%, -50%)";
        btn.setAttribute(
          "aria-label",
          format(ui && ui.messageEtoileTrouvee, { n: i + 1, total: total })
        );
        btn.addEventListener("click", function () { reveler(btn, i); });
        // La touche Entrée/Espace déclenche le clic natif sur <button>.
        ciel.appendChild(btn);
      });

      majProgression();
    }

    // Bouton « Relancer le ciel » éventuel.
    var rejouer = document.querySelector('[data-action="rejouer-jeu"]');
    if (rejouer) rejouer.addEventListener("click", construire);

    construire();

    return {
      reinitialiser: construire,
    };
  }

  BSG.jeu = { creer: creerJeu, format: format };
})(window);
