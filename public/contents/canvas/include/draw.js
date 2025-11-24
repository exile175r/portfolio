function Draw(canvas){
  this.ctx = canvas.getContext('2d', {willReadFrequently: true});
  const ctx = this.ctx;
  Object.assign(canvas, { width: canvas.width, height: canvas.height })
  let points = [];
  let beginPoint = null;
  let spacing = .5;
  this.color = '#000';
  this.size = 10;
  this.globalCompositeOperation = 'source-over';
  const {left: cvsL, top: cvsT} = canvas.getBoundingClientRect();
  const draw = (x, y) => {
    ctx.lineWidth = this.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  }
  const drawLine = (beginPoint, controlPoint, endPoint) => {
    ctx.beginPath();
    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    ctx.stroke();
    ctx.closePath();
  }
  const drawStart = ({x, y}) => {
    x -= cvsL / zoom;
    y -= cvsT / zoom;
    this.ondrawstart?.({x, y});
    ctx.globalCompositeOperation = this.globalCompositeOperation;
    beginPoint = { x, y };
    points.unshift(beginPoint);
    draw(x, y);
    addEventListener('pointermove', drawMove, {passive: false});
    addEventListener('pointerup', drawEnd, {passive: false});
  }
  const drawMove = ({x, y}) => {
    x -= cvsL;
    y -= cvsT;
    points.unshift({ x, y });
    const controlPoint = points[1];
    const endPoint = {
      x: (controlPoint.x + points[0].x) / 2,
      y: (controlPoint.y + points[0].y) / 2,
    }
    let delta = Math.sqrt((x - points[1].x) ** 2 + (y - points[1].y) ** 2);
    if (delta <= spacing) {
      draw(x, y);
      if (points.length >= 3) points.length = 2;
    } else {
      drawLine(beginPoint, controlPoint, endPoint);
    }
    beginPoint = endPoint;
    this.ondrawmove?.(x, y);
  }
  const drawEnd = () => {
    ctx.beginPath();
    removeEventListener('pointermove', drawMove);
    removeEventListener('pointerup', drawEnd);
    this.ondrawend?.();
  }
  this.ondraw = () => { canvas.onpointerdown = drawStart; }
}