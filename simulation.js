let screenContext = null;
let particles = [];
const t = 1;
const G = 10000 * t;
let WIDTH = 0;
let HEIGHT = 0;
let LAST_LOCATION_LIST_SIZE = 4;
const SIMULATION_INTERVAL = 0.1;
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

class Particle {
  constructor(id, mass, location, velocity) {
    this.id = id;
    this.mass = mass;
    this.location = location;
    this.velocity = velocity;
    this.nextLocation = location;
    this.nextVelocity = velocity;
    this.lastLocations = [];
  }

  draw() {
    var pathX = 0;
    var pathY = 0;
    let x = parseInt(this.nextLocation.x);
    let y = parseInt(this.nextLocation.y);
    pathX = WIDTH / 2 + x;
    pathY = HEIGHT / 2 - y;

    let raius = this.scaleRadius();

    if (raius > 0) {
      screenContext.beginPath();
      screenContext.globalAlpha = 1;
      screenContext.arc(pathX, pathY, raius, 0, Math.PI * 2);
      screenContext.closePath();
      screenContext.fillStyle = this.getColor();
      screenContext.fill();
    }
  }

  drawLastLocations() {
    var pathX = 0;
    var pathY = 0;

    this.lastLocations.forEach(location => {
      let x = parseInt(location.x);
      let y = parseInt(location.y);
      pathX = WIDTH / 2 + x;
      pathY = HEIGHT / 2 - y;

      let raius = RADIUS_SCALE / location.z;

      if (raius > 0) {
        screenContext.beginPath();
        screenContext.globalAlpha = 0.3;
        screenContext.arc(pathX, pathY, raius, 0, Math.PI * 2);
        screenContext.closePath();
        screenContext.fillStyle = this.getColor();
        screenContext.fill();
      }
    });
  }

  getColor() {
    return colors[this.id];
  }

  moveToNextLocation() {
    if (this.lastLocations.length == LAST_LOCATION_LIST_SIZE) {
      this.lastLocations.pop();
    }
    this.lastLocations.unshift(
      new Vector(this.nextLocation.x, this.nextLocation.y, this.nextLocation.z)
    );
    this.location = { ...this.nextLocation };
    this.velocity = { ...this.nextVelocity };
  }

  scaleRadius() {
    return RADIUS_SCALE / this.nextLocation.z;
  }

  isInView() {
    return (
      this.nextLocation.x <= WIDTH / 2 &&
      this.nextLocation.x >= -WIDTH / 2 &&
      this.nextLocation.y <= HEIGHT / 2 &&
      this.nextLocation.y >= -HEIGHT / 2 &&
      this.nextLocation.z > 0
    );
  }

  static compareByZLocation(a, b) {
    if (a.nextLocation.z < b.nextLocation.z) {
      return 1;
    } else if (a.nextLocation.z > b.nextLocation.z) {
      return -1;
    }

    return 0;
  }
}

//----------//----------//----------//----------//----------//----------

function startSimulation() {
  createParticles();
  setupScreen();
  setInterval(simulate, SIMULATION_INTERVAL * 1000);
}

function createParticles() {
  particles.push(new Particle(0, 0.01, new Vector(0, 150, 390), new Vector(-50, 16, -2)));
  particles.push(new Particle(1, 0.01, new Vector(-100, -200, 270), new Vector(-25, -20, 2)));
  particles.push(new Particle(2, 0.1, new Vector(0, -110, 350), new Vector(-20, -20, 2)));
  particles.push(new Particle(3, 0.1, new Vector(0, 0, 200), new Vector(-5, -28, 0)));
  particles.push(new Particle(4, 27, new Vector(0, 150, 500), new Vector(0.3, 0.1, 0.08)));
  particles.push(new Particle(5, 0.2, new Vector(500, -150, 700), new Vector(-20, 0, -2)));

  particles.push(new Particle(6, 0.01, new Vector(0, 100, 700), new Vector(-30, 16, -10)));
  // particles.push(new Particle(7, 0.01, new Vector(-100, -200, 270), new Vector(-25, -20, 2)));
}

function setupScreen() {
  const screen = document.getElementById("screen");
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  screen.width = WIDTH;
  screen.height = HEIGHT;
  screenContext = screen.getContext("2d");
  clearScreen();
}

function clearScreen() {
  screenContext.fillStyle = "black";
  screenContext.fillRect(0, 0, WIDTH, HEIGHT);
}

function simulate() {
  drawParticles();
  calculateNextLocationsAndVelocities();
}

function drawParticles() {
  clearScreen();

  particles.sort(Particle.compareByZLocation).forEach(particle => {
    if (particle.isInView()) {
      particle.drawLastLocations();
      particle.draw();
    }

    particle.moveToNextLocation();
  });
}

function calculateNextLocationsAndVelocities() {
  particles.forEach(particle => calculateNextLocationAndVelocity(particle));
}

function calculateNextLocationAndVelocity(particle) {
  let nextVelocity = calculateNextVelocity(particle);
  let nextLocation = new Vector(
    particle.location.x + nextVelocity.x * t,
    particle.location.y + nextVelocity.y * t,
    particle.location.z + nextVelocity.z * t
  );

  particle.nextLocation = nextLocation;
  particle.nextVelocity = nextVelocity;
}

//for t=1 acceleration and velocity is the same vector.
function calculateNextVelocity(currentParticle) {
  let distanceSquared = 0;
  let acceleration = 0;
  var transformedParticalLocation = null;
  let totalAcceleration = new Vector(
    currentParticle.velocity.x,
    currentParticle.velocity.y,
    currentParticle.velocity.z
  );

  particles.forEach(particle => {
    if (currentParticle.id !== particle.id) {
      transformedParticalLocation = transformLocation(particle.location, currentParticle.location);
      distanceSquared =
        Math.pow(transformedParticalLocation.x, 2) +
        Math.pow(transformedParticalLocation.y, 2) +
        Math.pow(transformedParticalLocation.z, 2);

      acceleration = (G * particle.mass) / distanceSquared;

      totalAcceleration.x +=
        (acceleration * transformedParticalLocation.x) / Math.sqrt(distanceSquared);
      totalAcceleration.y +=
        (acceleration * transformedParticalLocation.y) / Math.sqrt(distanceSquared);
      totalAcceleration.z +=
        (acceleration * transformedParticalLocation.z) / Math.sqrt(distanceSquared);
    }
  });

  return totalAcceleration;
}

function transformLocation(location, referenceLocation) {
  return new Vector(
    location.x - referenceLocation.x,
    location.y - referenceLocation.y,
    location.z - referenceLocation.z
  );
}