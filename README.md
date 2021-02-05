# Presentation

Ce dépôt a été crée depuis le template [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/) dans le cadre des développements du plugin Tabou2.


## Installation

Une installation de NodeJS >= 12.16.1 est prérequise ([téléchargement](https://nodejs.org/en/download/releases/)).

* Réaliser un clone du dépôt avec l'option `--recursive` afin de récupérer les sous-modules :

`git clone --recursive https://github.com/sigrennesmetropole/geor_tabou2_front`

* 1er démarrage 

Pour les développements et les tests :

`npm install`

`npm start`

L'application démarre par défaut sur `http://localhost:8081`. Vous devrez ensuite choisir une carte pour voir le plugin.

Une issue pour définir la carte par défaut est ouverte sur le dépôt [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/).

Vous pouvez modifier le port 8081 au sein du fichier package.json au sein des `scripts` de lancement.

* Démarrage classique : 

`npm start`

### Build Extension

`npm run ext:build`

L'extension ne peut être importée dans MapStore2 en l'état. Le bundler Webpack doit être utilisé ensuite pour builder l'extension vers une fichier ZIP avec le nom du plugin (ex: Tabou2.zip).

Les ressources en sortie et le ZIP seront disponibles dans le répertoire `/dist` à la racine du dépôt.


### Test & import du Module
En mode développement, le projet contient le plugin et ses ressources.

En production, vous devrez improter le plugin dynamiquement via le back-end MapStore (ex: via l'API ou l'IHM prévue à cet effet).

You can simulate in dev-mode this condition by:

Cet import peut-être simulé en commentant dans le fichier `js/app.js` les lignes précisées comme "à commenter" dans `js/app.jsx`. Cela afin de charger le plugin dans l'application principale.

```javascript
// Import plugin directly in application. Comment the 3 lines below to test the extension live.
const extensions = require('./extensions').default;
plugins.plugins = { ...plugins.plugins, ...extensions };
ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './assets/translations']);
// end of lines to comment
```

- Ensuite, exécuter dans 2 consoles (terminaux) differentes ces commandes :
  - `npm run ext:start`
  - `npm run ext:startapp`

Ces commandes vont démarrer :
* sur le port 8081, un serveur webpack avec MapStore2 en simulant une carte et le fichier `extensions.json` (ce fichier est écrit ensuite lors de l'import des modules)

* sur le port 8082 les modules à charger
This will run webpack dev server on port 8081 with MapStore, simulating the `extensions.json`, and will run on port 8082 the effective modules to load.

## Pour aller plus loin

Les extensions sont basées sur WebPack 5 [Module Federation](https://webpack.js.org/concepts/module-federation/).
MapStore utilise `ModuleFederationPlugin` pour utiliser les libraires partagées et utiliser les points d'entrés nécessaires.

Rendez-vous sur le dépôt initial [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/) pour plus de précisions.

### Limitations

Seuls les fichiers de format `css`, `js` and `png`, `jpg`, `gif` (et autres ressources de translation ainsi que les ressources relatives au fichier `index.json`).
