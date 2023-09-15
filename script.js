// Model
const app = document.getElementById("app");
const playerElement = document.getElementById("player");
const itemsContainer = document.getElementById("items-container");
const healthBar = document.getElementById("health-progress");
const coolnessBar = document.getElementById("coolness-progress");
const money = document.getElementById("money");
const greetingButtons = document.getElementById("button-container");

const model = {
  itemsSpawned: 0,
  homiesSpawned: 0,
  enemiesSpawned: 0,
  gameLoop: null,
  itemSpawnCooldown: false,
  homieSpawnCooldown: false,
  itemTimeoutIds: [],
  homieTimeoutIds: [],
  currentCorrectGreeting: null,
  currentHomieIndex: null,
  player: {
    coolness: 25,
    health: 100,
    upgrades: [],
    money: 0,
    movementSpeed: 0,
    holdingLeft: false,
    holdingRight: false,
    engineUpgraded: false,
    position: 300,
    interact: true,
  },
  activeItems: [],
  activeHomies: [],
  activeEnemies: [],
  itemTable: [
    { name: "Banana", coolness: -20, money: 0, damage: 5, class: "banana", width: 80, height: 80 },
    { name: "Screw", coolness: 5, money: 0, damage: -25, class: "screw", width: 80, height: 80 },
    { name: "Money", coolness: 5, money: 150, damage: 0, class: "money", width: 80, height: 80 },
    { name: "Hole", coolness: -40, money: 0, damage: 30, class: "hole", width: 80, height: 80 },
    { name: "Rival", coolness: -20, money: 0, damage: 0, class: "rival", width: 120, height: 200 },
    {
      name: "Politi",
      coolness: -70,
      money: -500,
      damage: 0,
      class: "politi",
      width: 120,
      height: 200,
    },
  ],
  homieTable: [
    {
      class: "bigMan",
      name: "Big Man",
      greetingId: 0,
      wrongGreetingMessage: "Dafuq man, don't you know how to greet me?",
      correctGreetingMessage: "Yo my man, wassup",
    },
    {
      class: "beetleJuice",
      name: "BeetleJuice",
      greetingId: 1,
      wrongGreetingMessage: "Whats up BeetleJuice?",
      correctGreetingMessage: "",
    },
    {
      class: "crackhead",
      name: "Crackhead",
      greetingId: 2,
      wrongGreetingMessage: "Ayo, have you forgotten it?",
      correctGreetingMessage: "Cool bro, I'll lend you the crack pipe later.",
    },
  ],
  /*  shopItemsTable: [
    { id: 0, name: "Spoiler", coolness: 5, cost: 100 },
    { id: 1, name: "Engine", coolness: 20, cost: 400 },
    { id: 2, name: "Neon light", coolness: 5, cost: 100 },
    { id: 3, name: "Paint", coolness: 10, cost: 200 },
    { id: 4, name: "Rims", coolness: 5, cost: 50 },
    { id: 5, name: "A great deal (scam)", coolness: -50, cost: 1000 },
    { id: 6, name: "Insurance", coolness: 5, damage: -100, cost: 1000 },
  ], */
};

// View

function updateView() {
  playerElement.style.left = `${model.player.position}px`;
  healthBar.style.height = getHeight(model.player.health);
  coolnessBar.style.height = getHeight(model.player.coolness);
  for (const item of model.activeItems) {
    itemDiv = document.getElementById(item.id);
    if (itemDiv) {
      itemDiv.style.top = `${item.yPosition}px`;
      itemDiv.style.left = `${item.xPosition}px`;
    } else {
      const newItem = document.createElement("div");
      newItem.id = item.id;
      newItem.classList.add("item");
      newItem.classList.add(item.class);
      newItem.style.top = "-80px";
      newItem.style.width = `${item.width}px`;
      newItem.style.height = `${item.height}px`;
      itemsContainer.append(newItem);
    }
  }
  for (const homie of model.activeHomies) {
    homieDiv = document.getElementById(homie.id);
    if (homieDiv) {
      homieDiv.style.top = `${homie.yPosition}px`;
    } else {
      const newHomie = document.createElement("div");
      newHomie.id = homie.id;
      newHomie.classList.add("item");
      newHomie.classList.add("homie");
      newHomie.classList.add(homie.class);
      newHomie.style.top = "-80px";
      newHomie.style.left = "900px";
      itemsContainer.append(newHomie);
    }
  }
  money.textContent = model.player.money;
}

function getHeight(value) {
  let percentage = value / 100;
  return `${percentage * 400}px`;
}

function removeElement(id) {
  document.getElementById(id).remove();
}

function setGreetingButtonsVisibility(state) {
  greetingButtons.classList.toggle("none", !state);
}

// Controller

function interact() {}

function handleKeyDown(event) {
  if (event.key === "a" || event.key === "ArrowLeft") {
    model.player.holdingLeft = true;
  }
  if (event.key === "d" || event.key === "ArrowRight") {
    model.player.holdingRight = true;
  }
  if (event.key === "f") {
    interact();
  }
}

function handleKeyUp(event) {
  if (event.key === "a" || event.key === "ArrowLeft") {
    model.player.holdingLeft = false;
  }
  if (event.key === "d" || event.key === "ArrowRight") {
    model.player.holdingRight = false;
  }
}
function getRandomNumFromZero(max) {
  return Math.floor(Math.random() * max);
}

