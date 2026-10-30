import type { UIResponse } from "@/lib/ui-schema";

/**
 * Réponses scénarisées du mode démo.
 *
 * Elles servent à tester toute la chaîne (streaming SSE, parsing partiel,
 * validation Zod, rendu des blocs) sans clé API. Chaque scénario met en avant
 * un sous-ensemble du catalogue de composants.
 */

const travel: UIResponse = {
  title: "Week-end à Strasbourg",
  blocks: [
    {
      type: "heading",
      text: "Deux jours à Strasbourg pour deux, budget 400 €",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Un programme équilibré entre la Petite France, la cathédrale et une pause gourmande. Le budget est estimé pour deux personnes, **hors transport jusqu'à Strasbourg**.",
    },
    {
      type: "stats",
      items: [
        { label: "Budget estimé", value: "382 €", hint: "Pour deux personnes" },
        { label: "Durée", value: "2 jours", hint: "1 nuit sur place" },
        { label: "Étapes", value: "7", hint: "Dont 3 gratuites" },
      ],
    },
    {
      type: "timeline",
      title: "Programme proposé",
      items: [
        {
          date: "Samedi matin",
          title: "Petite France",
          description: "Balade dans les ruelles, les quais et les ponts couverts.",
        },
        {
          date: "Samedi après-midi",
          title: "Cathédrale et centre historique",
          description: "Visite de la cathédrale, puis pause sur la place Gutenberg.",
        },
        {
          date: "Samedi soir",
          title: "Dîner alsacien",
          description: "Une winstub du centre, en réservant à l'avance.",
        },
        {
          date: "Dimanche",
          title: "Neustadt et Orangerie",
          description: "Architecture, parc et musée selon la météo.",
        },
      ],
    },
    {
      type: "table",
      columns: ["Poste", "Estimation"],
      rows: [
        ["Hébergement (1 nuit)", "140 €"],
        ["Repas", "120 €"],
        ["Visites et transports", "60 €"],
        ["Divers", "62 €"],
      ],
      caption: "Budget indicatif pour deux personnes, hors trajet.",
    },
    {
      type: "checklist",
      title: "À emporter",
      items: [
        { id: "billets", label: "Billets de train" },
        { id: "reservation", label: "Réservation de l'hébergement" },
        { id: "parapluie", label: "Parapluie ou veste imperméable" },
        { id: "chaussures", label: "Chaussures de marche" },
      ],
    },
    {
      type: "actions",
      title: "Ajuster le programme",
      actions: [
        {
          label: "Version plus nature",
          prompt:
            "Propose une version plus nature du week-end à Strasbourg, avec moins de musées et plus de balades.",
          variant: "primary",
        },
        {
          label: "Réduire le budget",
          prompt:
            "Réduis le budget du week-end à Strasbourg à 300 € pour deux personnes, en gardant l'essentiel.",
        },
      ],
    },
  ],
  followUps: [
    "Ajoute une adresse pour le dîner à Strasbourg",
    "Adapte le programme du week-end à Strasbourg à la pluie",
    "Propose une version sans voiture pour Strasbourg",
  ],
};

const travelBudget: UIResponse = {
  title: "Strasbourg, version 300 €",
  blocks: [
    {
      type: "heading",
      text: "Deux jours à Strasbourg pour 300 €",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "En réduisant l'hébergement et en privilégiant les visites gratuites, le week-end tient dans **300 € pour deux**. Le confort baisse un peu, pas l'essentiel.",
    },
    {
      type: "stats",
      items: [
        { label: "Budget estimé", value: "296 €", hint: "Pour deux personnes" },
        { label: "Nuit sur place", value: "1", hint: "Hébergement en périphérie" },
        { label: "Activités", value: "5", hint: "Dont 3 gratuites" },
      ],
    },
    {
      type: "table",
      columns: ["Poste", "Estimation"],
      rows: [
        ["Hébergement (1 nuit)", "120 €"],
        ["Repas", "90 €"],
        ["Visites", "40 €"],
        ["Transports", "30 €"],
        ["Divers", "16 €"],
      ],
      caption: "Total : 296 €. Marge de sécurité : 4 €.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Ce qui change",
      content:
        "Hébergement en périphérie, un seul restaurant et visites gratuites le dimanche. Prévoyez 20 à 30 € de marge si vous ajoutez un café ou un musée.",
    },
    {
      type: "checklist",
      title: "Arbitrages à valider",
      items: [
        { id: "hebergement", label: "Accepter un hôtel à 15 minutes du centre" },
        { id: "repas", label: "Remplacer un restaurant par un pique-nique" },
        { id: "visites", label: "Choisir les visites gratuites du dimanche" },
      ],
    },
    {
      type: "actions",
      actions: [
        {
          label: "Revenir au programme à 400 €",
          prompt:
            "Reviens au programme initial du week-end à Strasbourg avec un budget de 400 €.",
          variant: "primary",
        },
        {
          label: "Trouver une activité gratuite",
          prompt:
            "Trouve une activité gratuite à Strasbourg pour le week-end, adaptée à deux personnes.",
        },
      ],
    },
  ],
  followUps: [
    "Trouve un hôtel à Strasbourg à moins de 120 €",
    "Propose un pique-nique à Strasbourg",
    "Ajoute un plan B à Strasbourg en cas de pluie",
  ],
};

