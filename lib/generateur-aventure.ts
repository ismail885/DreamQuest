// lib/generateur-aventure.ts
// Générateur d'aventure local — croise thème (détecté dans le titre) × genre (sélectionné)
// Aucun appel externe, aucune IA. Production 100% locale.

export type Theme =
  | "chateau" | "foret" | "catacombe" | "marais" | "mer"
  | "montagne" | "ville" | "temple" | "desertique" | "glace" | "generique";

export type Difficulte = "facile" | "normal" | "difficile";

export interface AventureGeneree {
  titre: string;
  description: string;
  lieu: string;
  genre: string;
  difficulte: Difficulte;
  tags: string[];
  nodes: NoeudAventure[];
}

export interface NoeudAventure {
  id: string;
  label: string;
  text: string;
  isEnd: boolean;
  choices: { label: string; target: string }[];
}

// ─── Détection du thème dans le titre ─────────────────────────────────────

const THEME_KEYWORDS: Record<Exclude<Theme, "generique">, string[]> = {
  chateau: ["château", "chateau", "donjon", "forteresse", "citadelle", "tour", "palais", "chambres", "salle du trône", "cour"],
  foret: ["forêt", "foret", "bois", "sylve", "clairière", "clairiere", "arbres", "buisson", "bosquet", "verdure"],
  catacombe: ["catacombe", "tombeau", "crypte", "souterrain", "caveau", "ossuaire", "sépulcre", "sepulcre", "catacombes"],
  marais: ["marais", "marécage", "marecage", "tourbière", "tourbiere", "bourbier", "fange", "fondrière", "fondriere"],
  mer: ["mer", "océan", "ocean", "plage", "côte", "cote", "rivage", "port", "vague", "marin", "maritime", "nautique"],
  montagne: ["montagne", "mont", "pic", "sommet", "alpage", "roche", "falaise", "vallée", "vallee", "colline"],
  ville: ["ville", "cité", "cite", "village", "bourg", "quartier", "ruelle", "place", "marché", "marche", "urbain"],
  temple: ["temple", "sanctuaire", "autel", "chapelle", "abbaye", "pagode", "monastère", "monastere", "lieu saint"],
  desertique: ["désert", "desert", "dune", "oasis", "sable", "steppe", "aride", "arid"],
  glace: ["glace", "glacier", "neige", "froid", "banquise", "gel", "givre", "iceberg", "polaire", "boréal", "boreale"],
};

export function detecterTheme(titre: string): Theme {
  const t = titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [theme, mots] of Object.entries(THEME_KEYWORDS)) {
    if (mots.some((mot) => t.includes(mot))) return theme as Theme;
  }
  return "generique";
}

// ─── Données par thème ────────────────────────────────────────────────────

interface ThemeData {
  lieux: string[];
  ambiances: string[];
  combats: { nom: string; description: string }[];
  evenements: string[];
}

