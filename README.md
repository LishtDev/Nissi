# Barbichou's Secret Garden 🎂🌙

Un jardin secret sous un ciel étoilé, offert à **Nissi**, alias **Barbichou**,
comme cadeau d'anniversaire numérique : une petite histoire interactive qui se
déroule en six chapitres, de l'invitation à la surprise finale.

Le site est **100 % statique** : HTML5, CSS3 et JavaScript natif. Aucun serveur,
aucune base de données, aucun compte, aucune collecte de données, aucune
dépendance payante. Il se déploie en quelques minutes sur GitHub Pages ou Netlify.

---

## 1. Aperçu de l'expérience

| Chapitre | Contenu |
|---------:|---------|
| 1 | **L'invitation** — écran immersif, ciel étoilé animé, bouton « Entrer dans mon univers ». |
| 2 | **Le message d'accueil** — « Joyeux anniversaire, Nissi / Barbichou. » |
| 3 | **La galerie des souvenirs** — grille responsive + visionneuse accessible. |
| 4 | **La lettre pour Barbichou** — enveloppe à ouvrir, lettre à dérouler. |
| 5 | **Les étoiles de Barbichou** — mini-jeu : révéler 5 étoiles, sans chrono. |
| 6 | **La surprise finale** — scène plus lumineuse, particules dorées, message final. |

Un **lecteur musical discret** (chapitre « musique »), présent après l'entrée,
ne démarre **jamais** tout seul : il faut cliquer sur « lecture ».

---

## 2. Structure du projet

```
Nissi/
├── index.html                  # Page unique, structure sémantique
├── README.md                   # Ce fichier
├── RAPPORT-TESTS.md            # Rapport des vérifications réellement effectuées
├── .gitignore
├── config/
│   └── content.js              # ⭐ TOUS les textes / médias / réglages
├── assets/
│   ├── css/style.css           # Design nocturne responsive
│   ├── js/
│   │   ├── app.js              # Orchestrateur (chapitres, décor, navigation)
│   │   ├── gallery.js          # Galerie + visionneuse
│   │   ├── game.js             # Mini-jeu des étoiles
│   │   └── music.js            # Lecteur musical robuste
│   ├── images/
│   │   ├── carte-nissi.png     # Carte fournie (utilisée dans la galerie)
│   │   ├── favicon.svg
│   │   └── photos/             # ⭐ Dépose ici tes photos (voir LISEZ-MOI.txt)
│   ├── media/                  # Vidéos souvenirs (fournies)
│   └── audio/                  # Musiques (titre-01.mp3 … titre-04.mp3)
└── album/                      # Médias originaux fournis (source)
```

> Pour personnaliser le site, tu n'as en pratique qu'à modifier
> **`config/content.js`** et à déposer tes fichiers dans
> `assets/images/photos/` et `assets/audio/`.

---

## 3. Ouvrir le projet localement

### a) Le plus simple (double-clic)
Ouvre `index.html` dans un navigateur moderne. Le site fonctionne même ouvert
directement depuis le disque (les scripts ne sont pas des modules ES).

### b) Avec un petit serveur local (recommandé pour tester comme en ligne)
```bash
# depuis le dossier du projet
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```
ou, avec Node installé :
```bash
npx serve .
```

---

## 4. Remplacer les photographies

1. Dépose tes fichiers dans `assets/images/photos/` (ou `assets/media/` pour
   les vidéos).
2. Déclare-les dans `config/content.js`, section `galerie.items` :

```js
{ id: "photo-1", type: "image",
  src: "assets/images/photos/photo-1.jpg",
  alt: "Description courte et utile (accessibilité)",
  legende: "Le texte affiché sous la photo" },
```

- `type` vaut `"image"` ou `"video"`.
- `alt` est **obligatoire** pour l'accessibilité.
- Les chemins sont **relatifs** à `index.html` (jamais de `/` au début).
- Un fichier absent ne casse rien : la vignette affiche un **emplacement
  élégant** « Emplacement libre ».

**Conseils performance** : format WebP/AVIF, largeur ≤ 1600 px, garde une
version originale à part. Le chargement est déjà en `loading="lazy"`.

---

## 5. Modifier la lettre et les messages

Tout est dans **`config/content.js`** :

- `invitation`, `accueil` : textes des chapitres 1 et 2.
- `lettre.paragraphes` / `lettre.signature` : la lettre (tableau de paragraphes).
- `finale` : message final.
- `jeu.etoiles` : les 5 messages des étoiles.
- `musique` : réglages du lecteur.
- `ui` : libellés d'accessibilité et progression.

Les jetons `{prenom}` et `{surnom}` sont remplacés automatiquement.

