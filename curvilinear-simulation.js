let screenContext = null;
let particles = [];
const t = 1;
const G = 21.54;
let WIDTH = 0;
let HEIGHT = 0;
let RADIUS = 0;
let LAST_LOCATION_LIST_SIZE = 0;
let SIMULATION_INTERVAL = 0.01;
let isSimulationSpeedUp = true;
const colors = [
  'gold',
  'white',
  'crimson',
  'peru',
  'blue',
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
  if (e.code === 'ArrowUp') {
    particles.forEach(p => (p.nextLocation.y -= 10000));
  } else if (e.code === 'ArrowDown') {
    particles.forEach(p => (p.nextLocation.y += 10000));
  } else if (e.code === 'ArrowLeft') {
    particles.forEach(p => (p.nextLocation.x += 10000));
  } else if (e.code === 'ArrowRight') {
    particles.forEach(p => (p.nextLocation.x -= 10000));
  } else if (e.code === 'KeyA') {
    particles.forEach(p => (p.nextLocation.z -= 50000));
  } else if (e.code === 'KeyS') {
    particles.forEach(p => (p.nextLocation.z += 50000));
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
  // createParticles();
  createSolarSystem();
  setupScreen();
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function createParticles() {
  particles.push(
    new Particle(0, 8, 50, new Vector(-1600, -600, 20000), new Vector(-0.3, 0.1, 5.4))
  );
  particles.push(new Particle(1, 0.05, 18, new Vector(-1700, -600, 19900), new Vector(0, 0, 30)));
  particles.push(new Particle(2, 0.05, 18, new Vector(-1700, -500, 19900), new Vector(0, 0, 27)));

  particles.push(new Particle(3, 7, 40, new Vector(0, -600, 20000), new Vector(0, 0.1, -5)));
  particles.push(new Particle(4, 0.04, 12, new Vector(0, -500, 20100), new Vector(0, 0, -30)));
  particles.push(new Particle(5, 0.04, 12, new Vector(50, -700, 20000), new Vector(0, 0, -30)));
  // //
  particles.push(
    new Particle(6, 8, 40, new Vector(-1000, 1200, 35000), new Vector(0.2, -0.1, 5.1))
  );
  particles.push(new Particle(7, 0.04, 14, new Vector(-1100, 1200, 34900), new Vector(0, 0, 30)));
  particles.push(new Particle(8, 0.04, 14, new Vector(-1100, 1400, 34900), new Vector(0, 0, 27)));

  particles.push(new Particle(9, 7, 35, new Vector(400, 700, 35000), new Vector(0.4, -0.1, -4.58)));
  particles.push(new Particle(10, 0.04, 10, new Vector(400, 800, 35100), new Vector(0, 0, -30)));
  particles.push(new Particle(11, 0.04, 10, new Vector(450, 600, 35000), new Vector(0, 0, -30)));
  // //
  particles.push(
    new Particle(6, 8, 40, new Vector(-6000, 1000, 51000), new Vector(0.5, -0.1, 6.9))
  );
  particles.push(new Particle(7, 0.04, 14, new Vector(-6100, 1000, 50900), new Vector(0, 0, 30)));
  particles.push(new Particle(8, 0.04, 14, new Vector(-6100, 1100, 50900), new Vector(0, 0, 27)));

  particles.push(new Particle(9, 7, 35, new Vector(-4600, 1000, 51000), new Vector(0.9, -0.1, -4)));
  particles.push(new Particle(10, 0.04, 10, new Vector(-4600, 1100, 51100), new Vector(0, 0, -30)));
  particles.push(new Particle(11, 0.04, 10, new Vector(-4550, 900, 51000), new Vector(0, 0, -30)));
  //

  particles.push(new Particle(12, 8, 50, new Vector(4000, 2000, 69000), new Vector(0.5, -0.5, 4)));
  particles.push(new Particle(13, 0.04, 24, new Vector(4100, 2000, 68900), new Vector(0, 0, 30)));
  particles.push(new Particle(14, 0.04, 24, new Vector(4100, 1900, 68900), new Vector(0, 0, 27)));

  particles.push(
    new Particle(15, 7, 45, new Vector(4000, 700, 69000), new Vector(0.2, -0.9, -6.1))
  );
  particles.push(new Particle(16, 0.04, 20, new Vector(3900, 700, 69100), new Vector(0, 0, -30)));
  particles.push(new Particle(17, 0.04, 20, new Vector(4100, 600, 69000), new Vector(0, 0, -30)));
}

function createSolarSystem() {
  particles.push(new Particle(0, 2000000, 560, new Vector(0, 0, 750000), new Vector(0, 0, 0))); //sun x2
  particles.push(new Particle(1, 0.33, 5, new Vector(0, 23200, 750000), new Vector(48, 0, 0))); //mercury x5
  particles.push(new Particle(2, 0.64, 7.5, new Vector(0, 88400, 750000), new Vector(24, 0, 0))); //mars x5
  particles.push(new Particle(3, 4.8, 11.5, new Vector(0, 43200, 750000), new Vector(35, 0, 0))); //venus x5
  particles.push(new Particle(4, 6, 12.5, new Vector(0, 60000, 750000), new Vector(30, 0, 0))); //earth x5
  particles.push(new Particle(5, 0.073, 3.45, new Vector(0, 59846, 750000), new Vector(31, 0, 0))); //moon x5
  particles.push(new Particle(6, 1898, 56, new Vector(0, 300000, 750000), new Vector(13.1, 0, 0))); //jupiter x2
  particles.push(new Particle(7, 0.089, 4, new Vector(0, 299831, 750000), new Vector(31.03, 0, 0))); //io x5
  particles.push(
    new Particle(8, 0.048, 3.1, new Vector(0, 299732, 750000), new Vector(27.52, 0, 0))
  ); //europa x5
  particles.push(
    new Particle(9, 0.148, 5.25, new Vector(0, 299572, 750000), new Vector(24.58, 0, 0))
  ); //ganymede x5
  particles.push(
    new Particle(10, 0.107, 4.8, new Vector(0, 299248, 750000), new Vector(21.9, 0, 0))
  ); //callisto x5
  particles.push(
    new Particle(11, 568, 46.5, new Vector(0, 600000, 750000), new Vector(9.68, 0, 0))
  ); //saturn x2
  particles.push(
    new Particle(12, 0.134, 5, new Vector(0, 599520, 750000), new Vector(12.25, 0, 0))
  ); //titan x5
  particles.push(new Particle(13, 86.8, 30, new Vector(0, 1200000, 750000), new Vector(6.8, 0, 0))); //uranus x3
  particles.push(
    new Particle(14, 102.4, 30, new Vector(0, 1800000, 750000), new Vector(5.43, 0, 0))
  ); //neptune x3
  particles.push(
    new Particle(15, 0.02, 2.7, new Vector(0, 1799858, 750000), new Vector(9.82, 0, 0))
  ); //triton x5
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
