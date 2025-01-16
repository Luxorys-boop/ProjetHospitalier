# Emploi du Temps - CHRU TOURS

## À propos

Ce projet, destiné au Centre Hospitalier Régional de Tours, a pour objectif de concevoir un emploi du temps simple, dynamique et adaptatif. Il facilitera la création, l'édition et l'utilisation des plannings de manière optimale. ✨

## Table des matières

- 🪧 [À propos](#à-propos)
- 📦 [Prérequis](#prérequis)
- 🚀 [Installation](#installation)
- 🛠️ [Utilisation](#utilisation)
- 🤝 [Contribution](#contribution)
- 🏗️ [Construit avec](#construit-avec)
- 📚 [Documentation](#documentation)
- 🏷️ [Gestion des versions](#gestion-des-versions)
- 📝 [Licence](#licence)

## Prérequis ❓

- Javascript
- React
- NodeJS
- Une BDD

## Installation 🔧

### Windows : 
Exécutez le script run.ps1 à la racine. Cela lancera la mise à jour/installation des modules Node. Vous devrez patienter quelques minutes, puis cela ouvrira deux fenêtres :

    1. La première lance l'application web sur un port localhost:5137.
    2. La seconde lance le serveur Node pour accéder à la base de données.

### MacOS : 
Lancez le script run.sh, qui fait exactement ce qui est décrit ci-dessus ! 🚀

#### Attention ❗❗❗
Pensez bien à modifier dans server.js les informations de connexion et à affecter le bon port (par défaut de MySQL). 

✔ Le site sera déployé sur un VPS/Serveur dédié pour la soutenance.



## Utilisation ✈

L'utilisation est assez simple. Vous arrivez directement sur la page d'accueil, qui est en fait l'emploi du temps. Vous pouvez passer par le menu déroulant pour définir vos cycles puis shifts, qui seront appliqués à un utilisateur lors de sa création. 🗓️

Depuis l'accueil, vous pouvez appuyer sur le bouton "Ajouter" pour créer un nouvel utilisateur et l'affecter à votre cycle fraîchement produit. Toutefois, veillez à respecter les contraintes décrites dans l'onglet "Contraintes" ⚠️.

### Quels options sont disponibles ?

- Vous pouvez consulter les statistiques des contraintes, mais aussi le nombre d'infirmiers nécessaires par jour dans votre service, par exemple.

- L'onglet "Indicateur" vous fournira des informations statistiques sur les jours, soirs et matins effectués par vos infirmiers, ainsi que sur leurs congés payés (CP) et leur temps de travail (RH).

## Construit avec 🌠

- Kylian
- Mathys
- Meriem
- Arwa
- Nassim

## Langages & Frameworks

### React

React est une bibliothèque JavaScript pour créer des interfaces utilisateur interactives. Elle permet de construire des composants réutilisables pour des applications web performantes.

Avantages : Rend la création d'interfaces utilisateur plus intuitive, gère efficacement l'état des applications, et permet la création de composants réutilisables.

Documentation : [React MDN](https://reactjs.org/docs/getting-started.html)

### JavaScript

JavaScript est un langage de programmation essentiel pour le développement web. Il permet de rendre les pages web interactives en ajoutant du comportement dynamique aux éléments HTML.

Avantages : Utilisé pour le développement côté client et serveur, polyvalent et soutenu par une vaste communauté.

Documentation : [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### NodeJS

NodeJS est un environnement d'exécution JavaScript côté serveur. Il permet d'exécuter du code JavaScript en dehors d'un navigateur, notamment pour le développement de serveurs web.

Avantages : Très performant grâce à son moteur V8, favorise le développement d'applications en temps réel et bénéficie d'un écosystème riche en modules.

Documentation : [NodeJS MDN](https://nodejs.org/en/docs/)

### Outils

- Environnement : VSCODE 💻
- PhpMyAdmin 💾
- XAMPP/WAMPP 🔧
- Serveur Dédié/VPS 🖥️

#### Déploiement

Coming soon... 🚧

## Licence

Voir le fichier [LICENSE](./LICENSE.md) du dépôt.