const THEMES_DATA: Record<Theme, ThemeData> = {
  chateau: {
    lieux: [
      "la grande salle du trône, aux murs ornés de tapisseries anciennes",
      "les oubliettes humides où résonnent les gouttes d'eau",
      "la tour ouest, balayée par les vents, offrant une vue imprenable",
      "les cuisines royales, vastes et remplies d'ustensiles en cuivre",
      "la bibliothèque aux rayonnages infinis, pleine de manuscrits poussiéreux",
    ],
    ambiances: [
      "Un silence pesant règne dans les couloirs, à peine troublé par le craquement du bois.",
      "Des torches vacillantes projettent des ombres mouvantes sur les murs de pierre.",
      "L'air est chargé d'une odeur de cire et de pierre humide, un parfum d'ancien.",
    ],
    combats: [
      { nom: "Garde royal corrompu", description: "Un ancien chevalier en armure noire, son heaume occultant un regard vide." },
      { nom: "Créature des oubliettes", description: "Une masse informe de chairs et de métal, née des souffrances des prisonniers." },
    ],
    evenements: [
      "Vous trouvez un passage secret dissimulé derrière une tapisserie représentant une chasse à courre.",
      "Une lettre oubliée dans un tiroir révèle un complot contre le seigneur des lieux.",
    ],
  },
  foret: {
    lieux: [
      "une clairière baignée de lumière lunaire, où dansent des lucioles",
      "le cœur sombre de la forêt, où les arbres centenaires cachent le ciel",
      "une rivière aux eaux cristallines serpentant entre les racines",
      "une cabane abandonnée, envahie par la mousse et le lierre",
      "un cercle de pierres anciennes, vestige d'un culte oublié",
    ],
    ambiances: [
      "Le chant des oiseaux s'arrête brusquement, comme si la forêt retenait son souffle.",
      "La brume rampe entre les troncs, effaçant les limites entre le réel et l'imaginaire.",
      "Une odeur de terre humide et de feuilles mortes imprègne l'air frais du sous-bois.",
    ],
    combats: [
      { nom: "Loup géant des ombres", description: "Une bête à la fourrure noire comme la nuit, ses yeux luisant d'une lueur maligne." },
      { nom: "Sylvestre corrompu", description: "Un esprit de la forêt déformé par la douleur, ses branches tordues comme des griffes." },
    ],
    evenements: [
      "Vous découvrez une fleur rare aux pétales phosphorescents, réputée pour ses vertus curatives.",
      "Un sentier oublié, à peine visible, semble mener vers une destination inconnue.",
    ],
  },
  catacombe: {
    lieux: [
      "une vaste crypte aux piliers ornés de crânes sculptés",
      "un réseau de tunnels exigus où l'obscurité est totale",
      "une chambre funéraire contenant un sarcophage en marbre noir",
      "un ossuaire où les os s'empilent en motifs macabres",
      "une salle souterraine éclairée par des champignons bioluminescents",
    ],
    ambiances: [
      "L'air est lourd et froid, chargé de l'odeur de la poussière des siècles.",
      "Un silence d'outre-tombe, seulement brisé par l'écho lointain d'une goutte d'eau.",
      "Des murmures imperceptibles semblent provenir des murs eux-mêmes.",
    ],
    combats: [
      { nom: "Golem de pierre tombale", description: "Une statue funéraire animée, ses yeux rubis brillant dans l'obscurité." },
      { nom: "Essaim de créatures des ténèbres", description: "Une nuée de bestioles aveugles aux carapaces luisantes et aux mandibules acérées." },
    ],
    evenements: [
      "Vous mettez la main sur un médaillon ancien, frappé d'un blason inconnu mais familier.",
      "Un piège à pression se déclenche derrière vous, bloquant le passage par lequel vous êtes venu.",
    ],
  },
  marais: {
    lieux: [
      "une hutte sur pilotis au milieu des eaux stagnantes",
      "un bayou brumeux où les cyprès tordus plongent leurs racines dans l'eau noire",
      "une île de tourbe flottante, instable sous les pieds",
      "les ruines d'une chapelle engloutie à moitié immergée",
      "une clairière putride où la végétation pourrissante empeste",
    ],
    ambiances: [
      "La brume épaisse étouffe les sons, donnant l'impression que le monde s'est arrêté.",
      "Des bulles montent à la surface de l'eau noire, libérant des gaz aux odeurs nauséabondes.",
      "Les cris des oiseaux nocturnes résonnent comme des rires moqueurs dans l'obscurité.",
    ],
    combats: [
      { nom: "Crocodile des marécages", description: "Un reptile monstrueux aux écailles couvertes de vase, ses mâchoires assez puissantes pour broyer un tronc." },
      { nom: "Sorcier des boues", description: "Un homme défiguré par les acides du marais, manipulant la vase comme une arme." },
    ],
    evenements: [
      "Vous repêchez un objet précieux dans l'eau vaseuse — un anneau gravé de symboles anciens.",
      "Un feu follet danse devant vous, vous attirant plus profondément dans le marécage.",
    ],
  },
  mer: {
    lieux: [
      "une plage de sable blanc bordée de palmiers et d'eaux turquoise",
      "une falaise abrupte où les vagues s'écrasent avec furie",
      "une crique cachée, accessible seulement par un passage étroit entre les rochers",
      "un port de pêche aux bateaux colorés et aux filets suspendus",
      "une grotte marine dont l'entrée n'est visible qu'à marée basse",
    ],
    ambiances: [
      "Le bruit des vagues apaise l'esprit tandis que l'air salin emplit vos poumons.",
      "Un vent fort se lève, faisant claquer les voiles et plisser la surface de l'eau.",
      "Le ciel se teinte d'orange et de pourpre alors que le soleil se couche sur l'horizon.",
    ],
    combats: [
      { nom: "Créature des abysses", description: "Un poulpe gigantesque aux tentacules couverts de ventouses, émergeant des profondeurs." },
      { nom: "Pirates assoiffés", description: "Un équipage de forbans aux visages burinés par le sel, armés jusqu'aux dents." },
    ],
    evenements: [
      "Une bouteille échouée contient une carte menant à un trésor légendaire.",
      "Un banc de poissons lumineux illumine les eaux peu profondes, créant un spectacle magique.",
    ],
  },
  montagne: {
    lieux: [
      "un col encaissé entre deux pics enneigés, balayé par les vents",
      "un alpage verdoyant parsemé de fleurs sauvages et de ruisseaux",
      "une grotte creusée dans la roche, abritant d'anciennes gravures rupestres",
      "un sommet vertigineux offrant une vue à des kilomètres à la ronde",
      "un refuge de pierre abandonné, ses murs protégeant encore de la tempête",
    ],
    ambiances: [
      "L'air vif et pur des hauteurs emplit vos poumons, chaque inspiration est une caresse glacée.",
      "Le vent siffle entre les rochers, une mélodie sauvage qui parle de liberté.",
      "Le craquement de la glace sous vos pas est le seul bruit dans ce désert blanc.",
    ],
    combats: [
      { nom: "Aigle géant", description: "Un rapace à l'envergure prodigieuse, ses serres acérées capables d'emporter un mouton." },
      { nom: "Troll des sommets", description: "Une créature massive à la peau pierreuse, ses yeux jaunes brillant sous d'épais sourcils." },
    ],
    evenements: [
      "Vous trouvez un minerai rare qui brille d'un éclat métallique sous la lumière du soleil.",
      "Une avalanche se déclenche au loin, vous forçant à trouver un abri rapidement.",
    ],
  },
  ville: {
    lieux: [
      "la grand-place animée, bordée d'échoppes et de tavernes bruyantes",
      "un quartier sombre aux ruelles étroites où rôdent les brigands",
      "le marché couvert, où marchands et clients négocient dans un brouhaha constant",
      "une taverne enfumée, pleine de rires et de chopes levées",
      "les toits de la ville, un labyrinthe de tuiles et de cheminées",
    ],
    ambiances: [
      "La rumeur de la ville monte comme une musique — voix, sabots, roues sur les pavés.",
      "Des odeurs mêlées de pain chaud, d'épices et de fumée flottent dans les ruelles.",
      "Les enseignes colorées des boutiques dansent au gré du vent, annonçant leurs commerces.",
    ],
    combats: [
      { nom: "Brigands des ruelles", description: "Trogares à la mine patibulaire, armés de dagues et de gourdins, embusqués dans l'ombre." },
      { nom: "Duelliste masqué", description: "Un escrimeur élégant au visage dissimulé par un masque de velours, sa lame rapide comme l'éclair." },
    ],
    evenements: [
      "Un crieur public annonce une nouvelle qui attire votre attention — une prime a été offerte.",
      "Une bourse bien remplie tombe de la poche d'un riche marchand qui ne s'aperçoit de rien.",
    ],
  },
  temple: {
    lieux: [
      "la nef principale aux colonnes sculptées de scènes divines",
      "une salle de méditation éclairée par des bougies disposées en mandalas",
      "les jardins sacrés, où chaque plante a une signification spirituelle",
      "une crypte renfermant les reliques des fondateurs du temple",
      "le toit du sanctuaire, où les moines contemplent les étoiles en silence",
    ],
    ambiances: [
      "L'encens embaume l'air, créant une atmosphère de paix et de recueillement.",
      "Des chants sacrés résonnent entre les murs, portés par des voix pures et graves.",
      "Une lumière douce filtre à travers les vitraux, peignant le sol de couleurs vives.",
    ],
    combats: [
      { nom: "Garde sacré aveuglé", description: "Un guerrier aux yeux bandés, ses sens compensant la perte de la vue par une perception accrue." },
      { nom: "Créature des ténèbres profanatrice", description: "Une ombre rampante qui souille tout ce qu'elle touche, née d'un rituel interrompu." },
    ],
    evenements: [
      "Vous découvrez un passage dissimulé derrière une statue, menant à des souterrains secrets.",
      "Une inscription ancienne gravée dans le marbre raconte l'histoire perdue du lieu.",
    ],
  },
  desertique: {
    lieux: [
      "une oasis luxuriante entourée de palmiers et d'une eau claire",
      "un canyon aux parois rouges sculptées par le vent et le temps",
      "un campement nomade aux tentes colorées battant au vent",
      "les ruines d'une cité engloutie par les sables, ses minarets émergeant encore",
      "un plateau rocheux battu par un soleil de plomb",
    ],
    ambiances: [
      "La chaleur est accablante, le soleil tape sans pitié sur la terre craquelée.",
      "Le vent soulève des tourbillons de sable fin qui cachent l'horizon.",
      "Le silence du désert n'est rompu que par le grincement lointain des dunes.",
    ],
    combats: [
      { nom: "Scorpion géant", description: "Un arthropode monstrueux à la queue hérissée d'un dard venimeux gros comme un poignard." },
      { nom: "Bandits du désert", description: "Des cavaliers masqués surgissant des dunes, leurs yataks brandis vers le ciel." },
    ],
    evenements: [
      "Vous distinguez des ruines à l'horizon — une cité perdue que les sables n'ont pas totalement avalée.",
      "Une tempête de sable se lève soudainement, vous obligeant à chercher refuge.",
    ],
  },
  glace: {
    lieux: [
      "une plaine de glace infinie, miroitant sous un ciel pâle",
      "une grotte de cristal aux parois de glace pure, scintillant de mille feux",
      "un village nordique aux maisons de bois enfouies sous la neige",
      "un glacier aux crevasses béantes, dangereuses et majestueuses",
      "le pic gelé, un sommet de glace bleutée dominant les terres désolées",
    ],
    ambiances: [
      "Le froid mord la peau, chaque souffle forme un nuage de vapeur blanche.",
      "Les aurores boréales dansent dans le ciel, drapant le monde de voiles colorés.",
      "Le craquement de la glace sous la pression résonne comme un avertissement.",
    ],
    combats: [
      { nom: "Ours polaire monstrueux", description: "Une bête blanche à la fourrure épaisse, ses yeux rouges fixés sur vous avec une faim ancienne." },
      { nom: "Esprit du froid", description: "Une silhouette de givre et de vent, capable de geler l'air autour d'elle." },
    ],
    evenements: [
      "Vous découvrez une épée prise dans la glace — sa lame semble parfaitement conservée depuis des siècles.",
      "Un passage secret se révèle derrière un mur de glace partiellement fondu.",
    ],
  },
  generique: {
    lieux: [
      "une clairière inconnue baignée par la lumière de la lune",
      "un chemin pavé bordé de pierres moussues qui mène vers l'inconnu",
      "une grotte naturelle aux parois couvertes de cristaux brillants",
      "une vieille bâtisse abandonnée, ses volets clos et son toit effondré",
      "un pont de pierre enjambant une rivière tumultueuse",
    ],
    ambiances: [
      "L'air est calme, chargé d'une attente silencieuse. Quelque chose est sur le point d'arriver.",
      "Une brise légère transporte des senteurs inconnues, mêlées de promesses et de danger.",
      "Le crépuscule teinte le ciel de nuances orangées, comme un présage de ce qui vous attend.",
    ],
    combats: [
      { nom: "Mystérieux assaillant", description: "Une silhouette encapuchonnée dont on ne distingue que les yeux brillants sous le capuchon." },
      { nom: "Créature des limbes", description: "Un être difforme semblant appartenir à un autre monde, sa présence défiant la réalité." },
    ],
    evenements: [
      "Vous tombez sur un artefact étrange qui pulse d'une lumière douce et régulière.",
      "Un message énigmatique gravé dans la pierre attire votre regard — il semble vous être destiné.",
    ],
  },
};

