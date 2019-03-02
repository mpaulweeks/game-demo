const app = {};
const keyboard = {};
const state = {
  gameOn: false,
  heroPosition: {x: 0, y: 0},
  heroSpeed: {x: 0, y: 0},
  heroBullet: null,
};

const functions = [
  {
    key: 'onKeyDown',
    output: 'code-keydown',
    code: `
if (evt.code === 'Enter'){
  state.gameOn = true;
} else if (evt.code === 'Escape') {
  state.gameOn = false;
} else if (state.gameOn) {
  keyboard[evt.code] = true;
}
`,
  },
  {
    key: 'onKeyUp',
    output: 'code-keyup',
    code: `
if (keyboard[evt.code]) {
  delete keyboard[evt.code];
}
`,
  },
  {
    key: 'runGameLoop',
    output: 'code-loop',
    code: `
// check keyboard input, perform actions
if (Object.keys(keyboard).length) {
  app.interpretKeyboardAction();
}

// move hero
if (state.heroSpeed.x || state.heroSpeed.y) {
  app.applyHeroSpeed();
}
if (state.heroBullet) {
  app.moveHeroBullet();
}

// update canvas
app.draw();
`,
  },
  {
    key: 'interpretKeyboardAction',
    code: `
if (keyboard.Space && !state.heroBullet) {
  app.shootHeroBullet();
}
if (keyboard.ArrowLeft) {
  app.moveHeroLeft();
}
if (keyboard.ArrowRight) {
  app.moveHeroRight();
}
if (keyboard.ArrowUp) {
  app.moveHeroUp();
}
if (keyboard.ArrowDown) {
  app.moveHeroDown();
}
`,
  },
  {
    key: 'shootHeroBullet',
    code: `
state.heroBullet = {
  x: state.heroPosition.x,
  y: state.heroPosition.y,
};
`,
  },
  {
    key: 'despawnHeroBullet',
    code: `
state.heroBullet = null;
`,
  },
  {
    key: 'moveHeroLeft',
    code: `
state.heroSpeed.x = -5;
`,
  },
  {
    key: 'moveHeroRight',
    code: `
state.heroSpeed.x = 5;
`,
  },
  {
    key: 'moveHeroUp',
    code: `
state.heroSpeed.y = -5;
`,
  },
  {
    key: 'moveHeroDown',
    code: `
state.heroSpeed.y = 5;
`,
  },
  {
    key: 'applyHeroSpeed',
    code: `
state.heroPosition.x += state.heroSpeed.x;
state.heroSpeed.x = state.heroSpeed.x * 0.9;
if (Math.abs(state.heroSpeed.x) < 0.1){
  state.heroSpeed.x = 0;
}
state.heroPosition.y += state.heroSpeed.y;
state.heroSpeed.y = state.heroSpeed.y * 0.9;
if (Math.abs(state.heroSpeed.y) < 0.1){
  state.heroSpeed.y = 0;
}
`,
  },
  {
    key: 'moveHeroBullet',
    code: `
state.heroBullet.y -= 20;
if (state.heroBullet.y < 0){
  app.despawnHeroBullet();
}
`,
  },
].map(func => ({
  ...func,
  display: [
    `app.${func.key} = () => {`,
    ...func.code.trim().split('\n').map(line => `  ${line}`),
    `}`,
  ],
}));
