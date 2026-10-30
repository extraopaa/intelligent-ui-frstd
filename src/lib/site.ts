const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || "https://github.com/francestudent";

export const SITE = {
  name: "France Student",
  product: "Intelligent UI",
  fullName: "France Student · Intelligent UI",
  tagline: "L'interface qui répond",
  description:
    "L'IA de l'Offre France Student qui transforme chaque réponse en interface claire : tableaux, graphiques, checklists et formulaires.",
  offerUrl: "https://my.francestudent.org/store/offreia",
  accountUrl: "https://my.francestudent.org/",
  loginUrl: "https://ia.francestudent.org/login",
  supportUrl: "https://my.francestudent.org/submitticket.php",
  apiDocsUrl: "https://api.francestudent.ai/swagger-ui/index.html",
  websiteUrl: "https://francestudent.org/",
  githubUrl,
  githubConfigured: Boolean(process.env.NEXT_PUBLIC_GITHUB_URL?.trim()),
  license: "MIT",
} as const;