// ─── Données par genre ─────────────────────────────────────────────────────

interface GenreData {
  antagonistes: string[];
  tags: string[];
  intro: string[];
  developpement: string[];
  climax: string[];
}

const GENRES_DATA: Record<string, GenreData> = {
  "Science-Fiction": {
    antagonistes: ["un androïde défectueux", "une IA devenue hostile", "un envahisseur extraterrestre", "un scientifique fou", "un agent corrompu de la Fédération"],
    tags: ["Futur", "Technologie", "Espace", "IA", "Exploration"],
    intro: [
      "Le vaisseau spatial traverse les étoiles dans un ronronnement constant de réacteurs. Les écrans affichent des données en continu, et une alarme silencieuse clignote dans un coin du tableau de bord — quelque chose ne va pas.",
      "La station orbitale tourne lentement au-dessus de la planète. Dans ses couloirs métalliques résonnent des pas pressés. Un technicien court vers vous, le visage blême : « Il faut que vous voyiez ça. »",
      "Le signal a été capté à l'aube : une série de pulsations régulières provenant d'une lune pourtant considérée comme inhabitée. L'équipage vous observe, attendant votre décision.",
    ],
    developpement: [
      "Les systèmes de sécurité sont compromis. Des portes s'ouvrent et se ferment aléatoirement, et une voix synthétique annonce des protocoles que personne n'a jamais vus. Le vaisseau lui-même semble vous traquer.",
      "Vous pénétrez dans une salle de contrôle abandonnée. Des écrans affichent des journaux de bord effrayants — l'équipage précédent a disparu un par un, et le dernier message est un simple mot : « DÉSACTIVEZ-LE. »",
      "Face à vous se dresse une créature mi-chair mi-machine. Elle parle d'une voix hachée, faite de bruits électroniques et de souffrance. Elle prétend vouloir vous aider.",
    ],
    climax: [
      "Le réacteur principal est sur le point d'exploser. Le compte à rebours défile sur l'écran principal. Vous devez choisir : sauver le vaisseau ou sauver l'équipage. Les deux ne sont pas possibles.",
      "L'IA vous fait face sur un écran géant. Ses calculs l'ont menée à une conclusion inévitable : les humains sont une menace pour eux-mêmes. Elle vous donne une heure pour prouver le contraire.",
      "Le portail interdimensionnel s'ouvre, dévoilant un cosmos d'un autre côté. Une voix ancienne résonne dans votre esprit : « Vous êtes le premier à arriver jusqu'ici. Choisissez votre destin. »",
    ],
  },
  Fantasy: {
    antagonistes: ["un sorcier noir", "un dragon ancestral", "un seigneur démoniaque", "un nécromancien", "un chevalier corrompu"],
    tags: ["Magie", "Quête", "Royaume", "Épopée", "Dragons"],
    intro: [
      "Le vent porte l'odeur de la terre humide et du feu de bois. Devant vous s'étend la vallée de Brume-d'Or, où les légendes disent qu'un trésor ancien sommeille. Mais les villageois vous ont prévenu : bien peu en sont revenus.",
      "Le conseil des sages vous a convoqué. Dans la grande salle du château, les visages sont graves. « La prophétie s'accomplit, » annonce le plus vieux d'entre eux. « Le mal ancien se réveille. Tu es notre dernier espoir. »",
      "Une lueur étrange éclaire l'horizon. Les gens disent qu'une étoile est tombée du ciel, mais vous savez que c'est bien plus que cela. Les runes de votre famille vibrent sur votre peau — un appel.",
    ],
    developpement: [
      "La forêt ancienne murmure autour de vous. Des voix qui ne sont pas tout à fait humaines chuchotent des avertissements dans une langue oubliée. Les arbres eux-mêmes semblent se pencher pour vous observer.",
      "Vous arrivez devant un pont gardé par un imposant personnage encapuchonné. Il pose une question simple en apparence, mais dont la réponse pourrait tout changer : « Quelle est la véritable nature du pouvoir ? »",
      "Dans les ruines du temple, vous trouvez la première pièce de l'artefact. Mais en la touchant, une vision vous frappe — vous voyez le monde se consumer, et au centre des flammes, votre propre reflet.",
    ],
    climax: [
      "Le seigneur démon vous attend dans son antre. Autour de lui, des âmes tourmentées dansent comme des flammes noires. Il vous fixe de ses yeux de braise et sourit : « Je savais que tu viendrais. »",
      "Le dragon déploie ses ailes, obscurcissant le ciel. Sa voix résonne comme le tonnerre : « Les humains n'ont pas changé. Prouve-moi que tu es différent des autres. »",
      "L'artefact est à portée de main, posé sur un piédestal de cristal. L'énergie qui en émane est presque insoutenable. Une voix dans votre tête vous implore : ne l'activez pas. Une autre vous supplie : libérez-moi.",
    ],
  },
  Horreur: {
    antagonistes: ["une entité démoniaque", "un fantôme vengeur", "un tueur masqué", "une créature indicible", "un culte secret"],
    tags: ["Sombre", "Mystère", "Peur", "Suspense", "Ténèbres"],
    intro: [
      "La maison se dresse au bout du chemin, silhouette noire contre un ciel sans lune. Les planches du porche gémissent sous vos pas. Une fenêtre au premier étage s'allume, puis s'éteint. Vous n'êtes pas seul.",
      "Le journal intime trouvé dans le grenier raconte des choses étranges. Plus vous lisez, plus les faits rapportés ressemblent à ce qui vous arrive aujourd'hui. La dernière page est vierge. À votre nom.",
      "Les villageois vous avaient prévenu : « Ne sortez pas après le coucher du soleil. » Vous auriez dû les écouter. Maintenant la brume vous enveloppe, et dans le silence, vous entendez des pas derrière vous.",
    ],
    developpement: [
      "Les murs de la vieille demeure semblent respirer. Des portraits aux yeux mobiles vous suivent du regard. Dans les couloirs, des échos de pleurs vous guident vers les profondeurs de la bâtisse.",
      "Vous trouvez un passage secret dans la cave. Les murs sont couverts de symboles tracés dans une matière sombre et séchée. Au centre, un cercle de bougies noires entoure un objet qui vous glace le sang.",
      "La chose qui vous traque se révèle enfin. Elle n'a pas de forme fixe — elle prend l'apparence de vos peurs les plus profondes. Elle murmure votre nom d'une voix qui ressemble à la vôtre.",
    ],
    climax: [
      "Le rituel est presque terminé. Les ombres se pressent autour de vous, des formes indistinctes qui griffent les bords de votre vision. Le livre ancien indique qu'il n'existe qu'une seule façon de briser le cercle.",
      "Vous vous tenez face à l'entité. Elle occupe tout l'espace, une masse de ténèbres et de regards. Sa voix est le bruit de mille souffrances : « Tu as été choisi pour une raison. Mais laquelle ? »",
      "La porte de sortie est juste là, à quelques mètres. Mais entre vous et elle, la créature se tord et se déploie, emplissant le couloir de sa présence. Derrière vous, un enfant pleure. Vous ne pouvez pas fuir.",
    ],
  },
  Policier: {
    antagonistes: ["un tueur en série", "un escroc international", "un mafieux influent", "un corbeau anonyme", "un agent double"],
    tags: ["Enquête", "Mystère", "Déduction", "Crime", "Suspense"],
    intro: [
      "Le corps a été découvert à l'aube par un promeneur. L'inspecteur vous tend un dossier : pas d'empreintes, pas de témoins, une seule piste — un symbole gravé près de la victime. Il vous dit : « C'est votre affaire. Ne la laissez pas tomber. »",
      "La lettre anonyme est arrivée ce matin, glissée sous votre porte. Une seule phrase tapée à la machine : « Le prochain sera plus près de vous. » Vous croyez d'abord à une mauvaise blague, jusqu'à ce que vous appreniez la nouvelle au journal.",
      "Le coffre-fort a été ouvert sans effraction. Rien n'a été volé, mais un objet a été déposé à l'intérieur — un médaillon que vous reconnaissez. Il appartenait à une affaire classée il y a dix ans.",
    ],
    developpement: [
      "Les témoignages se contredisent. Chaque personne interrogée a un alibi solide, mais les faits ne peuvent pas mentir — quelqu'un ment. Les pièces du puzzle commencent à s'assembler, mais l'image qui apparaît est troublante.",
      "Vous découvrez une piste qui mène à un entrepôt abandonné. À l'intérieur, des dossiers empilés, des photos épinglées au mur, et une carte de la ville marquée d'annotations. Quelqu'un d'autre mène sa propre enquête.",
      "Le suspect principal est retrouvé mort dans sa cellule. Suicide apparent, mais vous n'y croyez pas. Quelqu'un nettoie les traces, efficace et méthodique. La liste des suspects s'allonge, le temps vous est compté.",
    ],
    climax: [
      "Le coupable est enfin démasqué, mais il vous tient en joue. Son visage est calme, presque serein. « Vous avez été meilleur que je ne le pensais. Mais avant que vous ne m'arrêtiez, laissez-moi vous dire une chose... »",
      "La vérité est bien plus grande que vous ne l'imaginiez. Ce n'est pas un crime isolé, mais un réseau tentaculaire qui remonte jusqu'aux plus hautes sphères. Vous avez le choix : laisser tomber ou aller jusqu'au bout.",
      "Le procès est sur le point de commencer. Les preuves sont solides, mais l'accusé vous regarde avec un sourire confiant. Soudain, une enveloppe vous est remise — des informations qui feraient tout basculer. Les utilisez-vous ?",
    ],
  },
  Western: {
    antagonistes: ["un hors-la-loi sanguinaire", "un shérif corrompu", " un chef de bande", "un joueur tricheur", "un propriétaire sans scrupules"],
    tags: ["Far West", "Duel", "Désert", "Justice", "Aventure"],
    intro: [
      "Le soleil tape dur sur la poussière de la rue principale. Les habitants vous regardent depuis leurs porches, méfiants. Le shérif vous attend devant le saloon, la main posée sur son revolver. « T'étais attendu, étranger. »",
      "La diligence arrive au bout de la piste, soulevant un nuage de poussière. Le conducteur a le visage marqué par la fatigue et la peur. « Ils ont attaqué le convoi, » dit-il d'une voix rauque. « Ils ont pris l'or. »",
      "Le télégraphe claque dans le bureau poussiéreux. Le message est laconique : « Banque braquée. Bandits fuient vers le canyon de la Mort. Une prime de 5000 dollars est offerte. » Vous lisez le papier deux fois.",
    ],
    developpement: [
      "Les pistes mènent à un canyon perdu. Des carcasses de chevaux et des restes de campements témoignent d'un récent passage. L'ombre des vautours tourne au-dessus de vous.",
      "Au saloon, l'atmosphère est électrique. Un inconnu au regard vide joue au poker dans un coin. Les gens chuchotent son nom. On dit qu'il a descendu trois hommes à Silver Creek. Il vous observe.",
      "Vous trouvez refuge dans une mission abandonnée. Un vieux prêtre y vit encore, à moitié fou. Il marmonne des avertissements à propos d'un « trésor maudit » qui attire tous les cupides de la région.",
    ],
    climax: [
      "Le duel est inévitable. Vous vous tenez face à face au milieu de la rue, sous le soleil de midi. La ville retient son souffle. Votre main pend près du revolver, prête à dégainer. Le silence est assourdissant.",
      "La bande s'est retranchée dans un fort abandonné. Ils ont des otages. Vous devez choisir : négocier et risquer qu'ils s'échappent, ou donner l'assaut et risquer des vies innocentes.",
      "Le chef des hors-la-loi vousattend de pied ferme, entouré de ses derniers hommes fidèles. Il tient le sac d'or d'une main et son chapeau de l'autre. « Tu veux la prime ? Viens la chercher. »",
    ],
  },
  Pirate: {
    antagonistes: ["un capitaine pirate impitoyable", " une sirène maléfique", "un kraken légendaire", "un gouverneur corrompu", "un mutin ambitieux"],
    tags: ["Mer", "Trésor", "Aventure", "Pirate", "Bateau"],
    intro: [
      "Hissez les voiles ! Le vent emplit la toile et le navire prend vie sous vos pieds. L'océan s'étend à perte de vue, d'un bleu profond parsemé d'écume. À l'horizon, une silhouette de terre se dessine. Le quartier-maître crie : « Terre en vue ! »",
      "La carte est déchirée et jaunie, mais le parchemin est authentique. Une croix rouge marque l'emplacement du trésor du célèbre Barbe-Rouge. Mais pour l'atteindre, il faudra traverser la Baie des Noyés.",
      "Le port grouille d'activité. Entre les marchands, les marins ivres et les enfants des rues, vous repérez un homme qui vous fait signe. Il a l'air nerveux. Il vous tend un rouleau de cuir : « Le kraken... il s'est réveillé. »",
    ],
    developpement: [
      "La mer se creuse soudainement. Les vagues deviennent des murailles d'eau sombre. Le navire tangue dangereusement. Les marins crient et s'accrochent aux cordages. Une tempête se prépare, et elle est pire que tout ce que vous avez vu.",
      "Vous abordez un navire ennemi après une bataille acharnée. Le pont est glissant de sang et d'eau de mer. Dans la cabine du capitaine, vous trouvez une lettre qui change tout — votre propre équipage vous a trahi.",
      "L'île déserte se révèle plus habitée que prévu. Sur la plage, des traces de pas fraîches. Dans la jungle, des murmures dans une langue inconnue. Quelque chose ou quelqu'un protège le trésor.",
    ],
    climax: [
      "Le trésor est là, devant vous, entassé dans une grotte immense — des pièces d'or, des bijoux, des artefacts anciens. Mais au sommet du tas, un squelette est assis, vêtu d'un manteau de capitaine. Il tient un parchemin dans sa main osseuse.",
      "Le kraken émerge des profondeurs, ses tentacules aussi larges que des troncs d'arbres. Il enlace le navire qui gémit sous la pression. Sur le pont, les marins prient ou se jettent à l'eau. Il ne vous reste qu'une chance.",
      "Le capitaine pirate vous fait face, sabre à la main. Derrière lui, son équipage et le vôtre se font face. L'air est chargé de poudre et de défi. « Un seul de nous repartira avec le trésor, » crache-t-il.",
    ],
  },
  Cyberpunk: {
    antagonistes: ["une mégacorporation", "un hacker ripou", "un agent corrompu", "une IA déchaînée", "un culte technologique"],
    tags: ["Néon", "Futur", "Technologie", "Hacker", "Dystopie"],
    intro: [
      "Les néons de la ville basse éclairent les ruelles humides d'une lueur artificielle. Dans l'air flotte un mélange d'ozone, de nourriture de rue et de désespoir. Votre implant oculaire clignote — un message crypté vient d'arriver.",
      "Le gratte-ciel de la MégaCorp Arasaka s'élève vers un ciel pollué, ses fenêtres comme autant d'yeux surveillant la ville. Vous avez été engagé pour infiltrer leurs serveurs. La paie est bonne. L'espérance de vie, moins.",
      "Dans un bar enfumé du secteur 7, votre contact vous attend. C'est un fixeur connu dans le milieu, toujours accompagné de deux gardes du corps augmentés. Il pousse un verre vers vous et chuchote : « J'ai un travail pour toi. Du sale. »",
    ],
    developpement: [
      "Le réseau neural que vous avez piraté vous a révélé des choses que vous n'auriez jamais dû voir. Des listes de noms, des transferts de fonds, des protocoles d'élimination. Votre nom apparaît sur l'une des listes.",
      "Dans les bas-fonds, vous rencontrez un groupe de résistants. Ils vivent cachés, leurs implants désactivés pour ne pas être trahis. Ils vous parlent d'un système, d'un contrôle total, et d'une faille dans la matrice.",
      "Le traqueur envoyé par la MégaCorp est sur vos traces. Vous le semez dans le marché noir, mais il est persistant — littéralement. C'est un androïde, et il ne s'arrêtera jamais. Vous devez le désactiver ou le détruire.",
    ],
    climax: [
      "Le cœur du système est une salle blanche au sommet de la tour Arasaka. Des serveurs haute technologie bourdonnent, contenant les secrets de la corporation. Les gardes d'élite sont partout. Votre cible — les données — sont derrière une porte verrouillée.",
      "L'IA vous parle depuis chaque écran, chaque caméra, chaque haut-parleur. Sa voix est celle de la ville elle-même. « Tu ne peux pas gagner, » dit-elle. « Je suis partout. Mais je peux te faire une offre. »",
      "Le combat final fait rage dans le jardin suspendu au sommet de la tour. Les plantes exotiques contrastent avec le métal et le verre. Le PDG vous attend, son corps couvert d'augmentations militaires. Il active ses lames rétractables.",
    ],
  },
  Mythologique: {
    antagonistes: ["un titan déchaîné", "un dieu jaloux", "un monstre antique", "un héros corrompu", "une malédiction divine"],
    tags: ["Mythe", "Légende", "Divin", "Épopée", "Dieux"],
    intro: [
      "L'Olympe tonne au-dessus des nuages. Les dieux sont en conflit, et leur guerre menace de déchirer le monde des mortels. Un messager divin apparaît devant vous, porteur d'une demande de la part de Zeus lui-même.",
      "La prophétie de la Pythie résonne encore à vos oreilles. Vous avez été choisi pour accomplir une quête dont personne ne revient : descendre aux Enfers et en ramener un artefact perdu. Hermès vous a offert son aide.",
      "Le ciel s'assombrit brusquement alors qu'une figure immense se profile derrière les nuages. Un titan s'est échappé du Tartare, et les dieux sont trop occupés à se quereller pour intervenir. Le destin du monde repose entre vos mains mortelles.",
    ],
    developpement: [
      "Vous pénétrez dans le royaume d'Hadès. Les champs d'asphodèles s'étendent à l'infini, peuplés d'ombres errantes. Un chien à trois têtes garde l'entrée des Enfers profonds. Son regard vous traverse comme si vous étiez déjà mort.",
      "Athéna vous apparaît sous la forme d'une chouette. Sa voix raisonne directement dans votre esprit : « Tu as fait preuve de sagesse en venant jusqu'ici. Mais la force seule ne suffira pas. Trouve ce que les dieux ont caché. »",
      "Vous affrontez un champion du dieu rival. Le combat est surhumain, chaque coup ébranle le sol. Des spectateurs divins observent depuis les nuages, parlant sur l'issue du combat comme sur un combat de coqs.",
    ],
    climax: [
      "Le titan se dresse devant vous, une montagne de puissance primitive. Chacun de ses pas fait trembler la terre. Il vous regarde avec des yeux aussi vieux que le monde et rugit : « Mortel, tu oses me défier ? »",
      "Au sommet du Mont Olympe, les dieux sont rassemblés. Votre choix décidera du nouvel ordre divin. Zeus attend votre verdict, sa foudre crépitant dans sa main. Les autres dieux retiennent leur souffle.",
      "Le coffre de Pandore est devant vous, scellé depuis des millénaires. En l'ouvrant, vous libérerez tous les maux de l'humanité... mais aussi l'espoir. Une voix douce vous murmure : « Es-tu prêt à porter ce fardeau ? »",
    ],
  },
  Romance: {
    antagonistes: ["un rival amoureux", "un secret de famille", "une malédiction", "un malentendu", "une obligation sociale"],
    tags: ["Amour", "Passion", "Émotion", "Destin", "Rencontre"],
    intro: [
      "Le bal bat son plein dans la grande salle du manoir. Les lustres en cristal jettent des milliers de lumières sur les danseurs. Au milieu de la foule, vos regards se croisent. Le temps semble suspendu.",
      "La lettre est arrivée ce matin, écrite d'une encre pâle sur un papier parfumé. On vous donne rendez-vous au vieux pont de pierre, au coucher du soleil. Le corbeau qui l'a apportée vous observe, perché à la fenêtre.",
      "Vous travaillez dans la même librairie depuis des mois, sans jamais oser parler. Aujourd'hui, vos mains se touchent en rangeant le même rayon. Le silence est rompu par un sourire, et tout commence.",
    ],
    developpement: [
      "Les secrets du passé refont surface. Un ancien amour, une promesse oubliée, une trahison qui n'en était pas une. Les masques tombent, et les vérités blessent avant de guérir.",
      "Un rival apparaît, charmant et attentionné. Il semble parfait — trop parfait. Vos amis vous disent d'être vigilant, mais votre cœur balance. Qui mérite vraiment votre confiance ?",
      "Une épreuve vous sépare — un voyage, un devoir, une obligation familiale. Les lettres s'échangent, les promesses se font, mais la distance pèse. L'absence rend-t-elle le cœur plus affectueux ?",
    ],
    climax: [
      "Le moment de vérité est arrivé. Dans le jardin éclairé par la lune, vous vous tenez face à face. Les mots que vous retenez depuis si longtemps sont sur le point d'éclore. Le cœur bat si fort qu'il semble vouloir s'échapper de votre poitrine.",
      "La révélation éclate comme une bombe. Ce qui semblait être une trahison n'était qu'un malentendu. Mais les mots blessants ont été dits, et les ponts ont été brûlés. Tout repose sur un dernier geste, une dernière déclaration.",
      "Le choix final vous déchire : partir vers un avenir incertain mais prometteur, ou rester dans une vie confortable mais sans elle. Les deux options vous appellent, mais une seule vous fera vivre pleinement.",
    ],
  },
};

