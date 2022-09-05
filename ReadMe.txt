Programme de simulateur de particules coulombiennes.


Le projet fonctionne en JavaScript avec le framework Vue (https://cli.vuejs.org/guide/installation.html)

Le fichier App.vue affiche la barre de navigation et le composant a afficher selon le chemin (route) selectionné.

Chacun des modes dans les fichiers contenus dans le dossier views ont la structure suivante.
    La vue est coupée en 3 parties:
        -Le composant graphic qui est contenu dans le dossier components.
        -Le composant boite de calculs qui est aussi contenu dans composents
        -La partie propriétés qui affiche les propriétés et permet de les modifier
    Les popup sont aussi gérés dans les fichier views.

Les données des atomes sont listés dans AtomsData contenu dans store-modules
La gestion des données et les données plus simples sont gérés dans index dans store