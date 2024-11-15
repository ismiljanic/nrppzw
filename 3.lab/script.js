//dohvacanje canvas elementa po identifikatoru i postavljanje 2d konteksta
const canvas = document.getElementById("canvasForBreakout");
const ctx = canvas.getContext("2d");

//prikaz canvasa preko cijelog zaslona
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//radijus lopte, pozicije x i y te brzine dx i dy
let ball = 10;
let x, y, dx, dy;

//cigla
let brickRowNumber = 4; //broj redaka
let brickColumnNumber = 12; //broj stupaca
let brickWidth; //dinamicki izracunata duljina cigle (zbog broja stupaca)
let brickHeight = 25; //visina cigle
let brickPadding = 10; //razmak izmedu cigli
let brickOffsetTop = 130; //razmak od vrha canvasa do prvog reda cigli
let brickOffsetLeft = 10; //razmak od lijevog ruba canvasa do prvog stupca

//palica
let paddleOffset = 0;
let paddleYPosition = canvas.height - 100; //polozaj visine palice u odnosu na dno
const paddleHeight = 20; //visina palice
const paddleWidth = 100; //duljina palice
let paddleSpeed = 12; //brzina kretanja palice
let score = 0; //rezultat
let maxScore = localStorage.getItem("maxScore") ? parseInt(localStorage.getItem("maxScore")) : 0; //spremanje rezultata u localstorage

//zvukovi kreirani pomocu https://sfxr.me/
const sounds = {
    ballWall: new Audio('sounds/ballWall.wav'),
    ballBrick: new Audio('sounds/ballBrick.wav'),
    ballPaddle: new Audio('sounds/ballPaddle.wav'),
    endGame: new Audio('sounds/endGame.wav'),
    winGame: new Audio('sounds/winGame.wav'),
    score10: new Audio('sounds/10Points.wav')
};

//inicijalizacija cigli i pocetka igre
let bricks = [];
let gameStarted = false;

//definicija palice kao objekta s polozajem, velicinom, logikom kretanja palice
let paddle = {
    x: (canvas.width - paddleWidth) / 2,
    y: paddleYPosition,
    width: paddleWidth,
    height: paddleHeight,
    speed: paddleSpeed,
    moveRight: false,
    moveLeft: false,
    //kreiranje palice
    draw: function () {
        ctx.shadowBlur = 20; //sjencanje palice
        ctx.shadowColor = "red"; //crvena boja
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    },
    //funkcija kretanja palice
    move: function () {
        //kretanje desno ako je naredba kretanja u desno i ako palica nije izvan granica canvasa
        if (this.moveRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        //kretanje lijevo ako je naredba kretanja u lijevo i ako palica nije izvan granica canvasa
        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed;
        }
    }
};

//funkcija za validaciju i ispravan unos korisnickih vrijednosti prije pocetka igre
function enforceMaxValue(inputId, maxValue) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", function () {
        if (parseInt(input.value) > maxValue) {
            input.value = maxValue;
        }
    });
}

enforceMaxValue("rows", 10);
enforceMaxValue("columns", 30);
enforceMaxValue("ballSpeed", 25);
enforceMaxValue("paddleSpeed", 40);

//funkcija za resetiranje igre i vracanje na pocetne postavke
function resetGame() {
    //postavljanje lopte na sredinu iznad palice
    x = canvas.width / 2;
    y = paddle.y - ball;
    //nasumicni odabir smjera kretanja lopte
    let direction = Math.random() > 0.5 ? 'right' : 'left';

    let angle;
    if (direction === 'right') {
        //45-60 stupnjeva 1.kvadrant
        angle = (Math.random() * 15 + 45) * Math.PI / 180;
    } else {
        //135-150 stupnjeva 2.kvadrant
        angle = (Math.random() * 15 + 135) * Math.PI / 180;
    }

    //postavljanje brzine lopte na korisnicki unos ili na pocetnu vrijednost
    let speed = ballSpeed;
    dx = speed * Math.cos(angle);
    dy = -speed * Math.sin(angle); //kretanje lopte prema gore

    //dinamicko racunanje duljine cigle na temelju korisnickog unosa
    brickWidth = (canvas.width - (brickColumnNumber + 1) * brickPadding) / brickColumnNumber;

    //inicijalizacija cigli kao polja sa statusom 1 prije sudara s loptom
    bricks = [];
    for (let i = 0; i < brickColumnNumber; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickRowNumber; j++) {
            bricks[i][j] = { x: 0, y: 0, status: 1 };
        }
    }
}
//resetiranje igre za inicijalizaciju pocetnog stanja prije prvog pokretanja
resetGame();

