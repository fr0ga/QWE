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
let currentSpell = null;
let lastSpell = null; // хранит предыдущий выбранный спелл
let spellStartTime = 0;
let score = 0;
let spellStats = {};
let gameOver = false;
let enemyAnimationId = null;

let spellSlotD = null;
let spellSlotF = null;
let lastSuccessfulSpell = null; // хранит последний успешно кастованный спелл

const orbDisplay = document.getElementById("orb-sequence");
const spellDisplay = document.getElementById("current-spell");
const enemy = document.getElementById("enemy");
const message = document.getElementById("message");
const invoker = document.getElementById("invoker");

function showMessage(text, color = "yellow") {
    message.innerHTML = text.replace(/\n/g, "<br>");
    message.style.color = color;
}

// Анимация картинки спела
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

// Настройки таймера
let spellCount = 0;
const baseDuration = 10000; // 10 секунд
const decrement = 750;      // минус 0.75 секунды
let enemyDuration = baseDuration;
let enemyStartTime = 0;
const startPos = 10;
const endPos = 500;

// Новый спелл
function newSpell() {
    if (gameOver) return;

    const keys = Object.keys(spells);
    let newChoice;

    // выбираем случайный спелл, пока он не отличается от предыдущего
    do {
        newChoice = keys[Math.floor(Math.random() * keys.length)];
    } while (newChoice === lastSpell);

    currentSpell = newChoice;
    lastSpell = currentSpell;

    spellDisplay.innerHTML = "";
    const textNode = document.createElement("span");
    textNode.textContent = currentSpell;
    const icon = document.createElement("img");
    icon.src = `images/${spellImages[currentSpell]}`;
    icon.alt = currentSpell;
    icon.classList.add("spell-icon");
    spellDisplay.appendChild(textNode);
    spellDisplay.appendChild(icon);

    if (enemyAnimationId) {
        cancelAnimationFrame(enemyAnimationId);
    }
    enemy.style.transition = "none";
    enemy.style.left = "10px";
    enemy.style.opacity = "1";
    enemy.offsetHeight;

    showMessage("Собери заклинание!", "yellow");

    spellStartTime = Date.now();
    enemyStartTime = Date.now();

    spellCount++;
    enemyDuration = Math.max(2500, baseDuration - decrement * (spellCount - 1));

    moveEnemy();
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
function checkSpell(invokedCombo) {
    if (gameOver || !invokedCombo) return;

    const required = countLetters(spells[currentSpell]);
    const actual = countLetters(invokedCombo);

    let ok = true;
    for (let key of ["Q", "W", "E"]) {
        if (required[key] !== actual[key]) {
            ok = false;
            break;
        }
    }

    // запрещаем повторный каст того же спелла
    if (ok && currentSpell === lastSuccessfulSpell) {
        showMessage("Этот спелл уже был успешно применён!", "orange");
        return;
    }

    if (ok) {
        showMessage("Заклинание успешно! Враг уничтожен.", "lime");
        castSpellEffect(currentSpell);

        if (enemyAnimationId) {
            cancelAnimationFrame(enemyAnimationId);
            enemyAnimationId = null;
        }

        enemy.style.transition = "opacity 0.5s linear";
        enemy.style.opacity = "0";

        const now = Date.now();
        const timeTaken = now - spellStartTime;
        const timeLeft = Math.max(0, enemyDuration - timeTaken);
        score += timeLeft;

        if (!spellStats[currentSpell]) {
            spellStats[currentSpell] = { totalTime: 0, count: 0 };
        }
        spellStats[currentSpell].totalTime += timeTaken;
        spellStats[currentSpell].count++;

        lastSuccessfulSpell = currentSpell;

        setTimeout(newSpell, 500);
    } else {
        showMessage("Неверное заклинание!", "red");
    }
}

function loseGame() {
    gameOver = true;
    if (enemyAnimationId) {
        cancelAnimationFrame(enemyAnimationId);
        enemyAnimationId = null;
    }

    let totalSpells = 0, totalTime = 0;
    for (let spell in spellStats) {
        totalSpells += spellStats[spell].count;
        totalTime += spellStats[spell].totalTime;
    }
    const avgTime = totalSpells ? (totalTime / totalSpells).toFixed(0) : 0;

    const statsPanel = document.getElementById("stats-panel");
    if (statsPanel) {
        statsPanel.innerHTML = `<h3>Статистика</h3>
            <p>Очки: ${score}</p>
            <p>Всего спеллов: ${totalSpells}</p>
            <p>Среднее время: ${avgTime} мс</p>
            <h4>Среднее по спеллам</h4>`;

        for (let spell in spellStats) {
            const avg = (spellStats[spell].totalTime / spellStats[spell].count).toFixed(0);
            statsPanel.innerHTML += `<p>${spell}: ${avg} мс (всего ${spellStats[spell].count})</p>`;
        }
    }

    showMessage("Крип дошёл до Инвокера!\nНажми Enter для рестарта.", "red");

    document.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            score = 0;
            spellStats = {};
            gameOver = false;
            orbSequence = "";
            spellSlotD = null;
            spellSlotF = null;
            spellCount = 0;
            enemyDuration = baseDuration;
            lastSuccessfulSpell = null;
            lastSpell = null;
            newSpell();
        }
    }, { once: true });
}

// Движение врага по таймеру
function moveEnemy() {
    if (gameOver) return;

    const now = Date.now();
    const elapsed = now - enemyStartTime;

    if (elapsed < enemyDuration) {
        const progress = elapsed / enemyDuration;
        const pos = startPos + (endPos - startPos) * progress;
        enemy.style.left = pos + "px";
        enemyAnimationId = requestAnimationFrame(moveEnemy);
    } else {
        loseGame();
    }
}

// Обработка клавиш (независимо от раскладки)
document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    switch (e.code) {
        case "KeyQ":
            orbSequence += "Q";
            break;
        case "KeyW":
            orbSequence += "W";
            break;
        case "KeyE":
            orbSequence += "E";
            break;
        case "KeyR":
            spellSlotF = spellSlotD;
            spellSlotD = orbSequence;
            break;
        case "KeyD":
        case "KeyT": // дубль D
            checkSpell(spellSlotD);
            break;
        case "KeyF":
        case "KeyY": // дубль F
            checkSpell(spellSlotF);
            break;
    }

    if (orbSequence.length > 3) {
        orbSequence = orbSequence.slice(-3);
    }
    orbDisplay.textContent = orbSequence;
});

// Запуск игры
newSpell();
