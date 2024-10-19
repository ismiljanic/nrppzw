
# Prva laboratorijska vježba
U prvoj laboratorijskoj vježbi proučava se autentifikacija korisnika.
Cilj je laboratorijske vježbe/projekta demonstrirati predznanje vezano za izradu web-aplikacije koja komunicira s bazom podataka, omogućiti isporuku aplikacije u oblak, a zatim u nju graditi autentifikacijske i autorizacijske mehanizme.
Aplikacija će služiti za generiranje QR kodova za ulaznice te za prikaz informacija pohranjenih u bazi podataka vezanih za pojedinu ulaznicu.

## Funkcionalni zahtjevi
- javno dostupna početna stranica koja prikazuje broj dosad generiranih ulaznica
- pristupna točka (engl. endpoint) za generiranje ulaznice
  - pristupna točka u tijelu zahtjeva prima json sa svojstvima `vatin`, `firstName` i `lastName`
  - za jedan OIB (vatin) smiju se generirati maksimalno 3 ulaznice
  - identifikator mora biti UUID iz PostgreSQL-a
  - za svaku generiranu ulaznicu u bazi podataka potrebno je dodatno pohraniti i vrijeme kreiranja ulaznice
  - rezultat uspješnog poziva je slika s QR kodom koji sadrži URL stranice određene identifikatorom ulaznice
  - u generiranom URL-u ne smiju se nalaziti podaci o OIB-u, imenu ili prezimenu
  - u slučaju pogreške vratiti status 400 ili 500 s odgovarajućim opisom pogreške
  - status 400 treba se vratiti ako ulazni json ne sadrži sve tražene podatke ili je isti OIB kupio 3 ulaznice 
  - pristupna točka mora koristiti autorizacijski mehanizam OAuth2 Client Credentials (machine-to-machine) koji je vezan za pojedinu aplikaciju, a ne korisnika
- stranica koja je jednoznačno određena identifikatorom ulaznice i prikazuje osobne podatke
  - pristup ovoj stranici imaju samo prijavljeni korisnici
  - na stranici ispisati ime trenutno prijavljenog korisnika koristeći OpenId Connect protokol

    
## O implementaciji projekta
Projekt je implementiran pomoću Node.js-a u razvojnom okruženju VSCode. Dodatno, korišten je EJS template za jednostavni prikaz i generiranje HTML-a koji je uređen pomoću CSS-a.
Projekt zahtjeva korištenje i instaliranje potrebnih biblioteka putem naredbe `npm install`. Nakon instaliranja potrebnih modula, projekt se pokreće putem naredbe `node server.js`.

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
- pozicionirati se unutar 1.lab direktorij
- upisati naredbu `ls` koja će ispisati sve datoteke i mape koje se nalaze u trenutnom direktoriju
- u slučaju da prethodna naredba nije ispisala `node_modules`, upisati naredbu `npm install`
- pokrenuti program naredbom `node server.js`

DISCLAIMER: Za lokalno testiranje potrebno je kreirati vlastitu bazu podataka i .env varijablu te promijeniti postavke u Auth0 aplikaciji

<img src="pictures/pokretanje.png" style="max-width: 100%; height: auto;">

## Pregled funkcionalnosti

### Login
<img src="pictures/login.png" style="max-width: 100%; height: auto;">

### Auth0 Login
<img src="pictures/loginAuth0.png" style="max-width: 100%; height: auto;">

### Create Ticket
<img src="pictures/createTicket.png" style="max-width: 100%; height: auto;">

### Submit Ticket and QRCode
<img src="pictures/qrCode.png" style="max-width: 100%; height: auto;">

### Ticket Information
<img src="pictures/ticketInfo.png" style="max-width: 100%; height: auto;">

## Deploy projekta
Projekt je javno dostupan na web stranici: https://nrppzw.onrender.com/