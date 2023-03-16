# Presentation

Ce dépôt a été crée depuis le template [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/) dans le cadre des développements du plugin Tabou2.


# Référence de versions

|     | MapStoreExtension | mapstore2-georchestra  | MapStore2 |
|-----|-------------------|------------------------|-----------|
| tag / commit | v2022.02.00       | 2022.02.00          | 814ac1528efa37fd04b1b69eb5999d39d7a8f2c7      |

# Documentation

Pour configurer le plugin, la documentation utile est disponible en ligne au format [readthedocs ici](https://geor-tabou2-front.readthedocs.io/fr/develop/_pages/doc.html).

L'ensemble des sources de la documentation sont accessibles dans le répertoire [/docs](https://github.com/sigrennesmetropole/geor_tabou2_front/tree/develop/docs).

# Installation

Une installation de NodeJS >= 12.16.1 est prérequise ([téléchargement](https://nodejs.org/en/download/releases/)).

* Réaliser un clone du dépôt avec l'option `--recursive` afin de récupérer les sous-modules :

`git clone --recursive https://github.com/sigrennesmetropole/geor_tabou2_front`

* 1er démarrage 

Pour les développements et les tests :

 > Bien vérifier via la commande `git submodule` que le commit de référence est identique à celui indiqué dans la branche (voir dans la branche via GitHub directement) avant de lancer la commande `npm install`
 

```
cd geor_tabou2_front
rm -rf nodes_*
rm package-*
git submodule update
npm install
npm start
```

L'application démarre par défaut sur `http://localhost:8081`. Vous devrez ensuite choisir une carte pour voir le plugin.

Vous pouvez modifier le port 8081 au sein du fichier package.json au sein des `scripts` de lancement.


 > ATTENTION :En cas de changement de branche, relancer systématiquement `git submodule`, supprimer le répertoire `node_module` et relancer la commande `npm install`

* Démarrage classique (prend en compte le proxy webpack) du front uniquement : 

`npm run fe:start`

* Démarrage en mode pré-prod :

```
npm run start
```

La commande précédente va lancer simultanément les commandes `ext:start` et `ext:startapp` (voir fichier `package.json`).

### Modifier la carte de base

La carte doit être modifiée dans le fichier `configs/config.json`.

### Utilisation d'un geoserver spécifique

Si vous devez ajouter un geoserver, il faudra également le rajouter dans le fichier configs/localConfig.json dans la liste `useCORS` tel que :

```
  "useCORS": [
    "http://demo.geo-solutions.it/geoserver",
    "https://demo.geo-solutions.it:443/geoserver",
    "https://demo.geo-solutions.it/geoserver",
    "https://nominatim.openstreetmap.org",
    "http://cloudsdi.geo-solutions.it",
    "https://gs-stable.geo-solutions.it/geoserver",
    "https://gs-stable.geo-solutions.it:443/geoserver",
    "https://gis.jdev.fr/geoserver"
  ]
```

### Proxy et démarrage local

MapStore2 utilise un proxy qui lui est propre. Si besoin, il faudra alors rajouter des règles pour qu'elle soit prise en compte en local.

1. Créer un fichier de règle proxy proxyConfig.js avec ce type de contenu :

```
module.exports = {
    '/tabou2': {
        target: "https://portail-test.sig.rennesmetropole.fr",
        secure: false,
        headers: {
            host: "portail-test.sig.rennesmetropole.fr"
        }
    }
;
```

2. Charger ce fichier au démarrage du serveur webpack local :

```
const proxyConfig = require('./proxyConfig');

module.exports = require('./MapStore2/build/buildConfig')(
    ...
    proxyConfig
);
```

On pointera dans cet exemple une requête type `/tabou2/{...}` vers https://portail-test.sig.rennesmetropole.fr.

### Build Extension

`npm run ext:build`

L'extension ne peut être importée dans MapStore2 en l'état. Le bundler Webpack doit être utilisé ensuite pour builder l'extension vers une fichier ZIP avec le nom du plugin (ex: Tabou2.zip).

Les ressources en sortie et le ZIP seront disponibles dans le répertoire `/dist` à la racine du dépôt.


## Pour aller plus loin sur les plugins MapStore2

Rendez-vous sur le dépôt initial [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/) pour plus de précisions.
