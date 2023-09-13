// Model
const app = document.getElementById("app");
const playerElement = document.getElementById("player");
const itemsContainer = document.getElementById("items-container");

const model = {
  itemsSpawned: 0,
  homiesSpawned: 0,
  enemiesSpawned: 0,
  gameLoop: null,
  itemSpawnCooldown: false,
  timeoutIds: [],
  player: {
    coolness: 0,
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
  ],
  homieTable: [
    {
      id: 0,
      name: "Big Man",
      greetingId: 0,
      wrongGreetingMessage: "Dafuq man, don't you know the greeting?",
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
      wrongGreetingMessage: "",
      correctGreetingMessage: "",
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
    { id: 2, name: "birdPoo", damage: 10 },
    { id: 3, name: "rival", damage: 20 },
  ],
};

// View

function updateView() {
  playerElement.style.left = `${model.player.position}px`;
  for (const item of model.activeItems) {
    itemDiv = document.getElementById(item.id);
    if (itemDiv) {
      itemDiv.style.top = `${item.position}px`;
    } else {
      itemsContainer.innerHTML += /*html*/ `
        <div id="${item.id}" class="${item.class}" style="top: -80px;"></div>
      `;
    }
  }
}

// Controller

function interact() {}

function handleKeyDown(event) {
  if (event.key === "a") {
    model.player.holdingLeft = true;
  }
  if (event.key === "d") {
    model.player.holdingRight = true;
  }
  if (event.key === "f") {
    interact();
  }
}

function handleKeyUp(event) {
  if (event.key === "a") {
    model.player.holdingLeft = false;
  }
  if (event.key === "d") {
    model.player.holdingRight = false;
  }
}

function getRandomNumFromZero(max) {
  return Math.floor(Math.random() * max);
}

function updateActiveItems() {
  for (let i = 0; i < model.activeItems.length; i++) {
    if (!model.activeItems[i].position && model.activeItems[i] !== 0) {
      // Todo: generate a random horizontal position
      model.activeItems[i].position = -80;
      model.activeItems[i].id = `item-${model.itemsSpawned}`;
    }
    model.activeItems[i].position += 4;
    if (model.activeItems[i].position >= window.innerHeight) {
      model.activeItems.splice(i, 1);
    }
  }
  console.log(model.activeItems);
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
    }, 3000)
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

//End
