# Opération teardrop

Le But est

### 1/ Récupérer l’ensemble des produits

```bash
GET BASE_URL/products.json
```

### 2/ Trouver l’URL du produit avec le handler et le variant ID:

```bash
GET BASE_URL/products/HANDLER
```

### 3/ Générer le lien add to cart.

```bash
GET ${config.BASE_URL}/cart/add.js?quantity=1&id=${item}
```

---- TODO

4/ Connexion Utilisateur
POST BASE*URL/ACCOUNT/LOGIN*
Form Data

```bash
customer[email]
customer[password]
```

5/ Recupérer le Token de Paiement

6/

Etape finale : Post the Checkout URL

---

Liste des Variables d’Envirnommenet:

```bash
BASE_URL
LAST_ID
EMAIL
PASSWORD

CREDIT_CARD_NUMBER
CREDIT_CARD_MONTHCREDIT_CARD_YEAR
CREDIT_CARD_CVV

FIRSTNAME
LASTNAME
```
