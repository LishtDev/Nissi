# Rapport de tests — Barbichou's Secret Garden

Date : 16/10/2026
Environnement : Linux. Outils disponibles : Python 3.12 (PIL), **QuickJS**,
**Firefox 157 headless**. *Pas de Node.js/npm*, pas de ffmpeg.

> Honnêteté sur les limites : aucun test physique sur un vrai téléphone n'a été
> réalisé (pas d'appareil disponible). Le comportement tactile a été validé par
> les primitives utilisées (boutons natifs, `click`) et le harnais DOM. Les tests
> automatisés ci-dessous ont **réellement été exécutés** ; les résultats sont
> reproductibles avec les scripts décrits en annexe.

---

## A. Tests statiques — 53 vérifications, 0 échec

Exécutés avec `esprima` (analyse syntaxique JS) et `html.parser` (structure HTML) :

- **Syntaxe JavaScript** : `config/content.js`, `music.js`, `gallery.js`,
  `game.js`, `app.js` — tous valides.
- **Extraction et évaluation** de l'objet `window.CONTENT` : OK.
- **HTML** : balises équilibrées, aucune balise laissée ouverte.
- **Identifiants requis** présents : `app`, `visionneuse`, `galerie-grille`,
  `jeu-ciel`, `lecteur`, `lettre-corps`, `progression-liste`, `annonces`.
- **Résolution des `data-content`** : les 38 références pointent vers des clés
  existantes de la config.
- **Existence des ressources** : `assets/images/carte-nissi.png`,
  `assets/media/souvenir-1.mp4`, `assets/media/souvenir-2.mp4` → présentes.
  Les 3 sources audio sont absentes → **toléré** (le site reste fonctionnel).
- **Mini-jeu** : 5 messages d'étoiles (attendu : 5).
- **Sécurité** : aucun `innerHTML`, aucun `eval(`, aucun `document.write`
  dans le JavaScript.
- **CSS** : accolades équilibrées (151 paires).

---

## B. Tests runtime — 46 vérifications, 0 erreur

Exécutés en chargeant **les vrais scripts** dans **QuickJS** (`assets/js/*.js`,
`config/content.js`) avec un **DOM simulé construit à partir du vrai
`index.html`**, puis en simulant tout le parcours utilisateur.

Résultats (tous PASS) :

- 6 chapitres présents ; invitation visible au départ, les 5 autres masqués.
- Titre d'invitation rempli depuis la config.
- Lecteur masqué au départ.
- 6 points de progression ; point 1 actif, point 2 verrouillé.
- Clic « Entrer » → chapitre accueil affiché, marque visible, focus sur le titre.
- « Suivant » → galerie affichée ; 3 médias dans la grille.
- Ouverture de la visionneuse : média chargé, légende affichée, compteur
  « 1 / 3 », flèche → / ← changent l'index, fermeture purge le média.
- Lettre : papier masqué avant ouverture, révélé après clic, enveloppe masquée,
  6 paragraphes, signature présente, bouton suivant visible.
- Mini-jeu : 5 étoiles, bouton finale désactivé, après les 5 clics message
  affiché + bouton activé + progression 5/5 ; « Relancer » réinitialise.
- Finale : chapitre affiché, 2 paragraphes.
- « Revoir ma surprise » → retour à l'invitation.
- **Musique** : 3 erreurs de chargement → bouton **désactivé sans erreur** ;
  puis métadonnées valides → bouton activé ; clic → lecture ; re-clic → pause.
- Mouvement réduit pris en compte (CSS + canvas statique).

---

## C. Test en navigateur réel — Firefox 157 headless

- Page servie via `python3 -m http.server`, chargée par Firefox headless à
  **390×844** (mobile) et **1280×900** (desktop).
- Capture d'écran analysée avec PIL : fond nocturne sombre (dominante
  `#0F1421`, anomalie 4860 couleurs distinctes) confirmant le rendu réel.
- Une copie **temporaire** neutralisant l'animation d'entrée a permis de
  vérifier que le **contenu de la carte s'affiche bien et centré**
  (bandes de texte détectées à y 344-393, 406-455, 489-538, 579-636 sur 900 px).
  La carte reste ensuite normale : le premier rendu sans cette neutralisation
  était simplement capturé pendant l'animation d'apparition (opacité 0).
- **Journal du serveur** : tous les assets JS/CSS/config renvoient **200**.
  Les musiques (`assets/audio/titre-01.mp3` … `titre-04.mp3`) ont été ajoutées
  après ce test et renvoient également **200** ; le lecteur fonctionne en
  dégradation propre si un fichier est absent.
- **Console Firefox** : aucune erreur JavaScript provenant de la page. Les
  messages `services.settings` / `nimbus` observés sont internes à Firefox et
  dus à l'absence de réseau dans l'environnement.

---

## D. Points non couverts par les tests automatiques (limites assumées)

- **Rendu visuel exact** (esthétique, polices, espacements) : non jugé
  objectivement par un automate ; à valider par un relecteur humain.
- **Matériel réel** (iOS Safari, Android Chrome, appareil tactile physique) :
  non testé faute d'appareil.
- **Validation W3C officielle en ligne** : aucun service en ligne disponible
  dans l'environnement ; la structure a été vérifiée hors ligne (balises
  équilibrées, HTML sémantique).
- **Lecture vidéo** : non testée en profondeur (le contenu est en `preload=none`
  et les fichiers fournis n'ont pas été décodés ici).

---

## E. Reproductibilité

Scripts utilisés (hors projet, répertoire temporaire) :

- `/tmp/test_bsg.py` — tests statiques (nécessite `esprima`).
- `/tmp/run_bsg.py` — tests runtime (nécessite `quickjs`).

Test navigateur :
```bash
cd <projet>
python3 -m http.server 8765
firefox --headless --no-remote -profile <profil> \
        --window-size=390,844 --screenshot /tmp/shot.png \
        http://127.0.0.1:8765/index.html
```

---

## F. Conclusion

Toutes les vérifications automatisées passent (53 statiques + 46 runtime, 0 erreur).
Le site se charge sans erreur de page dans un vrai navigateur, dégrade proprement
en l'absence de musique, et les ressources optionnelles manquantes ne bloquent
rien. Les seuls éléments restants sont **personnels** (photos, légendes, relecture
des textes, musique) et sont listés dans le `README.md` (§12).
