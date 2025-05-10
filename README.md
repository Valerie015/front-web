# SupMap – Interface Front-End

Ce dépôt contient l’interface utilisateur de SupMap, une application de navigation collaborative. Cette interface consomme les services API proposés par l’architecture microservices du backend.

## 🖥️ Démarrage du projet

Dans le répertoire du projet, exécutez les commandes suivantes :

### Installation des dépendances

```bash
npm install
```

Cette commande installe l’ensemble des dépendances nécessaires au bon fonctionnement de l’application.

### Lancement de l'application en mode développement

```bash
npm start
```

L'application sera disponible à l'adresse suivante : [http://localhost:3000](http://localhost:3000)

* Le rechargement automatique est activé lors des modifications du code.
* Les éventuelles erreurs de lint s’afficheront dans la console pour faciliter le débogage.

## 🔗 Dépendances principales

* **React** : Bibliothèque principale pour la création de l’interface
* **React Router** : Gestion de la navigation côté client
* **Axios** : Requêtes HTTP vers les microservices backend

## 🔐 Intégration avec les microservices

Ce front-end communique avec les microservices suivants :

* Authentification (Auth Service)
* Utilisateurs (User Service)
* Itinéraires (Route Service)
* Incidents (Incident Service)

Veillez à ce que les services backend soient opérationnels pour une expérience complète.
---

