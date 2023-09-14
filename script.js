// Model
const app = document.getElementById("app");
const playerElement = document.getElementById("player");
const itemsContainer = document.getElementById("items-container");
const healthBar = document.getElementById("health-progress");
const coolnessBar = document.getElementById("coolness-progress");

const model = {
  itemsSpawned: 0,
  homiesSpawned: 0,
  enemiesSpawned: 0,
  gameLoop: null,
  itemSpawnCooldown: false,
  timeoutIds: [],
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
    { name: "Banana", coolness: -20, money: 0, damage: 5, class: "banana" },
    { name: "Screw", coolness: 5, money: 0, damage: -25, class: "screw" },
    { name: "Money", coolness: 5, money: 150, damage: 0, class: "money" },
    { name: "Hole", coolness: -40, money: 0, damage: 30, class: "hole" },
    { name: "Rival", coolness: -20, money: 0, damage: 0, class: "rival" },
  ],
  homieTable: [
    {
      id: 0,
      name: "Big Man",
      greetingId: 0,
      wrongGreetingMessage: "Dafuq man, don't you know how to greet me?",
      correctGreetingMessage: "Yo my man, wassup",
    },
    {
      id: 1,
      name: "BeetleJuice",
      greetingId: 1,
      wrongGreetingMessage: "Whats up BeetleJuice?",
      correctGreetingMessage: "",
    },
    {
      id: 2,
      name: "Crackhead",
      greetingId: 2,
      wrongGreetingMessage: "Ayo, have you forgotten it?",
      correctGreetingMessage: "Cool bro, I'll lend you the crack pipe later.",
    },
  ],
  shopItemsTable: [
    { id: 0, name: "Spoiler", coolness: 5, cost: 100 },
    { id: 1, name: "Engine", coolness: 20, cost: 400 },
    { id: 2, name: "Neon light", coolness: 5, cost: 100 },
    { id: 3, name: "Paint", coolness: 10, cost: 200 },
    { id: 4, name: "Rims", coolness: 5, cost: 50 },
    { id: 5, name: "A great deal (scam)", coolness: -50, cost: 1000 },
    { id: 6, name: "Insurance", coolness: 5, damage: -100, cost: 1000 },
  ],
  enemiesTable: [
    { id: 0, name: "GrandMa", damage: 30 },
    { id: 1, name: "politi", damage: 40 },
  ],
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
      itemsContainer.innerHTML += /*html*/ `
        <div id="${item.id}" class="item ${item.class}" style="top: -80px;"></div>
      `;
    }
  }
}

function getHeight(value) {
  let percentage = value / 100;
  return `${percentage * 400}px`;
}

function removeItemElement(id) {
  document.getElementById(id).remove();
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
  for (let i = 0; i < model.activeItems.length; i++) {
    if (!model.activeItems[i].yPosition && model.activeItems[i].yPosition !== 0) {
      // Todo: generate a random horizontal position
      model.activeItems[i].yPosition = -80;
      model.activeItems[i].xPosition = Math.floor(Math.random() * (620 - 20 + 1) + 20);
      model.activeItems[i].id = `item-${model.itemsSpawned}`;
    }
    model.activeItems[i].yPosition += 5;
    if (model.activeItems[i].yPosition >= window.innerHeight) {
      removeItemElement(model.activeItems[i].id);
      model.activeItems.splice(i, 1);
    } else {
      const itemVSPlayerPosition = model.activeItems[i].xPosition - model.player.position;
      const PLAYER_WIDTH = 160;
      const PLAYER_HEIGHT_START = 674;
      const PLAYER_HEIGHT_END = 898;
      const ITEM_SIZE = 80;
      if (
        itemVSPlayerPosition >= -ITEM_SIZE &&
        itemVSPlayerPosition <= PLAYER_WIDTH &&
        model.activeItems[i].yPosition >= PLAYER_HEIGHT_START - ITEM_SIZE &&
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

        removeItemElement(model.activeItems[i].id);
        model.activeItems.splice(i, 1);
      }
    }
  }
}

function spawnRandomItem() {
  if (model.itemSpawnCooldown) return;
  const randomIndex = getRandomNumFromZero(model.itemTable.length);
  const spawnChanceNumber = getRandomNumFromZero(45);
  if (spawnChanceNumber !== 0) return;
  model.itemSpawnCooldown = true;
  model.timeoutIds.push(
    setTimeout(() => {
      model.itemSpawnCooldown = false;
      model.timeoutIds.pop();
    }, 1200)
  );
  model.itemsSpawned++;
  model.activeItems.push(JSON.parse(JSON.stringify(model.itemTable[randomIndex])));
}

function npc() {
  const randomIndex = getRandomNumFromZero(model.homies.length);
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
  if (model.player.position + model.player.movementSpeed >= 620) {
    model.player.position = 620;
  } else if (model.player.position + model.player.movementSpeed <= 20) {
    model.player.position = 20;
  } else {
    model.player.position += model.player.movementSpeed;
  }
}

function mainGameInterval() {
  updatePlayerPosition();
  spawnRandomItem();
  updateActiveItems();
  updateView();
}

function initializeGame() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  model.gameLoop = setInterval(mainGameInterval, 33);
  updateView();
}

window.addEventListener("DOMContentLoaded", initializeGame);
