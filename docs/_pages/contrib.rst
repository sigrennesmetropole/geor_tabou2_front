*********************************
Contribuer
*********************************

GitHub Workflow
-----------------------

Pour contribuer, corriger ou modifier, ce dépôt respecte les bonnes pratiques du suivantes : 


1. Les modifications doivent porter sur une branche spécifique
2. Les modifications sont centralisées vers une branche **develop** qui contient les modifications de la version en cours de développement
3. La branche master (ou main) contient le code de la dernières release
4. Chaque release correspond à un tag et une branche spécifique
5. Chaque pull request externe (correctif, évolution) doit ciblée la branche **develop**

.. image:: ../_img/contrib/git-flow.png
              :alt: git-flow process
              :align: center

Proposer une modification
-------------------------

Pour proposer une correction d'anomalie ou une évolution, vous devez suivre ces étapes :

- Créer une issue sur Github
- Faire un fork du code
- Créer une branche dans votre fork portant le numéro de l'issue (ex: issue-2287)
- Apporter vos modifications sur cette branche
- Partager cette branche via l'issue pour que les autres puissent tester et obtenir des conseils ou des avis
- Réaliser une pull request via GitHub

La pull request permettra d'importer votre modification dans le code natif. Vous diposerez alors de votre modification de manière native sans vous en préoccuper ultérieurement.

Documentation
-------------

Pour mieux contribuer :

#. `Première contribution <https://github.com/firstcontributions/first-contributions/blob/master/translations/README.fr.md>`_
#. `Comment contribuer <https://opensource.guide/how-to-contribute/>`_