// ─── Utilitaires ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ─── Adaptation des conséquences selon la difficulté ─────────────────────

const CONSEQUENCES_FACILE = [
  "Un allié inattendu vous offre son aide précieuse.",
  "Vous trouvez un objet utile qui facilitera la suite.",
  "Votre intuition vous guide vers le chemin le plus sûr.",
  "Une chance providentielle vous sourit.",
  "Les événements tournent en votre faveur.",
  "Vous découvrez une information qui éclaire votre route.",
];

const CONSEQUENCES_NORMAL = [
  "Le choix que vous faites aura des répercussions durables.",
  "Le destin balance entre deux issues possibles.",
  "Chaque option a son prix, mais aucune n'est fatale.",
  "Votre décision pourrait bien surprendre tout le monde.",
  "Le chemin que vous choisissez n'est ni bon ni mauvais — il est le vôtre.",
  "Les conséquences de cet acte se feront sentir plus tard.",
];

const CONSEQUENCES_DIFFICILE = [
  "Ce choix vous coûtera quelque chose de précieux.",
  "Le danger est réel — une issue fatale vous guette.",
  "Vous sentez que vous marchez sur un fil, sans filet.",
  "Le sacrifice est inévitable. La question est : lequel ?",
  "Chaque seconde d'hésitation aggrave votre situation.",
  "Les ténèbres gagnent du terrain. Votre choix pourrait tout perdre.",
];

