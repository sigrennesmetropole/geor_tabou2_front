*********************************
Généralités techniques
*********************************

Cette section décrit les généralités à propos du fonctionnement du plugin et les principaux répertoires que vous trouverez dans le dépôt GitHub.

Installation
========================

L'installation et les prérequis sont décrits dans le fichier README.md du plugin Tabou2 : 

https://github.com/sigrennesmetropole/geor_tabou2_front/blob/main/README.md


Build
========================

Le build est également décrit dans le fichier README.md.

Cette étape permet de générer un fichier .zip qui pourra être importé dans l'interface d'import d'un plugin MapStore2.


Répertoires utiles
=======================

Nous expliquons certains répertoires utiles.

* MapStore2

Ce répertoire est un sous-module qui contient l'ensemble de MapStore2. Grâce à ce répertoire, nous pouvons utiliser le framework et si besoin l'API MapStore2.

* assets

Ce répertoire contient les traductions et contiendra les fichiers CSS et autres ressources utiles.

* js

Ce répertoire contient le plugin Tabou2


* dist

Ce répertoire apparaîtra lorsqu'un premier build sera réalisé. il contiendra alors le fichier .zip à utiliser pour importer le plugin dans MapStore2 via l'interface prévu à cet effet.

Répertoires du plugin
=======================

Nous aborderons ici l'arborescence des répertoires du plugin Tabou2 dans le répertoire **/js/extension**.



* plugins

C'est le répertoire principale. Pour bien comprendre le plugin Tabou2, vous devez commencer par ce répertoire qui est chargé par MapStore2 en premier.
Il contient l'emplacement du bouton d'accès au module et le composant parent en haut de la chaîne des composants.

Pour bien commencer, il est fortement conseiller de lire la documentation sur les plugins : 
https://mapstore.readthedocs.io/en/latest/developer-guide/plugins-howto.html

* api
Contient l'ensemble des méthodes et appels (URL) du plugin Tabou2 vers un service externe (geoserver, API).
La librairie axios fournie par MapStore2 est utilisée.

* components
Contient tous les composants (fenêtres, comportements) du module.

* actions

Pour en savoir plus sur les actions :

https://mapstore.readthedocs.io/en/latest/developer-guide/writing-actions-reducers.html
https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers

* epics

Consulter https://redux-observable.js.org/docs/basics/Epics.html pour plus d'informations.

* reducers

Pour en savoir plus sur les reducers :

https://mapstore.readthedocs.io/en/latest/developer-guide/writing-actions-reducers.html
https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers

* selectors

Les selectors permettent de ne pas modifier et interagir directement avec l'état (props) des composants.
L'ensemble des actions asynchrones (requêtes) doivent en majorité passer par un selectors.

Voici les bonnes pratiques : 

https://mapstore.readthedocs.io/en/latest/developer-guide/code-conventions.html#access-to-the-state-using-state-selectors

* utils
Contient des méthodes utiles à l'ensemble du plugin.

* constant.js
ce fichier contient les constantes utiles et obligatoires pour le bon fonctionnement du plugin.