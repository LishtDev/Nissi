/*
 * ============================================================
 *  BARBICHOU'S SECRET GARDEN — fichier de contenu
 * ============================================================
 *  Tout ce qui est modifiable (textes, lettre, légendes, photos,
 *  musiques, messages du jeu) se trouve ici.
 *
 *  - Les textes sont insérés comme du TEXTE (jamais en HTML).
 *  - Dans la lettre, une ligne vide n'est pas nécessaire :
 *    chaque élément de `paragraphs` est un paragraphe.
 *  - Garde les guillemets "..." et les virgules entre éléments.
 * ============================================================
 */
window.BARBICHOU_CONTENT = {
  recipient: { name: "Nissi", nickname: "Barbichou" },

  /* ---------- SCÈNE 1 — L'invitation secrète ---------- */
  invitation: {
    kicker: "Une invitation",
    title: "Une petite surprise attend une personne très spéciale…",
    button: "Entrer dans mon univers",
    buttonWithMusic: "Entrer avec la musique",
    note: "La musique est facultative : elle ne démarre jamais toute seule."
  },

  /* ---------- SCÈNE 2 — Joyeux anniversaire ---------- */
  birthday: {
    pre: "Joyeux anniversaire,",
    name: "Nissi",
    nicknameLine: "pour toi, Barbichou",
    text: "Aujourd'hui, quelques étoiles brillent spécialement pour toi.",
    button: "Voir les souvenirs"
  },

  /* ---------- SCÈNE 3 — Galerie de souvenirs ----------
   * Pour ajouter une photo : copie-la dans assets/images/photos/
   * puis ajoute une ligne ci-dessous.
   *
   *  type: "photo"  → src (obligatoire), alt (description), caption (légende)
   *  type: "video"  → src (.mp4), poster (image d'aperçu), alt, caption
   *
   * Pour retirer un souvenir : supprime sa ligne.
   * Pour remplacer : change `src` (et `alt`/`caption`).
   * Si un fichier est introuvable, un emplacement clairement
   * identifié « À remplacer » s'affiche à sa place.
   */
  gallery: {
    title: "Galerie de souvenirs",
    intro: "Touche une image pour l'agrandir. Les vidéos se lancent dans la visionneuse.",
    emptyLabel: "Emplacement pour une photo de Nissi",
    brokenLabel: "Fichier introuvable — à remplacer",
    items: [
      {
        type: "photo",
        src: "assets/images/photos/carte-anniversaire.jpg",
        alt: "Carte d'anniversaire pour Nissi : son portrait au milieu de roses roses, avec un poème.",
        caption: "La carte d'anniversaire de Nissi"
      },
      {
        type: "video",
        src: "assets/video/souvenir-1.mp4",
        poster: "assets/images/photos/souvenir-1-poster.jpg",
        alt: "Vidéo souvenir numéro 1.",
        caption: "Souvenir n° 1 (vidéo)"
      },
      {
        type: "video",
        src: "assets/video/souvenir-2.mp4",
        poster: "assets/images/photos/souvenir-2-poster.jpg",
        alt: "Vidéo souvenir numéro 2.",
        caption: "Souvenir n° 2 (vidéo)"
      }
    ],
    button: "Lire ma lettre"
  },

  /* ---------- SCÈNE 4 — La lettre ---------- */
  letter: {
    title: "Une lettre pour Barbichou",
    envelopeHint: "Touche l'enveloppe pour l'ouvrir",
    openLabel: "Ouvrir la lettre pour Barbichou",
    closeButton: "Refermer la lettre",
    greeting: "Chère Nissi, ma Barbichou,",
    paragraphs: [
      "Il y a des amitiés qu'on n'essaie pas d'expliquer. On les reconnaît simplement à la façon dont elles rendent le monde un peu plus doux. La tienne est de celles-là.",
      "Avant toute chose, je voulais te dire merci. Merci d'être cette personne douce, lumineuse et précieuse, et merci de compter dans ma vie. Pouvoir compter sur ton amitié est un cadeau dont je mesure toute la valeur.",
      "Partager de beaux moments avec toi donne aux journées ordinaires une saveur particulière. Tu as ce don rare d'éclairer les instants simples, sans même t'en apercevoir, et c'est une vraie joie de te connaître.",
      "Pour cette nouvelle année, je te souhaite du bonheur, le vrai, celui qui s'installe et qui reste ; une santé solide ; la réussite dans tout ce que tu entreprends ; et une paix profonde, celle qui permet de rêver grand l'esprit tranquille.",
      "J'espère que notre amitié continuera de grandir, comme un jardin dont on prend soin avec patience, avec sincérité et avec beaucoup de lumière.",
      "Joyeux anniversaire, Barbichou."
    ],
    signature: "Avec toute mon affection et une amitié qui compte énormément.",
    button: "Écouter l'ambiance"
  },

  /* ---------- SCÈNE 5 — Musique d'ambiance ----------
   * Les morceaux se trouvent dans assets/audio/. Ajoute, retire ou
   * renomme-les ici. Si un fichier manque, il est simplement ignoré.
   */
  music: {
    title: "Une ambiance pour le jardin",
    intro: "Lance la musique si tu en as envie. Tu peux la couper à tout moment, elle suit le parcours.",
    tracks: [
      { title: "Titre 1", src: "assets/audio/titre-01.mp3" },
      { title: "Titre 2", src: "assets/audio/titre-02.mp3" },
      { title: "Titre 3", src: "assets/audio/titre-03.mp3" },
      { title: "Titre 4", src: "assets/audio/titre-04.mp3" }
    ],
    unavailable: "Aucune piste n'a pu être chargée. Le parcours continue sans musique.",
    button: "Aller chercher les étoiles"
  },

  /* ---------- SCÈNE 6 — Mini-jeu « Les étoiles de Barbichou » ---------- */
  game: {
    title: "Les étoiles de Barbichou",
    intro: "Cinq étoiles se cachent dans le ciel. Touche-les pour découvrir ce qu'elles ont à te dire.",
    hint: "Besoin d'un indice ?",
    reset: "Recommencer",
    idle: "Choisis une étoile dans le ciel.",
    completeText: "Les cinq étoiles forment la constellation de Barbichou.",
    unlockButton: "Débloquer la surprise",
    stars: [
      { x: 16, y: 22, message: "Tu éclaires les journées ordinaires." },
      { x: 78, y: 16, message: "Ta douceur est une vraie force." },
      { x: 48, y: 46, message: "Tes rêves méritent de fleurir." },
      { x: 20, y: 76, message: "Tu es une belle âme, et ça se voit." },
      { x: 82, y: 70, message: "Cette nouvelle année sera à ton image : lumineuse." }
    ]
  },

  /* ---------- SCÈNE 7 — La surprise finale ---------- */
  finale: {
    title: "Barbichou, aujourd'hui est ton jour.",
    message:
      "Je te souhaite une vie remplie de raisons de sourire, de rêves qui prennent forme, de belles surprises et de personnes qui te veulent sincèrement du bien. Que cette nouvelle année t'apporte la paix, la réussite, de merveilleux souvenirs et des joies inattendues. Continue d'avancer à ta manière et de profiter de chaque belle chose que la vie t'offre. Joyeux anniversaire, Barbichou.",
    replay: "Revivre la surprise",
    rereadLetter: "Relire la lettre",
    restart: "Recommencer depuis le début"
  },

  /* ---------- Libellés généraux ---------- */
  ui: {
    back: "Scène précédente",
    home: "Retour au début",
    sceneNames: [
      "Invitation", "Anniversaire", "Souvenirs", "Lettre",
      "Musique", "Étoiles", "Surprise"
    ],
    locked: "Verrouillé : découvre d'abord les cinq étoiles"
  }
};
