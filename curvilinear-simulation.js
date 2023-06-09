let screenContext = null;
let cameraLocation = null;
let ARROW_JUMP = 100;
let START_Z = 100000;
let particles = [];
const t = 1;
const G = 21.54;
let WIDTH = 0;
let HEIGHT = 0;
let RADIUS = 0;
let SIMULATION_INTERVAL = 0.01;
const colors = [
  'darkblue',
  'darkslategrey',
  'darkmagenta',
  'white',
  'SkyBlue',
  'grey',
  'lightpink',
  'yellowgreen',
  'white',
  'lightgrey',
  'brown',
  'beige',
  'goldenrod',
  'powderblue',
  'dodgerblue',
  'seagreen',
  'lime',
  'pink',
  'violet',
  'tomato',
  'teal',
  'silver',
  'peru',
];
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
    var centerPathX = 0;
    var centerPathY = 0;
    let centerX = parseInt(this.nextLocation.x - cameraLocation.x);
    let centerY = parseInt(this.nextLocation.y - cameraLocation.y);
    let centralDistanceToCamera = Math.sqrt(
      Math.pow(centerX, 2) +
        Math.pow(centerY, 2) +
        Math.pow(this.nextLocation.z - cameraLocation.z, 2)
    );
    centerPathX = (RADIUS * centerX) / centralDistanceToCamera;
    centerPathY = (RADIUS * centerY) / centralDistanceToCamera;

    var surfacePathX = 0;
    var surfacePathY = 0;
    let surfaceX = parseInt(this.nextLocation.x - cameraLocation.x) + this.radius;
    let surfaceY = parseInt(this.nextLocation.y - cameraLocation.y);
    let surfaceDistanceToCamera = Math.sqrt(
      Math.pow(surfaceX, 2) +
        Math.pow(surfaceY, 2) +
        Math.pow(this.nextLocation.z - cameraLocation.z, 2)
    );
    surfacePathX = (RADIUS * surfaceX) / surfaceDistanceToCamera;
    surfacePathY = (RADIUS * surfaceY) / surfaceDistanceToCamera;

    let screenRadius = Math.sqrt(
      Math.pow(surfacePathX - centerPathX, 2) + Math.pow(surfacePathY - centerPathY, 2)
    );

    screenContext.fillStyle = this.getColor();
    if (screenRadius > 0 && cameraLocation.z < this.nextLocation.z) {
      screenContext.beginPath();
      screenContext.globalAlpha = 1;
      screenContext.arc(
        WIDTH / 2 + centerPathX,
        HEIGHT / 2 - centerPathY,
        screenRadius,
        0,
        Math.PI * 2
      );
      screenContext.closePath();
      screenContext.fill();
    }
    return { centerPathX, centerPathY, screenRadius };
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
  m0 = 500000;
  r0 = 1000;
  particles.push(new Particle(0, 'O0', m0, r0, new Vector(0, 0, START_Z), new Vector(0, 0, 0)));

  m1 = 20000;
  r1 = 300;
  d1 = 20000;
  v1 = Math.sqrt((G * m0) / d1) + 1;
  console.log(v1);
  particles.push(new Particle(1, 'O1', m1, r1, new Vector(-d1, 0, START_Z), new Vector(0, 0, v1)));

  m2 = 4000;
  r2 = 40;
  d2 = 1000;
  v2 = Math.sqrt((G * m1) / d2) + 1;
  console.log(v2);
  particles.push(
    new Particle(2, 'O2', m2, r2, new Vector(-d1, d2, START_Z), new Vector(0, 0, v1 + v2))
  );

  m3 = 100;
  r3 = 10;
  d3 = 100;
  v3 = Math.sqrt((G * m2) / d3) + 1;
  console.log(v3);
  particles.push(
    new Particle(3, 'O3', m3, r3, new Vector(-d1 + d3, d2, START_Z), new Vector(0, 0, v1 + v2 + v3))
  );
}

function setupScreen() {
  const screen = document.getElementById('screen');
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  RADIUS = 7 * HEIGHT;
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
  clearScreen();

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
      ((particle.location.x - cameraLocation.x) / ARROW_JUMP).toFixed(1) +
      ', ' +
      ((particle.location.y - cameraLocation.y) / ARROW_JUMP).toFixed(1) +
      ', ' +
      ((particle.location.z - cameraLocation.z) / ARROW_JUMP).toFixed(1),
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

function transformLocation(location, referenceLocation) {
  return new Vector(
    location.x - referenceLocation.x,
    location.y - referenceLocation.y,
    location.z - referenceLocation.z
  );
}
