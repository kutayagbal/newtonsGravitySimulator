let screenContext = null;
let particles = [];
const t = 1;
const G = 10000;
let WIDTH = 0;
let HEIGHT = 0;
let RADIUS = 0;
let LAST_LOCATION_LIST_SIZE = 0;
let SIMULATION_INTERVAL = 0.01;
let isSimulationSpeedUp = true;
const colors = ['gold', 'darkred', 'blue', 'coral', 'aqua', 'olive', 'purple', 'grey'];
//----------//----------//----------//----------//----------//----------

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowUp') {
    SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 9) / 10;
  } else if (e.code === 'ArrowDown') {
    SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 11) / 10;
  } else if (e.code === 'ArrowLeft') {
    particles.forEach(p => (p.nextLocation.z -= 100));
  } else if (e.code === 'ArrowRight') {
    particles.forEach(p => (p.nextLocation.z += 100));
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
  constructor(id, mass, radius, location, velocity) {
    this.id = id;
    this.mass = mass;
    this.radius = radius;
    this.location = location;
    this.velocity = velocity;
    this.nextLocation = location;
    this.nextVelocity = velocity;
    this.lastLocations = [];
  }

  project() {
    if (LAST_LOCATION_LIST_SIZE > 0) {
      this.projectLastLocations();
    }

    var centerPathX = 0;
    var centerPathY = 0;
    let centerX = parseInt(this.nextLocation.x);
    let centerY = parseInt(this.nextLocation.y);
    let centralDistanceToOrigin = Math.sqrt(
      Math.pow(this.nextLocation.x, 2) +
        Math.pow(this.nextLocation.y, 2) +
        Math.pow(this.nextLocation.z, 2)
    );
    centerPathX = (RADIUS * centerX) / centralDistanceToOrigin;
    centerPathY = (RADIUS * centerY) / centralDistanceToOrigin;

    var surfacePathX = 0;
    var surfacePathY = 0;
    let surfaceX = parseInt(this.nextLocation.x) + this.radius;
    let surfaceY = parseInt(this.nextLocation.y);
    let surfaceDistanceToOrigin = Math.sqrt(
      Math.pow(this.nextLocation.x + this.radius, 2) +
        Math.pow(this.nextLocation.y, 2) +
        Math.pow(this.nextLocation.z, 2)
    );
    surfacePathX = (RADIUS * surfaceX) / surfaceDistanceToOrigin;
    surfacePathY = (RADIUS * surfaceY) / surfaceDistanceToOrigin;

    let screenRadius = Math.sqrt(
      Math.pow(surfacePathX - centerPathX, 2) + Math.pow(surfacePathY - centerPathY, 2)
    );

    if (screenRadius > 0) {
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
      screenContext.fillStyle = this.getColor();
      screenContext.fill();
    }

    return { centerPathX, centerPathY, screenRadius };
  }

  projectLastLocations() {
    this.lastLocations.forEach(loc => {
      if (loc.screenRadius > 0) {
        screenContext.beginPath();
        screenContext.globalAlpha = 1;
        screenContext.arc(
          WIDTH / 2 + loc.centerPathX,
          HEIGHT / 2 - loc.centerPathY,
          loc.screenRadius,
          0,
          Math.PI * 2
        );
        screenContext.closePath();
        screenContext.fillStyle = this.getColor();
        screenContext.fill();
      }
    });
  }

  getColor() {
    return colors[this.id];
  }

  moveToNextLocation(obj) {
    if (LAST_LOCATION_LIST_SIZE > 0) {
      this.moveLastLocations(obj.centerPathX, obj.centerPathY, obj.screenRadius);
    }

    this.location = { ...this.nextLocation };
    this.velocity = { ...this.nextVelocity };
  }

  moveLastLocations(centerPathX, centerPathY, screenRadius) {
    if (LAST_LOCATION_LIST_SIZE > 0) {
      if (this.lastLocations.length == LAST_LOCATION_LIST_SIZE) {
        this.lastLocations.pop();
      }

      this.lastLocations.unshift({
        centerPathX: centerPathX,
        centerPathY: centerPathY,
        screenRadius: screenRadius,
      });
    }
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
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function createParticles() {
  particles.push(new Particle(0, 8, 40, new Vector(-1000, -600, 20000), new Vector(0, 0.1, 5.1)));
  particles.push(new Particle(1, 0.04, 20, new Vector(-1100, -600, 19900), new Vector(0, 0, 30)));
  particles.push(new Particle(2, 0.04, 20, new Vector(-1100, -500, 19900), new Vector(0, 0, 27)));

  particles.push(new Particle(3, 7, 35, new Vector(400, -600, 20000), new Vector(0.2, 0.1, -5)));
  particles.push(new Particle(4, 0.04, 20, new Vector(400, -500, 20100), new Vector(0, 0, -30)));
  particles.push(new Particle(5, 0.04, 20, new Vector(450, -700, 20000), new Vector(0, 0, -30)));
}

function setupScreen() {
  const screen = document.getElementById('screen');
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  RADIUS = 6 * HEIGHT;
  console.log('WIDTH: ' + WIDTH + ' HEIGHT: ' + HEIGHT + ' RADIUS: ' + RADIUS);
  screen.width = WIDTH;
  screen.height = HEIGHT;
  screenContext = screen.getContext('2d');
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

  particles.sort(Particle.compareByZLocation).forEach(particle => {
    particle.moveToNextLocation(particle.project());
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
