let htmllinks = [];
fetch("assets/jsons/games.json").then((response) => response.json()).then((data) => {
    let tileCount = 0;
    data.forEach((game) => {
        let container = document.querySelector(".cards-section");
        let gameimages = "assets/images/" + game.detail + "/";
        let tile = tileCount;

        const cardcontainer = document.createElement("div");
        cardcontainer.className = "game-card game" + tileCount;
        cardcontainer.addEventListener("click", () => {
            changeGameSelected(tile);
        });

        const cardcharacter = document.createElement("div");
        cardcharacter.className = "card-character";
        cardcharacter.style.backgroundImage = "url(" + gameimages + "thumbnail.png)";

        const cardfade = document.createElement("div");
        cardfade.className = "card-fade";
        cardfade.style.background = game.color;

        const carddarkness = document.createElement("div");
        carddarkness.className = "card-darkness";

        const cardtitlediv = document.createElement("div");
        cardtitlediv.className = "card-title";
        const cardtitle = document.createElement("img");
        cardtitle.src = gameimages + "title.png";

        const playdiv = document.createElement("a");
        // compute per-game HTML link placeholder:
        // - prefer the link from games.json (game.links[1]) if provided
        // - otherwise create a default placeholder file path (e.g. games/game1.html)
        const htmlLink = (game.links && game.links[1]) ? game.links[1] : `games/game${tileCount + 1}.html`;

        // store the html link on the element and push into the htmllinks array
        playdiv.href = "javascript:void(0)";
        playdiv.dataset.url = htmlLink;

        playdiv.addEventListener("click", (e) => {
            // prevent the click from bubbling to the card container
            e.preventDefault();
            e.stopPropagation();

            // if launcher is 'off', keep the existing deactivator behavior
            if (launcherSHO === 'off') {
                deactivator();
                return;
            }

            const url = playdiv.dataset.url || htmllinks[tile];
            if (url) {
                // open in same tab; change to "_blank" if you want a new tab
                window.open(url, "_self");
                return;
            }

            // fallback behavior if no url available
            deactivator();
        });

        const playbutton = document.createElement("button");
        playbutton.className = "play-button";
        playbutton.role = "button";
        playbutton.innerText = "Play";

        cardtitlediv.appendChild(cardtitle);
        playdiv.appendChild(playbutton);
        cardcontainer.appendChild(cardcharacter);
        cardcontainer.appendChild(cardfade);
        cardcontainer.appendChild(carddarkness);
        cardcontainer.appendChild(cardtitlediv);
        cardcontainer.appendChild(playdiv);
        container.appendChild(cardcontainer);

        // push the html link placeholder we computed
        htmllinks.push(htmlLink);

        tileCount++;
    });
});

// -----------------
let inMenu = true;
let currentIndex = 0;
const totalCards = 11;
let hovering = false;
let down = true;
let up = false;
let left = false;
let right = true;
let deactivate = true;

let launcherKey = "launcherSHO";
let musicKey = "musicOnOff";
let soundKey = "soundOnOff";

let launcherSHO = localStorage.getItem(launcherKey);
let playMusic = localStorage.getItem(musicKey);
let playSound = localStorage.getItem(soundKey);

const select = new Audio('assets/sounds/blip.wav');
const error = new Audio('assets/sounds/error.wav');
const bm = new Audio('assets/sounds/background.wav');
const back = new Audio('assets/sounds/back.wav');

bm.volume = 0.75;
bm.loop = true;

let cardSelector, cardSelectorSource;
const menu = document.getElementById("menu");
const selection = document.getElementById("selection");
const options = document.querySelector('.launcher-options');
const musicIcon = document.querySelector('.music');
const soundIcon = document.querySelector('.sound');

// default to html launcher (no steam behavior)
if (!launcherSHO) { launcherSHO = 'html'; localStorage.setItem(launcherKey, launcherSHO); }
if (!playMusic) { playMusic = 'true'; localStorage.setItem(musicKey, playMusic); }
if (!playSound) { playSound = 'true'; localStorage.setItem(soundKey, playSound); }

