const $ = function(sel){return document.querySelector(sel)};

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
  const coordinates = []; // path 구현을 위한 배열
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
    coordinates.push({type: 'moveTo', x: beginPoint.x, y: beginPoint.y});
    coordinates.push({type: 'lineTo', x: x, y: y});
  }
  const drawLine = (beginPoint, controlPoint, endPoint) => {
    ctx.beginPath();
    ctx.moveTo(beginPoint.x, beginPoint.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    ctx.stroke();
    ctx.closePath();
    coordinates.push({type: 'moveTo', x: beginPoint.x, y: beginPoint.y});
    coordinates.push({type: 'quadraticCurveTo', cp1x: controlPoint.x, cp1y: controlPoint.y, x: endPoint.x, y: endPoint.y});
  }
  const drawStart = ({x, y}) => {
    x -= cvsL / zoom;
    y -= cvsT / zoom;
    this.ondrawstart?.(x, y);
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
  const drawEnd = ({x, y}) => {
    ctx.beginPath();
    removeEventListener('pointermove', drawMove);
    removeEventListener('pointerup', drawEnd);
    this.coordinates = coordinates;
    this.ondrawend?.(x, y);
  }
  this.ondraw = () => { canvas.onpointerdown = drawStart; }
}
const newSVGTag = (elementType, attributes = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
  Object.entries(attributes).map(a => element.setAttribute(a[0],a[1]));
  return element;
}
const images = {};
const svgToImage = (() => {
  const imagePathList = [
    {fill: ['#73c3ca','#e1faff','#14373b','#14373b','#14373b','#73c3ca'], width: 99, height: 94, d: [
      'M52.3 9.4s2.7 1.5 2.2 4.8c0 0-2.8 2.7-5.3 2.5L47.1 12s1-1.5 5.2-2.6zM61 22.3s2.7 1.5 2.2 4.8c0 0-2.8 2.7-5.3 2.5L55.7 25s1-1.6 5.3-2.7zM59.9 84.2s2.3-2.1 1.2-5.1c0 0-3.3-2-5.7-1.3l-1.1 5c-.1 0 1.2 1.3 5.6 1.4zM65.6 69.7s2.3-2.1 1.2-5.1c0 0-3.3-2-5.7-1.3l-1.1 5c-.1 0 1.2 1.3 5.6 1.4z',
      'M80.3 36.8c-4.8.5-9.8 1.1-14.7 1.8v-.3L43.5 0l-5.8.7 6.4 39.9v.4c-9.9 1.4-19.8 3.6-29.1 7.1l-7-7.3-8.1 1 6.9 10.9-4.4 12.2 6.1-.2 7.4-9.5c7.9.7 19.3.8 23.3.3 2.2-.3 4.4-.5 6.6-.6l.1.8L47.4 94l7.3-2.1 12.4-37.8v-.5c.8 0 1.5-.1 2.2-.1 5.6-.3 28.1-3.1 29.2-9 1.9-9.9-14.4-8-18.2-7.7z',
      'm86.9 38.4 2.7.1s4.4 2.7 2.1 8.8l-2.5 1c0-.1 2.3-6.2-2.3-9.9z" opacity=".85',
      'M48 42.3c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5 0 1 0 1 .2zM50.9 41.8c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5 0 1 0 1 .2zM53.8 41.3c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5 0 1 0 1 .2zM56.7 40.9c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5-.1 1 0 1 .2zM59.6 40.5c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5-.1 1 0 1 .2zM62.5 40.1c0 .2-.4.4-.9.5-.5.1-1 0-1-.2s.4-.4.9-.5c.5-.1 1 0 1 .2zM65.4 39.8c0 .2-.4.4-.9.4-.5.1-1 0-1-.2s.4-.4.9-.5c.5 0 1 .1 1 .3zM68.3 39.5c0 .2-.4.4-.9.4-.5.1-1-.1-1-.2 0-.2.4-.4.9-.4.5-.1 1 0 1 .2zM71.2 39.3c0 .2-.4.4-.9.4s-1-.1-1-.3c0-.2.4-.4.9-.4s.9.1 1 .3zM74.1 39.1c0 .2-.4.4-.9.4s-1-.1-1-.3c0-.2.4-.4.9-.4.5-.1.9.1 1 .3zM77 38.9c0 .2-.4.4-.9.4s-1-.1-1-.3c0-.2.4-.4.9-.4s.9.1 1 .3zM79.9 38.8c0 .2-.4.4-.9.4s-1-.1-1-.3c0-.2.4-.4.9-.4.5-.1.9.1 1 .3z',
      'M79.3 51.1c0-.2.4-.4.9-.5.5-.1 1 0 1 .2s-.4.4-.9.5c-.6.1-1 0-1-.2zM76.4 51.5c0-.2.4-.4.9-.5.5-.1 1 0 1 .2s-.4.4-.9.5c-.6.1-1 0-1-.2zM73.5 51.8c0-.2.4-.4.9-.5.5-.1 1 0 1 .2s-.4.4-.9.5c-.6.1-1 0-1-.2zM70.6 52.1c0-.2.4-.4.9-.4.5-.1 1 .1 1 .2 0 .2-.4.4-.9.4-.6.1-1 0-1-.2zM67.6 52.4c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4s-.9-.1-1-.3zM64.7 52.6c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4s-1-.1-1-.3zM61.8 52.8c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4s-1-.1-1-.3zM58.9 53c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4s-1-.1-1-.3zM56 53.1c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4s-1-.1-1-.3zM53.1 53.1c0-.2.4-.4.9-.4s1 .1 1 .3c0 .2-.4.4-.9.4-.6.1-1-.1-1-.3zM50.2 53.2c0-.2.4-.3.9-.3s1 .1 1 .3c0 .2-.4.4-.9.4-.6-.1-1-.2-1-.4zM47.3 53.2c0-.2.4-.3.9-.3s1 .2 1 .3c0 .2-.4.3-.9.3-.6 0-1-.2-1-.3z',
      'M19.2 51.8c0 .4-.2.8-.5.8l-8.9.8c-.3 0-.6-.3-.7-.7 0-.4.2-.8.5-.8l8.9-.8c.4 0 .7.3.7.7z'
    ]},
    {fill: ['#c02020','#c02020','','#fff','#ff4a4a'], width: 19, height: 34, d: [
      'M18.1 12.2c.4-3.3 0-7-2.4-9.5C14.1.9 11.6 0 9.1 0c1.5 0 2.9.4 4.1 1.3 1.1.6 1.4 11.6 1.1 11.5-.1.1-5.6 20.2-5.7 20.2 0 .1-.1.1-.1.2s-.2.1-.3.1c.5.2 1.2.2 1.8.3.2 0 .4 0 .4-.1 3.5-6.6 6.9-13.8 7.7-21.3',
      'M10.3 3.4c-3.5.9-5.4 2.2-5.5 4.7-.2 3.5 1.8 4.9 4.3 6.5-5.7 1.2-7.6-4.2-7.3-6.4.1-1.8 1-4.1 2.5-5 .7-.5 3.1-.9 6 .2',
      'M7.7 32.7c0 .1.1.1.1.2-.1-.1-.1-.3-.2-.4 0 .1 0 .1.1.2',
      'M7.7 3.9h.4-.4M8.3 3.9h.2c-.1.1-.2 0-.2 0M7.4 4h.1-.1',
      'M16.1 11.1c.3-3 .2-6.6-2-9-.3-.3-.6-.6-.9-.8C12 .5 10.6 0 9.1 0 7.4 0 5.6.4 4.2 1.2-2 4.6.1 13.8 1.8 19.2c1.4 4.6 3.4 9.1 5.8 13.3.1.1.1.3.2.4 0 0 0 .1.1.1 0 .1.2.2.3.2.1 0 .3 0 .3-.1s.1-.1.1-.2c3.4-6.8 6.7-14.1 7.5-21.8M2.9 7.8C3.5 5.4 5.4 4.2 7.4 4h1.1c2.8.2 5.4 2.3 4.6 5.7-1.6 6.2-11 4.5-10.2-1.9'
    ]}
  ]
  imagePathList.forEach((v, i) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = v.width;
    canvas.height = v.height;

    if(!Array.isArray(v.d)){
      const path = new Path2D(v.d);
      context.fillStyle = v.fill;
      context.fill(path);
      context.stroke(path);
    }else{
      v.d.forEach((d, i) => {
        const path = new Path2D(d);
        context.fillStyle = !Array.isArray(v.fill) ? v.fill : v.fill[i];
        context.fill(path);
        context.stroke(path);
      })
    }

    const imageData = images[!i ? 'airplane':'nav'] = {};
    imageData.width = v.width;
    imageData.height = v.height;
    imageData.d = canvas.toDataURL('image/png');
  })
})();
const convertToLowercaseCommands = (d) => {
  const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
  let currentX = 0, currentY = 0;
  let path = '';
  let isM = true;
  commands.forEach(command => {
    const type = command[0];
    const values = command.slice(1).trim().split(/[\s,]+/).map(Number);
    switch (type) {
      case 'M':
        if(isM){
          path += `M${values[0] - currentX},${values[1] - currentY} `;
          currentX = values[0];
          currentY = values[1];
          isM = false;
        }else{
          path += `l${values[0] - currentX},${values[1] - currentY} `;
          currentX = values[0];
          currentY = values[1];
        }
      break;
      case 'L':
        path += `l${values[0] - currentX},${values[1] - currentY} `;
        currentX = values[0];
        currentY = values[1];
      break;
      case 'Q':
        path += `q${values[0] - currentX},${values[1] - currentY} ${values[2] - currentX},${values[3] - currentY} `;
        currentX = values[2];
        currentY = values[3];
      break;
      case 'Z':
        path += 'z ';
      break;
    }
  });

  return path.trim();
}
const coordinatesToPathD = (coords) => {
  if (coords.length === 0) return '';
  let d = '';
  coords.forEach(coord => {
    switch (coord.type) {
      case 'moveTo':
        d += `M${coord.x},${coord.y} `;
      break;
      case 'lineTo':
        d += `L${coord.x},${coord.y} `;
      break;
      case 'quadraticCurveTo':
        d += `Q${coord.cp1x},${coord.cp1y} ${coord.x},${coord.y} `;
      break;
    }
  });
  return convertToLowercaseCommands(d);
}

