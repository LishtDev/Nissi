# Barbichou's Secret Garden

Un petit site d'anniversaire statique (HTML, CSS, JavaScript natif) pour Nissi, alias « Barbichou ».
Aucun backend, aucune base de données, aucun suivi, aucune ressource externe (pas de CDN, pas de police web).

Parcours : invitation → « Joyeux anniversaire, Nissi » → galerie de souvenirs → lettre → musique → mini-jeu des étoiles → surprise finale.

## Structure

```
index.html
config/content.js          ← TOUS les textes, la lettre, les photos, les musiques, les messages du jeu
assets/css/style.css
assets/js/app.js           scènes, lettre, finale, ciel étoilé
assets/js/gallery.js       grille + visionneuse
assets/js/music.js         lecteur
assets/js/game.js          mini-jeu
assets/images/photos/      photos et aperçus vidéo
assets/video/              vidéos (mp4)
assets/audio/              musiques (mp3)
```

## 1. Lancer en local

Le plus simple : double-cliquer sur `index.html` (fonctionne directement dans le navigateur).

Avec un petit serveur (recommandé pour tester comme en ligne) :

```bash
cd barbichou-secret-garden
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## 2. Ajouter, retirer, remplacer des photos

1. Copie la photo dans `assets/images/photos/` (JPEG ou WebP, environ 1200 px de large, moins de 400 Ko si possible).
2. Dans `config/content.js`, section `gallery.items`, ajoute une ligne :

```js
{ type: "photo", src: "assets/images/photos/ma-photo.jpg",
  alt: "Description de la photo pour les personnes qui ne la voient pas",
  caption: "Légende affichée sous la photo" },
```

- **Retirer** : supprime la ligne. **Remplacer** : change `src` (et `alt`, `caption`).
- **Vidéo** : `{ type: "video", src: "assets/video/x.mp4", poster: "assets/images/photos/x-poster.jpg", alt: "…", caption: "…" }`
  (mp4 H.264/AAC ; `poster` est l'image d'aperçu).
- Si un fichier est introuvable, un emplacement « Fichier introuvable — à remplacer » apparaît à sa place.
  Si la liste est vide, trois emplacements « Emplacement pour une photo de Nissi » s'affichent. Aucune fausse image n'est jamais montrée.

## 3. Modifier la lettre et les messages

Tout est dans `config/content.js` :

- `letter.greeting`, `letter.paragraphs` (un élément = un paragraphe), `letter.signature`
- `game.stars[].message` (les 5 messages) et leur position (`x`, `y` en % du ciel)
- `finale.title` et `finale.message`
- `invitation`, `birthday`, et tous les boutons.

Les textes sont insérés comme du texte brut (pas de HTML). Garde les guillemets et les virgules.
La lettre actuelle est un texte d'ambiance : relis-la et personnalise-la (aucun souvenir précis n'y a été inventé ; tu peux en ajouter de vrais).

## 4. Ajouter ou changer la musique

Copie des `.mp3` dans `assets/audio/` puis édite `music.tracks` :

```js
tracks: [
  { title: "Nom du morceau", src: "assets/audio/mon-morceau.mp3" }
]
```

La musique ne démarre jamais toute seule : seulement après un clic (bouton « Entrer avec la musique », lecteur ou mini-lecteur).
Une piste manquante est ignorée ; sans aucune piste le site continue normalement.
Pendant la lecture d'une vidéo dans la galerie, la musique se met en pause puis reprend.
Utilise uniquement des morceaux dont tu as les droits ou libres d'utilisation.

## 5. Tests à effectuer (checklist)

Voir `TESTS.md` pour ce qui a été exécuté. Avant de publier, refais à la main sur un vrai téléphone :

- [ ] Entrer, parcourir les 7 scènes, revenir au début.
- [ ] Galerie : agrandir, naviguer (flèches / glissement), Échap, lire les 2 vidéos (avec le son).
- [ ] Lettre : ouvrir, refermer, rouvrir.
- [ ] Musique : lecture, pause, volume, muet, morceau suivant.
- [ ] Jeu : trouver les 5 étoiles (au toucher), recommencer, débloquer la surprise.
- [ ] Surprise : « Revivre la surprise », « Relire la lettre », « Recommencer ».
- [ ] Rotation du téléphone, aucun défilement horizontal.
- [ ] Réglage système « Réduire les animations » activé : tout reste lisible et utilisable.

## 6. Publier

**GitHub Pages**
1. Crée un dépôt (privé ou public) et envoie tout le dossier.
2. Settings → Pages → Source : branche `main`, dossier `/ (root)`.
3. Le site est servi sous `https://<utilisateur>.github.io/<depot>/` (sous-dossier : les chemins sont relatifs, aucun réglage nécessaire).

**Netlify**
1. Sur app.netlify.com : « Add new site » → « Deploy manually » → glisse le dossier du projet.
2. Ou connecte le dépôt (commande de build : aucune ; dossier de publication : `/`).

## 7. Vérifier la version en ligne

- Ouvre l'adresse sur téléphone ET ordinateur, en navigation privée (cache vide).
- Vérifie que les photos, les 2 vidéos et les 4 musiques se chargent (sinon : un chemin ou une majuscule diffère, l'hébergeur distingue majuscules/minuscules).
- Ouvre les outils de développement → Console : aucune erreur rouge.
- Rafraîchis la page au milieu du parcours : tu retrouves ta scène (mémorisée dans l'onglet seulement).

## Confidentialité

- Le site ne collecte rien et n'envoie rien. L'avancée (scène, étoiles trouvées) est gardée dans `sessionStorage` de l'onglet, puis oubliée à sa fermeture.
- Une balise `noindex` demande aux moteurs de recherche de ne pas l'indexer.
- **Attention :** les fichiers d'un site public (photos, vidéos, musiques, textes) sont accessibles à toute personne qui connaît ou devine l'adresse. Un lien « secret » n'est pas une protection. Il n'y a volontairement pas de mot de passe en JavaScript (il serait lisible par tous). Pour une vraie confidentialité, utilise un hébergement avec accès protégé, ou envoie le dossier directement à Nissi.
- Ne publie pas de photos ou vidéos de personnes sans leur accord (la vidéo « Souvenir n° 2 » montre deux personnes).

## Ce qu'il reste à ajouter / valider par toi

- [ ] Autres photos de Nissi (actuellement : la carte d'anniversaire + 2 vidéos).
- [ ] Légendes et descriptions (`alt`) des vidéos (actuellement génériques : « Souvenir n° 1/2 »).
- [ ] Noms réels des 4 morceaux (actuellement « Titre 1 » à « Titre 4 ») et confirmation des droits.
- [ ] Relecture et personnalisation de la lettre et des 5 messages d'étoiles.
- [ ] Accord des personnes visibles dans les vidéos avant toute mise en ligne.
- [ ] Choix de l'hébergement (et décision sur la confidentialité, voir plus haut).