document.body.style.margin = "0";

//pritisak tipke za lijevo i desno
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

//pritisak na tipku
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") paddle.moveRight = true;
    if (e.key === "Left" || e.key === "ArrowLeft") paddle.moveLeft = true;
}

//prekid pritiska na tipku
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") paddle.moveRight = false;
    if (e.key === "Left" || e.key === "ArrowLeft") paddle.moveLeft = false;
}

//kreiranje lopte na canvasu
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ball, 0, Math.PI * 2);
    ctx.fillStyle = "whitesmoke";
    ctx.fill();
    ctx.closePath();
}

//kreiranje cigli na canvasu
function drawBricks() {
    for (let i = 0; i < brickColumnNumber; i++) {
        for (let j = 0; j < brickRowNumber; j++) {
            //prikaz cigle ako je status 1 (nije sudarena s loptom)
            if (bricks[i][j].status === 1) {
                //pozicija pojedine cigle na canvasu
                const brickX = i * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = j * (brickHeight + brickPadding) + brickOffsetTop;
                //postavljanje pozicije za svaku ciglu
                bricks[i][j].x = brickX;
                bricks[i][j].y = brickY;

                //dodjeljivanje odredene boje ovisno o retku
                let brickColor;
                switch (j) {
                    case 0: brickColor = "red"; break;
                    case 1: brickColor = "orange"; break;
                    case 2: brickColor = "yellow"; break;
                    case 3: brickColor = "green"; break;
                    default: brickColor = "#0095DD"; break;
                }

                ctx.shadowBlur = 10; //sjencanje svake cigle
                ctx.shadowColor = brickColor;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColor;
                ctx.fill();
                ctx.closePath();

                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        }
    }
}

//funkcija za detekciju sudara izmedu cigle i lopte
function collisionDetection() {
    for (let i = 0; i < brickColumnNumber; i++) {
        for (let j = 0; j < brickRowNumber; j++) {
            const brick = bricks[i][j];
            //provjera je li se lopta vec sudarila s ciglom
            if (brick.status === 1) {
                //provjera je li lopta u sudaru s ciglom na temelju pozicije lopte, odnosno sudar se dogada ako je lopta unutar granica cigle
                //x > brick.x - provjera je li lopta presla lijevi rub cigle i unutar je opsega cigle
                //x < brick.x + brickWidth - provjera je li lopta lijevo od desnog ruba cigle
                //y > brick.y - provjera je li vertikalna pozicija lopte ispod gornjeg ruba cigle
                //y < brick.y + brickHeight - provjera je li vertikalna pozicija lopte iznad donjeg ruba cigle
                if (x >= brick.x && x <= brick.x + brickWidth && y >= brick.y && y <= brick.y + brickHeight) {
                    dy = -dy; //odbijanje od cigle
                    brick.status = 0; //ponistavanje cigle
                    score++; //inkrementiranje rezultata
                    sounds.ballBrick.play(); //zvuk
                    if (score % 10 === 0) {
                        sounds.score10.play(); //zvuk
                    }
                    checkWin(); //provjera jesu li sve cigle unistene
                }
            }
        }
    }
}

function checkWin() {
    let allBricksBroken = true;
    let lastBrick = null;

    for (let i = 0; i < brickColumnNumber; i++) {
        for (let j = 0; j < brickRowNumber; j++) {
            const brick = bricks[i][j];
            if (brick.status === 1) {
                allBricksBroken = false; //ako nisu sve cigle unistene igra se nastavlja
            } else if (!lastBrick) {
                lastBrick = brick; //posljednja cigla koja nije unistena
            }
        }
    }
    //sve su cigle unistene
    if (allBricksBroken && lastBrick) {
        lastBrick.status = 0;
        //timeout zbog unistenja zadnje cigle
        setTimeout(() => {
            endGame("Congratulations! You Won!", "green"); //poruka
            sounds.winGame.play(); //zvuk
        }, 300);
    }
}

//funkcija za zavrsavanje igre
function endGame(message, color) {
    gameStarted = false;
    //provjera rezultata i postavljanje najviseg rezultata u localstorage
    if (score > maxScore) {
        maxScore = score;
        localStorage.setItem("maxScore", maxScore);
    }
    showMessage(message, color);
}

//funkcija za ispis poruke ovisno o rezultatu igre
function showMessage(message, color) {
    ctx.font = "64px Monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

//inicijalizacija igre i prikaz rezultata otvaranjem igre
window.onload = function () {
    drawScore();
};

//funkcija za ispis trenutnog rezultata i najbolje ostvarenog rezultata
function drawScore() {
    //dohvacanje rezultata
    const maxScore = localStorage.getItem("maxScore") ? parseInt(localStorage.getItem("maxScore")) : 0;
    //azuriranje vrijednosti na trenutne
    document.getElementById("maxScoreDisplay").textContent = "Max Score: " + maxScore;
    document.getElementById("currentScore").textContent = "Score: " + score;
}

//funkcija za pokretanje igre
function draw() {
    if (!gameStarted) return;
    //pocetni prazan prikaz canvasa
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //pozivanje svih potrebnih funkcija
    drawBricks();
    drawBall();
    paddle.draw();
    collisionDetection();
    drawScore();

    //provjera je li lopta dodirnula lijevi ili desni rub canvasa (zid)
    //x + dx > canvas.width - ball - provjera je li lopta na desnom rubu
    //x + dx < ball - provjera je li lopta dodirnula lijevi rub, tj. udaljenost lopte od lijevog ruba je manja od radijusa lopte
    if (x + dx > canvas.width - ball || x + dx < ball) {
        dx = -dx; //ako je lopta dodirnula lijevi ili desni rub, odbija se u suprotnom smjeru i pusta se odgovarajuci zvuk za odbijanje o zid
        sounds.ballWall.play();
    }
    //provjera je li lopta dodirnula vrh zida
    //y + dy < ball - provjera je li lopta dodirnula vrh zida tj. je li udaljenost lopte od vrha zida za manje od radijusa lopte
    if (y + dy < ball) {
        dy = -dy; //ako je lopta dodirnula vrh zida, odbija se prema dolje i pusta se odgovarajuci zvuk za odbijanje od zid
        sounds.ballWall.play();
    }
    //provjera je li lopta dodirnula palicu
    //y + dy > paddle.y - ball - provjera je li lopta iznad vrha palice
    //y + dy < paddle.y - provjera je li lopta ispod vrha palice
    //x > paddle.x - provjera je li lopta desno od lijevog ruba palice
    //x < paddle.x + paddle.width - provjera je li lopta lijevo od desnog ruba palice
    else if (y + dy > paddle.y - ball && y + dy < paddle.y && x > paddle.x && x < paddle.x + paddle.width) {
        y = paddle.y - ball; //postavljanje lopte na palicu nakon sudara da ne prolazi ispod palice
        sounds.ballPaddle.play();
        const hitEdge = x - paddle.x; //horizontalna pozicija lopte u odnosu na lijevu rub palice
        const paddlePart = hitEdge / paddle.width; //mjesto sudara lopte i palice na palici

        //lopta je udarila lijevu stranu palice
        if (paddlePart < 0.2) {
            dx = -Math.abs(dx); //lopta se vraca na stranu iz koje je dosla
            dy = -Math.abs(dy); //lopta ide nazad prema gore
        }
        //lopta je udarila desnu stranu palice
        else if (paddlePart > 0.8) {
            dx = Math.abs(dx); //lopta se vraca na desnu stranu iz koje je dosla
            dy = -Math.abs(dy); //lopta ide nazad prema gore
        }
        //lopta je udarila "sredinu"
        else {
            dy = -Math.abs(dy); //vertikalna promjena smjera lopte
        }
    }
    //lopta je dodirnula dno canvasa
    else if (y + dy > canvas.height - ball) {
        endGame("GAME OVER", "red");
        sounds.endGame.play();
    }

    //omogucavanje kretanja palice pomocu tipku
    paddle.move();

    //azuriranje pozicije lopte
    x += dx;
    y += dy;

    //pokretanje
    requestAnimationFrame(draw);
}

//pokretanje igre pritiskom na start button
document.getElementById("startButton").addEventListener("click", function () {
    //dohvacanje postavljenih vrijednosti za igru na pocetnoj stranici od strane korisnika
    brickRowNumber = parseInt(document.getElementById("rows").value);
    brickColumnNumber = parseInt(document.getElementById("columns").value);
    ballSpeed = parseInt(document.getElementById("ballSpeed").value);
    paddleSpeed = parseInt(document.getElementById("paddleSpeed").value);

    paddle.speed = paddleSpeed;
    //inicijalizacija pocetnog stanja
    resetGame();
    gameStarted = true;

    document.getElementById("gameSettings").style.display = "none";
    //pokretanje igre
    draw();
});