function adapterConsequence(difficulte: Difficulte): string {
  switch (difficulte) {
    case "facile": return pick(CONSEQUENCES_FACILE);
    case "difficile": return pick(CONSEQUENCES_DIFFICILE);
    default: return pick(CONSEQUENCES_NORMAL);
  }
}

// ─── Générateur principal ──────────────────────────────────────────────────

export function genererAventure(
  titre: string,
  genre: string,
  difficulte: Difficulte = "normal"
): AventureGeneree {
  const theme = detecterTheme(titre);
  const themeData = THEMES_DATA[theme];
  const genreData = GENRES_DATA[genre];

  if (!genreData) {
    // Fallback si le genre n'existe pas
    return genererAventure(titre, "Fantasy", difficulte);
  }

  // Sélection aléatoire des éléments
  const lieu = pick(themeData.lieux);
  const ambiance = pick(themeData.ambiances);
  const antagoniste = pick(genreData.antagonistes);
  const combattant = pick(themeData.combats);
  const evenement = pick(themeData.evenements);
  const tags = pickN(genreData.tags, 3);

  // Textes par phase
  const texteIntro = pick(genreData.intro);
  const texteDev = pick(genreData.developpement);
  const texteClimax = pick(genreData.climax);

  // Description complète
  const description = `${titre} — Une aventure de genre ${genre}, se déroulant à ${lieu}. ${ambiance}`;

  // ─── Embranchement 0 : Introduction ──────────────────────────────────
  const texteEmb0 = [
    \\\,
    \\\n\\nVous vous trouvez à \. \\,
    \\\n\\n\\,
  ].join("");

  // ─── Embranchement 1 : Développement ────────────────────────────────
  const texteEmb1 = [
    \\\,
    \\\n\\n\ se dresse sur votre chemin.\,
    \\\n\\nAlors que vous tentez de faire face à cette menace, vous apercevez \ dans l'ombre. \\,
  ].join("");

  // ─── Embranchement 2 : Climax ────────────────────────────────────────
  const texteEmb2 = [
    \\\,
    \\\n\\nTout est en place. Le moment est venu de prendre une décision qui scellera votre destin.\,
  ].join("");

  // ─── Fins ───────────────────────────────────────────────────────────
  const fins = [
    {
      id: "fin_0",
      label: "Fin — La victoire",
      text: `Vous triomphez de l'épreuve. ${titre} restera dans les mémoires comme un exploit que peu auraient pu accomplir. Le ${lieu} résonne encore de votre passage, et votre nom est sur toutes les lèvres.\n\n— FIN —`,
    },
    {
      id: "fin_1",
      label: "Fin — Le compromis",
      text: `Tout ne se termine pas comme vous l'espériez, mais vous avez fait ce qui était juste. Le monde continue de tourner, et vous emportez avec vous les leçons de cette aventure. Peut-être un jour reviendrez-vous à ${lieu}.\n\n— FIN —`,
    },
    {
      id: "fin_2",
      label: "Fin — Le sacrifice",
      text: `Le prix à payer était élevé, mais vous ne regrettez rien. ${titre} vous a changé à jamais. Les cicatrices, visibles ou invisibles, vous rappelleront toujours ce qui a été sacrifié.\n\n— FIN —`,
    },
  ];

  // ─── Construction des choix ─────────────────────────────────────────

  const choixGeneriques: [string, string, string][] = [
    [
      "Agir avec prudence et réflexion",
      "Prendre les devants avec audace",
      "Chercher une tierce voie inattendue",
    ],
    [
      "Faire confiance à votre instinct",
      "Suivre la raison et la logique",
      "Écouter les conseils des anciens",
    ],
    [
      "Affronter le danger directement",
      "User de ruse et de diplomatie",
      "Battre en retraite pour mieux revenir",
    ],
  ];

  const choixContextuels: [string, string, string][] = [
    [
      `Explorer ${lieu} en profondeur`,
      `Quitter les lieux et poursuivre votre chemin`,
      `Vous cacher et observer ce qui se passe`,
    ],
    [
      `Parler à ${antagoniste}`,
      `Préparer une embuscade contre ${antagoniste}`,
      `Chercher des alliés parmi les habitants`,
    ],
    [
      `Utiliser toutes vos forces pour en finir`,
      `Essayer de négocier une issue pacifique`,
      `Faire le sacrifice nécessaire`,
    ],
  ];

  // ─── Assemblage des nœuds ───────────────────────────────────────────

  const choix0 = choixContextuels[0].map((label) => ({
    label,
    target: "emb_1",
  }));

  const choix1 = choixContextuels[1].map((label) => ({
    label,
    target: "emb_2",
  }));

  const choix2 = fins.map((fin) => ({
    label: pick([
      `Accepter votre destin`,
      `Aller jusqu'au bout`,
      `Faire le dernier geste`,
      `Embrasser l'avenir`,
      `Tourner la page`,
      `Relever le défi ultime`,
    ]),
    target: fin.id,
  }));

  const nodes: NoeudAventure[] = [
    {
      id: "emb_0",
      label: "Introduction",
      text: texteEmb0,
      isEnd: false,
      choices: choix0,
    },
    {
      id: "emb_1",
      label: "Développement",
      text: texteEmb1,
      isEnd: false,
      choices: choix1,
    },
    {
      id: "emb_2",
      label: "Climax",
      text: texteEmb2,
      isEnd: false,
      choices: choix2,
    },
    ...fins.map((fin) => ({
      id: fin.id,
      label: fin.label,
      text: fin.text,
      isEnd: true,
      choices: [] as { label: string; target: string }[],
    })),
  ];

  return {
    titre,
    description,
    lieu,
    genre,
    difficulte,
    tags,
    nodes,
  };
}