> **Règle importante** : ne mets dans ces textes que des informations réelles.
> Le contenu livré est volontairement **neutre et non biographique** : aucune
> date, anecdote, conversation ou souvenir inventé. Personnalise-le avec ce que
> tu sais vraiment, ou laisse-le tel quel — il reste juste et sincère.

---

## 6. Ajouter une musique autorisée

1. Place une ou plusieurs pistes **libres de droits ou dont tu détiens les
   droits** dans `assets/audio/` (par ex. `titre-01.mp3`, `titre-02.mp3`…).
2. Déclare-les dans `config/content.js` → `musique.pistes`, puis règle le
   `volume` et la `boucle` :

```js
musique: {
  pistes: [
    { src: "assets/audio/titre-01.mp3", titre: "Titre 1" },
    { src: "assets/audio/titre-02.mp3", titre: "Titre 2" },
  ],
  volume: 0.5,
  boucle: true,
},
```

Les morceaux s'enchaînent automatiquement (en boucle). Si aucun fichier n'est
présent, le lecteur affiche un **état neutre**, se désactive proprement et
**le site reste parfaitement utilisable en silence**.

Ne dépose pas de musique protégée sans autorisation.

---

## 7. Tester avant publication

- Ouvre le site et déroule les six chapitres.
- Vérifie la galerie (clic pour agrandir, flèches ←/→, `Échap` pour fermer).
- Vérifie le mini-jeu à la **souris**, au **toucher** et au **clavier**
  (`Tab` puis `Entrée`/`Espace`).
- Ouvre la console du navigateur (F12) : aucune erreur ne doit apparaître.
- Vérifie sur petit écran (≈ 360 px de large) l'absence de défilement horizontal.
- Teste avec « réduire les animations » activé dans le système.

Voir `RAPPORT-TESTS.md` pour la liste exacte des vérifications déjà effectuées.

---

## 8. Publier sur GitHub Pages

```bash
git init
git add .
git commit -m "Barbichou's Secret Garden"
git branch -M main
git remote add origin https://github.com/<utilisateur>/<depot>.git
git push -u origin main
```
Puis, sur GitHub : **Settings → Pages → Build and deployment → Source :
Deploy from a branch**, branche `main`, dossier `/ (root)`, **Save**.
Le site sera à l'adresse :
`https://<utilisateur>.github.io/<depot>/`

> Les chemins du projet sont **relatifs** : le site fonctionne aussi dans un
> sous-répertoire (`/<depot>/`) comme c'est le cas sur GitHub Pages.

---

## 9. Publier sur Netlify

- Méthode simple : va sur <https://app.netlify.com/drop> et **glisse le dossier
  du projet** dans la page. C'est en ligne immédiatement.
- Ou connecte le dépôt Git : **Build command** = (vide),
  **Publish directory** = `.` (racine).

Aucune variable d'environnement n'est nécessaire.

---

## 10. Vérifier les chemins après publication

- Ouvre le site publié et vérifie que **la carte/photo s'affiche** (pas
  d'icône d'image cassée).
- Ouvre la console (F12) : les erreurs réseau 404 éventuelles indiqueront un
  chemin à corriger. Les seuls 404 normaux sont ceux de `assets/audio/*` si tu
  n'as pas ajouté de musique.
- Sur GitHub Pages, le site vit dans un sous-dossier : ne mets **jamais** de
  chemin commençant par `/` dans `config/content.js`.

---

## 11. Accessibilité & confidentialité

- Navigation clavier complète, focus visible, lien d'évitement, `aria-live`,
  respect de `prefers-reduced-motion`, contrastes soignés.
- **Aucune donnée personnelle collectée**, aucun cookie de suivi, aucune
  publicité, aucun `eval()`, aucun script externe.
- ⚠️ Le site est **public** : toute personne ayant le lien peut voir son
  contenu (photos comprises). Le lien n'est **pas** un contrôle d'accès.
  Ne publie des photos qu'avec l'accord de la personne concernée. Aucun
  « mot de passe » côté client n'est proposé, car ce serait trompeur.

---

## 12. Liste des fichiers personnels encore à ajouter

À faire avant l'envoi du cadeau :

- [ ] **Photos** dans `assets/images/photos/` + entrées dans `galerie.items`
      (il y a déjà la carte et les 2 vidéos fournies).
- [ ] **Légendes** adaptées dans `config/content.js`.
- [ ] **Lettre** relue/personnalisée (`lettre.paragraphes`, `lettre.signature`).
- [ ] **Message final** relu (`finale.texte`).
- [ ] **Messages des étoiles** (`jeu.etoiles`) éventuellement adaptés.
- [x] **Musique** dans `assets/audio/` (4 titres fournis, enchaînés en boucle).
- [ ] **Image de partage** (`og:image`) dans `index.html` (optionnel).

Bonne surprise à Barbichou. ✨
