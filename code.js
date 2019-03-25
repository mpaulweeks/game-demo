const app = {
  randomShadeOfGrey: () => {
    function randomNoise(){
      return Math.floor(Math.random() * 40);
    }
    const shade = Math.floor(Math.random() * 100) + 100;
    return `rgb(${shade + randomNoise()}, ${shade + randomNoise()}, ${shade - randomNoise()})`;
  },
};
const keyboard = {};
const state = {
  complete: true,
  level: {index: -1},
  shooterBase: {x: 0, y: 0},
  shooterNozzle: {x: 0, y: 0},
  shooterAngle: Math.PI / 2,
  pellet: null,
  target: {x: 0, y: 0, radius: 0},
  walls: [],
};
const constants = {
  heroSize: 20,
  heroSpeed: 5,
  bulletSpeed: 10,
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0,
  nozzleLength: 40,
  nozzleSpeed: 0.05,
  nozzleWidth: 6,
  barrierWidth: 20,
  maxAngle: Math.PI - 0.2,
  minAngle: 0.2,
};

const getLevelData = () => {
  const c = constants;
  const defaultWalls = [
    {
      start: {x: 0, y: 0},
      width: c.barrierWidth,
      height: c.canvasHeight,
    },
    {
      start: {x: c.canvasWidth - c.barrierWidth, y: 0},
      width: c.barrierWidth,
      height: c.canvasHeight,
    },
  ];
  return [
    {
      title: 'TRICKSHOT',
      subtitles: [
        'press SPACE to shoot',
        'you can only have one pellet at a time',
        '',
        'press ENTER to start',
      ],
      target: {
        x: -500,
        y: -500,
        radius: 50,
      },
      walls: defaultWalls,
    },
    {
      title: 'LEVEL COMPLETE',
      subtitles: [
        'press LEFT / RIGHT arrow to move',
        'lineup your shoot to hit the target!',
        '',
        'press ENTER to proceed',
      ],
      target: {
        x: c.canvasWidth / 2,
        y: 100,
        radius: 50,
      },
      walls: defaultWalls,
    },
    {
      title: 'LEVEL COMPLETE',
      subtitles: [
        'press UP / DOWN arrow to aim',
        'you can ricochet your shots off walls!',
        '',
        'press ENTER to proceed',
      ],
      target: {
        x: c.canvasWidth * 3 / 4,
        y: 100,
        radius: 50,
      },
      walls: defaultWalls,
    },
    {
      title: 'LEVEL COMPLETE',
      subtitles: [
        'you win!',
        'more levels coming soon',
        '',
        'press ENTER to restart',
      ],
      target: {
        x: c.canvasWidth / 4,
        y: 100,
        radius: 50,
      },
      walls: [
        {
          start: {x: 0, y: c.canvasHeight / 2},
          width: c.barrierWidth,
          height: c.canvasHeight,
        },
        {
          start: {x: c.canvasWidth - c.barrierWidth, y: 0},
          width: c.barrierWidth,
          height: c.canvasHeight,
        },
        {
          start: {x: 0, y: c.canvasHeight / 2},
          width: c.canvasWidth*2/3,
          height: c.barrierWidth,
        },
      ],
    },
  ].map((data, index) => ({
    ...data,
    index,
  }));
};

