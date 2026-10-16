/*
 * Barbichou's Secret Garden — Fichier de contenu central
 * ------------------------------------------------------------------
 * C'est LE fichier à modifier pour personnaliser le site.
 * Aucun autre fichier n'a besoin d'être touché pour changer les textes,
 * les légendes, les messages du mini-jeu ou les paramètres de la musique.
 *
 * IMPORTANT : ne note ici que des informations réelles et vérifiées.
 * Ne crée pas de faux souvenirs, de fausses dates ni de fausses anecdotes.
 */
window.CONTENT = {
  /* ── Identité ─────────────────────────────────────────────── */
  profile: {
    prenom: "Nissi",
    surnom: "Barbichou",
    // Année de naissance optionnelle (laisser vide pour ne rien afficher) :
    annee: ""
  },

  /* ── Chapitre 1 : l'invitation ────────────────────────────── */
  invitation: {
    eyebrow: "Une invitation nocturne",
    titre: "Quelqu'un a préparé quelque chose pour toi…",
    // Le prénom et le surnom sont insérés automatiquement.
    texte:
      "Ce jardin secret n'ouvre que pour une personne. Il paraît que c'est toi.",
    bouton: "Entrer dans mon univers",
  },

  /* ── Chapitre 2 : le message d'accueil ───────────────────── */
  accueil: {
    eyebrow: "Pour toi, ce soir",
    texte:
      "Ce soir, le monde peut continuer de tourner comme d'habitude. Mais ici, quelques étoiles ont décidé de briller spécialement pour toi.",
    titre: "Joyeux anniversaire, {prenom}.",
    sousTitre: "Joyeux anniversaire, {surnom}.",
    bouton: "Continuer l'histoire",
  },

  /* ── Chapitre 3 : la galerie des souvenirs ───────────────── */
  /* type: "image" ou "video". Remplacer/augmenter librement.
     - src    : chemin relatif depuis index.html (ex: assets/images/photos/nous.jpg)
     - alt    : description courte (obligatoire pour l'accessibilité)
     - legende: texte affiché sous la vignette
     - poster : (optionnel, vidéos) image d'aperçu
     Les fichiers absents sont remplacés automatiquement par un
     emplacement élégant : le site ne casse jamais. */
  galerie: {
    eyebrow: "Chapitre trois",
    titre: "La galerie des souvenirs",
    intro:
      "Quelques instants précieux. Remplace-les par vos propres souvenirs quand tu veux.",
    // Ouvrir directement à la 1re image manquante ? (false = afficher les emplacements)
    items: [
      {
        id: "carte",
        type: "image",
        src: "assets/images/carte-nissi.png",
        alt: "Carte d'anniversaire créée pour Nissi",
        legende: "La carte d'anniversaire préparée pour toi",
      },
      {
        id: "souvenir-1",
        type: "video",
        src: "assets/media/souvenir-1.mp4",
        poster: "",
        alt: "Vidéo souvenir n°1",
        legende: "Un moment à revoir",
      },
      {
        id: "souvenir-2",
        type: "video",
        src: "assets/media/souvenir-2.mp4",
        poster: "",
        alt: "Vidéo souvenir n°2",
        legende: "Encore un souvenir",
      },
      // Ajoute ici d'autres photos, par exemple :
      // { id:"photo-1", type:"image", src:"assets/images/photos/photo-1.jpg",
      //   alt:"Description de la photo", legende:"Un beau souvenir" },
    ],
    bouton: "Découvrir la lettre",
  },

  /* ── Chapitre 4 : la lettre pour Barbichou ───────────────── */
  /* La lettre est un tableau de paragraphes. Les balises ne sont pas
     interprétées : seuls des sauts de paragraphe sont créés. */
  lettre: {
    eyebrow: "Chapitre quatre",
    titre: "La lettre pour Barbichou",
    sousTitre: "Ouvre l'enveloppe quand tu es prête.",
    boutonOuvrir: "Ouvrir la lettre",
    // {prenom} et {surnom} sont remplacés automatiquement.
    paragraphes: [
      "Chère {prenom},",
      "Il y a des personnes qui traversent une vie en laissant une lumière tranquille derrière elles. Tu es de celles-là. Aujourd'hui je voulais simplement m'arrêter un instant pour te dire à quel point cette amitié compte pour moi.",
      "Merci d'être là, tout simplement. Merci pour la complicité, les fous rires, les silences confortables et ces instants ordinaires qui deviennent précieux quand ils sont partagés.",
      "J'aimerais te souhaiter une année pleine de douceur : du bonheur, une santé solide, des projets qui aboutissent, et cette paix intérieure qui rend tout plus léger. Que la vie t'offre autant que tu donnes aux autres.",
      "J'espère qu'on aura encore beaucoup de moments à partager, de nouvelles histoires à raconter et de souvenirs à construire.",
      "Ce jardin secret est un peu le reflet de ce que tu représentes : discret, sincère, et fait pour ceux qui comptent vraiment.",
    ],
    // Signature : modifie-la librement avant publication.
    signature: "Avec toute mon affection et une amitié qui compte énormément.",
    bouton: "Continuer vers le jeu",
  },

  /* ── La musique (lecteur discret, disponible tout au long) ─ */
  /* Playlist : les morceaux déposés dans assets/audio/ sont enchaînés
     en boucle. Le premier morceau disponible est utilisé automatiquement.
     Si aucun fichier n'est présent, le lecteur affiche un état neutre
     et reste inactif, sans provoquer d'erreur. */
  musique: {
    titre: "Ambiance du jardin",
    pistes: [
      { src: "assets/audio/titre-01.mp3", titre: "Titre 1" },
      { src: "assets/audio/titre-02.mp3", titre: "Titre 2" },
      { src: "assets/audio/titre-03.mp3", titre: "Titre 3" },
      { src: "assets/audio/titre-04.mp3", titre: "Titre 4" },
    ],
    volume: 0.5, // 0 à 1
    boucle: true,
  },

  /* ── Chapitre 6 : le mini-jeu « Les étoiles de Barbichou » ─ */
  jeu: {
    eyebrow: "Chapitre cinq",
    titre: "Les étoiles de Barbichou",
    intro:
      "Cinq étoiles se cachent dans le ciel. Touche-les pour révéler un message. Une étoile s'illumine à chaque fois.",
    consigne: "Touche les étoiles une à une. Aucune limite de temps.",
    bouton: "Révéler la surprise finale",
    boutonRejouer: "Relancer le ciel",
    // Cinq messages associés aux cinq étoiles.
    etoiles: [
      "Que ta journée soit aussi douce qu'un ciel d'été.",
      "Je te souhaite mille raisons de sourire, même les jours gris.",
      "Que tous tes projets trouvent leur chemin, un par un.",
      "Prends soin de toi : ta lumière mérite d'être protégée.",
      "Et surtout : reste exactement cette personne précieuse que tu es.",
    ],
  },

  /* ── Chapitre 7 : la surprise finale ─────────────────────── */
  finale: {
    eyebrow: "La surprise",
    titre: "Barbichou, aujourd'hui est ton jour.",
    texte: [
      "Je te souhaite une vie remplie de raisons de sourire, de rêves qui prennent forme, de personnes qui te veulent sincèrement du bien et de moments qui deviennent de beaux souvenirs.",
      "Que cette nouvelle année t'apporte bien plus que ce que tu oses espérer. Reste cette personne précieuse qui rend l'amitié si belle.",
    ],
    titreFinal: "Joyeux anniversaire, {surnom}.",
    boutonRevoir: "Revoir ma surprise",
  },

  /* ── Navigation / libellés d'accessibilité ───────────────── */
  ui: {
    chapitres: [
      "Invitation",
      "Accueil",
      "Souvenirs",
      "Lettre",
      "Étoiles",
      "Surprise",
    ],
    suivante: "Chapitre suivant",
    precedente: "Chapitre précédent",
    fermerVisionneuse: "Fermer la visionneuse",
    imagePrecedente: "Image précédente",
    imageSuivante: "Image suivante",
    lecteurMusique: "Lecteur de musique",
    jouerMusique: "Lire la musique",
    pauseMusique: "Mettre la musique en pause",
    muetMusique: "Couper le son",
    sonMusique: "Rétablir le son",
    volumeMusique: "Volume de la musique",
    etatLecture: "En lecture",
    etatPause: "En pause",
    etatIndisponible: "Musique non disponible",
    progressionJeu: "Étoiles trouvées : {n} sur {total}",
    messageEtoileTrouvee: "Étoile {n} sur {total} révélée.",
  },
};
                                                                                                                                                                                                                                                                                                                