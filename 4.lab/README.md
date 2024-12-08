# Četvrta laboratorijska vježba

U četvroj laboratorijskoj vježbi proučava se izrada web stranice uz korištenje HTTP/2 protokola.
Cilj je laboratorijske vježbe/projekta izraditi vlastiti SSL certifikat, aktivirati HTTP/SSL, konfigurirati podršku za HTTP/2 u nginx poslužitelju, uključiti i potvrditi da je HTTP/2 uključen.

## O implementaciji projekta
Projekt je implementiran korištenjem HTML-a, JavaScripta te CSS-a. Pokreće se tako da korisnik uključi nginx poslužitelj i pokrene u web pregledniku stranicu na lokaciji `https://localhost` za HTTP/2 te `http://localhost/lab4` za HTTP/1.1

# Tehnologije korištene za implementaciju

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
        <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="javascript" width="auto" height="auto"/>
    </li>
  <li>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="git logo"  />
  <img width="12" /> Git
  </li>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="40" alt="vscode logo"  /> Visual Studio Code
    <img width="12" />
  </li>
</ul>

## Upute za lokalno testiranje

### Pokretanje projekta
- pozicionirati se u direktorij **4.lab/**
- pokrenuti nginx poslužitelj
- otvoriti web preglednik na domeni `https://localhost` za HTTP/2 te `http://localhost/lab4` za HTTP/1.1
- otvoriti karticu **Network** u konzoli web preglednika i gledati promjenu

## Pregled funkcionalnosti

### Demonstracija HTTP/2

<img src="./http2.jpg" style="max-width: 100%; height: auto;">

### Demonstracija HTTP/1.1

<img src="./no_http2.jpg" style="max-width: 100%; height: auto;">