# Compte rendu des tests réellement exécutés

Outil : Playwright 1.56 + Chromium headless, serveur `python3 -m http.server`, site servi dans un sous-dossier (`/barbichou-secret-garden/`).
Date : 16/10/2026.

## Parcours complet automatisé (65 vérifications par taille d'écran, toutes réussies)

Tailles : 320×568, 375×667, 390×844 (tactile), 768×1024 (tactile), 1280×800, 1920×1080.

Pour chaque taille : entrée ; transitions entre les 7 scènes ; absence de débordement horizontal à chaque scène ;
3 vignettes de galerie ; visionneuse (ouverture, compteur, flèches clavier, boutons, boucle, piège de focus, Échap,
focus rendu à la vignette) ; lettre (ouvrir, lire, refermer, rouvrir) ; lecteur (lecture réelle d'un mp3 avec compteur qui avance,
muet, volume, morceau suivant, pause) ; indice du jeu ; 5 étoiles + messages ; scène 7 verrouillée avant la fin ;
actualisation de la page (état restauré) ; recommencer le jeu ; déblocage ; message final complet ; « Revivre la surprise » ;
clic pour tout afficher ; « Relire la lettre » ; retour arrière ; retour au début ; « Recommencer » (état remis à zéro) ;
console sans erreur ni avertissement ; aucune réponse HTTP ≥ 400.

## Robustesse et accessibilité (27 vérifications, toutes réussies)

- Fichiers audio en 404 : message d'indisponibilité, boutons désactivés, mini-lecteur masqué, parcours non bloqué, aucune erreur JS.
- Image en 404 : emplacement « Fichier introuvable — à remplacer », exclue de la visionneuse.
- Galerie vide : 3 emplacements clairement identifiés.
- Clavier seul : lien d'évitement, focus visible (3 px), focus déplacé sur le titre de chaque scène, scènes inactives inertes,
  mini-jeu entièrement jouable (Tab/Entrée), focus sur « Débloquer la surprise » à la fin.
- `prefers-reduced-motion: reduce` : scènes, lettre et finale instantanées, tous les mots visibles, aucune animation décorative.
- `sessionStorage` bloqué : le site fonctionne.
- Ouverture directe `file://` : fonctionne sans erreur.
- Les 9 ressources du fichier de configuration répondent 200 sous un sous-dossier ; aucun chemin absolu dans `index.html`.

## Limites (non testé ou non vérifiable ici)

- Seul Chromium a été utilisé : Safari/iOS, Firefox et un vrai téléphone n'ont PAS été testés.
- Le Chromium de test ne lit pas le H.264/AAC : la lecture des deux .mp4 a été testée avec des copies WebM de test
  (logique de la visionneuse, pause de la musique), pas avec les vrais fichiers. Les .mp4 (H.264/AAC, `faststart`) sont lisibles
  par les navigateurs courants, mais à vérifier sur ton téléphone.
- Aucun audit automatisé WCAG/Lighthouse n'a été exécuté ; l'accessibilité a été vérifiée par les contrôles ci-dessus, pas par un audit complet ni avec un lecteur d'écran.
- Les polices web n'ont pas pu être téléchargées dans cet environnement : le site utilise des polices système
  (Georgia/Palatino/Iowan Old Style…). Le rendu typographique varie selon l'appareil.
- Le site n'a pas été déployé.
