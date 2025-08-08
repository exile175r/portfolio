const resizing = (figure, targetList, figureInfo, idx, rotate = null) => {
  const abs = (v) => Math.abs(v);
  const getAngle = (x1, y1, x2, y2) => {
    let rad = Math.atan2(y2 - y1, x2 - x1);
    return (rad*180)/Math.PI ;
  }
  const sign = (v) => Math.sign(v);
  const calcAngleDegrees = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
  const targetInfo = [];
  const fig = figureInfo[idx];
  const minSize = 20;
  let $t, prevX, prevY, parentInfo, parentStyle;
  // let center, startAngle, moveAngle, rotation;
  // rotate.onpointerdown = ({target}) => {
  //   $t = target;
  //   console.log(fig);
  //   center = {x: (fig.x + (JSON.parse(fig.width)/2)), y: (fig.y + (JSON.parse(fig.height)/2))}
  //   prevX = (fig.x - center.x) / zoom;
  //   prevY = (fig.y - center.y) / zoom;
  //   startAngle = calcAngleDegrees(prevX, prevY);
  //   const parent = $t.closest('g');
  //   parentStyle = parent.style.transform || null;
  //   parent.style.transformOrigin = `${center.x}px ${center.y}px`;
  //   console.log('parentStyle: ', parentStyle);
  //   onpointermove = rotateMove;
  //   onpointerup = rotateEnd;
  // }
  // const rotateMove = ({x, y}) => {
  //   moveAngle = calcAngleDegrees((x - center.x) / zoom, (y - center.y) / zoom);
  //   rotation = moveAngle - startAngle;
  //   $t.closest('g').style.transform = `${parentStyle ? parentStyle : ''} rotate(${rotation}deg)`;
  // }
  // const rotateEnd = () => {
  //   onpointermove = null;
  //   onpointerup = null;
  //   $t = null, center = null, startAngle = null, moveAngle = null, rotation = null, parentStyle = null;
  // }
  targetList.forEach(($, i) => {
    targetInfo.push({x: JSON.parse($.getAttribute('x')), y: JSON.parse($.getAttribute('y'))});
    $.onpointerdown = ({target}) => {
      $t = target;
      parentStyle = $t.closest('g').style.transform || null;
      parentInfo = parentStyle ? 
                   parentStyle.replace(/translate\(|px,|px\)/g, '').split(' ').map(v =>  JSON.parse(v))
                   :
                   [0, 0];
      prevX = (targetInfo[i].x + parentInfo[0]) / zoom;
      prevY = (targetInfo[i].y + parentInfo[1]) / zoom;
      
      thickness = JSON.parse(figure.getAttribute('stroke-width'));
      console.log('thickness: ', thickness);


      if(figure.closest('g').classList[0] == 'arrow'){
        
      }
      
      onpointermove = resizingMove;
      onpointerup = resizingEnd;
    }
    
    const resizingMove = ({x, y}) => {
      const moveX = (x / zoom - prevX);
      const moveY = (y / zoom - prevY);

      switch (figure.closest('g').classList[0]) {
        case 'line':
          lineResizing(i, moveX, moveY);
        break;
        case 'arrow':
          arrowResizing(i, moveX, moveY);
        break;
        case 'rect':
          rectResizing(i, moveX, moveY);
        break;
        case 'ellipse':
          ellipseResizing(i, moveX, moveY);
        break;
      }
    }
    
    const resizingEnd = () => {
      onpointermove = null;
      onpointerup = null;
      $t = null, prevX = null, prevY = null, parentStyle = null;
      ['width', 'height', 'x', 'y', 'rx', 'ry', 'cx', 'cy', 'x1', 'x2', 'y1', 'y2', 'points'].forEach(v => {
        let attr = JSON.parse(figure.getAttribute(v));
        if(!attr) return;
        fig[v] = attr;
      });
      targetInfo.map((v, i) => {
        let pos = v;
        pos.x = JSON.parse(targetList[i].getAttribute('x'));
        pos.y = JSON.parse(targetList[i].getAttribute('y'));
        return pos;
      })
      console.log('fig: ', fig);
    }
  });

  let wid, hei, posX, posY;
  const rectResizing = (i, moveX, moveY) => {
    switch (i) {
      case 0:
        wid = fig.width - moveX;
        hei = fig.height - moveY;
        if(wid >= minSize){
          figure.setAttribute('width', abs(wid));
          figure.setAttribute('x', fig.x + moveX);
          targetList[2].setAttribute('x', targetInfo[i].x + moveX);
        }
        if(hei >= minSize){
          figure.setAttribute('height', abs(hei));
          figure.setAttribute('y', fig.y + moveY);
          targetList[1].setAttribute('y', targetInfo[i].y + moveY);
        }
      break;
      case 1:
        wid = fig.width + moveX;
        hei = fig.height - moveY;
        if(wid >= minSize){
          figure.setAttribute('width', abs(wid));
          targetList[3].setAttribute('x', targetInfo[i].x + moveX);
        }
        if(hei >= minSize){
          figure.setAttribute('height', abs(hei));
          figure.setAttribute('y', fig.y + moveY);
          targetList[0].setAttribute('y', targetInfo[i].y + moveY);
        }
      break;
      case 2:
        wid = fig.width - moveX;
        hei = fig.height + moveY;
        if(wid >= minSize){
          figure.setAttribute('width', abs(wid));
          figure.setAttribute('x', fig.x + moveX);
          targetList[0].setAttribute('x', targetInfo[i].x + moveX);
        }
        if(hei >= minSize){
          figure.setAttribute('height', abs(hei));
          targetList[3].setAttribute('y', targetInfo[i].y + moveY);
        }
      break;
      case 3:
        wid = fig.width + moveX;
        hei = fig.height + moveY;
        if(wid >= minSize){
          figure.setAttribute('width', abs(wid));
          targetList[1].setAttribute('x', targetInfo[i].x + moveX);
        }
        if(hei >= minSize){
          figure.setAttribute('height', abs(hei));
          targetList[2].setAttribute('y', targetInfo[i].y + moveY);
        }
      break;
    }
    if(wid >= minSize) $t.setAttribute('x', targetInfo[i].x + moveX);
    if(hei >= minSize) $t.setAttribute('y', targetInfo[i].y + moveY);
  }
  const ellipseResizing = (i, moveX, moveY) => {
    if(targetList[1]){
      wid = fig.rx + moveX;
      hei = fig.ry + moveY;
      if(wid >= minSize){
        figure.setAttribute('rx', wid);
        targetList[0].setAttribute('width', wid * 2 + thickness);
        targetList[0].setAttribute('x', targetInfo[i].x + moveX - (wid * 2) - thickness);
        targetList[1].setAttribute('x', targetInfo[i].x + moveX);
      }
      if(hei >= minSize){
        figure.setAttribute('ry', hei);
        targetList[0].setAttribute('height', hei * 2 + thickness);
        targetList[0].setAttribute('y', targetInfo[i].y + moveY - (hei * 2) - thickness);
        targetList[1].setAttribute('y', targetInfo[i].y + moveY);
      }
    }
    if(wid >= minSize) $t.setAttribute('cx', targetInfo[i].x + moveX - thickness);
    if(hei >= minSize) $t.setAttribute('cy', targetInfo[i].y + moveY - thickness);
  }
  const lineResizing = (i, moveX, moveY) => {
    if(!i){
      figure.setAttribute('x1', fig.x1 + moveX);
      figure.setAttribute('y1', fig.y1 + moveY); 
    }else{
      figure.setAttribute('x2', fig.x2 + moveX);
      figure.setAttribute('y2', fig.y2 + moveY);
    }
    $t.setAttribute('x', targetInfo[i].x + moveX);
    $t.setAttribute('y', targetInfo[i].y + moveY);
  }
  const arrowResizing = (i, moveX, moveY) => {
    targetList[0].setAttribute('points', `${fig.x1}, ${fig.y1 - thickness} ${fig.x1}, ${fig.y1 + thickness} ${fig.x1 + thickness * 2}, ${fig.y1}`);
    if(i == 1){
      posX = fig.x1 + moveX;
      posY = fig.y1 + moveY;
      figure.setAttribute('x1', posX);
      figure.setAttribute('y1', posY);
      targetList[0].style.cssText = `--x:${fig.x2 - fig.x1};--y:${fig.y2 - fig.y1};--ox:${fig.x1}px;--oy:${fig.y1}px;--r:${getAngle(posX, posY, fig.x2, fig.y2)}deg;`;
      targetList[2].style.cssText = `--ox:${fig.x2}px;--oy:${fig.y2}px;--r:${getAngle(fig.x2, fig.y2, posX, posY)}deg;--tx: -10;--ty: 0;`;
      // targetList[2].style.cssText = `--ox:${fig.x2}px;--oy:${fig.y2}px;--r:${getAngle(fig.x2, fig.y2, posX, posY)}deg;`;
    }else if(i == 2){
      posX = fig.x2 + moveX;
      posY = fig.y2 + moveY;
      figure.setAttribute('x2', posX);
      figure.setAttribute('y2', posY);
      targetList[0].style.cssText = `--x:${fig.x2 - fig.x1 + moveX};--y:${fig.y2 - fig.y1 + moveY};--ox:${fig.x1}px;--oy:${fig.y1}px;--r:${getAngle(fig.x1, fig.y1, posX, posY)}deg;`;
      // targetList[2].style.cssText = `--ox:${posX}px;--oy:${posY}px;--r:${getAngle(fig.x1, fig.y1, posX, posY)}deg;--tx: 0;--ty: 0;`;
      targetList[2].style.cssText = `--ox:${posX}px;--oy:${posY}px;--r:${getAngle(fig.x1, fig.y1, posX, posY)}deg;`;
    }
    $t.setAttribute('x', targetInfo[i].x + moveX);
    $t.setAttribute('y', targetInfo[i].y + moveY);
  }
}