const spells = {
    "Cold Snap": "QQQ",
    "EMP": "WWW",
    "Sun Strike": "EEE",
    "Tornado": "WWQ",
    "Chaos Meteor": "EEW",
    "Deafening Blast": "QWE"
};

let orbSequence = "";
let invokedCombo = "";
let currentSpell = null;

const orbDisplay = document.getElementById("orb-sequence");
const spellDisplay = document.getElementById("current-spell");
const enemy = document.getElementById("enemy");
const message = document.getElementById("message");

function showMessage(text, color = "yellow") {
    message.textContent = text;
    message.style.color = color;
}

// Новый спелл
function newSpell() {
    const keys = Object.keys(spells);
    currentSpell = keys[Math.floor(Math.random() * keys.length)];
    spellDisplay.textContent = currentSpell;
    orbSequence = "";
    invokedCombo = "";
    orbDisplay.textContent = orbSequence;
    enemy.style.left = "10px";
    enemy.style.opacity = "1";
    showMessage("Собери заклинание!", "yellow");
}

// Считаем буквы в строке
function countLetters(str) {
    const counts = { Q: 0, W: 0, E: 0 };
    for (let ch of str) {
        if (counts[ch] !== undefined) counts[ch]++;
    }
    return counts;
}

// Проверка заклинания (без учёта порядка)
function checkSpell() {
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
        enemy.style.opacity = "0"; // плавное исчезновение
        setTimeout(newSpell, 1000);
    } else {
        showMessage("Неверное заклинание!", "red");
    }
}

// Движение врага
function moveEnemy() {
    let pos = parseInt(enemy.style.left);
    if (pos < 500) {
        enemy.style.left = pos + 2 + "px";
    } else {
        showMessage("Крип дошёл до Инвокера! Ты проиграл.", "red");
        setTimeout(newSpell, 1000);
    }
    requestAnimationFrame(moveEnemy);
}

// Обработка клавиш
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    // Орбы
    if (["q", "w", "e"].includes(key)) {
        orbSequence += key.toUpperCase();
        orbDisplay.textContent = orbSequence;
    }

    // Invoke (R)
    if (key === "r") {
        invokedCombo = orbSequence.slice(-3); // последние 3 орба
        showMessage("Заклинание вызвано: " + invokedCombo, "cyan");
    }

    // Каст (D/F)
    if (["d", "f"].includes(key)) {
        checkSpell();
    }
});

// Запуск игры
newSpell();
moveEnemy();
