const newSVGTag = (elementType, attributes = {}, text = '') => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
  Object.entries(attributes).map(a => element.setAttribute(a[0],a[1]));
  if(!attributes.class) figureInfo.push(attributes);
  if (text) {
    const textNode = document.createTextNode(text);
    element.appendChild(textNode);
  }
  return element;
}
function Figure(svg, figure){
  const svgTagBundle = (arr, svg, figure) => {
    const g = newSVGTag('g', {'class': figure});
    for (const $ of arr) g.append($);
    svg.append(g);
  }
  const getAngle = (x1, y1, x2, y2) => {
    var rad = Math.atan2(y2 - y1, x2 - x1);
    return (rad*180)/Math.PI ;
  }
  this.color = '#000';
  this.thickness = 10;
  let prevX, prevY;
  let f, fp, r0, r1, r2, r3, r4, rotate;
  let rAttr;
  const start = ({target, x, y}) => {
    if(target != svg) return;
    this.onFigureDrawStart?.();
    x = x / zoom - zoomL;
    y = y / zoom;
    switch(figure){
      case 'line':
        f = newSVGTag(figure, {'x1': x, 'y1': y, 'x2': x, 'y2': y, 'stroke': `${this.color}`, 'stroke-width': `${this.thickness}`, 'fill': 'none'});
        rAttr = {class: 're', 'x': x-5, 'y': y-5, 'width': 10, 'height': 10, 'fill': '#1884ec'};
        r1 = newSVGTag('rect', rAttr);
        r2 = newSVGTag('rect', rAttr);
        svgTagBundle([f, r1, r2], svg, figure);
      break;
      case 'arrow':
        f = newSVGTag('line', {'x1': x, 'y1': y, 'x2': x, 'y2': y, 'stroke': `${this.color}`, 'stroke-width':`${this.thickness}`, 'fill': 'none'});
        fp = newSVGTag('polygon', {'points': `${x},${y - this.thickness} ${x},${y + this.thickness} ${x + this.thickness * 2},${y}`, 'fill': this.color});
        rAttr = {class: 're', 'x': x-5, 'y': y-5, 'width': 10, 'height': 10, 'fill': '#1884ec'};
        r1 = newSVGTag('rect', rAttr);
        r2 = newSVGTag('rect', rAttr);
        svgTagBundle([f, fp, r1, r2], svg, 'arrow');
      break;
      case 'rect':
        f = newSVGTag(figure, {'x': x+this.thickness/2, 'y': y+this.thickness/2, 'width': 0, 'height': 0, 'stroke': `${this.color}`, 'stroke-width': `${this.thickness}`, 'fill': 'transparent'});
        r1 = newSVGTag('circle', {class: 're', 'cx': x, 'cy': y, 'r': 5, 'fill': '#1884ec'});
        r2 = newSVGTag('circle', {class: 're', 'cx': x, 'cy': y, 'r': 5, 'fill': '#1884ec'});
        r3 = newSVGTag('circle', {class: 're', 'cx': x, 'cy': y, 'r': 5, 'fill': '#1884ec'});
        r4 = newSVGTag('circle', {class: 're', 'cx': x, 'cy': y, 'r': 5, 'fill': '#1884ec'});
        rotate = newSVGTag('image', {class: 'rotate', 'href': './img/rotate_button.svg', 'width': 30, 'height': 30, 'x': x - 15, 'y': y - 50});
        svgTagBundle([f, r1, r2, r3, r4, rotate], svg, figure);
      break;
      case 'ellipse':
        f = newSVGTag(figure, {'cx': x, 'cy': y, 'rx': 0, 'ry': 0, 'stroke': `${this.color}`, 'stroke-width': `${this.thickness}`, 'fill': 'transparent'});
        r0 = newSVGTag('rect', {class: 'reBox', 'x': x, 'y': y, 'width': 0, 'height': 0, 'stroke': '#1884ec', 'stroke-width': 1, 'fill': 'none'});
        r1 = newSVGTag('rect', {class: 're', 'x': x-5, 'y': y-5, 'width': 10, 'height': 10, 'fill': '#1884ec'});
        r2 = newSVGTag('rect', {class: 're', 'x': x+5, 'y': y-5, 'width': 10, 'height': 10, 'fill': '#1884ec'});
        r3 = newSVGTag('rect', {class: 're', 'x': x-5, 'y': y+5, 'width': 10, 'height': 10, 'fill': '#1884ec'});
        r4 = newSVGTag('rect', {class: 're', 'x': x+5, 'y': y+5, 'width': 10, 'height': 10, 'fill': '#1884ec'});
        svgTagBundle([f, r0, r1, r2, r3, r4], svg, figure);
      break;
    }
    prevX = x;
    prevY = y;
    onpointermove = move;
    onpointerup = end;
  }
  const move = ({x, y}) => {
    x = x / zoom - zoomL;
    y = y / zoom;
    switch(figure){
      case 'line':
        f.setAttribute('x2', x);
        f.setAttribute('y2', y);
        r2.setAttribute('x', x-4);
        r2.setAttribute('y', y-4);
      break;
      case 'arrow':
        f.setAttribute('x2', x);
        f.setAttribute('y2', y);
        fp.style.cssText = `--x:${x-prevX};--y:${y-prevY};--ox:${prevX}px;--oy:${prevY}px;--r:${getAngle(prevX, prevY, x, y)}deg;`;
        r2.setAttribute('x', x+11);
        r2.setAttribute('y', y-4);
        r2.style.cssText = `--ox:${x}px;--oy:${y}px;--r:${getAngle(prevX, prevY, x+11, y-4)}deg;`;
      break;
      case 'rect':
        if(x-prevX < 0) f.style.setProperty('--rsx', -1);
        else f.style.setProperty('--rsx', 1);
        if(y-prevY < 0) f.style.setProperty('--rsy', -1);
        else f.style.setProperty('--rsy', 1);
        const rectW = Math.abs(x-prevX)-this.thickness;
        const rectH = Math.abs(y-prevY)-this.thickness;
        f.setAttribute('width', rectW < 0 ? 1 : rectW);
        f.setAttribute('height', rectH < 0 ? 1 : rectH);
        r2.setAttribute('cx', x);
        r3.setAttribute('cy', y);
        r4.setAttribute('cx', x);
        r4.setAttribute('cy', y);
        rotate.setAttribute('x', x - rectW / 2 - 15);
      break;
      case 'ellipse':
        const ellipseW = Math.abs(x-prevX);
        const ellipseH = Math.abs(y-prevY);
        f.setAttribute('cx', prevX + ellipseW / 2);
        f.setAttribute('cy', prevY + ellipseH / 2);
        f.setAttribute('rx', ellipseW/2-this.thickness/2 < 0 ? 1 : ellipseW/2-this.thickness/2);
        f.setAttribute('ry', ellipseH/2-this.thickness/2 < 0 ? 1 : ellipseH/2-this.thickness/2);
        if(x-prevX < 0){
          f.style.setProperty('--esx', -1);
          r0.style.setProperty('--esx', -1);
        }else{
          f.style.setProperty('--esx', 1);
          r0.style.setProperty('--esx', 1);
        }
        if(y-prevY < 0){
          f.style.setProperty('--esy', -1);
          r0.style.setProperty('--esy', -1);
        }else{
          f.style.setProperty('--esy', 1);
          r0.style.setProperty('--esy', 1);
        }

        r0.setAttribute('width', ellipseW);
        r0.setAttribute('height', ellipseH);
        r2.setAttribute('x', x-5);
        r3.setAttribute('y', y-5);
        r4.setAttribute('x', x-5);
        r4.setAttribute('y', y-5);
      break;
    }
  }
  const end = () => {
    this.onFigureDrawEnd?.();
    onpointermove = null;
    onpointerup = null;
    if(figure == 'rect'){
      const currentIdx = figureInfo.length - 1;
      ['width', 'height', 'x', 'y'].map(v => {
        figureInfo[currentIdx][v] = JSON.parse(f.getAttribute(v));
      })
      resizing(f, [r1, r2, r3, r4], figureInfo, rotate, currentIdx);
    }
  }
  this.ondraw = () => { svg.onpointerdown = start; }
}