if (launcherSHO === 'off') { options.src = 'assets/images/icons/launcher-off.svg'; }
if (launcherSHO === 'html') { options.src = 'assets/images/icons/launcher-html.svg'; }
if (playMusic === 'true') { musicIcon.src = 'assets/images/icons/music.svg'; }
if (playMusic === 'false') { musicIcon.src = 'assets/images/icons/music-off.svg'; }
if (playSound === 'true') { soundIcon.src = 'assets/images/icons/sound.svg'; }
if (playSound === 'false') { soundIcon.src = 'assets/images/icons/sound-off.svg'; }

function activator() {
    if (playSound === 'true') { back.currentTime = 0; back.play(); }
    menu.style.display = "none";
    selection.style.display = "flex";
    inMenu = false;
    cardSelector = document.querySelectorAll('.game-card');
    cardSelectorSource = document.querySelectorAll('.game-card a');
    setTimeout(function () {
        updateCarousel();
    }, 100);
    if (playMusic === 'true') {
        bm.play();
    }
}

function deactivator() {
    if (deactivate === true) {
        if (playSound === 'true') { back.currentTime = 0; back.play(); }
        setTimeout(function () {
            bm.pause();
            error.currentTime = 0;
        }, 10);

        menu.style.display = "flex";
        selection.style.display = "none";
        inMenu = true;
        hovering = false;
        down = true;
        up = false;
        left = false;
        right = true;
        if (launcherSHO === 'html') { deactivate = false; }
        else if (launcherSHO === 'off') { deactivate = false; }
    }
    if (deactivate === false) { if (playSound === 'true') { back.currentTime = 0; back.play(); } }
}

document.addEventListener('keydown', function (event) {
    if (inMenu === false && event.keyCode == 37) {
        if (left === true) { gameSelection('left'); }
        else { if (playSound === 'true') { error.currentTime = 0; error.play(); } }
    }
    if (inMenu === false && event.keyCode == 39) {
        if (right === true) { gameSelection('right'); }
        else { if (playSound === 'true') { error.currentTime = 0; error.play(); } }
    }
    if (inMenu === false && event.keyCode == 40) {
        if (down === true) { playButtonHover(true); }
        else { if (playSound === 'true') { error.currentTime = 0; error.play(); } }
        down = false; up = true; left = false; right = false;
    }
    if (inMenu === false && event.keyCode == 38) {
        if (up === true) { playButtonHover(); }
        else { if (playSound === 'true') { error.currentTime = 0; error.play(); } }
        up = false; down = true; left = false; right = true;
    }
    if (event.keyCode == 13) {
        if (inMenu === true) { activator(); }
        else if (inMenu === false && hovering === true) {
            // open per-card HTML when Enter is pressed while hovering (only if not 'off')
            if (launcherSHO !== 'off') {
                const url = htmllinks[currentIndex];
                if (url) { window.open(url, "_self"); }
                else { deactivator(); }
            } else {
                deactivator();
            }
        }
    }
    if (inMenu === false && event.keyCode == 32) {
        if (hovering === true) {
            if (launcherSHO !== 'off') {
                const url = htmllinks[currentIndex];
                if (url) { window.open(url, "_self"); }
                else { deactivator(); }
            } else {
                deactivator();
            }
        }
    }
    if (inMenu === false && event.keyCode == 27) { deactivate = true; deactivator(); }
})

function gameSelection(direction) {
    if (direction === "left" && currentIndex - 1 > -1) { changeGameSelected(currentIndex - 1); }
    if (direction === "right" && currentIndex + 1 < 11) { changeGameSelected(currentIndex + 1); }
}

function playButtonHover(cancel) {
    cardSelector.forEach(card => card.classList.remove('hover'));
    hovering = false;
    if (playSound === 'true') {
        select.currentTime = 0;
        select.play();
    }
    if (cancel === true) { cardSelector[currentIndex].classList.add('hover'); hovering = true; }
}

function launcherOptions() {
    // toggle only between 'off' and 'html' (steam removed)
    if (launcherSHO === 'off') { launcherSHO = 'html'; options.src = 'assets/images/icons/launcher-html.svg'; }
    else if (launcherSHO === 'html') { launcherSHO = 'off'; options.src = 'assets/images/icons/launcher-off.svg'; }
    localStorage.setItem(launcherKey, launcherSHO);
    changeGameSelected(currentIndex);
}

