# Guide de migration

Opérations à réaliser côté front-end lors de la montée de version de l'extension Tabou2. Les opérations de base de
données, GeoServer et backend sont décrites dans le fichier `MIGRATION.md` du dépôt `tabou2` (backend).

## 2.14.0 → 2.15.0 — Opérations Off visibles par commune (US-323)

La couche des opérations n'est plus lue directement depuis GeoServer mais via le proxy du backend `/tabou2/carto/ows`,
qui applique la règle de visibilité de l'utilisateur connecté (opérations publiques, plus les opérations Off non
prospectives de la commune de l'utilisateur pour les utilisateurs sans accès global).

**Prérequis** : backend 2.6.0 déployé, avec la couche GeoServer rechargée et le proxy configuré (voir le
`MIGRATION.md` du backend). Déployer le front-end ensuite.

### 1. Configuration du plugin (`localConfig.json` ou contexte MapStore, `cfg` du plugin `Tabou2`)

```json
"layersCfg": {
  "layerOA": {
    "nom": "tabou:v_oa_operation",
    "url": "/tabou2/carto/ows",
    "geomField": "shape",
    "idField": "objectid",
    "idType": "number"
  }
}
```

- `url` (nouvelle clé) : URL du proxy du backend. Toute couche de la carte dont le nom est égal à `nom` est redirigée
  vers cette URL, aussi bien pour l'affichage WMS que pour la recherche WFS, y compris les couches enregistrées dans
  des contextes et cartes utilisateur existants ; il n'est pas nécessaire de les modifier. Ne renseigner cette clé que
  sur `layerOA` : toute couche de `layersCfg` ayant une `url` est redirigée.
- `nom` : doit être l'une des couches listées dans la propriété backend `tabou2.geoserver.authorized-layers`, sinon le
  proxy refuse les requêtes.
- `geomField` : désormais utilisé pour construire le `CQL_FILTER` spatial (`INTERSECTS`) de l'identification sur la
  carte, pour toutes les couches de `layersCfg` (`layerOA`, `layerSA`, `layerPA`). Il doit correspondre à l'attribut
  géométrique de la couche GeoServer (`shape` pour les vues publiées telles quelles). À défaut, `the_geom` est utilisé.

### 2. Couche cartographique (`config.json` ou contexte MapStore)

Faire pointer la couche des opérations vers le proxy, pour l'affichage comme pour la recherche :

```json
{
  "name": "tabou:v_oa_operation",
  "type": "wms",
  "url": "/tabou2/carto/ows",
  "search": { "url": "/tabou2/carto/ows", "type": "wfs" }
}
```

Cette étape est facultative grâce à la redirection décrite ci-dessus, mais elle évite une première URL non filtrée dans
les contextes enregistrés.

### 3. Changements de comportement

- La lecture des opérations Off (recherche, consultation, impression) est autorisée à tous les rôles dans l'interface
  utilisateur : c'est l'API qui décide des opérations que chaque utilisateur peut voir. La modification des opérations
  Off reste réservée aux référents.
- Une opération que l'utilisateur ne peut pas voir affiche le message `operationNotAccessible` ("Opération non
  accessible").
- Pour les utilisateurs sans accès global, le proxy refuse les paramètres susceptibles de contourner le filtre de
  visibilité : `FILTER`, `FEATUREID`, `RESOURCEID`, `SLD`, `SLD_BODY`, `VIEWPARAMS`, `STOREDQUERY_ID`, et `BBOX` sur un
  `GetFeature` WFS. Les filtres spatiaux doivent être exprimés dans `CQL_FILTER` (ou dans un POST XML WFS
  `GetFeature`). Les outils MapStore génériques utilisés sur la couche des opérations (table attributaire, panneau de
  requête) sont soumis aux mêmes restrictions.
