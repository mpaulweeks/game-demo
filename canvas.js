const canvasElm = document.getElementById('canvas-game');
const ctx = canvasElm.getContext('2d');

canvasElm.height = canvasElm.parentElement.clientHeight;

app.canvas = canvasElm;
app.draw = () => {
  canvasElm.width = canvasElm.parentElement.clientWidth;

  const { buffer, heroSize, enemySize } = constants;
  Object.assign(constants, {
    canvasWidth: canvasElm.width,
    canvasHeight: canvasElm.height,
    minX: heroSize * 2,
    maxX: canvasElm.width - (heroSize * 2),
    enemyMinY: buffer,
    enemyMaxY: canvasElm.height / 3,
  });

  ctx.fillStyle = '#101050';
  ctx.fillRect(0, 0, canvasElm.width, canvasElm.height);

  ctx.fillStyle = 'yellow';
  ctx.strokeStyle = 'yellow';

  const { shooterBase, shooterNozzle, pellet } = state;
  const { target, walls } = state.levelData;

  // draw hero base
  ctx.beginPath();
  ctx.arc(shooterBase.x, shooterBase.y, heroSize, Math.PI, 2*Math.PI, false);
  ctx.fill();
  ctx.fillRect(shooterBase.x - heroSize, shooterBase.y, heroSize * 2, heroSize);

  // draw hero nozzle
  ctx.lineWidth = constants.nozzleWidth;
  ctx.beginPath();
  ctx.moveTo(shooterNozzle.x, shooterNozzle.y);
  ctx.lineTo(shooterBase.x, shooterBase.y);
  ctx.stroke();

  // draw hero bullet
  if (pellet){
    ctx.beginPath();
    ctx.arc(pellet.x, pellet.y, constants.nozzleWidth, 0, 2 * Math.PI, false);
    ctx.fill();
  };

  ctx.strokeStyle = '#FFFFFF';
  walls.forEach(wall => {
    ctx.fillStyle = 'gray';
    ctx.fillRect(wall.start.x, wall.start.y, wall.width, wall.height);
  });

  for (let i = 0; i < 3; i++){
    ctx.fillStyle = i % 2 === 0 ? 'red' : 'white';
    const radius = target.radius * (1 - (0.3 * i));
    ctx.beginPath();
    ctx.arc(target.x, target.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  if (state.levelComplete) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasElm.width, canvasElm.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '40px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(state.levelData.title, canvasElm.width/2, (canvasElm.height / 2) - 50);
    ctx.font = '20px monospace';
    state.levelData.subtitles.forEach((subtitle, index) => {
      ctx.fillText(subtitle, canvasElm.width/2, (canvasElm.height / 2) + 50 + (30*index));
    });
  }
}
