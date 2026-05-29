const spells = {
    "Cold Snap": "QQQ",
    "EMP": "WWW",
    "Sun Strike": "EEE",
    "Tornado": "WWQ",
    "Chaos Meteor": "EEW",
    "Deafening Blast": "QWE",
    "Ice Wall": "QQE",
    "Forge Spirit": "EEQ",
    "Ghost Walk": "QQW",
    "Alacrity": "WWE"
};

const spellImages = {
    "Cold Snap": "invoker_cold_snap.png",
    "EMP": "invoker_emp.png",
    "Sun Strike": "invoker_sun_strike.png",
    "Tornado": "invoker_tornado.png",
    "Chaos Meteor": "invoker_chaos_meteor.png",
    "Deafening Blast": "invoker_deafening_blast.png",
    "Ice Wall": "invoker_ice_wall.png",
    "Forge Spirit": "invoker_forge_spirit.png",
    "Ghost Walk": "invoker_ghost_walk.png",
    "Alacrity": "invoker_alacrity.png"
};

let orbSequence = "";
let invokedCombo = "";
let currentSpell = null;
let spellStartTime = 0;
let score = 0;
let spellStats = {};
let gameOver = false;

const orbDisplay = document.getElementById("orb-sequence");
const spellDisplay = document.getElementById("current-spell");
const enemy = document.getElementById("enemy");
const message = document.getElementById("message");
const invoker = document.getElementById("invoker");

function showMessage(text, color = "yellow") {
    message.innerHTML = text.replace(/\n/g, "<br>");
    message.style.color = color;
}

// ✨ Анимация картинки спела
function castSpellEffect(spellName) {
    const img = document.createElement("img");
    img.src = `images/${spellImages[spellName]}`;
    img.classList.add("spell-effect");

    const invokerRect = invoker.getBoundingClientRect();
    const gameRect = document.querySelector(".game-area").getBoundingClientRect();

    img.style.left = (invokerRect.left - gameRect.left - 20) + "px";
    img.style.top = (invokerRect.top - gameRect.top) + "px";

    document.querySelector(".game-area").appendChild(img);

    requestAnimationFrame(() => {
        img.style.transform = "translateX(-300px)";
        img.style.opacity = "0";
    });

    setTimeout(() => {
        img.remove();
    }, 1000);
}

// Новый спелл
function newSpell() {
    if (gameOver) return;
    const keys = Object.keys(spells);
    currentSpell = keys[Math.floor(Math.random() * keys.length)];
    spellDisplay.textContent = currentSpell;
    orbSequence = "";
    invokedCombo = "";
    orbDisplay.textContent = orbSequence;
    enemy.style.left = "10px";
    enemy.style.opacity = "1";
    showMessage("Собери заклинание!", "yellow");
    spellStartTime = Date.now();
}

// Считаем буквы
function countLetters(str) {
    const counts = { Q: 0, W: 0, E: 0 };
    for (let ch of str) {
        if (counts[ch] !== undefined) counts[ch]++;
    }
    return counts;
}

// Проверка заклинания
function checkSpell() {
    if (gameOver) return;

    const required = countLetters(spells[currentSpell]);
    const actual = countLetters(invokedCombo);

    let ok = true;
    for (let key of ["Q", "W", "E"]) {
        if (required[key] !== actual[key]) {
            ok = false;
            break;
        }
    }

    if (ok) {
        showMessage("Заклинание успешно! Враг уничтожен.", "lime");

        castSpellEffect(currentSpell);
        enemy.style.transition = "opacity 1s linear";
        enemy.style.opacity = "0";

        const now = Date.now();
        const timeTaken = now - spellStartTime;
        const timeLeft = Math.max(0, 10000 - timeTaken); // крип идёт 10 сек
        score += timeLeft;

        if (!spellStats[currentSpell]) {
            spellStats[currentSpell] = { totalTime: 0, count: 0 };
        }
        spellStats[currentSpell].totalTime += timeTaken;
        spellStats[currentSpell].count++;

        setTimeout(newSpell, 1000);
    } else {
        showMessage("Неверное заклинание!", "red");
    }
}

function loseGame() {
    gameOver = true;

    let totalSpells = 0, totalTime = 0;
    for (let spell in spellStats) {
        totalSpells += spellStats[spell].count;
        totalTime += spellStats[spell].totalTime;
    }
    const avgTime = totalSpells ? (totalTime / totalSpells).toFixed(0) : 0;

    const statsPanel = document.getElementById("stats-panel");
    statsPanel.innerHTML = `<h3>Статистика</h3>
        <p>Очки: ${score}</p>
        <p>Всего спеллов: ${totalSpells}</p>
        <p>Среднее время: ${avgTime} мс</p>
        <h4>Среднее по спеллам</h4>`;

    for (let spell in spellStats) {
        const avg = (spellStats[spell].totalTime / spellStats[spell].count).toFixed(0);
        statsPanel.innerHTML += `<p>${spell}: ${avg} мс (всего ${spellStats[spell].count})</p>`;
    }

    showMessage("Крип дошёл до Инвокера!\nНажми любую кнопку для рестарта.", "red");

    document.addEventListener("keydown", () => {
        score = 0;
        spellStats = {};
        gameOver = false;
        statsPanel.innerHTML = "";
        newSpell();
        moveEnemy();
    }, { once: true });
}

// Движение врага
function moveEnemy() {
    if (gameOver) return;

    let pos = parseInt(enemy.style.left);
    if (pos < 500) {
        enemy.style.left = pos + 2 + "px";
    } else {
        loseGame();
        return;
    }
    requestAnimationFrame(moveEnemy);
}

// Обработка клавиш
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (["q", "w", "e"].includes(key)) {
        orbSequence += key.toUpperCase();
        orbDisplay.textContent = orbSequence;
    }

    if (key === "r") {
        invokedCombo = orbSequence.slice(-3);
    }

    if (key === "d") {
        checkSpell();
    }
});

// Запуск игры
newSpell();
moveEnemy();
