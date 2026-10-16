/* ============================================================
   gallery.js — Galerie des souvenirs + visionneuse accessible
   - Construit la grille à partir de config/content.js
   - Un média absent devient un emplacement élégant (pas d'image cassée)
   - Visionneuse en <dialog> natif : Échap ferme, flèches naviguent
   - Le focus est géré par le dialogue natif ; on le complète.
   ============================================================ */
(function (global) {
  "use strict";

  var BSG = (global.BSG = global.BSG || {});

  // Vide un élément sans jamais injecter de HTML.
  function vider(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function creerGalerie(config, ui) {
    var grille = document.getElementById("galerie-grille");
    var dialog = document.getElementById("visionneuse");
    var media = document.getElementById("visionneuse-media");
    var legende = document.getElementById("visionneuse-legende");
    var compteur = document.getElementById("visionneuse-compteur");
    var fermer = document.getElementById("visionneuse-fermer");
    var prev = document.getElementById("visionneuse-prev");
    var next = document.getElementById("visionneuse-next");

    if (!grille || !dialog) return;

    var items = (config && config.items) || [];
    var indexCourant = 0;

    // --- Construction d'une vignette -------------------------
    function construireVignette(item) {
      var li = document.createElement("li");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vignette";
      btn.setAttribute("aria-label", (item.legende || "") + " — agrandir");

      var contenu;
      if (item.type === "video") {
        contenu = document.createElement("video");
        contenu.className = "vignette__media";
        contenu.muted = true;
        contenu.playsInline = true;
        contenu.preload = "none";
        if (item.poster) contenu.poster = item.poster;
        // Certains navigateurs affichent la 1re image si on charge un peu.
        contenu.addEventListener("loadeddata", function () {
          try { contenu.currentTime = 0.1; } catch (e) { /* ignore */ }
        });
      } else {
        contenu = document.createElement("img");
        contenu.className = "vignette__media";
        contenu.loading = "lazy";
        contenu.decoding = "async";
        contenu.alt = item.alt || "";
      }
      contenu.src = item.src;

      var badge = document.createElement("span");
      badge.className = "vignette__badge";
      badge.textContent = item.type === "video" ? "Vidéo" : "Photo";

      var cap = document.createElement("span");
      cap.className = "vignette__legende";
      cap.textContent = item.legende || "";

      // Gestion d'erreur : le média n'a pas pu être chargé -> emplacement.
      function remplacement() {
        vider(li); // vide le noeud que l'on contrôle nous-mêmes
        var vide = document.createElement("div");
        vide.className = "vignette__vide-texte";
        var strong = document.createElement("strong");
        strong.textContent = "Emplacement libre";
        var p = document.createElement("span");
        p.textContent = (item.legende || "Souvenir à ajouter") +
          " — dépose un fichier nommé « " +
          String(item.src).split("/").pop() + " ».";
        vide.appendChild(strong);
        vide.appendChild(p);
        li.appendChild(vide);
        btn.classList.add("vignette--vide");
        btn.disabled = true;
        btn.removeAttribute("aria-label");
      }

      contenu.addEventListener("error", remplacement);

      btn.appendChild(contenu);
      btn.appendChild(badge);
      btn.appendChild(cap);
      btn.addEventListener("click", function () {
        ouvrir(item);
      });

      li.appendChild(btn);
      grille.appendChild(li);
    }

    items.forEach(construireVignette);

    // --- Ouverture de la visionneuse -------------------------
    function ouvrir(item) {
      // On recalcule l'index dans la liste des items affichables.
      var idx = items.indexOf(item);
      indexCourant = idx >= 0 ? idx : 0;
      rendre();
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }

    function rendre() {
      var item = items[indexCourant];
      if (!item) return;

      // Vide le média précédent (arrête toute lecture vidéo en cours).
      vider(media);

      var el;
      if (item.type === "video") {
        el = document.createElement("video");
        el.controls = true;
        el.playsInline = true;
        el.preload = "metadata";
        el.src = item.src;
        if (item.poster) el.poster = item.poster;
        el.setAttribute("aria-label", item.alt || item.legende || "Vidéo souvenir");
      } else {
        el = document.createElement("img");
        el.src = item.src;
        el.alt = item.alt || item.legende || "";
      }
      media.appendChild(el);

      legende.textContent = item.legende || "";
      if (compteur) {
        compteur.textContent = (indexCourant + 1) + " / " + items.length;
      }

      var multiple = items.length > 1;
      if (prev) prev.disabled = !multiple;
      if (next) next.disabled = !multiple;
    }

    function suivant() {
      indexCourant = (indexCourant + 1) % items.length;
      rendre();
    }
    function precedent() {
      indexCourant = (indexCourant - 1 + items.length) % items.length;
      rendre();
    }

    // --- Commandes -------------------------------------------
    if (fermer) {
      fermer.addEventListener("click", function () { dialog.close(); });
    }
    if (prev) {
      prev.textContent = (ui && ui.imagePrecedente) || "";
      prev.addEventListener("click", precedent);
    }
    if (next) {
      next.textContent = (ui && ui.imageSuivante) || "";
      next.addEventListener("click", suivant);
    }

    // Clic sur le fond (hors contenu) ferme la visionneuse.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });

    // Navigation clavier (Échap est géré nativement par <dialog>).
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); suivant(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); precedent(); }
    });

    // À la fermeture, on purge le média (stoppe la vidéo) et on
    // rend le focus au déclencheur pour ne pas "perdre" l'utilisateur.
    var declencheur = null;
    dialog.addEventListener("close", function () {
      vider(media);
      if (declencheur && typeof declencheur.focus === "function") {
        declencheur.focus();
      }
    });
    grille.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".vignette") : null;
      if (b) declencheur = b;
    });
  }

  BSG.galerie = { creer: creerGalerie };
})(window);
