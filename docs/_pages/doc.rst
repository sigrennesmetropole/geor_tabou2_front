*********************************
Documentation
*********************************

Cette section vous permettra de modifier, générer et déployer la documentation que vous êtes en train de consulter.


Construire et déployer la documentation
---------------------------------------

- Les sources de la documentation sont localisées dans le répertoire **/docs** du dépôt

- Nous voulons que notre documentation soit construite (build) dans le dossier à créer :

::

    /var/www/tabou2/doc

- Si vous avez utilisé XAMPP (voir "xampp"::), le dossier cible où sera construite la documentation sera dans ce dossier à créer (sous windows) :

::

    C:\xampp\tabou2-doc\

- Nous avons ensuite à passer la commande (les chemins sont à adapter):


::

    sphinx-build -b html git/geor_tabou2_front/docs /var/www/tabou2-doc/

- La documentation est maintenant dans le dossier de notre choix :

::

    /var/www/tabou2-doc/

    ou pour XAMPP:

    C:\xampp\tabou2-doc\

- Si vous mettez à jour les sources de la documentation ou bien si vous la modifiez, vous devrez relancer cette commande systématiquement

- Avec XAMPP Accédez à la documentation via localhost/tabou2-doc (tabou2-doc étant le nom de dossier que vous avez utilisé)


.. _installxamp:

Installer XAMPP (windows)
-------------------------

- Téléchargez `XAMPP <https://www.apachefriends.org/fr/download.html>`_
- Lancez XAMPP pour afficher l'interface d'administration (GUI)
- Sur la ligne du module "Apache", à droite cliquez sur "Start" au sein des actions
- "Apache" doit passer en vert dans la colonne "Module"
- Cliquez sur "Explorer" dans la colonne tout à droite
- Une fenêtre d'exploration s'affiche (par défaut vers C:\xampp)
- Rechercher "htdocs" dans la fenêtre d'exploration
- Créez un dossier "tabou2-doc"

C'est dans le dossier "tabou2-doc" que sera déployée la documentation après la phase de build (voir plus haut).

- Accédez au dossier avec votre navigateur via l'URL :

::

    localhost/tabou2-doc

Documentation
-------------

Pour obtenir plus d'information sur la syntaxe et sphinx :

#. `Sphinx <http://www.sphinx-doc.org/en/master/>`_
#. `Sphinx syntaxe tutoriel <https://thomas-cokelaer.info/tutorials/sphinx/rest_syntax.html>`_
#. `Sphinx syntaxe infos <http://openalea.gforge.inria.fr/doc/openalea/doc/_build/html/source/sphinx/rest_syntax.html>`_
#. `Sphinx example syntaxe <https://matplotlib.org/sampledoc/cheatsheet.html>`_