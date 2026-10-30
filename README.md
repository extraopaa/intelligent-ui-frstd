# France Student · Intelligent UI

L’interface générative de l’**Offre IA France Student**. Posez une question : l’assistant répond sous forme d’interface structurée — texte, tableaux, graphiques, checklists, simulateurs et formulaires — au lieu d’un simple bloc de texte.

Le modèle ne produit pas de HTML libre. Il renvoie un **JSON strict**, validé par un schéma Zod, puis rendu par des composants React connus. L’interface reste fiable, accessible et contrôlable, avec streaming et interactions locales.

> **Projet open source** — code publié sous licence [MIT](LICENSE).
> Le lien du dépôt affiché dans l’interface se configure avec `NEXT_PUBLIC_GITHUB_URL`.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Sans configuration, l’application démarre en **mode démo** : 10 réponses scénarisées sont streamées pour tester tous les composants. Aucune clé n’est nécessaire.

## Connexion France Student

### Depuis l’interface

L’écran **Connexion France Student** propose deux parcours :

1. **Compte France Student** — le bouton « Continuer avec France Student » ouvre le
   portail officiel [ia.francestudent.org](https://ia.francestudent.org/login).
   L’application ne demande jamais le mot de passe France Student.
2. **Accès développeur** — si vous disposez d’une clé API, ouvrez « Utiliser une clé »,
   collez-la, choisissez un modèle, puis cliquez sur **Tester et connecter**.

> **Pourquoi la connexion automatique n’est pas encore active ?**
> France Student IA utilise un OAuth NextAuth/WHMCS dont le client est confidentiel et
> dont le `redirect_uri` est réservé à `ia.francestudent.org`. Une application tierce ne
> peut donc ni récupérer la session de l’utilisateur, ni échanger le code OAuth sans un
> client autorisé par France Student. L’interface est prête à activer ce flux dès qu’un
> accès OAuth officiel sera accordé. En attendant, le mode démo et la clé API restent
> disponibles.

La clé est vérifiée par un échange minimal avec l’API, puis conservée dans le
`sessionStorage` de l’onglet. Elle disparaît à la fermeture de l’onglet et n’est jamais
enregistrée par l’application.

Pour obtenir une clé, connectez-vous à votre compte France Student :
[my.francestudent.org](https://my.francestudent.org/) puis activez le statut développeur.
La documentation de l’API est disponible sur
[api.francestudent.ai](https://api.francestudent.ai/swagger-ui/index.html).

### Avec une clé serveur

Pour offrir l’accès sans clé personnelle, copiez `.env.example` vers `.env.local` et renseignez une clé côté serveur :

```bash
cp .env.example .env.local
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env.local
```

```dotenv
FRANCESTUDENT_API_KEY=votre-cle-api
FRANCESTUDENT_MODEL=gpt-6-luna
```

Redémarrez `npm run dev`. La clé serveur n’est jamais exposée au navigateur : elle est utilisée uniquement par la route `/api/chat`.

### Variables

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `FRANCESTUDENT_API_KEY` | Clé API de l’Offre IA, envoyée en `Authorization: Bearer` | — |
| `FRANCESTUDENT_MODEL` | Modèle utilisé par défaut | `gpt-6-luna` |
| `FRANCESTUDENT_BASE_URL` | Racine de l’API Responses | `https://api.francestudent.ai/v1` |
| `NEXT_PUBLIC_GITHUB_URL` | URL du dépôt affichée dans l’interface | `https://github.com/francestudent` |
| `AI_API_KEY` / `AI_MODEL` / `AI_BASE_URL` | Alias de compatibilité, utiles pour un mock local | — |

Le mode est **live** dès qu’une clé (client ou serveur) ou qu’une URL de base explicite est disponible. Sinon, il reste en **démo**.

## API France Student

L’application utilise l’endpoint **OpenAI Responses** de France Student :

```http
POST https://api.francestudent.ai/v1/responses
Authorization: Bearer <clé>
Content-Type: application/json
```

```json
{
  "model": "gpt-6-luna",
  "input": [{ "role": "user", "content": "..." }],
  "stream": true
}
```

Points importants :

- L’API ne conserve que le **dernier message user** de `input`. Le prompt système et l’historique sont donc fusionnés dans un unique message utilisateur avant l’envoi.
- Le flux SSE est relayé au navigateur. Les événements `response.output_text.delta`, `response.output_text.done`, `completed` et `error` sont pris en charge, avec un repli sur une réponse JSON complète.
- La liste des modèles est publique via `GET /v1/models`. L’interface propose une sélection courte ; `FRANCESTUDENT_MODEL` permet d’en forcer un autre.
- Les modèles disponibles et leurs tarifs évoluent : consultez votre compte France Student pour connaître votre budget API.

## Fonctionnement

1. **Le client** envoie l’historique à `POST /api/chat`, avec éventuellement la clé et le modèle de l’onglet.
2. **La route serveur** fusionne les instructions et l’historique, puis appelle `${FRANCESTUDENT_BASE_URL}/responses` en streaming.
3. **Le serveur** relaie les deltas en SSE : `{ type: "delta", text: "..." }`.
4. **Le client** parse le JSON partiel à chaque chunk (`partial-json`) et valide chaque bloc avec Zod.
5. **Les blocs valides** sont rendus immédiatement, sans attendre la fin de la réponse.
6. **Les interactions locales** (checklist, slider) restent dans le navigateur. Les actions, formulaires et suggestions renvoient un message utilisateur.

### Catalogue de blocs

| Bloc | Usage |
| --- | --- |
| `markdown` | Texte enrichi, listes, liens, tableaux Markdown |
| `heading` | Titre de section |
| `callout` | Information, succès, avertissement, erreur |
| `stats` | Indicateurs clés |
| `table` | Données tabulaires |
| `chart` | Graphique en barres ou en courbe (SVG natif) |
| `checklist` | Suivi de tâches avec progression |
| `timeline` | Étapes ordonnées |
| `compare` | Comparaison de deux options avec verdict |
| `slider` | Simulateur avec formule arithmétique sûre |
| `form` | Formulaire avec validation et modèle de message |
| `actions` | Boutons qui relancent la conversation |
| `sources` | Références externes |

## Sécurité, données et limites

- Une clé personnelle reste dans le `sessionStorage` de l’onglet. Elle est transmise à notre route serveur, puis à France Student dans l’en-tête `Authorization`; elle n’est ni journalisée ni renvoyée dans les erreurs.
- Une clé serveur définie dans `.env.local` n’est jamais envoyée au navigateur.
- Le modèle ne peut pas injecter de HTML ni de composant arbitraire : seuls les blocs du schéma sont rendus.
- Les liens Markdown et les sources s’ouvrent dans un nouvel onglet avec `rel="noopener noreferrer"`.
- Les formules des sliders sont évaluées par un parseur maison (`+ - * / ( )`, variable `value`), sans `eval`.
- **Aucune persistance locale** : les conversations vivent dans la mémoire de l’onglet. Un rechargement les efface.
- En mode connecté, France Student peut conserver la conversation dans le compte associé à la clé, selon ses propres conditions. Cette application n’ajoute aucune base de données.
- Pas d’authentification complète ni de multi-utilisateur : c’est un MVP.
- Les réponses d’un modèle peuvent contenir des erreurs. Les données chiffrées des démos sont indicatives.

## Scripts

```bash
npm run dev    # serveur de développement
npm run build  # build de production
npm run start  # serveur de production
npm run lint   # ESLint
```

## Stack

- Next.js 16 (App Router, Route Handlers)
- React 19 + TypeScript
- Tailwind CSS v4
- Zod 4 pour le schéma et la validation
- `react-markdown` + `remark-gfm`
- `partial-json` pour le streaming
- `lucide-react` pour les icônes

## Dépannage

| Symptôme | Piste |
| --- | --- |
| `401` | Clé refusée. Vérifiez-la dans les réglages ou générez-en une nouvelle. |
| `402` | Budget API épuisé sur le compte France Student. |
| `403` | Le compte n’a pas accès à ce modèle ou à cette fonctionnalité. |
| `404` | Modèle introuvable : choisissez-en un autre dans les réglages. |
| `429` | Limite de débit atteinte : patientez avant de réessayer. |
| Le mode reste « Démo » | Connectez une clé dans les réglages, ou définissez `FRANCESTUDENT_API_KEY` puis redémarrez. |
| La connexion automatique n’apparaît pas | France Student réserve son OAuth à `ia.francestudent.org`. Utilisez le portail officiel, le mode démo ou une clé API. |
| Réponse brute au lieu de blocs | Le modèle n’a pas respecté le JSON. Essayez un modèle plus capable. |
| La vérification échoue | L’échange de test peut consommer quelques tokens ; vérifiez aussi le réseau et le modèle. |

## Structure

```text
src/
  app/
    api/chat/route.ts       # streaming SSE + adaptateur France Student
    api/connect/route.ts    # vérification d’une clé et d’un modèle
    api/config/route.ts     # état public de la configuration
    globals.css             # thème France Student, Markdown, slider
    layout.tsx
    page.tsx
  components/
    blocks/                 # rendu des 13 types de blocs
    chat/                   # chat, sidebar, composer, connexion
    icons/                  # icône GitHub
  lib/
    ai-config.ts            # variables d’environnement et modèles
    ai-upstream.ts          # appel et lecture du flux Responses
    demo-response.ts        # scénarios du mode démo
    formula.ts              # évaluateur arithmétique sûr
    partial-ui.ts           # parsing JSON partiel
    site.ts                 # marque, liens, licence
    ui-prompt.ts            # prompt système + schéma
    ui-schema.ts            # schéma Zod
    ui-text.ts              # export texte pour la copie
```

## Licence

[MIT](LICENSE) — le code peut être étudié, modifié et réutilisé librement.