const travelNature: UIResponse = {
  title: "Strasbourg côté nature",
  blocks: [
    {
      type: "heading",
      text: "Un week-end à Strasbourg au vert",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Moins de musées, plus de parcs et de quais. Ce programme garde la Petite France et la cathédrale, mais réserve une large place aux balades et aux pauses au grand air.",
    },
    {
      type: "timeline",
      title: "Trois balades, deux pauses",
      items: [
        {
          date: "Samedi matin",
          title: "Petite France au lever du jour",
          description: "Les quais sont calmes avant 10 h. Idéal pour les photos.",
        },
        {
          date: "Samedi après-midi",
          title: "Parc de l'Orangerie",
          description: "Promenade, bancs au bord de l'eau et petite pause en terrasse.",
        },
        {
          date: "Dimanche matin",
          title: "Jardin des Deux Rives",
          description: "Balade le long du Rhin, à cheval entre la France et l'Allemagne.",
        },
        {
          date: "Dimanche après-midi",
          title: "Neustadt à pied",
          description: "Architecture et quais, avec un détour par la cathédrale.",
        },
      ],
    },
    {
      type: "callout",
      variant: "success",
      title: "À retenir",
      content:
        "Le Jardin des Deux Rives est accessible à pied depuis la Neustadt. Vérifiez les horaires du parc de l'Orangerie hors saison.",
    },
    {
      type: "checklist",
      title: "Dans le sac",
      items: [
        { id: "chaussures", label: "Chaussures de marche" },
        { id: "gourde", label: "Gourde réutilisable" },
        { id: "coupevent", label: "Coupe-vent léger" },
        { id: "blanket", label: "Petite couverture pour le parc", checked: true },
      ],
    },
    {
      type: "actions",
      actions: [
        {
          label: "Version culturelle",
          prompt:
            "Propose une version plus culturelle du week-end à Strasbourg, avec deux musées et la cathédrale.",
          variant: "primary",
        },
        {
          label: "Ajouter une sortie vélo",
          prompt:
            "Ajoute une sortie à vélo au programme nature du week-end à Strasbourg.",
        },
      ],
    },
  ],
  followUps: [
    "Où louer un vélo à Strasbourg ?",
    "Quelle balade à Strasbourg faire sous la pluie ?",
    "Ajoute un café près du parc de l'Orangerie",
  ],
};

