let screenContext = null;
let particles = [];
const t = 1;
const G = 10000;
let WIDTH = 0;
let HEIGHT = 0;
let LAST_LOCATION_LIST_SIZE = 0;
let SIMULATION_INTERVAL = 0.05;
let isSimulationSpeedUp = true;
const RADIUS_SCALE = 40000;
const colors = ["gold", "darkred", "blue", "coral", "aqua", "olive", "purple", "grey"];
//----------//----------//----------//----------//----------//----------

document.addEventListener("keyup", e => {
  if (e.code === "ArrowUp") {
    SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 9) / 10;
  } else if (e.code === "ArrowDown") {
    SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 11) / 10;
  } else if (e.code === "ArrowLeft") {
    particles.forEach(p => (p.nextLocation.z -= 100));
  } else if (e.code === "ArrowRight") {
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
    if (LAST_LOCATION_LIST_SIZE > 0) {
      this.drawLastLocations();
    }

    if (isLocationOnScreen(this.nextLocation)) {
      var pathX = 0;
      var pathY = 0;
      let x = parseInt(this.nextLocation.x);
      let y = parseInt(this.nextLocation.y);
      pathX = WIDTH / 2 + x;
      pathY = HEIGHT / 2 - y;

      let radius = this.scaleRadius();

      if (radius > 0) {
        screenContext.beginPath();
        screenContext.globalAlpha = 1;
        screenContext.arc(pathX, pathY, radius, 0, Math.PI * 2);
        screenContext.closePath();
        screenContext.fillStyle = this.getColor();
        screenContext.fill();
      }
    }
  }

  drawLastLocations() {
    var pathX = 0;
    var pathY = 0;

    this.lastLocations.forEach(obj => {
      if (isLocationOnScreen(obj.location)) {
        let x = parseInt(obj.location.x);
        let y = parseInt(obj.location.y);
        pathX = WIDTH / 2 + x;
        pathY = HEIGHT / 2 - y;

        let distanceToOrigin = Math.sqrt(
          Math.pow(obj.location.x, 2) + Math.pow(obj.location.y, 2) + Math.pow(obj.location.z, 2)
        );

        let radius = (RADIUS_SCALE * Math.cbrt(obj.mass)) / distanceToOrigin;

        if (radius > 0) {
          screenContext.beginPath();
          screenContext.globalAlpha = 0.3;
          screenContext.arc(pathX, pathY, radius, 0, Math.PI * 2);
          screenContext.closePath();
          screenContext.fillStyle = this.getColor();
          screenContext.fill();
        }
      }
    });
  }

  getColor() {
    return colors[this.id];
  }

  moveLastLocations() {
    if (LAST_LOCATION_LIST_SIZE > 0) {
      if (this.lastLocations.length == LAST_LOCATION_LIST_SIZE) {
        this.lastLocations.pop();
      }

      this.lastLocations.unshift({
        mass: this.mass,
        location: new Vector(this.nextLocation.x, this.nextLocation.y, this.nextLocation.z),
      });
    }
  }

  moveToNextLocation() {
    if (LAST_LOCATION_LIST_SIZE > 0) {
      this.moveLastLocations();
    }

    this.location = { ...this.nextLocation };
    this.velocity = { ...this.nextVelocity };
  }

  scaleRadius() {
    let distanceToOrigin = Math.sqrt(
      Math.pow(this.nextLocation.x, 2) +
        Math.pow(this.nextLocation.y, 2) +
        Math.pow(this.nextLocation.z, 2)
    );

    return (RADIUS_SCALE * Math.cbrt(this.mass)) / distanceToOrigin;
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

function isLocationOnScreen(location) {
  return (
    location.x <= WIDTH / 2 &&
    location.x >= -WIDTH / 2 &&
    location.y <= HEIGHT / 2 &&
    location.y >= -HEIGHT / 2 &&
    location.z > 0
  );
}

function startSimulation() {
  createParticles();
  setupScreen();
  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
  // setInterval(simulate, SIMULATION_INTERVAL * 1000);
}

function createParticles() {
  particles.push(new Particle(0, 8, new Vector(-700, -100, 1500), new Vector(0, 0, 5)));
  particles.push(new Particle(1, 0.04, new Vector(-800, -100, 1450), new Vector(0, 0, 30)));
  particles.push(new Particle(2, 0.04, new Vector(-800, -200, 1450), new Vector(0, 0, 30)));

  particles.push(new Particle(3, 7, new Vector(700, -100, 1500), new Vector(0, 0, -5)));
  particles.push(new Particle(4, 0.04, new Vector(700, -200, 1550), new Vector(0, 0, -30)));
  particles.push(new Particle(5, 0.04, new Vector(750, 0, 1550), new Vector(0, 0, -30)));
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

  // if (isSimulationSpeedUp) {
  //   if (SIMULATION_INTERVAL <= 0.1) {
  //     SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 1001) / 1000;
  //   } else {
  //     isSimulationSpeedUp = false;
  //   }
  // } else {
  //   if (SIMULATION_INTERVAL >= 0.001) {
  //     SIMULATION_INTERVAL = (SIMULATION_INTERVAL * 999) / 1000;
  //   } else {
  //     isSimulationSpeedUp = true;
  //   }
  // }

  setTimeout(simulate, SIMULATION_INTERVAL * 1000);
}

function drawParticles() {
  clearScreen();

  particles.sort(Particle.compareByZLocation).forEach(particle => {
    particle.draw();
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
