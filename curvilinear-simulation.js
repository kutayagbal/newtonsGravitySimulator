let screenContext = null;
let ARROW_JUMP = 100;
let START_Z = 100000;
let particles = [];
const t = 1;
const G = 21.54;
let WIDTH = 0;
let HEIGHT = 0;
let RADIUS = 0;
let LAST_LOCATION_LIST_SIZE = 0;
let SIMULATION_INTERVAL = 0.1;
let isSimulationSpeedUp = true;
const colors = [
  'gold',
  'white',
  'crimson',
  'peru',
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
    particles.forEach(p => (p.nextLocation.y -= jumpAmount));
  } else if (e.code === 'ArrowDown') {
    particles.forEach(p => (p.nextLocation.y += jumpAmount));
  } else if (e.code === 'ArrowLeft') {
    particles.forEach(p => (p.nextLocation.x += jumpAmount));
  } else if (e.code === 'ArrowRight') {
    particles.forEach(p => (p.nextLocation.x -= jumpAmount));
  } else if (e.code === 'KeyA') {
    particles.forEach(p => (p.nextLocation.z -= jumpAmount));
  } else if (e.code === 'KeyS') {
    particles.forEach(p => (p.nextLocation.z += jumpAmount));
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
  createSolarSystem();
  setupScreen();
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function createSolarSystem() {
  particles.push(
    new Particle(0, 'sun', 1989000, 278.536, new Vector(0, 0, START_Z), new Vector(0, 0, 0))
  ); //sun
  particles.push(
    new Particle(1, 'mercury', 0.3285, 0.976, new Vector(0, 23200, START_Z), new Vector(48, 0, 0))
  ); //mercury
  particles.push(
    new Particle(2, 'mars', 0.639, 1.3558, new Vector(0, 88400, START_Z), new Vector(24, 0, 0))
  ); //mars
  particles.push(
    new Particle(3, 'venus', 4.867, 2.4208, new Vector(0, 43200, START_Z), new Vector(-35, 0, 0))
  ); //venus
  particles.push(
    new Particle(4, 'earth', 5.972, 2.5484, new Vector(0, 60000, START_Z), new Vector(30, 0, 0))
  ); //earth
  particles.push(
    new Particle(5, 'moon', 0.0734, 0.6949, new Vector(0, 59846, START_Z), new Vector(31, 0, 0))
  ); //moon
  particles.push(
    new Particle(
      6,
      'jupiter',
      1898,
      27.9644,
      new Vector(0, 300000, START_Z),
      new Vector(13.1, 0, 0)
    )
  ); //jupiter
  particles.push(
    new Particle(7, 'io', 0.0893, 0.7288, new Vector(0, 299831, START_Z), new Vector(31.03, 0, 0))
  ); //io
  particles.push(
    new Particle(
      8,
      'europa',
      0.048,
      0.6244,
      new Vector(0, 299732, START_Z),
      new Vector(27.52, 0, 0)
    )
  ); //europa
  particles.push(
    new Particle(
      9,
      'ganymede',
      0.1481,
      1.0536,
      new Vector(0, 299572, START_Z),
      new Vector(24.58, 0, 0)
    )
  ); //ganymede
  particles.push(
    new Particle(
      10,
      'callisto',
      0.1075,
      0.964,
      new Vector(0, 299248, START_Z),
      new Vector(21.9, 0, 0)
    )
  ); //callisto
  particles.push(
    new Particle(
      11,
      'saturn',
      568.3,
      23.2928,
      new Vector(0, 600000, START_Z),
      new Vector(9.68, 0, 0)
    )
  ); //saturn
  particles.push(
    new Particle(12, 'titan', 0.1345, 1.03, new Vector(0, 599520, START_Z), new Vector(12.25, 0, 0))
  ); //titan
  particles.push(
    new Particle(
      13,
      'uranus',
      86.81,
      10.1448,
      new Vector(0, 1200000, START_Z),
      new Vector(-6.8, 0, 0)
    )
  ); //uranus
  particles.push(
    new Particle(
      14,
      'neptune',
      102.4,
      9.8488,
      new Vector(0, 1800000, START_Z),
      new Vector(5.43, 0, 0)
    )
  ); //neptune
  particles.push(
    new Particle(
      15,
      'triton',
      0.0213,
      0.5412,
      new Vector(0, 1800142, START_Z),
      new Vector(1.04, 0, 0)
    )
  ); //triton
}

function setupScreen() {
  const screen = document.getElementById('screen');
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  RADIUS = 7 * HEIGHT;
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
    15 * particle.id + 15
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