const canvas = document.getElementById('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
let zoom = 1;
let pathD = null, pathD_r = null;
let endPos;
const $startBtn = $('#btn');
const paint = new Draw(canvas);
paint.ondraw();
paint.ondrawstart = () => {
  if(paint.coordinates) paint.coordinates.length = 0;
  paint.ctx.clearRect(0, 0, canvas.width, canvas.height);
  $box.textContent = '';
  if(!$startBtn.hidden) $startBtn.hidden = true;
}
// paint.ondrawmove = (x, y) => {}
paint.ondrawend = (x, y) => {
  const coordinates = paint.coordinates;
  pathD = coordinatesToPathD(coordinates);

  coordinates.push({type: 'moveTo', x: x, y: y})
  pathD_r = coordinatesToPathD(coordinates.reverse());
  endPos = {x: x, y: y};

  $startBtn.hidden = null;
}

let idNo = 0;
const $box = document.querySelector("#svgBox");
$startBtn.onclick = () => {
  if(pathD){
    $box.textContent = '';
    if(!$startBtn.hidden) $startBtn.hidden = true;
    let name = `cls-${++idNo}`;

    const path = newSVGTag('path', {id: name, d: pathD});
    const pathAni = newSVGTag('path', {id: `ani-${idNo}`, d: pathD_r});
    let pathLength = pathAni.getTotalLength();
    let dur = (pathLength / 600).toFixed(2);

    const image_airplane = newSVGTag('image', {
      href: images.airplane.d,
      x: `-${images.airplane.width}`,
      y: `-${images.airplane.height/2}`
    });
    const animateMotion = newSVGTag('animateMotion', {
      dur: `${dur}s`, from: '0', to: '100', repeatcont: 'once', rotate: 'auto', fill: 'freeze'
    });
    const mpath = newSVGTag('mpath', {href: `#${name}`});
    animateMotion.append(mpath);
    image_airplane.append(animateMotion);

    const image_nav = newSVGTag('image', {
      href: images.nav.d,
      x: `-${images.nav.width/2}`,
      y: `-${images.nav.height}`,
      style: `transform: translate(${endPos.x}px, ${endPos.y}px)`
    });

    const svg = newSVGTag('svg');
    svg.append(path, pathAni, image_airplane, image_nav);

    $box.append(svg);

    paint.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    Object.assign(pathAni.style, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });
    pathAni.style.setProperty('--duration', `${dur}s`)
    pathAni.onanimationend = () => {
      if($startBtn.hidden) $startBtn.hidden = null;
    }
  }
}




