import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, genre } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 },
      );
    }

    const lowerGenre = (genre ?? "aventure").toLowerCase();
    const gen = title.trim();

    const nodes = [
      {
        id: "debut",
        label: "Début",
        text: `Bienvenue dans "${gen}". ${genre ? `Genre : ${genre}. ` : ""}L'aventure commence maintenant.\n\nVous ouvrez les yeux dans un lieu inconnu. L'air est lourd, chargé d'une atmosphère étrange. Autour de vous, des murs de pierre ancienne sont ornés de symboles qui semblent briller faiblement dans la pénombre.\n\nUne voix résonne dans votre esprit : « Ainsi tu es arrivé. Nous t'attendions. Prépare-toi, car ton jugement commence maintenant. »`,
        isEnd: false,
        choices: [
          { label: "Examiner les symboles sur les murs", target: "n2" },
          { label: "Avancer dans le couloir devant vous", target: "n3" },
        ],
      },
      {
        id: "n2",
        label: "N2",
        text: "Les symboles s'animent sous votre regard. Ils racontent une histoire ancienne — une prophétie. Vous distinguez des figures de guerriers, de monstres et d'un artefact lumineux au centre. Le message est clair : un grand danger menace, et vous êtes l'élu.\n\nSoudain, le sol tremble. Des bruits de pas résonnent au loin.",
        isEnd: false,
        choices: [
          { label: "Suivre le bruit des pas", target: "n4" },
          { label: "Chercher une arme dans les débris", target: "n5" },
        ],
      },
      {
        id: "n3",
        label: "N3",
        text: "Le couloir s'étend à perte de vue, éclairé par des torches qui brûlent d'une flamme bleutée. Après plusieurs minutes de marche, vous débouchez sur une immense salle circulaire. Au centre, un pilier de cristal pulse d'une lumière aveuglante.\n\nUne silhouette encapuchonnée se tient près du pilier. Elle ne bouge pas, mais vous sentez son regard posé sur vous.",
        isEnd: false,
        choices: [
          { label: "Parler à la silhouette", target: "n6" },
          { label: "Toucher le pilier de cristal", target: "n7" },
        ],
      },
      {
        id: "n4",
        label: "N4",
        text: "Vous suivez les bruits de pas à travers un dédale de couloirs sombres. L'humidité imprègne les murs. Au détour d'un virage, vous tombez sur une créature étrange — mi-homme, mi-machine — qui bloque le passage.\n\nElle vous observe sans bouger, attendant votre réaction.",
        isEnd: false,
        choices: [
          { label: "Engager le dialogue avec la créature", target: "n8" },
          { label: "Tenter de passer en force", target: "n9" },
        ],
      },
      {
        id: "n5",
        label: "N5",
        text: "Vous fouillez les décombres et trouvez une épée ancienne, encore en bon état. Sa lame semble faite d'un métal qui absorbe la lumière. En la saisissant, une décharge d'énergie vous traverse — l'arme vous a choisi.\n\nSoudain, un grondement se fait entendre. Le sol s'effondre partiellement, révélant un passage secret.",
        isEnd: false,
        choices: [
          { label: "Descendre dans le passage secret", target: "n10" },
          { label: "Chercher une autre issue", target: "n4" },
        ],
      },
      {
        id: "n6",
        label: "N6",
        text: "Vous vous adressez à la silhouette encapuchonnée. Elle se retourne lentement, dévoilant un visage d'une beauté surnaturelle, aux yeux blancs lumineux. « Enfin, un courageux. Je suis le Gardien du Seuil. Pour passer, tu dois répondre à mon énigme. »\n\nElle vous fixe, attendant votre réponse.",
        isEnd: false,
        choices: [
          { label: "Accepter l'énigme du Gardien", target: "n11" },
          { label: "Refuser et l'attaquer", target: "n12" },
        ],
      },
      {
        id: "n7",
        label: "N7",
        text: "Vous posez la main sur le cristal. Une lumière aveuglante vous submerge. Des visions défilent à une vitesse vertigineuse — des batailles anciennes, des royaumes oubliés, et au centre de tout, une silhouette qui vous ressemble.\n\n« Tu es la clé », murmure une voix ancestrale. Quand vous rouvrez les yeux, le cristal est éteint, et une marque lumineuse brille sur votre main.",
        isEnd: false,
        choices: [
          { label: "Suivre la marque qui semble vous guider", target: "n13" },
          { label: "Ignorer la marque et continuer votre chemin", target: "n4" },
        ],
      },
      {
        id: "n8",
        label: "N8",
        text: "La créature incline la tête et émet des sons qui forment lentement des mots dans votre langue : « Tu es le premier à me parler sans trembler. Je suis le gardien de ce passage. Seuls les cœurs purs peuvent passer. »\n\nElle s'efface contre le mur, révélant une porte ornée derrière elle.",
        isEnd: false,
        choices: [
          { label: "Ouvrir la porte ornée", target: "n14" },
          { label: "Questionner la créature sur ses origines", target: "n11" },
        ],
      },
      {
        id: "n9",
        label: "N9",
        text: "Vous chargez la créature, épée levée. Elle esquive avec une rapidité surnaturelle et vous désarme d'un geste fluide. Vous vous retrouvez à terre, vulnérable.\n\nLa créature se penche sur vous et dit : « La force n'est pas toujours la réponse. Mais puisque tu as choisi cette voie, prouve ta valeur au combat. »\n\nElle se met en garde.",
        isEnd: false,
        choices: [
          { label: "Vous relever et combattre loyalement", target: "n14" },
          { label: "Profiter d'une distraction pour fuir", target: "n10" },
        ],
      },
      {
        id: "n10",
        label: "N10",
        text: "Vous vous enfoncez dans les profondeurs. Le passage secret mène à une grotte naturelle immense, éclairée par des champignons bioluminescents. Au centre, un autel ancien porte un livre ouvert.\n\nEn vous approchant, les symboles du livre s'illuminent. C'est un grimoire de savoir ancien, contenant des secrets sur l'origine de ce lieu et sur la prophétie qui vous concerne.",
        isEnd: false,
        choices: [
          { label: "Lire le grimoire en entier", target: "fin1" },
          { label: "Prendre le livre et continuer", target: "n13" },
        ],
      },
      {
        id: "n11",
        label: "N11",
        text: "Vous échangez avec l'entité. Elle vous révèle que ce lieu est un vestige d'une civilisation disparue, et que vous avez été choisi pour décider de son héritage. « Chaque choix que tu fais ici résonne à travers les âges. »\n\nElle vous offre un artefact : un pendentif capable de révéler la vérité cachée dans les murs.",
        isEnd: false,
        choices: [
          { label: "Accepter le pendentif", target: "n13" },
          { label: "Demander comment fuir ce lieu", target: "fin2" },
        ],
      },
      {
        id: "n12",
        label: "N12",
        text: "Votre attaque est déviée comme si vous frappiez un mur de brume. Le Gardien soupire. « La violence aveugle mène toujours à la chute. »\n\nD'un geste, il vous téléporte dans une salle souterraine obscure. Vous êtes désorienté, mais une lueur au loin semble indiquer une sortie. Derrière vous, des bruits de pas — plusieurs créatures approchent.",
        isEnd: false,
        choices: [
          { label: "Courir vers la lumière", target: "n14" },
          { label: "Vous cacher et tendre une embuscade", target: "n10" },
        ],
      },
      {
        id: "n13",
        label: "N13",
        text: "Guidé par la marque sur votre main, vous parcourez des couloirs qui semblent se tordre autour de vous. Finalement, vous débouchez dans une salle au plafond étoilé. Au centre, un portail tourbillonne d'une énergie couleur azur.\n\nVous sentez que c'est la dernière étape. Au-delà de ce portail se trouve soit votre destinée, soit votre fin.",
        isEnd: false,
        choices: [
          { label: "Traverser le portail", target: "fin1" },
          { label: "Sceller le portail et rester", target: "fin3" },
        ],
      },
      {
        id: "n14",
        label: "N14",
        text: "Après un combat éprouvant, vous emergez dans une salle de contrôle technologique. Des écrans affichent des données indéchiffrables, mais un message en français clignote : « L'Épreuve est presque terminée. Rendez-vous au cœur du nexus. »\n\nUn hologramme apparaît — une femme d'un âge avancé, au regard bienveillant. « Tu as fait mieux que tous ceux qui t'ont précédé. Mais le plus dur reste à venir. »",
        isEnd: false,
        choices: [
          { label: "Suivre l'hologramme vers le nexus", target: "n13" },
          { label: "Explorer la salle de contrôle", target: "n10" },
        ],
      },
      {
        id: "fin1",
        label: "Fin — La destinée",
        text: "Vous traversez le portail et vous vous retrouvez dans une dimension où le temps et l'espace n'ont plus de sens. Vous comprenez maintenant — vous n'êtes pas le premier élu, mais vous êtes celui qui a mené la quête à son terme. \n\nLa civilisation disparue vous confie sa sagesse, et vous devenez le nouveau Gardien du Savoir. Votre nom sera chanté à travers les âges.\n\n— FIN —",
        isEnd: true,
        choices: [],
      },
      {
        id: "fin2",
        label: "Fin — L'évasion",
        text: "Vous trouvez une issue de secours qui mène à la surface. La lumière du jour vous éblouit. Derrière vous, l'entrée du temple se referme dans un grondement sourd. Vous êtes libre, mais les questions restent sans réponse.\n\nPeut-être était-ce pour le mieux. Certains mystères ne sont pas faits pour être résolus. Vous rentrez chez vous, changé à jamais par cette épreuve.\n\n— FIN —",
        isEnd: true,
        choices: [],
      },
      {
        id: "fin3",
        label: "Fin — Le sacrifice",
        text: "Vous scellez le portail, sacrifiant ainsi votre chance de connaître la vérité ultime. La marque sur votre main s'éteint, et le temple commence à s'effondrer. Vous vous échappez de justesse.\n\nDehors, le monde est comme avant. Mais vous portez en vous le poids des secrets que vous avez protégés. Parfois, le véritable courage est de savoir renoncer.\n\n— FIN —",
        isEnd: true,
        choices: [],
      },
    ];

    return NextResponse.json({
      content: [{ text: JSON.stringify({ nodes }) }],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("generate-adventure error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