const compare: UIResponse = {
  title: "Télétravail ou présentiel ?",
  blocks: [
    {
      type: "heading",
      text: "Télétravail ou présentiel : que choisir ?",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Les deux modes ne répondent pas aux mêmes besoins. Le bon choix dépend surtout du type de travail, de l'expérience des personnes et de la qualité du collectif.",
    },
    {
      type: "compare",
      left: {
        title: "Télétravail",
        points: [
          "Concentration et flexibilité",
          "Supprime le temps de trajet",
          "Isole et brouille les frontières",
          "Demande une bonne coordination écrite",
        ],
      },
      right: {
        title: "Présentiel",
        points: [
          "Coordination et apprentissage rapides",
          "Sépare vie professionnelle et personnelle",
          "Temps de trajet et interruptions",
          "Moins de flexibilité",
        ],
      },
      verdict:
        "Pour un travail de création ou de coordination, un rythme hybride de 2 à 3 jours sur site est souvent le meilleur compromis.",
    },
    {
      type: "table",
      columns: ["Critère", "Télétravail", "Présentiel"],
      rows: [
        ["Concentration", "Fort", "Variable"],
        ["Apprentissage", "Moyen", "Fort"],
        ["Flexibilité", "Fort", "Faible"],
        ["Lien d'équipe", "À entretenir", "Naturel"],
      ],
      caption: "Ce tableau résume les tendances, pas une règle absolue.",
    },
    {
      type: "callout",
      variant: "info",
      title: "À tester avant de trancher",
      content:
        "Choisissez un rythme sur quatre semaines, puis évaluez la concentration, la qualité des échanges et la fatigue. Ajustez à partir de données réelles plutôt que d'une préférence générale.",
    },
    {
      type: "actions",
      title: "Passer à l'action",
      actions: [
        {
          label: "Construire un plan hybride",
          prompt:
            "Construis un plan hybride de télétravail sur quatre semaines pour une équipe de six personnes, avec deux jours sur site par semaine.",
          variant: "primary",
        },
        {
          label: "Lister les freins",
          prompt:
            "Liste les principaux freins au télétravail dans une équipe et propose une réponse concrète pour chacun.",
        },
      ],
    },
  ],
  followUps: [
    "Quel rythme de télétravail pour une équipe junior ?",
    "Comment mesurer l'impact du télétravail ?",
    "Propose une charte de télétravail d'équipe",
  ],
};

const eventCompare: UIResponse = {
  title: "Cocktail ou dîner assis ?",
  blocks: [
    {
      type: "heading",
      text: "Deux formats, deux budgets",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Pour 80 personnes, le format change surtout le coût du lieu, de la restauration et du service. Le cocktail est plus court et plus flexible ; le dîner assis installe une expérience plus formelle.",
    },
    {
      type: "compare",
      left: {
        title: "Cocktail",
        points: [
          "Format debout, plus convivial",
          "Budget maîtrisé",
          "Circulation facile entre les invités",
          "Moins de temps assis pour les discours",
        ],
      },
      right: {
        title: "Dîner assis",
        points: [
          "Expérience plus formelle",
          "Plan de table et service à prévoir",
          "Budget plus élevé",
          "Cadre propice aux prises de parole",
        ],
      },
      verdict:
        "Pour un lancement produit ou un anniversaire, le cocktail est souvent suffisant. Le dîner assis se justifie pour un dîner de gala ou une remise de prix.",
    },
    {
      type: "table",
      columns: ["Poste", "Cocktail", "Dîner assis"],
      rows: [
        ["Lieu", "900 €", "1 400 €"],
        ["Restauration", "1 600 €", "2 800 €"],
        ["Service", "300 €", "700 €"],
        ["Animation", "500 €", "400 €"],
        ["Total indicatif", "3 300 €", "5 300 €"],
      ],
      caption: "Estimations pour 80 personnes, hors décoration et sécurité.",
    },
    {
      type: "callout",
      variant: "info",
      title: "À arbitrer",
      content:
        "Le cocktail laisse plus de marge pour la scénographie ou un photographe. Le dîner assis demande un plan de table, un timing plus strict et un service renforcé.",
    },
    {
      type: "actions",
      actions: [
        {
          label: "Revenir au simulateur",
          prompt: "Estime le budget d'un événement de 80 personnes.",
          variant: "primary",
        },
        {
          label: "Détailler le cocktail",
          prompt:
            "Détaille le budget d'un événement cocktail de 80 personnes, poste par poste.",
        },
      ],
    },
  ],
  followUps: [
    "Quel format pour un lancement produit ?",
    "Comment réduire le coût du dîner ?",
    "Ajoute une option végétarienne",
  ],
};

