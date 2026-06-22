import type { GenreData, GenreNom } from "./types";

// 9 genres heroic-fantasy ; chaque genre habille le décor du thème.
export const GENRES: Record<GenreNom, GenreData> = {
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
        "Vous repoussez {antagoniste}, au prix de votre amulette, brisée dans l'affrontement.",
      ],
      difficile: [
        "La malédiction de {lieu} vous marque : vous fuyez {decor} blessé et privé de vos sorts.",
        "{antagoniste} brise votre arme, vous battez en retraite, désarmé et traqué.",
      ],
      legendaire: [
        "Le sortilège vous engloutit : pour survivre, vous offrez votre force vitale en sacrifice.",
        "{antagoniste} vous corrompt de sa magie noire, une part de vous ne reviendra jamais.",
      ],
    },
    tags: ["fantasy", "magie", "épopée", "dragon", "quête", "héroïque"],
    enemyTypes: ["beast", "demon", "undead"],
    evenements: ["sceau_brise", "rencontre_mystique", "tresor_enchante"],
  },

  "Dark Fantasy": {
    nom: "Dark Fantasy",
    habillagesLieu: [
      "{lieu}, hanté par ce qui n'aurait jamais dû mourir",
      "{lieu}, où chaque mur semble retenir un cri",
      "{lieu}, rongé par une malédiction sans nom",
    ],
    antagonistes: [
      "une chose tapie dans l'obscurité",
      "un spectre qui ne supporte pas les vivants",
      "un seigneur mort-vivant assoiffé d'âmes",
      "ce qui rôde derrière les murs",
    ],
    ambiances: [
      "Le silence de {lieu} est si dense qu'il en devient assourdissant.",
      "Dans {decor}, quelque chose bouge, puis s'immobilise dès que vous regardez.",
      "L'odeur de {lieu} vous serre la gorge : ici, la mort n'a pas dit son dernier mot.",
    ],
    scenes: [
      "Vous avancez dans {decor} de {lieu}. Votre torche faiblit, et {antagoniste} se rapproche dans votre dos.",
      "Un murmure monte de {decor}. Vous voulez fuir, mais {antagoniste} a déjà scellé la sortie.",
      "Les murs de {lieu} suintent une sève noire. Près de {decor}, {antagoniste} prononce votre nom d'une voix qui n'est pas humaine.",
    ],
    choix: [
      ["Affronter votre peur et avancer dans {decor}", "Vous terrer en retenant votre souffle"],
      ["Brandir votre torche pour repousser les ombres", "Suivre le murmure jusqu'à sa source"],
      ["Courir vers la sortie scellée", "Vous retourner pour faire face à {antagoniste}"],
    ],
    consequences: {
      facile: [
        "Votre nerf tient bon : vous traversez {decor} le cœur battant mais indemne.",
        "La présence s'éloigne, vous reprenez votre souffle, vivant.",
      ],
      normal: [
        "Vous échappez à {antagoniste}, mais ce que vous avez vu hantera vos nuits.",
        "La sortie cède, vous laissez derrière vous une partie de votre raison.",
      ],
      difficile: [
        "{antagoniste} vous frôle : glacé d'effroi, vous fuyez {decor} en sang.",
        "Piégé dans {lieu}, vous perdez le sens du temps et de votre propre nom.",
      ],
      legendaire: [
        "La chose vous saisit : votre esprit se brise et quelque chose d'autre prend votre place.",
        "Pour échapper à {antagoniste}, vous l'abandonnez à votre compagnon, ses hurlements ne cessent jamais.",
      ],
    },
    tags: ["dark-fantasy", "ténèbres", "malédiction", "morts-vivants", "épouvante", "survie"],
    enemyTypes: ["undead", "demon"],
    evenements: ["apparition", "piege_mortel", "perte_de_raison"],
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

  Flibuste: {
    nom: "Flibuste",
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
        "Le trésor est sauf, une voie d'eau menace pourtant de couler votre navire.",
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
    tags: ["flibuste", "corsaires", "mer", "trésor", "abordage", "aventure"],
    enemyTypes: ["human", "beast", "undead"],
    evenements: ["abordage", "tempete", "tresor_maudit"],
  },

  "Intrigue de Cour": {
    nom: "Intrigue de Cour",
    habillagesLieu: [
      "{lieu}, théâtre d'un complot contre la couronne",
      "{lieu}, où un noble a été retrouvé sans vie",
      "{lieu}, nid d'espions au service de maisons rivales",
    ],
    antagonistes: [
      "un conseiller à l'ambition dévorante",
      "un maître-espion dans l'ombre",
      "le grand chambellan qui tire les ficelles",
      "une dame de cour au sourire empoisonné",
    ],
    ambiances: [
      "Sous les lustres de {lieu}, chaque révérence cache une lame.",
      "Dans {decor}, un sceau brisé trahit une lettre que nul ne devait lire.",
      "Le calme de {lieu} sonne faux : ici, on murmure plus qu'on ne parle.",
    ],
    scenes: [
      "Vous arpentez {decor} de {lieu}. Un indice contredit la version officielle, et {antagoniste} vous observe par-dessus son éventail.",
      "Un valet effrayé vous attend près de {decor}. Il sait quelque chose, mais {antagoniste} l'a déjà menacé.",
      "Les pièces du complot s'assemblent dans {lieu}. Mais {antagoniste} efface ses traces plus vite que vous ne les découvrez.",
    ],
    choix: [
      ["Confondre {antagoniste} devant la cour", "Le filer discrètement jusqu'à son commanditaire"],
      ["Déchiffrer la lettre cachée dans {decor}", "Soudoyer le témoin pour qu'il parle"],
      ["Tendre un piège au traître", "Réunir des preuves avant de frapper"],
    ],
    consequences: {
      facile: [
        "Votre joute verbale porte : {antagoniste} se trahit devant témoins.",
        "La lettre de {decor} parle d'elle-même, le complot se dévoile.",
      ],
      normal: [
        "Vous arrachez un demi-aveu, mais {antagoniste} a eu le temps d'alerter ses alliés.",
        "La preuve est solide, sauf qu'un détail vous a échappé et vous coûtera plus tard.",
      ],
      difficile: [
        "{antagoniste} retourne la cour contre vous : déshonoré, vous perdez l'accès à {lieu}.",
        "Le piège se referme sur vous, une dague vous frôle dans {decor} avant que le traître ne s'enfuie.",
      ],
      legendaire: [
        "Le commanditaire avait un coup d'avance : votre témoin est retrouvé mort dans {decor}.",
        "Pour démasquer {antagoniste}, vous sacrifiez votre nom, et plus aucune maison ne vous protège.",
      ],
    },
    tags: ["intrigue", "complot", "espionnage", "cour", "mystère", "trahison"],
    enemyTypes: ["human", "undead"],
    evenements: ["complot_devoile", "fausse_piste", "temoin_silencieux"],
  },

  "Marches Sauvages": {
    nom: "Marches Sauvages",
    habillagesLieu: [
      "{lieu}, avant-poste battu par les vents de la frontière",
      "{lieu}, repaire d'un hors-la-loi recherché",
      "{lieu}, bourg-frontière sous la coupe d'un seigneur de guerre",
    ],
    antagonistes: [
      "un chef de bande à la hache facile",
      "un chasseur de primes sans pitié",
      "le seigneur pillard qui règne sur les marches",
      "un capitaine de mercenaires vendu au plus offrant",
    ],
    ambiances: [
      "Le vent balaie {lieu}, seule la poussière ose bouger.",
      "Dans {decor}, une silhouette vous toise, la main près de la garde.",
      "La taverne de {lieu} s'est tue d'un coup : votre arrivée n'est pas passée inaperçue.",
    ],
    scenes: [
      "Vous arrivez à {decor} de {lieu}. {antagoniste} crache par terre : la tension monte d'un cran.",
      "Un chariot renversé bloque {decor}. {antagoniste} et ses hommes vous attendaient au tournant.",
      "La cloche de {lieu} sonne midi. Face à vous, dans {decor}, {antagoniste} dégaine lentement sa lame.",
    ],
    choix: [
      ["Provoquer {antagoniste} en duel", "Désamorcer la situation par la parole"],
      ["Sauter en selle et fuir par {decor}", "Tenir votre position, arc bandé"],
      ["Rallier les habitants à votre cause", "Régler ça seul, à la pointe de l'épée"],
    ],
    consequences: {
      facile: [
        "Plus vif que lui : {antagoniste} mord la poussière et les marches respirent.",
        "Vos mots font mouche, on vous laisse traverser {decor} sans une flèche.",
      ],
      normal: [
        "Vous l'emportez, mais une lame vous a éraflé l'épaule et la bande retiendra votre visage.",
        "La fuite réussit, au prix de votre monture, abattue dans {decor}.",
      ],
      difficile: [
        "{antagoniste} frappe le premier : touché, vous battez en retraite hors de {lieu}.",
        "Les hommes du seigneur vous encerclent, dépouillé de vos armes, vous fuyez à pied.",
      ],
      legendaire: [
        "L'embuscade tourne au massacre : pour vous en sortir, vous laissez un allié dans {decor}.",
        "Le bourgmestre vous livre à la bande, trahi de tous, il ne vous reste que votre dernière flèche.",
      ],
    },
    tags: ["marches", "frontière", "hors-la-loi", "duel", "honneur", "aventure"],
    enemyTypes: ["human", "beast"],
    evenements: ["duel_a_l_aube", "embuscade", "chevauchee"],
  },

  "Conte Féerique": {
    nom: "Conte Féerique",
    habillagesLieu: [
      "{lieu}, baigné d'une lumière qui n'appartient pas à ce monde",
      "{lieu}, où le voile entre les royaumes s'amincit",
      "{lieu}, demeure d'un esprit lié par un ancien pacte",
    ],
    antagonistes: [
      "une reine des fées capricieuse",
      "un esprit lié par un serment rompu",
      "un sorcier qui collectionne les souvenirs",
      "une créature née d'un vœu corrompu",
    ],
    ambiances: [
      "Une douceur enchantée flotte sur {lieu}, mais toute féerie a son prix.",
      "Dans {decor}, des lucioles dessinent un chemin que vous n'aviez pas vu.",
      "Les lumières de {lieu} tremblent comme une promesse qu'on n'ose pas formuler.",
    ],
    scenes: [
      "Vous pénétrez dans {decor} de {lieu}. Un pacte ancien s'éveille, et {antagoniste} attend que vous prononciez le mauvais mot.",
      "Une offrande vous attend près de {decor}. L'accepter pourrait tout changer, ou vous lier à {antagoniste} pour toujours.",
      "Le bal des esprits de {lieu} bat son plein. Dans {decor}, un seul faux pas et {antagoniste} réclamera son dû.",
    ],
    choix: [
      ["Accepter le pacte malgré {antagoniste}", "Refuser et chercher une autre voie"],
      ["Suivre le sentier de lucioles", "Briser l'enchantement de {decor}"],
      ["Offrir un souvenir cher en échange", "Vous battre pour reprendre ce qui vous a été pris"],
    ],
    consequences: {
      facile: [
        "Le pacte vous est favorable : la féerie vous ouvre {decor} en souriant.",
        "L'enchantement se dissipe, vous quittez {lieu} le cœur léger et béni.",
      ],
      normal: [
        "Le vœu s'exauce, mais {antagoniste} jure de réclamer son tribut tôt ou tard.",
        "Vous traversez {decor} indemne, au prix d'un souvenir précieux à jamais effacé.",
      ],
      difficile: [
        "{antagoniste} retourne la magie contre vous : égaré, vous errez dans {decor} sans repère.",
        "Le pacte se referme comme un piège, vous quittez {lieu} marqué d'une dette féerique.",
      ],
      legendaire: [
        "Pour rompre le sortilège, vous renoncez à ce qui vous est le plus cher, sans retour possible.",
        "Le serment l'emporte : {antagoniste} vous garde à sa cour pour cent ans et un jour.",
      ],
    },
    tags: ["féerie", "enchantement", "pacte", "esprits", "merveilleux", "destin"],
    enemyTypes: ["beast", "elemental"],
    evenements: ["pacte_feerique", "don_enchante", "serment_brise"],
  },

  "Épopée Guerrière": {
    nom: "Épopée Guerrière",
    habillagesLieu: [
      "{lieu}, place forte assiégée depuis des mois",
      "{lieu}, dernier bastion avant la chute du royaume",
      "{lieu}, champ de bataille où s'est jouée une guerre",
    ],
    antagonistes: [
      "un seigneur de guerre invaincu",
      "une horde en marche vers la capitale",
      "le général renégat d'une armée maudite",
      "un champion ennemi que nul n'a su abattre",
    ],
    ambiances: [
      "Les tambours de guerre font trembler les remparts de {lieu}.",
      "Dans {decor}, les bannières déchirées claquent au-dessus des morts.",
      "Le cor de {lieu} sonne le rassemblement : l'assaut est pour bientôt.",
    ],
    scenes: [
      "Vous gagnez {decor} de {lieu}. La ligne va céder, et {antagoniste} mène déjà la charge.",
      "Un éclaireur tombe à vos pieds près de {decor} : {antagoniste} a contourné vos défenses.",
      "Les portes de {lieu} ploient sous le bélier. Au cœur de {decor}, {antagoniste} cherche votre étendard.",
    ],
    choix: [
      ["Mener la contre-charge contre {antagoniste}", "Tenir la formation coûte que coûte"],
      ["Sonner la retraite vers {decor}", "Défier {antagoniste} en combat singulier"],
      ["Rallier les troupes en déroute", "Tenter une manœuvre désespérée par {decor}"],
    ],
    consequences: {
      facile: [
        "Votre charge enfonce la ligne ennemie : {antagoniste} recule et la place tient.",
        "La formation tient bon, vous repoussez l'assaut hors de {decor} sans rompre.",
      ],
      normal: [
        "Vous repoussez l'attaque, mais la moitié de votre compagnie gît dans {decor}.",
        "La position est sauve, au prix d'une blessure qui vous suivra toute la campagne.",
      ],
      difficile: [
        "{antagoniste} brise votre flanc : blessé, vous abandonnez {decor} à l'ennemi.",
        "La retraite vire à la débâcle, vous fuyez {lieu} en laissant vos étendards au sol.",
      ],
      legendaire: [
        "Pour sauver l'armée, vous tenez {decor} seul et vous y laissez la vie de vos frères d'armes.",
        "Le duel tourne mal : {antagoniste} vous épargne pour mieux vous humilier devant vos hommes.",
      ],
    },
    tags: ["guerre", "bataille", "siège", "héroïsme", "conquête", "honneur"],
    enemyTypes: ["human", "beast", "undead"],
    evenements: ["assaut", "charge_de_cavalerie", "siege"],
  },

  "Arcane & Reliques": {
    nom: "Arcane & Reliques",
    habillagesLieu: [
      "{lieu}, atelier d'un artificier disparu sans laisser de traces",
      "{lieu}, voûte scellée où dort une relique interdite",
      "{lieu}, ruine traversée d'automates encore en veille",
    ],
    antagonistes: [
      "un golem-gardien devenu fou",
      "l'esprit lié à une relique corrompue",
      "une confrérie de mages-artificiers rivale",
      "une création arcanique échappée à son maître",
    ],
    ambiances: [
      "Des cristaux d'arcane palpitent faiblement dans la pénombre de {lieu}.",
      "Dans {decor}, des rouages anciens se remettent en marche à votre approche.",
      "Une alarme runique résonne au loin : {lieu} n'a plus vu d'âme vivante depuis des siècles.",
    ],
    scenes: [
      "Les portes runiques de {lieu} s'ouvrent sur {decor}. Vos sens s'affolent : {antagoniste} a scellé les passages.",
      "Une relique pulse au cœur de {decor}. À peine l'approchez-vous que {antagoniste} s'anime pour la défendre.",
      "Le mécanisme de {lieu} s'enclenche. Près de {decor}, {antagoniste} verrouille l'accès au cœur arcanique.",
    ],
    choix: [
      ["Déchiffrer les runes pour ouvrir le sceau", "Couper le flux d'arcane et passer par {decor}"],
      ["Affronter {antagoniste} avec votre magie", "Récupérer la relique avant qu'il ne réagisse"],
      ["Tenter de maîtriser le golem par une formule", "Provoquer la surcharge du mécanisme"],
    ],
    consequences: {
      facile: [
        "Les runes obéissent : le sceau s'ouvre et vous progressez sans dommage.",
        "Votre bouclier arcanique tient, vous quittez {decor} intact, relique en main.",
      ],
      normal: [
        "Le sceau cède, mais une décharge d'arcane vous brûle la main : votre talisman grésille.",
        "Vous saisissez la relique, fêlée. Une part de son pouvoir s'est dissipée dans la fuite.",
      ],
      difficile: [
        "{antagoniste} verrouille {decor} derrière vous : blessé, vous fuyez sans la relique.",
        "Le golem broie votre arme, vous battez en retraite, désarmé et traqué dans {lieu}.",
      ],
      legendaire: [
        "Le mécanisme s'effondre : pour survivre, vous abandonnez votre compagnon dans {decor}.",
        "La relique vous corrompt de son arcane : votre corps ne répond plus tout à fait à vos ordres.",
      ],
    },
    tags: ["arcane", "relique", "artificier", "golem", "magitech", "mystère"],
    enemyTypes: ["elemental", "demon", "undead"],
    evenements: ["surcharge_arcanique", "eveil_du_golem", "relique_instable"],
  },
};
