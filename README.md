# Nome del Progetto

Breve descrizione del sito e del suo scopo.

---

# Struttura del progetto

```
project/
│
├── index.html          # Pagina principale
├── login.html          # Pagina di login
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── login.js
│   └── api.js
│
├── images/
│   └── ...
│
└── assets/
```

## Cartelle

### `/css`
Contiene tutti i fogli di stile del progetto.

### `/js`
Contiene la logica del sito:
- `main.js` → gestione della homepage
- `login.js` → gestione del login
- `api.js` → richieste al server

### `/images`
Contiene immagini, icone e loghi.

---

# Come funziona il sito

## 1. Homepage

La homepage è il punto di ingresso del sito.

Da qui l'utente può:
- visualizzare i contenuti principali;
- navigare tra le varie pagine;
- effettuare il login.

---

## 2. Login

Il login controlla le credenziali dell'utente.

Se le credenziali sono corrette:
- viene effettuato l'accesso;
- l'utente viene reindirizzato alla propria area.

---

## 3. Dashboard

Una volta autenticato, l'utente può:

- visualizzare i propri dati;
- modificare le informazioni;
- utilizzare le funzionalità del sito.

---

# Flusso del sito

```
Homepage
     │
     ▼
 Login
     │
     ▼
Dashboard
     │
     ├── Profilo
     ├── Impostazioni
     └── Logout
```

---

# Tecnologie utilizzate

- HTML5
- CSS3
- JavaScript
- Bootstrap
- PHP
- MySQL

*(modifica in base al vostro progetto)*

---

# Ruoli dei componenti principali

| File | Funzione |
|-------|----------|
| index.html | Pagina iniziale |
| style.css | Grafica del sito |
| main.js | Logica principale |
| api.js | Comunicazione con il backend |

---

# Come avviare il progetto

1. Clonare il repository.
2. Aprire la cartella del progetto.
3. Avviare il server (se necessario).
4. Aprire `index.html` oppure visitare `localhost`.

---

# Note

- Tutti gli script JavaScript sono separati dalla grafica.
- Le immagini sono raccolte nella cartella `images`.
- Ogni pagina ha il proprio file dedicato quando necessario.

---

# Autori

- Nome Cognome
- Nome Cognome
- Nome Cognomes