const calc: UIResponse = {
  title: "Budget événementiel",
  blocks: [
    {
      type: "heading",
      text: "Estimer le budget d'un événement",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Partez d'un coût moyen par participant, puis ajustez selon le format. Le simulateur donne un ordre de grandeur, pas un devis.",
    },
    {
      type: "slider",
      title: "Simulateur",
      label: "Nombre de participants",
      min: 10,
      max: 500,
      step: 10,
      defaultValue: 80,
      unit: "personnes",
      formula: "value * 42",
      resultLabel: "Budget estimé",
      resultUnit: " €",
      hint: "Base de 42 € par participant : lieu, restauration, animation et communication.",
    },
    {
      type: "stats",
      items: [
        { label: "Base par participant", value: "42 €", hint: "Hypothèse de travail" },
        { label: "Postes budgétés", value: "5", hint: "Lieu, repas, animation…" },
        { label: "Marge conseillée", value: "15 %", hint: "Pour les imprévus" },
      ],
    },
    {
      type: "chart",
      chartType: "bar",
      title: "Répartition indicative pour 80 personnes",
      data: [
        { label: "Lieu", value: 1200 },
        { label: "Restauration", value: 900 },
        { label: "Animation", value: 600 },
        { label: "Communication", value: 360 },
        { label: "Imprévus", value: 300 },
      ],
      unit: "€",
      caption: "Total : 3 360 €, soit 42 € par participant.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "À vérifier",
      content:
        "Le lieu et la restauration varient fortement selon la ville et la saison. Demandez au moins deux devis avant de figer l'enveloppe.",
    },
    {
      type: "actions",
      actions: [
        {
          label: "Affiner avec un formulaire",
          prompt:
            "Crée un formulaire de brief pour affiner le budget d'un événement de 80 personnes.",
          variant: "primary",
        },
        {
          label: "Comparer deux formats",
          prompt:
            "Compare le budget d'un événement de 80 personnes en format cocktail et en format dîner assis.",
        },
      ],
    },
  ],
  followUps: [
    "Détaille le poste restauration du budget événement",
    "Que faire avec 5 000 € pour un événement ?",
    "Ajoute une ligne sécurité au budget événement",
  ],
};

const projectBrief: UIResponse = {
  title: "Brief de projet",
  blocks: [
    {
      type: "heading",
      text: "Cadrons votre projet en quelques questions",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Remplissez ce brief. À l'envoi, je propose un plan de projet, les risques principaux et une première estimation de charge.",
    },
    {
      type: "form",
      title: "Votre brief",
      description: "Les champs marqués d'un astérisque sont nécessaires pour démarrer.",
      fields: [
        {
          name: "projet",
          label: "Nom du projet",
          type: "text",
          placeholder: "Ex : Refonte du site vitrine",
          required: true,
        },
        {
          name: "objectif",
          label: "Objectif principal",
          type: "textarea",
          placeholder: "Ex : permettre aux visiteurs de demander un devis en ligne",
          required: true,
        },
        {
          name: "budget",
          label: "Budget",
          type: "select",
          options: [
            "Moins de 5 000 €",
            "5 000 – 15 000 €",
            "15 000 – 50 000 €",
            "Plus de 50 000 €",
          ],
          required: true,
        },
        {
          name: "echeance",
          label: "Échéance souhaitée",
          type: "text",
          placeholder: "Ex : juin 2027",
        },
        {
          name: "contraintes",
          label: "Contraintes ou points d'attention",
          type: "textarea",
          placeholder: "Ex : charte graphique existante, accessibilité, équipe réduite",
        },
      ],
      submitLabel: "Générer le brief",
      promptTemplate:
        "Voici le brief du projet {{projet}}.\nObjectif : {{objectif}}\nBudget : {{budget}}\nÉchéance : {{echeance}}\nContraintes : {{contraintes}}\nPropose un plan de projet en étapes, avec les risques principaux et une première estimation de charge.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Pourquoi ces questions ?",
      content:
        "Le budget et l'objectif changent radicalement le plan. Mieux vaut deux minutes de cadrage qu'une proposition à côté.",
    },
  ],
  followUps: [
    "Quel budget pour un site vitrine ?",
    "Combien de temps pour un prototype ?",
    "Qui doit participer au cadrage du projet ?",
  ],
};