function updateActiveItems() {
  if (model.activeItems.length === 0 || model.player.talkingToHomie) return;
  for (let i = 0; i < model.activeItems.length; i++) {
    if (!model.activeItems[i].yPosition && model.activeItems[i].yPosition !== 0) {
      model.activeItems[i].yPosition = -80;
      model.activeItems[i].xPosition = Math.floor(Math.random() * (620 - 20 + 1) + 20);
      model.activeItems[i].id = `item-${model.itemsSpawned}`;
    }
    model.activeItems[i].yPosition += 5;
    if (model.activeItems[i].yPosition >= window.innerHeight) {
      removeElement(model.activeItems[i].id);
      model.activeItems.splice(i, 1);
    } else {
      const itemVSPlayerPosition = model.activeItems[i].xPosition - (model.player.position + 60);
      const PLAYER_WIDTH = 80;
      const PLAYER_HEIGHT_START = 710;
      const PLAYER_HEIGHT_END = 898;
      const ITEM_WIDTH = model.activeItems[i].width;
      const ITEM_HEIGHT = model.activeItems[i].height;
      if (
        itemVSPlayerPosition >= -ITEM_WIDTH &&
        itemVSPlayerPosition <= PLAYER_WIDTH &&
        model.activeItems[i].yPosition >= PLAYER_HEIGHT_START - ITEM_HEIGHT &&
        model.activeItems[i].yPosition <= PLAYER_HEIGHT_END
      ) {
        let newHealth = model.player.health - model.activeItems[i].damage;
        let newCoolness = model.player.coolness + model.activeItems[i].coolness;
        if (newHealth > 100) {
          newHealth = 100;
        }
        if (newCoolness > 100) {
          newCoolness = 100;
        } else if (newCoolness < 0) {
          newCoolness = 0;
        }
        model.player.health = newHealth;
        model.player.coolness = newCoolness;
        model.player.money += model.activeItems[i].money;

        removeElement(model.activeItems[i].id);
        model.activeItems.splice(i, 1);
      }
    }
  }
}

function updateActiveHomies() {
  if (model.activeHomies.length === 0) return;
  for (let i = 0; i < model.activeHomies.length; i++) {
    if (!model.activeHomies[i].yPosition && model.activeHomies[i].yPosition !== 0) {
      model.activeHomies[i].yPosition = -80;
      model.activeHomies[i].xPosition = 900;
      model.activeHomies[i].id = `homie-${model.homiesSpawned}`;
      console.log(model.activeHomies[i].id);
    }
    const HOMIE_STOP_AT_HEIGHT = 740;
    if (model.activeHomies[i].yPosition >= HOMIE_STOP_AT_HEIGHT) {
      clearInterval(model.gameLoop);
      model.currentCorrectGreeting = model.activeHomies[i].greetingId;
      model.currentHomieIndex = i;
      setGreetingButtonsVisibility(true);
    } else {
      model.activeHomies[i].yPosition += 5;
    }
  }
}

function spawnRandomItem() {
  if (model.itemSpawnCooldown || model.player.talkingToHomie) return;
  const randomIndex = getRandomNumFromZero(model.itemTable.length);
  const spawnChanceNumber = getRandomNumFromZero(45);
  if (spawnChanceNumber !== 0) return;
  model.itemSpawnCooldown = true;
  model.itemTimeoutIds.push(
    setTimeout(() => {
      model.itemSpawnCooldown = false;
      model.itemTimeoutIds.pop();
    }, 1200)
  );
  model.itemsSpawned++;
  model.activeItems.push({ ...model.itemTable[randomIndex] });
}

function spawnRandomHomie() {
  if (model.homieSpawnCooldown) return;
  const randomIndex = getRandomNumFromZero(model.homieTable.length);
  const spawnChanceNumber = getRandomNumFromZero(120);
  if (spawnChanceNumber !== 0) return;
  model.homieSpawnCooldown = true;
  model.homieTimeoutIds.push(
    setTimeout(() => {
      model.homieSpawnCooldown = false;
      model.homieTimeoutIds.pop();
    }, 10000)
  );
  model.homiesSpawned++;
  model.activeHomies.push({ ...model.homieTable[randomIndex] });
}

function updatePlayerPosition() {
  if (model.player.holdingLeft === model.player.holdingRight) {
    model.player.movementSpeed = 0;
  } else if (model.player.holdingLeft) {
    model.player.movementSpeed = -15;
  } else if (model.player.holdingRight) {
    model.player.movementSpeed = 15;
  } else {
    model.player.movementSpeed = 0;
  }
  if (model.player.engineUpgraded) {
    model.player.movementSpeed *= 1.25;
  }
  if (model.player.position + model.player.movementSpeed >= 640) {
    model.player.position = 640;
  } else if (model.player.position + model.player.movementSpeed <= -30) {
    model.player.position = -30;
  } else {
    model.player.position += model.player.movementSpeed;
  }
}

function greetHomie(greetingId) {
  if (greetingId === model.currentCorrectGreeting) {
    setGreetingButtonsVisibility(false);
    removeElement(model.activeHomies[model.currentHomieIndex].id);
    model.activeHomies.splice(model.currentHomieIndex, 1);
    model.gameLoop = setInterval(mainGameInterval, 33);
    let newCoolness = model.player.coolness + 35;
    if (newCoolness > 100) {
      newCoolness = 100;
    } else if (newCoolness < 0) {
      newCoolness = 0;
    }
    model.player.coolness = newCoolness;
  } else {
    model.player.coolness -= 8;
  }
}

function mainGameInterval() {
  updatePlayerPosition();
  spawnRandomItem();
  spawnRandomHomie();
  updateActiveItems();
  updateActiveHomies();
  updateView();
}

function initializeGame() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  model.gameLoop = setInterval(mainGameInterval, 33);
  updateView();
}

window.addEventListener("DOMContentLoaded", initializeGame);
