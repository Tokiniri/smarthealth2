# SmartHealth - Facturation Medicale
> Sujet 13 - TP Qualimetrie en Ingenierie Logicielle

## Installation et lancement

```bash
npm install
npm start        # API sur http://localhost:3000
npm run lint     # Verifier la qualite du code
npm test         # Lancer les tests (21 tests, 100% coverage)
```

## Tester l'API

```bash
curl -X POST http://localhost:3000/api/medical-bill \
  -H "Content-Type: application/json" \
  -d '{"type":"Specialist","nightEmergency":true,"age":40,"mutuelle":"Basique"}'
```

## Structure

```
smarthealth/
├── src/
│   ├── app.js                  # Serveur Express
│   ├── medical-bill.js         # Code refactorise (Etape 4)
│   └── medical-bill.dirty.js   # Code sale intentionnel (Etape 1)
├── tests/
│   └── medical-bill.test.js    # 21 tests Jest
├── .github/workflows/ci.yml    # Pipeline GitHub Actions
├── .eslintrc.json              # Regle complexite <= 5
├── sonar-project.properties    # Config SonarCloud
└── package.json
```
