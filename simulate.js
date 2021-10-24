let ctx = null;
let dots = [];
const t = 1;
const G = 10000 * t;
let WIDTH = 0;
let HEIGHT = 0;
let LAST_LOCATION_LIST_SIZE = 5;
const SIMULATION_INTERVAL = 0.01;
const RADIUS_SCALE = 1500;
const colors = ["yellow", "red", "blue", "pink", "purple", "green", "white"];
//----------//----------//----------//----------//----------//----------

class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class LinkedList {
  constructor() {
    this.nodes = [];
  }

  size() {
    return this.nodes.length;
  }

  insertAt(index, value) {
    const previousNode = this.nodes[index - 1] || null;
    const nextNode = this.nodes[index] || null;
    const node = { value, next: nextNode };

    if (previousNode) previousNode.next = node;
    this.nodes.splice(index, 0, node);
  }

  insertFirst(value) {
    if (this.size() == LAST_LOCATION_LIST_SIZE) {
      this.removeAt(this.size() - 1);
    }

    this.insertAt(0, value);
  }

  getAt(index) {
    return this.nodes[index];
  }

  removeAt(index) {
    const previousNode = this.nodes[index - 1];
    const nextNode = this.nodes[index + 1] || null;

    if (previousNode) previousNode.next = nextNode;

    return this.nodes.splice(index, 1);
  }

  clear() {
    this.nodes = [];
  }
}

class Dot {
  constructor(id, mass, locVec, velVec) {
    this.id = id;
    this.mass = mass;
    this.locVec = locVec;
    this.velVec = velVec;
    this.nextLocVec = locVec;
    this.nextVelVec = velVec;
    this.lastLocationList = new LinkedList();
  }

  draw() {
    var pathX = 0;
    var pathY = 0;
    let x = parseInt(this.nextLocVec.x);
    let y = parseInt(this.nextLocVec.y);
    pathX = WIDTH / 2 + x;
    pathY = HEIGHT / 2 - y;

    let raius = this.scaleRadius();

    if (raius > 0) {
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.arc(pathX, pathY, raius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = this.getColor();
      ctx.fill();
    }
  }

  drawLastLocations() {
    var pathX = 0;
    var pathY = 0;
    var locVec = null;

    for (let i = 0; i < this.lastLocationList.size(); i++) {
      locVec = this.lastLocationList.getAt(i).value;

      let x = parseInt(locVec.x);
      let y = parseInt(locVec.y);
      pathX = WIDTH / 2 + x;
      pathY = HEIGHT / 2 - y;

      let raius = RADIUS_SCALE / locVec.z;

      if (raius > 0) {
        ctx.beginPath();
        ctx.globalAlpha = 0.3;
        ctx.arc(pathX, pathY, raius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.getColor();
        ctx.fill();
      }
    }
  }

  getColor() {
    return colors[this.id];
  }

  moveToNextLocation() {
    this.lastLocationList.insertFirst(
      new Vector(this.nextLocVec.x, this.nextLocVec.y, this.nextLocVec.z)
    );
    this.locVec = { ...this.nextLocVec };
    this.velVec = { ...this.nextVelVec };
  }

  scaleRadius() {
    return RADIUS_SCALE / this.nextLocVec.z;
  }

  isInView() {
    return (
      this.nextLocVec.x <= WIDTH / 2 &&
      this.nextLocVec.x >= -WIDTH / 2 &&
      this.nextLocVec.y <= HEIGHT / 2 &&
      this.nextLocVec.y >= -HEIGHT / 2 &&
      this.nextLocVec.z > 0
    );
  }
}

//----------//----------//----------//----------//----------//----------

function start() {
  const canvas = document.getElementById("screen");
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  console.log(WIDTH + ", " + HEIGHT);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  createDot();
  setInterval(simulate, SIMULATION_INTERVAL * 1000);
}

function simulate() {
  drawDots();
  calcNexts();
}

function createDot() {
  dots.push(new Dot(0, 0.001, new Vector(0, 150, 390), new Vector(-50, 16, -2)));
  dots.push(new Dot(1, 0.001, new Vector(-100, -100, 270), new Vector(-25, -20, 2)));
  dots.push(new Dot(2, 0.001, new Vector(0, -110, 350), new Vector(-20, -20, 2)));
  dots.push(new Dot(4, 0.001, new Vector(0, 0, 200), new Vector(-5, -28, 0)));
  dots.push(new Dot(3, 25, new Vector(0, 150, 500), new Vector(0, -0.02, 0)));
}

function drawDots() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let dot of dots) {
    if (dot.isInView) {
      dot.drawLastLocations();
      dot.draw();
    } else {
      console.log(
        "##### NOT SEEN x: " +
          dot.nextLocVec.x +
          " y: " +
          dot.nextLocVec.y +
          " z: " +
          dot.nextLocVec.z
      );
    }

    dot.moveToNextLocation();
  }

  console.log("------------------------------------------------------------");
}

function calcNexts() {
  for (let currentDot of dots) {
    calcNextLocVel(currentDot);
  }
}

function calcNextLocVel(currentDot) {
  let velVec = calcNextVel(currentDot);
  let locVec = new Vector(
    currentDot.locVec.x + velVec.x * t,
    currentDot.locVec.y + velVec.y * t,
    currentDot.locVec.z + velVec.z * t
  );

  currentDot.nextLocVec = locVec;
  currentDot.nextVelVec = velVec;
}

function calcNextVel(currentDot) {
  let distanceSquared = 0;
  let acceleration = 0;
  let transformedDotLoc = null;
  let totalAcceleration = new Vector(currentDot.velVec.x, currentDot.velVec.y, currentDot.velVec.z);

  const transformedCurrentDotLoc = transform(currentDot.locVec, currentDot.locVec);

  for (let dot of dots) {
    if (currentDot.id !== dot.id) {
      transformedDotLoc = transform(dot.locVec, currentDot.locVec);
      distanceSquared =
        Math.pow(transformedDotLoc.x - transformedCurrentDotLoc.x, 2) +
        Math.pow(transformedDotLoc.y - transformedCurrentDotLoc.y, 2) +
        Math.pow(transformedDotLoc.z - transformedCurrentDotLoc.z, 2);

      acceleration = (G * dot.mass) / distanceSquared;

      totalAcceleration.x += (acceleration * transformedDotLoc.x) / Math.sqrt(distanceSquared);
      totalAcceleration.y += (acceleration * transformedDotLoc.y) / Math.sqrt(distanceSquared);
      totalAcceleration.z += (acceleration * transformedDotLoc.z) / Math.sqrt(distanceSquared);
    }
  }

  return totalAcceleration;
}

function transform(dotLocVec, transformPointLocVec) {
  return new Vector(
    dotLocVec.x - transformPointLocVec.x,
    dotLocVec.y - transformPointLocVec.y,
    dotLocVec.z - transformPointLocVec.z
  );
}

function cosAlpha(dot, distance) {
  return dot.locVec.x / distance;
}

function cosBeta(dot, distance) {
  return dot.locVec.y / distance;
}

function calculateTheta(dot, distance) {
  return dot.locVec.z / distance;
}
