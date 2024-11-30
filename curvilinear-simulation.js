let screenContext = null;
let cameraLocation = null;
let ARROW_JUMP = 100;
const million = 1000000;
let START_Z = 100 * million;
let particles = [];
const t = 1;
const G = 667 / (100 * million);
let WIDTH = 0;
let HEIGHT = 0;
let SIMULATION_INTERVAL = 0.001;
let R = 10 * million;

const colors = ['peru', 'dodgerblue', 'darkmagenta', 'black', 'crimson'];
//----------//----------//----------//----------//----------//----------

document.addEventListener('keyup', e => {
  let jumpAmount = ARROW_JUMP;
  if (e.shiftKey) {
    jumpAmount *= 10;
  } else if (e.ctrlKey) {
    jumpAmount *= 100;
  } else if (e.altKey) {
    jumpAmount *= 1000;
  }

  if (e.code === 'ArrowUp') {
    cameraLocation.y += jumpAmount;
  } else if (e.code === 'ArrowDown') {
    cameraLocation.y -= jumpAmount;
  } else if (e.code === 'ArrowLeft') {
    cameraLocation.x -= jumpAmount;
  } else if (e.code === 'ArrowRight') {
    cameraLocation.x += jumpAmount;
  } else if (e.code === 'KeyA') {
    cameraLocation.z += jumpAmount;
  } else if (e.code === 'KeyS') {
    cameraLocation.z -= jumpAmount;
  }
  // clearScreen();
});
class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Particle {
  constructor(id, title, mass, radius, location, velocity) {
    this.id = id;
    this.title = title;
    this.mass = mass;
    this.radius = radius;
    this.location = location;
    this.velocity = velocity;
    this.nextLocation = location;
    this.nextVelocity = velocity;
  }

  project() {
    // if (this.id == 3) {
    //   return;
    // }

    var centerCurvyDist = Math.sqrt(
      Math.pow(this.nextLocation.x, 2) +
        Math.pow(this.nextLocation.y, 2) +
        Math.pow(this.nextLocation.z, 2)
    );

    if (centerCurvyDist === 0) {
      centerCurvyDist = 1;
    }

    var centerCurvyX = (R * this.nextLocation.x) / centerCurvyDist;
    var centerCurvyY = (R * this.nextLocation.y) / centerCurvyDist;

    var surfaceCurvyDist = Math.sqrt(
      Math.pow(this.nextLocation.x + this.radius, 2) +
        Math.pow(this.nextLocation.y + this.radius, 2) +
        Math.pow(this.nextLocation.z + this.radius, 2)
    );

    if (surfaceCurvyDist === 0) {
      surfaceCurvyDist = 1;
    }

    var surfaceCurvyX = (R * (this.nextLocation.x + this.radius)) / surfaceCurvyDist;
    var surfaceCurvyY = (R * (this.nextLocation.y + this.radius)) / surfaceCurvyDist;

    let screenRadius = Math.sqrt(
      Math.pow(surfaceCurvyX - centerCurvyX, 2) + Math.pow(surfaceCurvyY - centerCurvyY, 2)
    );

    screenContext.fillStyle = this.getColor();
    if (screenRadius > 0 && cameraLocation.z < this.nextLocation.z) {
      screenContext.beginPath();
      screenContext.globalAlpha = 1;

      screenContext.arc(
        WIDTH / 2 + centerCurvyX,
        HEIGHT / 2 - centerCurvyY,
        screenRadius,
        0,
        Math.PI * 2
      );
      screenContext.closePath();
      screenContext.fill();
    }
  }

  getColor() {
    return colors[this.id];
  }

  moveToNextLocation(obj) {
    this.location = { ...this.nextLocation };
    this.velocity = { ...this.nextVelocity };
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
  createSystem();
  setupScreen();
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function createSystem() {
  yellowgreen = 300 * million;
  r3 = 10;
  particles.push(
    new Particle(3, 'O3', yellowgreen, r3, new Vector(600, 0, START_Z), new Vector(0, 0, -1))
  );

  dodgerblue = 5 * million;
  r2 = 200;
  d0 = 5000;
  v0 = Math.sqrt((G * yellowgreen) / d0);
  particles.push(
    new Particle(1, 'O1', dodgerblue, r2, new Vector(0, d0, START_Z), new Vector(0, 0, v0))
  );

  darkmagenta = 1 * million;
  r1 = 40;
  d1 = 20000;
  particles.push(
    new Particle(2, 'O2', darkmagenta, r1, new Vector(0, -d0, START_Z), new Vector(0, 0, -v0))
  );

  crimson = 5 * million;
  r4 = 200;
  v1 = Math.sqrt((G * yellowgreen) / d1);
  particles.push(
    new Particle(4, 'O4', crimson, r4, new Vector(-3400, 0, START_Z), new Vector(0, 0, -v1))
  );

  peru = 1 * million;
  r0 = 40;
  particles.push(
    new Particle(0, 'O0', peru, r0, new Vector(4600, 0, START_Z), new Vector(0, 0, v1))
  );
}

function setupScreen() {
  const screen = document.getElementById('screen');
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  screen.width = WIDTH;
  screen.height = HEIGHT;
  screenContext = screen.getContext('2d');
  cameraLocation = new Vector(0, 0, 0);
  clearScreen();
}

function clearScreen() {
  screenContext.fillStyle = 'black';
  screenContext.fillRect(0, 0, WIDTH, HEIGHT);
}

function simulate() {
  projectParticles();
  calculateNextLocationsAndVelocities();
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function projectParticles() {
  // clearScreen();

  showCameraLocationInfo();

  particles.sort(Particle.compareByZLocation).forEach(particle => {
    particle.moveToNextLocation(particle.project());
    showParticleLocationInfo(particle);
  });
}

function showParticleLocationInfo(particle) {
  screenContext.fillText(
    particle.title +
      ': ' +
      (particle.location.x / ARROW_JUMP).toFixed(1) +
      ', ' +
      (particle.location.y / ARROW_JUMP).toFixed(1) +
      ', ' +
      (particle.location.z / ARROW_JUMP).toFixed(1),
    10,
    15 * particle.id + 30
  );
}

function showCameraLocationInfo() {
  screenContext.fillStyle = 'green';
  screenContext.fillText(
    'camera: ' +
      (cameraLocation.x / ARROW_JUMP).toFixed(1) +
      ', ' +
      (cameraLocation.y / ARROW_JUMP).toFixed(1) +
      ', ' +
      (cameraLocation.z / ARROW_JUMP).toFixed(1),
    10,
    15
  );
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

function _calculateNextLocationAndVelocity(particle) {
  particle.nextLocation = new Vector(
    particle.location.x + particle.velocity.x * t,
    particle.location.y + particle.velocity.y * t,
    particle.location.z + particle.velocity.z * t
  );
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

      acceleration = (G * t * particle.mass) / distanceSquared;

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

function transformLocation(referenceLocation, location) {
  return new Vector(
    referenceLocation.x - location.x,
    referenceLocation.y - location.y,
    referenceLocation.z - location.z
  );
}