const projectPlan: UIResponse = {
  title: "Plan de projet",
  blocks: [
    {
      type: "heading",
      text: "Un plan en quatre phases",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Proposition de démarrage pour le projet décrit. La charge est une **première estimation** à affiner après un atelier de cadrage.",
    },
    {
      type: "timeline",
      title: "Déroulé proposé",
      items: [
        {
          date: "Semaine 1",
          title: "Cadrage",
          description: "Objectifs, périmètre, personas et critères de succès.",
        },
        {
          date: "Semaines 2–3",
          title: "Conception",
          description: "Arborescence, wireframes et maquettes des écrans clés.",
        },
        {
          date: "Semaines 4–5",
          title: "Réalisation",
          description: "Développement, intégration des contenus et recette interne.",
        },
        {
          date: "Semaine 6",
          title: "Mise en ligne",
          description: "Tests finaux, formation et lancement progressif.",
        },
      ],
    },
    {
      type: "stats",
      items: [
        { label: "Durée estimée", value: "6 sem.", hint: "Avec une équipe réduite" },
        { label: "Lots", value: "3", hint: "Cadrage, conception, réalisation" },
        { label: "Risques majeurs", value: "2", hint: "Contenus et disponibilité" },
      ],
    },
    {
      type: "table",
      columns: ["Lot", "Contenu", "Charge"],
      rows: [
        ["Cadrage", "Ateliers, périmètre, indicateurs", "5 j/h"],
        ["Conception", "Parcours, maquettes, design system", "12 j/h"],
        ["Réalisation", "Développement, contenus, recette", "25 j/h"],
      ],
      caption: "Charge indicative : 42 jours-homme.",
    },
    {
      type: "chart",
      chartType: "line",
      title: "Charge par semaine",
      data: [
        { label: "S1", value: 5 },
        { label: "S2", value: 7 },
        { label: "S3", value: 8 },
        { label: "S4", value: 9 },
        { label: "S5", value: 8 },
        { label: "S6", value: 5 },
      ],
      unit: "j/h",
      caption: "La charge culmine en semaine 4, pendant la réalisation.",
    },
    {
      type: "callout",
      variant: "warning",
      title: "Risques principaux",
      content:
        "La validation des contenus et la disponibilité des intervenants peuvent décaler le planning. Prévoir une marge de 15 % et un point hebdomadaire court.",
    },
    {
      type: "actions",
      actions: [
        {
          label: "Détailler le lot 1",
          prompt:
            "Détaille le lot 1 du plan de projet : cadrage et conception, avec les livrables et les critères de validation.",
          variant: "primary",
        },
        {
          label: "Réduire à quatre semaines",
          prompt:
            "Propose une version en quatre semaines du plan de projet, en réduisant le périmètre et en expliquant les arbitrages.",
        },
      ],
    },
  ],
  followUps: [
    "Qui compose l'équipe du plan de projet ?",
    "Quels livrables pour la recette du plan de projet ?",
    "Ajoute un plan de communication au plan de projet",
  ],
};

