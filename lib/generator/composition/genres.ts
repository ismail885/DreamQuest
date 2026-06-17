import type { GenreData, GenreNom } from "./types";

// 9 genres. Chaque genre habille le décor neutre du thème.

export const GENRES: Record<GenreNom, GenreData> = {
  "Science-Fiction": {
    nom: "Science-Fiction",
    habillagesLieu: [
      "{lieu}, reconverti en station orbitale à l'abandon",
      "{lieu}, complexe cybernétique aux circuits éteints",
      "{lieu}, avant-poste colonial perdu aux confins du système",
    ],
    antagonistes: [
      "un androïde de sécurité défaillant",
      "l'IA corrompue du complexe",
      "une milice corporatiste",
      "une forme de vie synthétique inconnue",
    ],
    ambiances: [
      "Les néons de secours de {lieu} clignotent dans un silence de vide spatial.",
      "Dans {decor}, vos scanners captent une signature énergétique qui ne devrait pas exister.",
      "Une alarme lointaine résonne, {lieu} n'a plus vu d'équipage depuis des années.",
    ],
    scenes: [
      "Les portes blindées de {lieu} s'ouvrent sur {decor}. Vos capteurs s'affolent : {antagoniste} a verrouillé les protocoles de survie.",
      "Un signal de détresse vous guide à travers {decor}. L'air se raréfie, et {antagoniste} surveille chaque sas.",
      "L'écran holographique de {lieu} affiche un compte à rebours. Près de {decor}, {antagoniste} bloque l'accès aux données vitales.",
    ],
    choix: [
      ["Pirater le terminal pour ouvrir le sas", "Couper l'alimentation et passer par {decor}"],
      ["Affronter {antagoniste} avec votre arme à énergie", "Récupérer les données avant qu'il vous repère"],
      ["Tenter de raisonner l'IA", "Lancer le protocole d'autodestruction"],
    ],
    consequences: {
      facile: [
        "Le protocole obéit : le sas s'ouvre et vous progressez sans dommage.",
        "Vos boucliers encaissent, vous sortez de {decor} intact, données en main.",
      ],
      normal: [
        "Le sas cède, mais une décharge grille un de vos modules : votre combinaison clignote en orange.",
        "Vous récupérez les données — incomplètes. Une partie a été effacée pendant la fuite.",
      ],
      difficile: [
        "L'IA verrouille {decor} derrière vous : blessé, vous fuyez sans la moitié des données.",
        "{antagoniste} touche votre réacteur dorsal, vous progressez en perdant de l'oxygène.",
      ],
      legendaire: [
        "Le complexe se dépressurise : pour survivre, vous devez sacrifier votre coéquipier resté dans {decor}.",
        "L'IA prend le contrôle de votre combinaison — votre corps ne répond plus tout à fait à vos ordres.",
      ],
    },
    tags: ["science-fiction", "espace", "technologie", "ia", "survie", "futur"],
    enemyTypes: ["human", "elemental"],
    evenements: ["panne_systeme", "depressurisation", "signal_inconnu"],
  },

  Fantasy: {
    nom: "Fantasy",
    habillagesLieu: [
      "{lieu}, forteresse de mages noirs",
      "{lieu}, citadelle elfique frappée d'une malédiction",
      "{lieu}, repaire d'un dragon endormi",
    ],
    antagonistes: [
      "un roi-liche oublié",
      "un sorcier renégat",
      "un dragon affamé",
      "un démon convoqué par mégarde",
    ],
    ambiances: [
      "Une magie ancienne fait vibrer les pierres de {lieu}.",
      "Dans {decor}, des runes brillent faiblement au passage de votre lame.",
      "Le vent porte une mélodie elfique jusqu'à {lieu}, mais nul ne chante plus ici.",
    ],
    scenes: [
      "Vous franchissez {decor} de {lieu}. Une présence magique vous observe : {antagoniste} n'a pas oublié les intrus.",
      "Un grimoire ouvert repose près de {decor}. À peine l'effleurez-vous que {antagoniste} se manifeste.",
      "Les sceaux de {lieu} se brisent un à un. Au cœur de {decor}, {antagoniste} prépare un sortilège dévastateur.",
    ],
    choix: [
      ["Invoquer votre magie pour briser le sceau", "Contourner par {decor}"],
      ["Défier {antagoniste} en duel", "Chercher l'artefact qui pourrait l'affaiblir"],
      ["Forger une alliance avec la créature", "Trancher dans le vif avec votre épée"],
    ],
    consequences: {
      facile: [
        "Votre sort opère : la voie s'ouvre et la magie vous épargne.",
        "L'artefact répond à votre appel, vous traversez {decor} auréolé de lumière.",
      ],
      normal: [
        "Le sceau cède, mais le contrecoup magique vous laisse étourdi pour un long moment.",
        "Vous repoussez {antagoniste} — au prix de votre amulette, brisée dans l'affrontement.",
      ],
      difficile: [
        "La malédiction de {lieu} vous marque : vous fuyez {decor} blessé et privé de vos sorts.",
        "{antagoniste} brise votre arme, vous battez en retraite, désarmé et traqué.",
      ],
      legendaire: [
        "Le sortilège vous engloutit : pour survivre, vous offrez votre force vitale en sacrifice.",
        "{antagoniste} vous corrompt de sa magie noire — une part de vous ne reviendra jamais.",
      ],
    },
    tags: ["fantasy", "magie", "épopée", "dragon", "quête", "héroïque"],
    enemyTypes: ["beast", "demon", "undead"],
    evenements: ["sceau_brise", "rencontre_mystique", "tresor_enchante"],
  },

  Horreur: {
    nom: "Horreur",
    habillagesLieu: [
      "{lieu}, hanté par ce qui n'aurait jamais dû mourir",
      "{lieu}, où chaque mur semble retenir un cri",
      "{lieu}, rongé par une présence invisible",
    ],
    antagonistes: [
      "une chose tapie dans l'obscurité",
      "un spectre qui ne supporte pas les vivants",
      "une entité sans nom ni visage",
      "ce qui rôde derrière les murs",
    ],
    ambiances: [
      "Le silence de {lieu} est si dense qu'il en devient assourdissant.",
      "Dans {decor}, quelque chose bouge — puis s'immobilise dès que vous regardez.",
      "L'odeur de {lieu} vous serre la gorge : ici, la mort n'a pas dit son dernier mot.",
    ],
    scenes: [
      "Vous avancez dans {decor} de {lieu}. Votre lampe faiblit, et {antagoniste} se rapproche dans votre dos.",
      "Un murmure monte de {decor}. Vous voulez fuir, mais {antagoniste} a déjà scellé la sortie.",
      "Les murs de {lieu} suintent. Près de {decor}, {antagoniste} prononce votre nom d'une voix qui n'est pas humaine.",
    ],
    choix: [
      ["Affronter votre peur et avancer dans {decor}", "Vous terrer en retenant votre souffle"],
      ["Allumer ce qui reste de votre lampe", "Suivre le murmure jusqu'à sa source"],
      ["Courir vers la sortie scellée", "Vous retourner pour faire face à {antagoniste}"],
    ],
    consequences: {
      facile: [
        "Votre nerf tient bon : vous traversez {decor} le cœur battant mais indemne.",
        "La présence s'éloigne, vous reprenez votre souffle, vivant.",
      ],
      normal: [
        "Vous échappez à {antagoniste}, mais ce que vous avez vu hantera vos nuits.",
        "La sortie cède — vous laissez derrière vous une partie de votre raison.",
      ],
      difficile: [
        "{antagoniste} vous frôle : glacé d'effroi, vous fuyez {decor} en sang et en larmes.",
        "Piégé dans {lieu}, vous perdez le sens du temps et de votre propre nom.",
      ],
      legendaire: [
        "La chose vous saisit : votre esprit se brise et quelque chose d'autre prend votre place.",
        "Pour échapper à {antagoniste}, vous l'abandonnez à votre compagnon — ses hurlements ne cessent jamais.",
      ],
    },
    tags: ["horreur", "épouvante", "survie", "ténèbres", "folie", "surnaturel"],
    enemyTypes: ["undead", "demon"],
    evenements: ["apparition", "piege_mortel", "perte_de_raison"],
  },

  Policier: {
    nom: "Policier",
    habillagesLieu: [
      "{lieu}, théâtre d'un meurtre encore tiède",
      "{lieu}, où une disparition reste inexpliquée",
      "{lieu}, repaire présumé d'une organisation criminelle",
    ],
    antagonistes: [
      "un suspect trop sûr de lui",
      "un complice dans l'ombre",
      "le commanditaire qui tire les ficelles",
      "un tueur méthodique",
    ],
    ambiances: [
      "Rien n'est laissé au hasard dans {lieu} : chaque détail peut être un indice.",
      "Dans {decor}, une trace discordante attire votre œil d'enquêteur.",
      "Le calme de {lieu} sonne faux, quelqu'un ici sait et se tait.",
    ],
    scenes: [
      "Vous examinez {decor} de {lieu}. Un indice contredit la version officielle, et {antagoniste} vous observe de loin.",
      "Un témoin vous attend près de {decor}. Ses mains tremblent : {antagoniste} l'a peut-être déjà menacé.",
      "Les pièces du puzzle s'assemblent dans {lieu}. Mais {antagoniste} efface ses traces plus vite que vous ne les trouvez.",
    ],
    choix: [
      ["Interroger {antagoniste} sans détour", "Filer discrètement pour le prendre en flagrant délit"],
      ["Analyser l'indice trouvé dans {decor}", "Confronter le témoin à ses contradictions"],
      ["Tendre un piège au coupable", "Rassembler des preuves avant d'agir"],
    ],
    consequences: {
      facile: [
        "L'interrogatoire porte : {antagoniste} se trahit et vous tenez votre piste.",
        "L'indice de {decor} parle de lui-même, l'enquête avance nettement.",
      ],
      normal: [
        "Vous obtenez un aveu partiel, mais {antagoniste} a eu le temps de prévenir les autres.",
        "La preuve est solide — sauf qu'un détail vous a échappé et vous coûtera plus tard.",
      ],
      difficile: [
        "{antagoniste} retourne la situation : compromis, vous perdez l'accès à {lieu}.",
        "Le piège se referme sur vous, blessé, vous voyez le coupable s'enfuir.",
      ],
      legendaire: [
        "Le commanditaire avait un coup d'avance : votre témoin est retrouvé mort dans {decor}.",
        "Pour coincer {antagoniste}, vous devez sacrifier votre couverture — et plus rien ne vous protège.",
      ],
    },
    tags: ["policier", "enquête", "mystère", "crime", "indices", "suspense"],
    enemyTypes: ["human"],
    evenements: ["nouvel_indice", "fausse_piste", "temoin_silencieux"],
  },

  Western: {
    nom: "Western",
    habillagesLieu: [
      "{lieu}, fort abandonné battu par la poussière",
      "{lieu}, bastion d'un hors-la-loi recherché",
      "{lieu}, ville-frontière au shérif corrompu",
    ],
    antagonistes: [
      "un pistolero à la gâchette facile",
      "un chasseur de primes sans pitié",
      "le chef de clan qui règne sur la région",
      "un shérif vendu au plus offrant",
    ],
    ambiances: [
      "Le soleil écrase {lieu}, seule la poussière ose bouger.",
      "Dans {decor}, une silhouette vous toise, la main près du holster.",
      "Le saloon de {lieu} s'est tu d'un coup : votre arrivée n'est pas passée inaperçue.",
    ],
    scenes: [
      "Vous arrivez à {decor} de {lieu}. {antagoniste} crache par terre : la tension monte d'un cran.",
      "Une diligence renversée bloque {decor}. {antagoniste} et ses hommes vous attendaient au tournant.",
      "La cloche de {lieu} sonne midi. Face à vous, dans {decor}, {antagoniste} dégaine lentement.",
    ],
    choix: [
      ["Provoquer {antagoniste} en duel", "Désamorcer la situation par la parole"],
      ["Sauter en selle et fuir par {decor}", "Tenir votre position, fusil en main"],
      ["Rallier les habitants à votre cause", "Régler ça seul, comme un homme de l'Ouest"],
    ],
    consequences: {
      facile: [
        "Plus rapide que lui : {antagoniste} mord la poussière et la région respire.",
        "Vos mots font mouche, on vous laisse traverser {decor} sans une balle.",
      ],
      normal: [
        "Vous l'emportez, mais une balle vous a éraflé l'épaule et le clan retiendra votre visage.",
        "La fuite réussit — au prix de votre cheval, abattu dans {decor}.",
      ],
      difficile: [
        "{antagoniste} dégaine le premier : touché, vous battez en retraite hors de {lieu}.",
        "Les hommes du clan vous encerclent, dépouillé de vos armes, vous fuyez à pied.",
      ],
      legendaire: [
        "L'embuscade tourne au massacre : pour vous en sortir, vous laissez un allié dans {decor}.",
        "Le shérif vous livre au clan, trahi de tous, vous n'avez plus que votre dernière balle.",
      ],
    },
    tags: ["western", "far-west", "duel", "hors-la-loi", "honneur", "désert"],
    enemyTypes: ["human", "beast"],
    evenements: ["duel_au_soleil", "embuscade", "chevauchee"],
  },

  Pirate: {
    nom: "Pirate",
    habillagesLieu: [
      "{lieu}, forteresse côtière à prendre d'assaut",
      "{lieu}, repaire de corsaires niché dans un delta",
      "{lieu}, où dort un trésor maudit",
    ],
    antagonistes: [
      "un capitaine rival assoiffé d'or",
      "la garde de la Couronne",
      "une créature des abysses",
      "le fantôme d'un flibustier trahi",
    ],
    ambiances: [
      "Le sel et la poudre flottent dans l'air de {lieu}.",
      "Dans {decor}, une carte au trésor à moitié effacée attend son lecteur.",
      "Les vagues frappent {lieu}, quelque part, une cloche de naufrage sonne.",
    ],
    scenes: [
      "Vous abordez {decor} de {lieu}. {antagoniste} hisse son pavillon : le combat semble inévitable.",
      "Le coffre repose enfin dans {decor}. Mais {antagoniste} surgit, sabre au clair, pour vous le disputer.",
      "Une tempête pousse votre navire vers {lieu}. Sur {decor}, {antagoniste} compte bien vous envoyer par le fond.",
    ],
    choix: [
      ["Ordonner l'abordage du navire de {antagoniste}", "Négocier un partage du butin"],
      ["Saisir le trésor et fuir par {decor}", "Affronter {antagoniste} pour l'honneur de l'équipage"],
      ["Tenir la barre dans la tempête", "Jeter du lest pour gagner en vitesse"],
    ],
    consequences: {
      facile: [
        "L'abordage est un triomphe : le butin et la gloire sont à vous.",
        "Vous filez avec le coffre, {decor} disparaît dans votre sillage.",
      ],
      normal: [
        "Vous prenez le navire, mais la moitié de votre équipage gît sur le pont.",
        "Le trésor est sauf — une voie d'eau menace pourtant de couler votre navire.",
      ],
      difficile: [
        "{antagoniste} éperonne votre coque : blessé, vous abandonnez le butin dans {decor}.",
        "La tempête vous drosse sur {lieu}, vous perdez votre navire et la moitié de vos hommes.",
      ],
      legendaire: [
        "La malédiction du trésor s'éveille : pour survivre, vous offrez une âme aux abysses.",
        "Acculé, vous faites sauter votre propre soute pour emporter {antagoniste} dans la mort.",
      ],
    },
    tags: ["pirate", "mer", "trésor", "flibuste", "abordage", "aventure"],
    enemyTypes: ["human", "beast", "undead"],
    evenements: ["abordage", "tempete", "tresor_maudit"],
  },

  Cyberpunk: {
    nom: "Cyberpunk",
    habillagesLieu: [
      "{lieu}, reconverti en bunker par la mégacorpo Hélios",
      "{lieu}, gratte-ciel tombé aux mains des gangs des bas-fonds",
      "{lieu}, nœud de données noyé sous les néons",
    ],
    antagonistes: [
      "l'agent corporatiste Voss",
      "le gang des Lames Néon",
      "une IA de surveillance corrompue",
      "un netrunner ennemi mieux équipé que vous",
    ],
    ambiances: [
      "Sous la pluie acide, les néons de {lieu} grésillent comme un avertissement.",
      "Dans {decor}, vos implants captent une fréquence qui n'aurait pas dû exister.",
      "Les drones de {lieu} quadrillent le ciel, chaque pas est enregistré quelque part.",
    ],
    scenes: [
      "Votre interface neurale détecte une backdoor dans {lieu}. Mais {antagoniste} surveille le réseau, et chaque seconde de connexion laisse une trace.",
      "Un fixer vous attend près de {decor}. L'info est juteuse — {antagoniste} la veut tout autant que vous.",
      "Les pare-feu de {lieu} tombent un à un sous votre hack. Dans {decor}, {antagoniste} lance ses ICE contre votre esprit.",
    ],
    choix: [
      ["Forcer la backdoor avant d'être tracé", "Débrancher et passer par {decor}"],
      ["Conclure le deal avec le fixer", "Doubler tout le monde et garder l'info"],
      ["Affronter {antagoniste} dans le cyberespace", "Brûler vos traces et disparaître"],
    ],
    consequences: {
      facile: [
        "Le hack passe net : vous récupérez les données et quelques crédits au passage.",
        "Le deal tient, vous quittez {decor} plus riche et toujours anonyme.",
      ],
      normal: [
        "Vous récupérez les données, mais l'intrusion a grillé un implant — votre interface clignote en rouge.",
        "L'info est bonne, sauf que {antagoniste} connaît désormais votre signature réseau.",
      ],
      difficile: [
        "Tracé : {antagoniste} verrouille les issues et votre implant surchauffe, vous fuyez {decor} blessé.",
        "Le fixer vous trahit, dépouillé de vos crédits, vous êtes recherché dans tout le secteur.",
      ],
      legendaire: [
        "L'IA retourne votre interface contre vous : une partie de votre mémoire est effacée à jamais.",
        "Pour échapper aux ICE, vous sacrifiez la conscience numérique de votre allié restée dans {decor}.",
      ],
    },
    tags: ["cyberpunk", "hacking", "dystopie", "mégacorporation", "implants", "néon"],
    enemyTypes: ["human", "elemental"],
    evenements: ["raid_corporatiste", "panne_reseau", "marche_noir"],
  },

  Mythologique: {
    nom: "Mythologique",
    habillagesLieu: [
      "{lieu}, palais d'un dieu déchu",
      "{lieu}, temple d'une divinité oubliée",
      "{lieu}, où les mortels ne devraient pas marcher",
    ],
    antagonistes: [
      "un dieu jaloux de sa gloire",
      "un titan enchaîné depuis l'aube des temps",
      "un héros maudit par les Parques",
      "un monstre né de la colère divine",
    ],
    ambiances: [
      "Une présence divine fait trembler les colonnes de {lieu}.",
      "Dans {decor}, les offrandes des anciens fidèles n'ont jamais été emportées.",
      "Le ciel au-dessus de {lieu} gronde comme si les dieux retenaient leur souffle.",
    ],
    scenes: [
      "Vous franchissez {decor} de {lieu}. Une épreuve divine vous attend, et {antagoniste} juge déjà votre audace.",
      "Un oracle vous interpelle près de {decor} : la prophétie vous lie à {antagoniste} pour le meilleur ou le pire.",
      "Les portes de {lieu} s'ouvrent sur l'inconnu. Au cœur de {decor}, {antagoniste} exige un tribut de sang.",
    ],
    choix: [
      ["Relever l'épreuve imposée par les dieux", "Implorer la faveur d'une divinité rivale"],
      ["Défier {antagoniste} malgré son rang divin", "Offrir le sacrifice exigé"],
      ["Saisir la relique sacrée de {decor}", "Respecter l'interdit et rebrousser chemin"],
    ],
    consequences: {
      facile: [
        "Les dieux sourient à votre courage : l'épreuve est franchie, leur faveur vous accompagne.",
        "La relique vous accepte, {decor} s'illumine sur votre passage.",
      ],
      normal: [
        "Vous réussissez l'épreuve, mais un dieu mineur vous tient désormais rancune.",
        "La faveur divine a un prix : un an de votre vie offert à l'autel de {lieu}.",
      ],
      difficile: [
        "{antagoniste} châtie votre arrogance : marqué par sa colère, vous fuyez {decor} affaibli.",
        "L'épreuve vous brise, les dieux vous renvoient blessé et privé de leur grâce.",
      ],
      legendaire: [
        "Le tribut est inévitable : pour apaiser {antagoniste}, vous sacrifiez ce que vous aimez le plus.",
        "Vous défiez un dieu et perdez : votre nom est effacé de la mémoire des mortels.",
      ],
    },
    tags: ["mythologie", "dieux", "légende", "héros", "prophétie", "antique"],
    enemyTypes: ["demon", "beast", "elemental"],
    evenements: ["epreuve_divine", "prophetie", "faveur_des_dieux"],
  },

  Romance: {
    nom: "Romance",
    habillagesLieu: [
      "{lieu}, demeure d'un noble au passé mystérieux",
      "{lieu}, refuge d'une rencontre interdite",
      "{lieu}, théâtre d'un amour que tout oppose",
    ],
    antagonistes: [
      "un rival amoureux déterminé",
      "deux familles qui se déchirent",
      "un secret du passé impossible à taire",
      "un serment qui vous enchaîne à un autre",
    ],
    ambiances: [
      "Une douceur mélancolique imprègne chaque pièce de {lieu}.",
      "Dans {decor}, un parfum familier ravive un souvenir qui fait battre votre cœur.",
      "Les lumières de {lieu} tremblent comme l'aveu que vous n'osez pas faire.",
    ],
    scenes: [
      "Vous retrouvez l'être aimé dans {decor} de {lieu}. Mais {antagoniste} se dresse entre vos deux mondes.",
      "Une lettre vous attend près de {decor}. Les mots qu'elle contient pourraient tout changer — ou tout briser à cause de {antagoniste}.",
      "Le bal de {lieu} bat son plein. Dans {decor}, un regard suffit, pourtant {antagoniste} épie le moindre geste.",
    ],
    choix: [
      ["Avouer vos sentiments malgré {antagoniste}", "Taire votre cœur pour protéger l'autre"],
      ["Fuir ensemble loin de {lieu}", "Affronter {antagoniste} et plaider votre cause"],
      ["Sacrifier votre bonheur pour le sien", "Vous battre pour cet amour, quoi qu'il en coûte"],
    ],
    consequences: {
      facile: [
        "Votre aveu est accueilli avec tendresse : deux cœurs ne battent plus que comme un seul.",
        "La fuite réussit, loin de {lieu}, votre amour respire enfin librement.",
      ],
      normal: [
        "L'aveu touche sa cible, mais {antagoniste} jure de ne pas en rester là.",
        "Vous restez unis — au prix d'une rupture avec votre propre famille.",
      ],
      difficile: [
        "{antagoniste} sépare vos chemins : le cœur en miettes, vous quittez {lieu} seul.",
        "Le secret éclate dans {decor}, la confiance se brise et les mots blessent.",
      ],
      legendaire: [
        "Pour sauver l'être aimé, vous renoncez à lui pour toujours et partez sans un adieu.",
        "Le serment l'emporte sur la passion : vous vous condamnez à aimer en silence jusqu'à la fin.",
      ],
    },
    tags: ["romance", "passion", "sentiments", "destin", "amour", "drame"],
    enemyTypes: ["human"],
    evenements: ["rencontre", "aveu", "trahison_du_coeur"],
  },
};