function musicOption() {
    if (playMusic === 'true') { playMusic = 'false'; bm.pause(); musicIcon.src = 'assets/images/icons/music-off.svg'; localStorage.setItem(musicKey, playMusic) }
    else if (playMusic === 'false') { playMusic = 'true'; bm.play(); musicIcon.src = 'assets/images/icons/music.svg'; localStorage.setItem(musicKey, playMusic) }
}

function soundOption() {
    if (playSound === 'true') { playSound = 'false'; soundIcon.src = 'assets/images/icons/sound-off.svg'; localStorage.setItem(soundKey, playSound) }
    else if (playSound === 'false') { playSound = 'true'; soundIcon.src = 'assets/images/icons/sound.svg'; localStorage.setItem(soundKey, playSound) }
}

function updateCarousel() {
    const slider = document.querySelector('.cards-section');
    const cardWidth = document.querySelector('.game-card').offsetWidth;
    const newPosition = -currentIndex * (cardWidth / 2 + 5);
    slider.style.transform = `translateX(${newPosition}px)`;
    changeGameSelected(currentIndex);
}

function changeGameSelected(index) {
    if (index > 0) { left = true; }
    changeIndex = index - currentIndex

    if (changeIndex < 0) {
        currentIndex = (currentIndex + changeIndex + totalCards) % totalCards;
        updateCarousel();
    }

    if (changeIndex > 0) {
        currentIndex = (currentIndex + changeIndex) % totalCards;
        updateCarousel();
    }
    if (playSound === 'true') {
        select.currentTime = 0;
        select.play();
    }
    cardSelector.forEach(card => card.classList.remove('scale1', 'scale2', 'scale3', 'scale4', 'scale5', 'scale6', 'scale7', 'scale8', 'scale9', 'scale10'));

    if (index - 1 > -1) { cardSelector[index - 1].classList.add('scale1'); }
    if (index + 1 < 11) { cardSelector[index + 1].classList.add('scale1'); }
    if (index - 2 > -1) { cardSelector[index - 2].classList.add('scale2'); }
    if (index + 2 < 11) { cardSelector[index + 2].classList.add('scale2'); }
    if (index - 3 > -1) { cardSelector[index - 3].classList.add('scale3'); }
    if (index + 3 < 11) { cardSelector[index + 3].classList.add('scale3'); }
    if (index - 4 > -1) { cardSelector[index - 4].classList.add('scale4'); }
    if (index + 4 < 11) { cardSelector[index + 4].classList.add('scale4'); }
    if (index - 5 > -1) { cardSelector[index - 5].classList.add('scale5'); }
    if (index + 5 < 11) { cardSelector[index + 5].classList.add('scale5'); }
    if (index - 6 > -1) { cardSelector[index - 6].classList.add('scale6'); }
    if (index + 6 < 11) { cardSelector[index + 6].classList.add('scale6'); }
    if (index - 7 > -1) { cardSelector[index - 7].classList.add('scale7'); }
    if (index + 7 < 11) { cardSelector[index + 7].classList.add('scale7'); }
    if (index - 8 > -1) { cardSelector[index - 8].classList.add('scale8'); }
    if (index + 8 < 11) { cardSelector[index + 8].classList.add('scale8'); }
    if (index - 9 > -1) { cardSelector[index - 9].classList.add('scale9'); }
    if (index + 9 < 11) { cardSelector[index + 9].classList.add('scale9'); }
    if (index - 10 > -1) { cardSelector[index - 10].classList.add('scale10'); }
    if (index + 10 < 11) { cardSelector[index + 10].classList.add('scale10'); }

    // set anchors so the selected card points to its per-card HTML link (or disabled when off)
    if (cardSelectorSource && cardSelectorSource.length) {
        cardSelectorSource.forEach(card => card.href = 'javascript:void(0)');
        if (launcherSHO === 'html') {
            cardSelectorSource[index].href = htmllinks[index] || 'javascript:void(0)';
            deactivate = false;
        } else {
            // launcherSHO === 'off'
            deactivate = false;
        }
    }

    const cardsSection = document.querySelector('.cards-section');
    const selectedCard = cardsSection.children[index];

    selectedCard.style.order = '0';

    cardSelector.forEach(card => card.classList.remove('selected'));

    cardSelector[index].classList.add('selected');

    cardSelector.forEach(card => card.classList.remove('hover'));
    if (hovering === true) {
        cardSelector[currentIndex].classList.add('hover');
    }
    else { hovering = false; }
}