const explain: UIResponse = {
  title: "Sous le capot d’Intelligent UI",
  blocks: [
    {
      type: "heading",
      text: "Une réponse, plusieurs formats",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Le modèle ne renvoie pas du HTML libre. Il produit un **JSON strict**, validé par un schéma, puis transformé en composants React. C'est ce qui rend l'interface fiable, accessible et contrôlable.",
    },
    {
      type: "timeline",
      title: "Le trajet d'une réponse",
      items: [
        {
          date: "1",
          title: "Compréhension",
          description: "Le modèle reçoit la question et l'historique de la conversation.",
        },
        {
          date: "2",
          title: "Composition",
          description:
            "Il choisit les blocs utiles : texte, tableau, graphique, formulaire…",
        },
        {
          date: "3",
          title: "Validation",
          description:
            "Chaque bloc est vérifié par Zod. Un bloc invalide n'est jamais rendu.",
        },
        {
          date: "4",
          title: "Rendu",
          description:
            "React affiche les composants et branche les interactions locales.",
        },
      ],
    },
    {
      type: "stats",
      items: [
        { label: "Types de blocs", value: "13", hint: "Texte, données, actions" },
        { label: "Schéma", value: "1", hint: "Source de vérité" },
        { label: "HTML injecté", value: "0", hint: "Markdown sûr uniquement" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Pourquoi un schéma ?",
      content:
        "Il borne ce que le modèle peut produire. Les liens s'ouvrent dans un nouvel onglet, les formules des sliders sont évaluées sans eval et le Markdown ne rend pas de HTML brut.",
    },
    {
      type: "sources",
      items: [
        {
          title: "Next.js — Route Handlers",
          url: "https://nextjs.org/docs/app/getting-started/route-handlers",
          snippet: "Routes API et streaming côté serveur.",
        },
        {
          title: "Zod — Validation TypeScript",
          url: "https://zod.dev",
          snippet: "Schémas et validation des données.",
        },
        {
          title: "OpenAI — Structured Outputs",
          url: "https://platform.openai.com/docs/guides/structured-outputs",
          snippet: "Sorties JSON contraintes par schéma.",
        },
      ],
    },
    {
      type: "actions",
      actions: [
        {
          label: "Voir un exemple de voyage",
          prompt: "Organise un week-end à Strasbourg pour deux avec un budget de 400 €.",
          variant: "primary",
        },
        {
          label: "Tester le simulateur",
          prompt: "Estime le budget d'un événement de 80 personnes.",
        },
      ],
    },
  ],
  followUps: [
    "Comment connecter l’Offre IA ?",
    "Quels blocs sont disponibles ?",
    "Comment fonctionne le streaming ?",
  ],
};

const fallback: UIResponse = {
  title: "Bienvenue dans Intelligent UI",
  blocks: [
    {
      type: "heading",
      text: "Je transforme la réponse en interface",
      level: 2,
    },
    {
      type: "markdown",
      content:
        "Posez une question, décrivez un projet ou demandez une comparaison. Selon le besoin, je réponds avec du texte, un tableau, un graphique, une checklist ou un formulaire.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Mode démo actif",
      content:
        "Aucune clé API n'est configurée. Les réponses sont scénarisées pour tester l'interface. Pour utiliser les modèles de l'Offre IA France Student, ouvrez les réglages et connectez votre clé API.",
    },
    {
      type: "stats",
      items: [
        { label: "Types de blocs", value: "13", hint: "Du texte au formulaire" },
        { label: "Scénarios démo", value: "10", hint: "Sans clé API" },
        { label: "Clé requise", value: "0", hint: "Pour explorer" },
      ],
    },
    {
      type: "actions",
      title: "Quelques idées pour démarrer",
      actions: [
        {
          label: "Organiser un week-end",
          prompt: "Organise un week-end à Strasbourg pour deux avec un budget de 400 €.",
          variant: "primary",
        },
        {
          label: "Comparer deux options",
          prompt: "Compare le télétravail et le présentiel.",
        },
        {
          label: "Créer un brief",
          prompt: "Crée un formulaire de brief pour un projet.",
        },
      ],
    },
  ],
  followUps: [
    "Estime le budget d'un événement de 80 personnes",
    "Comment fonctionne l'Intelligent UI ?",
    "Montre-moi un exemple de graphique",
  ],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Choisit un scénario à partir des mots-clés du dernier message.
 * L'ordre des tests compte : les variantes passent avant les scénarios généraux.
 */
export function pickDemoResponse(prompt: string): UIResponse {
  const text = normalize(prompt);
  const has = (...words: string[]) => words.some((word) => text.includes(word));
  const isTravel = has("strasbourg", "week-end", "weekend", "voyage", "sejour", "vacances", "itineraire");

  if (has("voici le brief", "plan de projet", "brief du projet", "livrables")) {
    return projectPlan;
  }

  if (isTravel && has("nature", "balade", "parc", "vert")) {
    return travelNature;
  }

  if (
    isTravel &&
    has("reduis", "reduire", "300", "resserre", "baisser", "moins cher", "economi")
  ) {
    return travelBudget;
  }

  if (isTravel) {
    return travel;
  }

  if (
    has("cocktail", "diner assis") &&
    has("compare", "comparer", "format", "versus")
  ) {
    return eventCompare;
  }

  if (
    has(
      "compare",
      "comparer",
      "versus",
      " vs ",
      "difference",
      "choisir entre",
      "mieux",
      "teletravail",
      "presentiel"
    )
  ) {
    return compare;
  }

  if (
    has(
      "formulaire",
      "brief",
      "cadrer",
      "questionnaire",
      "site vitrine",
      "prototype",
      "cadrage"
    )
  ) {
    return projectBrief;
  }

  if (
    has(
      "budget",
      "calcul",
      "calculer",
      "cout",
      "prix",
      "tarif",
      "combien",
      "simul",
      "salaire",
      "tva",
      "epargne",
      "participants",
      "evenement",
      "graphique",
      "simulateur"
    )
  ) {
    return calc;
  }

  if (
    has(
      "intelligent ui",
      "studio ui",
      "comment fonctionne",
      "comment ca marche",
      "explique",
      "pourquoi",
      "qu'est-ce",
      "api",
      "blocs",
      "streaming"
    )
  ) {
    return explain;
  }

  return fallback;
}
