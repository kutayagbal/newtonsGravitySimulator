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
let SIMULATION_INTERVAL = 0.001;
const million = 1000000;
const colors = [
  'peru',
  'darkmagenta',
  'dodgerblue',
  'yellowgreen',
  'crimson',
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
  clearScreen();
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
  peru = 47001 * million;
  r0 = 5000;
  particles.push(
    new Particle(0, 'O0', peru, r0, new Vector(-100, 0, START_Z), new Vector(-80, -10, -30))
  );

  darkmagenta = 170 * million;
  r1 = 10 * 170;
  d1 = 40000;
  v1 = Math.sqrt((G * peru) / d1) + 1;
  console.log(v1);
  particles.push(
    new Particle(1, 'O1', darkmagenta, r1, new Vector(-d1, 0, START_Z), new Vector(50, v1, 0))
  );

  dodgerblue = 155 * million;
  r2 = 10 * 155;
  d2 = 10000;
  v2 = Math.sqrt((G * darkmagenta) / d2) + 1;
  console.log(v2);
  particles.push(
    new Particle(
      2,
      'O2',
      dodgerblue,
      r2,
      new Vector(d1, d2, START_Z),
      new Vector(600, v2 - v1, 1200)
    )
  );

  yellowgreen = 3900 * million;
  r3 = 1000;
  d3 = 1000;
  v3 = Math.sqrt((G * peru) / d3) + 1;
  console.log(v3);
  particles.push(
    new Particle(
      3,
      'O3',
      yellowgreen,
      r3,
      new Vector(d1, d3, START_Z + 1600),
      new Vector(1010, -30, v3 - 25000)
    )
  );

  crimson = 180 * million;
  r4 = 10 * 180;
  d4 = 1000;
  v4 = Math.sqrt((G * yellowgreen) / d4) + 1;
  console.log(v4);
  particles.push(
    new Particle(
      4,
      'O4',
      crimson,
      r4,
      new Vector(d1 + d3, d3 + d4, START_Z + d3 + d4 + 2000),
      new Vector(1800, -400, 5400)
    )
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
  cameraLocation = new Vector(0, 0, -1500000);
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
