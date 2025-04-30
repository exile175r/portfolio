const resizing = (figure, targetList, figureInfo, rotate, idx) => {
  const sign = (v) => Math.sign(v);
  const max = (v1, v2) => Math.max(v1, v2);
  const min = (v1, v2) => Math.min(v1, v2);
  const calcAngleDegrees = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
  const MIN_SIZE = 20; // 최소 크기 20px
  const targetInfo = [];
  const fig = figureInfo[idx];
  let $t, prevX, prevY, parentInfo, parentStyle, center, startAngle, moveAngle, rotation;
  let initialWidth, initialHeight, initialX, initialY;
  let currentRotation = 0;
  let translateMatch = null, translate = '';

  rotate.onpointerdown = ({target, x, y}) => {
    $t = target;
    const parent = $t.closest('g');
    const figure = parent.querySelector('rect, circle, path');
    const currentX = JSON.parse(figure.getAttribute('x'));
    const currentY = JSON.parse(figure.getAttribute('y'));
    const currentWidth = JSON.parse(figure.getAttribute('width'));
    const currentHeight = JSON.parse(figure.getAttribute('height'));
    
    // 부모 g 태그의 transform 값 가져오기
    parentStyle = parent.style.transform || null;
    const translateMatch = parentStyle ? parentStyle.match(/translate\(([^)]+)\)/) : null;
    let translateX = 0, translateY = 0;
    
    if(translateMatch) {
      const translateValues = translateMatch[1].match(/-?\d+(\.\d+)?/g);
      console.log(translateValues);
      if(translateValues && translateValues.length >= 2) {
        translateX = parseFloat(translateValues[0]);
        translateY = parseFloat(translateValues[1]);
      }
    }
    
    // 현재 회전 각도 가져오기
    const currentRotationMatch = parentStyle ? parentStyle.match(/rotate\(([^)]+)deg\)/) : null;
    currentRotation = currentRotationMatch ? parseFloat(currentRotationMatch[1]) : 0;
    
    // 도형의 중앙점 계산
    const center = getFigureCenter(figure);
    
    const startX = (x - zoomL) / zoom - center.x;
    const startY = y / zoom - center.y;
    startAngle = calcAngleDegrees(startX, startY);
    
    onpointermove = rotateMove;
    onpointerup = rotateEnd;
  }
  const rotateMove = ({x, y}) => {
    const figure = $t.closest('g').querySelector('rect, circle, path');
    const center = getFigureCenter(figure);
    
    const mouseX = (x - zoomL) / zoom - center.x;
    const mouseY = y / zoom - center.y;
    moveAngle = calcAngleDegrees(mouseX, mouseY);
    rotation = currentRotation + (moveAngle - startAngle);
    
    // 기존 transform에서 translate 값만 추출
    const translateMatch = parentStyle ? parentStyle.match(/translate\(([^)]+)\)/) : null;
    let translateX = 0, translateY = 0;
    
    if(translateMatch) {
      const translateValues = translateMatch[1].match(/-?\d+(\.\d+)?/g);
      if(translateValues && translateValues.length >= 2) {
        translateX = parseFloat(translateValues[0]);
        translateY = parseFloat(translateValues[1]);
      }
    }
    
    // 회전 시 중심점 유지
    updateTransform($t.closest('g'), {x: translateX, y: translateY}, rotation);
  }
  const rotateEnd = () => {
    // 회전 종료 시 figureInfo 업데이트
    const figure = $t?.closest('g')?.querySelector('rect, circle, path');
    if (figure) {
      const idx = figureInfo.findIndex(info => info.id === figure.id);
      if (idx !== -1) {
        figureInfo[idx].rotate = rotation;
      }
    }
    
    onpointermove = null;
    onpointerup = null;
    $t = null, center = null, startAngle = null, moveAngle = null, rotation = null, parentStyle = null;
  }

  targetList.forEach(($, i) => {
    targetInfo.push({x: JSON.parse($.getAttribute('cx')), y: JSON.parse($.getAttribute('cy'))});
    let rotateInfo;
    $.onpointerdown = ({target, x, y}) => {
      $t = target;
      const parent = $t.closest('g');
      parentStyle = parent.style.transform || null;
      
      // translate 값만 추출
      const translateMatch = parentStyle ? parentStyle.match(/translate\(([^)]+)\)/) : null;
      parentInfo = translateMatch ? 
                   translateMatch[1].replace(/px,|px/g, '').split(' ').map(v => JSON.parse(v))
                   :
                   [0, 0];
      
      // 회전 각도 추출
      const rotationMatch = parentStyle ? parentStyle.match(/rotate\(([^)]+)\)/) : null;
      currentRotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
      
      // 초기 마우스 위치 저장
      prevX = (x - zoomL) / zoom;
      prevY = y / zoom;
      
      initialWidth = JSON.parse(figure.getAttribute('width'));
      initialHeight = JSON.parse(figure.getAttribute('height'));
      initialX = JSON.parse(figure.getAttribute('x'));
      initialY = JSON.parse(figure.getAttribute('y'));
      rotateInfo = {x: JSON.parse(rotate.getAttribute('x')), y: JSON.parse(rotate.getAttribute('y'))};
      
      onpointermove = resizingMove;
      onpointerup = resizingEnd;
    }
    const resizingMove = ({x, y}) => {
      // 현재 마우스 위치
      const currentX = (x - zoomL) / zoom;
      const currentY = y / zoom;
      
      // 회전된 상태에서의 이동 거리 계산
      const rad = -currentRotation * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = currentX - prevX;
      const dy = currentY - prevY;
      const moveX = dx * cos - dy * sin;
      const moveY = dx * sin + dy * cos;
      
      let wid;
      switch (i) {
        case 0: // top-left
          wid = initialWidth - moveX;
          const newWidth0 = max(wid, MIN_SIZE);
          const newHeight0 = max(initialHeight - moveY, MIN_SIZE);
          if (newWidth0 <= MIN_SIZE) {
            figure.setAttribute('width', MIN_SIZE);
            figure.setAttribute('x', initialX + (initialWidth - MIN_SIZE));
          } else {
            figure.setAttribute('width', newWidth0);
            figure.setAttribute('x', initialX + moveX);
          }
          if (newHeight0 <= MIN_SIZE) {
            figure.setAttribute('height', MIN_SIZE);
            figure.setAttribute('y', initialY + (initialHeight - MIN_SIZE));
          } else {
            figure.setAttribute('height', newHeight0);
            figure.setAttribute('y', initialY + moveY);
            rotate.setAttribute('y', rotateInfo.y + moveY);
          }
          figure.style.transform = `scaleX(${sign(wid) ? 1 : -1})`;
          
          // 핸들러 위치 고정
          const minX0 = JSON.parse(figure.getAttribute('x'));
          const minY0 = JSON.parse(figure.getAttribute('y'));
          const maxX0 = minX0 + JSON.parse(figure.getAttribute('width'));
          const maxY0 = minY0 + JSON.parse(figure.getAttribute('height'));
          targetList[1].setAttribute('cx', maxX0+5);
          targetList[1].setAttribute('cy', minY0-5);
          targetList[2].setAttribute('cx', minX0-5);
          targetList[2].setAttribute('cy', maxY0+5);
        break;
        case 1: // top-right
          const newWidth1 = max(initialWidth + moveX, MIN_SIZE);
          const newHeight1 = max(initialHeight - moveY, MIN_SIZE);
          if (newWidth1 <= MIN_SIZE) {
            figure.setAttribute('width', MIN_SIZE);
          } else {
            figure.setAttribute('width', newWidth1);
          }
          if (newHeight1 <= MIN_SIZE) {
            figure.setAttribute('height', MIN_SIZE);
            figure.setAttribute('y', initialY + (initialHeight - MIN_SIZE));
          } else {
            figure.setAttribute('height', newHeight1);
            figure.setAttribute('y', initialY + moveY);
            rotate.setAttribute('y', rotateInfo.y + moveY);
          }
          
          // 핸들러 위치 고정
          const minX1 = initialX;
          const minY1 = JSON.parse(figure.getAttribute('y'));
          const maxX1 = minX1 + JSON.parse(figure.getAttribute('width'));
          const maxY1 = minY1 + JSON.parse(figure.getAttribute('height'));
          targetList[0].setAttribute('cx', minX1-5);
          targetList[0].setAttribute('cy', minY1-5);
          targetList[3].setAttribute('cx', maxX1+5);
          targetList[3].setAttribute('cy', maxY1+5);
        break;
        case 2: // bottom-left
          const newWidth2 = max(initialWidth - moveX, MIN_SIZE);
          const newHeight2 = max(initialHeight + moveY, MIN_SIZE);
          if (newWidth2 <= MIN_SIZE) {
            figure.setAttribute('width', MIN_SIZE);
            figure.setAttribute('x', initialX + (initialWidth - MIN_SIZE));
          } else {
            figure.setAttribute('width', newWidth2);
            figure.setAttribute('x', initialX + moveX);
          }
          if (newHeight2 <= MIN_SIZE) {
            figure.setAttribute('height', MIN_SIZE);
          } else {
            figure.setAttribute('height', newHeight2);
          }
          
          // 핸들러 위치 고정
          const minX2 = JSON.parse(figure.getAttribute('x'));
          const minY2 = initialY;
          const maxX2 = minX2 + JSON.parse(figure.getAttribute('width'));
          const maxY2 = minY2 + JSON.parse(figure.getAttribute('height'));
          targetList[0].setAttribute('cx', minX2-5);
          targetList[0].setAttribute('cy', minY2-5);
          targetList[3].setAttribute('cx', maxX2+5);
          targetList[3].setAttribute('cy', maxY2+5);
        break;
        case 3: // bottom-right
          const newWidth3 = max(initialWidth + moveX, MIN_SIZE);
          const newHeight3 = max(initialHeight + moveY, MIN_SIZE);
          if (newWidth3 <= MIN_SIZE) {
            figure.setAttribute('width', MIN_SIZE);
          } else {
            figure.setAttribute('width', newWidth3);
          }
          if (newHeight3 <= MIN_SIZE) {
            figure.setAttribute('height', MIN_SIZE);
          } else {
            figure.setAttribute('height', newHeight3);
          }
          
          // 핸들러 위치 고정
          const minX3 = initialX;
          const minY3 = initialY;
          const maxX3 = minX3 + JSON.parse(figure.getAttribute('width'));
          const maxY3 = minY3 + JSON.parse(figure.getAttribute('height'));
          targetList[1].setAttribute('cx', maxX3+5);
          targetList[1].setAttribute('cy', minY3-5);
          targetList[2].setAttribute('cx', minX3-5);
          targetList[2].setAttribute('cy', maxY3+5);
        break;
      };
      
      // 회전 핸들러 위치 업데이트
      const rotatedWidth = JSON.parse(figure.getAttribute('width'));
      rotate.setAttribute('x', (rotatedWidth / 2) + JSON.parse(figure.getAttribute('x')) - 15);
      
      // 현재 리사이징 핸들러 위치 고정
      const minX = JSON.parse(figure.getAttribute('x'));
      const minY = JSON.parse(figure.getAttribute('y'));
      const maxX = minX + JSON.parse(figure.getAttribute('width'));
      const maxY = minY + JSON.parse(figure.getAttribute('height'));
      
      let newX, newY;
      switch (i) {
        case 0: // top-left
          newX = minX-5;
          newY = minY-5;
          break;
        case 1: // top-right
          newX = maxX+5;
          newY = minY-5;
          break;
        case 2: // bottom-left
          newX = minX-5;
          newY = maxY+5;
          break;
        case 3: // bottom-right
          newX = maxX+5;
          newY = maxY+5;
          break;
      }
      $t.setAttribute('cx', newX);
      $t.setAttribute('cy', newY);
    }
    const resizingEnd = () => {
      // 리사이징 종료 시 figureInfo 업데이트
      const figure = $t?.closest('g')?.querySelector('rect, circle, path');
      if (figure) {
        const idx = figureInfo.findIndex(info => info.id === figure.id);
        if (idx !== -1) {
          figureInfo[idx].width = JSON.parse(figure.getAttribute('width'));
          figureInfo[idx].height = JSON.parse(figure.getAttribute('height'));
          figureInfo[idx].x = JSON.parse(figure.getAttribute('x'));
          figureInfo[idx].y = JSON.parse(figure.getAttribute('y'));
        }
      }
      
      onpointermove = null;
      onpointerup = null;
      $t = null, prevX = null, prevY = null, parentStyle = null;
      initialWidth = null, initialHeight = null, initialX = null, initialY = null;
      
      // 핸들러 위치 정보 업데이트
      targetList.forEach((v, i) => {
        targetInfo[i].x = JSON.parse(v.getAttribute('cx'));
        targetInfo[i].y = JSON.parse(v.getAttribute('cy'));
      });
    }
  });
}