const functions = [
  {
    key: 'onKeyDown',
    hidePrint: true,
    output: 'code-keydown',
    code: (evt) => {
      if (evt.code === 'KeyQ') {
        app.completeLevel();
        return;
      }
      keyboard[evt.code] = true;
      if (evt.code === 'Space' || evt.code.includes('Arrow')){
        evt.preventDefault();
      }
    },
  },
  {
    key: 'onKeyUp',
    hidePrint: true,
    output: 'code-keyup',
    code: (evt) => {
      if (keyboard[evt.code]) {
        delete keyboard[evt.code];
      }
    },
  },
  {
    key: 'shootPellet',
    code: (nozzle) => {
      state.pellet = {
        x: nozzle.x,
        y: nozzle.y,
        dx: nozzle.dx,
        dy: nozzle.dy,
      };
    },
  },
  {
    key: 'despawnPellet',
    code: () => {
      state.pellet = null;
    },
  },
  {
    key: 'checkTargetHit',
    code: (pellet, target) => {
      const distance = Math.sqrt(
        Math.pow(pellet.x - target.x, 2) +
        Math.pow(pellet.y - target.y, 2)
      );
      if (distance <= target.radius) {
        app.despawnPellet();
        app.completeLevel();
      }
    },
  },
  {
    key: 'bounceOffWall',
    code: (pellet, wall) => {
      // move backwards to get out of wall
      pellet.x -= pellet.dx;
      pellet.y -= pellet.dy;

      // reverse direction depending on wall type
      if (wall.width > wall.height) {
        pellet.dy *= -1;
      } else {
        pellet.dx *= -1;
      }

      // move twice to clear the wall
      pellet.x += 2 * pellet.dx;
      pellet.y += 2 * pellet.dy;
    },
  },
  {
    key: 'checkWallHit',
    code: (pellet, wall) => {
      const isHit = (
        wall.start.x < pellet.x &&
        wall.start.x + wall.width > pellet.x &&
        wall.start.y < pellet.y &&
        wall.start.y + wall.height > pellet.y
      );
      if (isHit) {
        app.bounceOffWall(pellet, wall);
      }
    },
  },
  {
    key: 'runGameLoop',
    output: 'code-loop',
    code: () => {
      state.ticks += 1;

      // check keyboard input, perform actions
      if (keyboard.Space && !state.pellet)
        app.shootPellet(state.shooterNozzle);
      if (keyboard.ArrowLeft)
        app.moveHeroLeft();
      if (keyboard.ArrowRight)
        app.moveHeroRight();
      if (keyboard.ArrowUp)
        app.angleHeroLeft();
      if (keyboard.ArrowDown)
        app.angleHeroRight();
      if (keyboard.Enter && state.complete)
        app.loadLevel();

      if (state.pellet) {
        const pellet = state.pellet;
        pellet.x += pellet.dx;
        pellet.y += pellet.dy;

        state.level.walls.forEach(wall => {
          app.checkWallHit(pellet, wall);
        });
        app.checkTargetHit(pellet, state.level.target);

        let outOfBounds = (
          pellet.x < 0 ||
          pellet.x > constants.canvasWidth ||
          pellet.y < 0 ||
          pellet.y > constants.canvasHeight
        );
        if (outOfBounds){
          app.despawnPellet();
        }
      }

      // update the canvas
      app.draw();
    },
  },
  {
    key: 'loadLevel',
    code: () => {
      state.complete = false;
      state.ticks = 0;

      state.shooterBase.x = canvasElm.width / 2;
      state.shooterBase.y = canvasElm.height - constants.heroSize;
      state.shooterAngle = Math.PI / 2;
      app.calcNozzlePosition();
      state.pellet = null;

      const allLevels = getLevelData();
      let nextLevelIndex = state.level.index + 1;
      if (nextLevelIndex >= allLevels.length) {
        nextLevelIndex = 1;
      }
      state.level = allLevels[nextLevelIndex];
    },
  },
  {
    key: 'completeLevel',
    code: () => {
      state.complete = true;
    },
  },
  {
    key: 'calcNozzlePosition',
    code: () => {
      const base = state.shooterBase;
      const angle = state.shooterAngle;
      const length = constants.nozzleLength;
      const angleX = Math.cos(angle);
      const angleY = Math.sin(angle);
      state.shooterNozzle = {
        x: base.x + (angleX * length),
        y: base.y - (angleY * length),
        dx: angleX * constants.bulletSpeed,
        dy: angleY * constants.bulletSpeed * -1,
      };
    },
  },
  {
    key: 'moveHeroLeft',
    code: () => {
      state.shooterBase.x -= constants.heroSpeed;
      if (state.shooterBase.x < constants.minX) {
        state.shooterBase.x = constants.minX;
      }
      app.calcNozzlePosition();
    },
  },
  {
    key: 'moveHeroRight',
    code: () => {
      state.shooterBase.x += constants.heroSpeed;
      if (state.shooterBase.x > constants.maxX) {
        state.shooterBase.x = constants.maxX;
      }
      app.calcNozzlePosition();
    },
  },
  {
    key: 'angleHeroLeft',
    code: () => {
      state.shooterAngle += constants.nozzleSpeed;
      if (state.shooterAngle > constants.maxAngle) {
        state.shooterAngle = constants.maxAngle;
      }
      app.calcNozzlePosition();
    },
  },
  {
    key: 'angleHeroRight',
    code: () => {
      state.shooterAngle -= constants.nozzleSpeed;
      if (state.shooterAngle < constants.minAngle) {
        state.shooterAngle = constants.minAngle;
      }
      app.calcNozzlePosition();
    },
  },
].map(func => ({
    ...func,
    display: func.code.toString().trim().split('\n').map((line, index, lines) => {
      if (index === 0){
        return `app.${func.key} = ${line}`;
      } else if (index === lines.length - 1){
        return '}';
      } else {
         // making sure each line is whitespace preserves empty lines
        return line.slice(4) || ' ';
      }
    }),
}));
