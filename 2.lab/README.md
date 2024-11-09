# Druga laboratorijska vježba

U prvoj laboratorijskoj vježbi proučava se sigurnost web aplikacije.
Cilj je laboratorijske vježbe/projekta demonstrirati predznanje vezano za izradu web-aplikacije koja komunicira s bazom
podataka, omogućiti isporuku aplikacije u oblak, a zatim u nju graditi mogućnosti koje će omogućiti potencijalnom
napadaču korištenje dvije različite tehnike sigurnosnih napada, odnosno dvije vrste ranjivosti web aplikacija.
Aplikacija će sadržavati funkcionalnost koja omogućuje ranjivost i funkcionalnost kojom se ta ranjivost onemogućuje.

## Funkcionalni zahtjevi

- funkcionalnost koja omogućuje ranjivost
- funkcionalnost koja onemogućuje ranjivost
- napadi se mogu pokrenuti kroz sučelje web aplikacije
- učinak napada mora biti vidljiv u korisničkom sučelju

## O implementaciji projekta

Projekt je implementiran pomoću Node.js-a u razvojnom okruženju VSCode. Dodatno, korišten je React framework za prikaz
korisničko sučelja koji je uređen pomoću CSS-a.
Projekt zahtjeva korištenje i instaliranje potrebnih biblioteka putem naredbe `npm install`. Nakon instaliranja
potrebnih modula, projekt se pokreće putem naredbe `node server.js`.

# Tehnologije korištene za implementaciju

<h3>Frontend</h3>
<ul class="horizontal-list">
    <li>
        <a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/>
        </a>
        CSS
    </li>
    <li>
        <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/>
        </a>
        HTML5
    </li>
    <li>
    <a href="https://nodejs.org"><img height=48 src="https://raw.githubusercontent.com/caiogondim/javascript-server-side-logos/master/node.js/standard/454x128.png"></a>
  </li>
    <li>
    <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/>
    </a>
        React
    </li>
  <li>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="git logo"  />
  <img width="12" /> Git
  </li>
  <li>
        <a href="https://www.postgresql.org" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="postgresql" width="40" height="40"/>
        </a>
         PostgreSQL
    </li>
  <li>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="40" alt="vscode logo"  /> Visual Studio Code
    <img width="12" />
  </li>
</ul>

## Upute za lokalno testiranje

### Radno okruženje

Za radno okruženje koristi se VSCode.

- Kloniranje ili preuzimanje projekta
- Otvaranje projekta unutar VSCode odabirom odgovarajućeg direktorija

### Pokretanje projekta

#### Frontend
- pozicionirati se unutar 2.lab/client direktorij
- upisati naredbu `ls` koja će ispisati sve datoteke i mape koje se nalaze u trenutnom direktoriju
- u slučaju da prethodna naredba nije ispisala `node_modules`, upisati naredbu `npm install`
- pokrenuti aplikaciju pomoću naredbe `npm start`

#### Backend
- pozicionirati se unutar 2.lab/server direktorij
- upisati naredbu `ls` koja će ispisati sve datoteke i mape koje se nalaze u trenutnom direktoriju
- u slučaju da prethodna naredba nije ispisala `node_modules`, upisati naredbu `npm install`
- pokrenuti server pomoću naredbe `node server.js`

DISCLAIMER: Za lokalno testiranje potrebno je kreirati vlastitu bazu podataka i .env te promijeniti mapiranje na localhost.

## Pregled funkcionalnosti

### Pocetna stranica

<img src="2.lab/pictures/pocetna.png" style="max-width: 100%; height: auto;">

### SQL injection - tautologija

<img src="2.lab/pictures/sql1.png" style="max-width: 100%; height: auto;">

### SQL injection - tautologija

<img src="2.lab/pictures/sql2.png" style="max-width: 100%; height: auto;">

### SQL injection - ilegalni upiti

<img src="2.lab/pictures/sql3.png" style="max-width: 100%; height: auto;">

### Broken Authentication

<img src="2.lab/pictures/brokenAuth1.png" style="max-width: 100%; height: auto;">
<img src="2.lab/pictures/brokenAuth2.png" style="max-width: 100%; height: auto;">

## Deploy projekta
Projekt je javno dostupan na web stranici: https://nrppzw2lab2frontend.onrender.com/