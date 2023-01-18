# Presentation

Ce dépôt a été crée depuis le template [MapStore Extensions](https://mapstore.readthedocs.io/en/latest/developer-guide/extensions/) dans le cadre des développements du plugin Tabou2.

# Documentation

Pour configurer le plugin, la documentation utile est disponible en ligne au format [readthedocs ici](https://geor-tabou2-front.readthedocs.io/fr/develop/_pages/doc.html).

L'ensemble des sources de la documentation sont accessibles dans le répertoire [/docs](https://github.com/sigrennesmetropole/geor_tabou2_front/tree/develop/docs).

# Installation

Une installation de NodeJS >= 12.16.1 est prérequise ([téléchargement](https://nodejs.org/en/download/releases/)).

* Réaliser un clone du dépôt avec l'option `--recursive` afin de récupérer les sous-modules :

`git clone --recursive https://github.com/sigrennesmetropole/geor_tabou2_front`

* 1er démarrage 

Pour les développements et les tests :



```
cd MapStore2
git checkout master
cd ..
npm install
npm start
```

L'application démarre par défaut sur `http://localhost:8081`. Vous devrez ensuite choisir une carte pour voir le plugin.

Vous pouvez modifier le port 8081 au sein du fichier package.json au sein des `scripts` de lancement.

* Démarrage classique (prend en compte le proxy webpack) : 

`npm start`

* Démarrage en mode pré-prod :

```
npm run ext:start
npm run ext:startapp
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
