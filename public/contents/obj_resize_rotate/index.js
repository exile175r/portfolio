const box = document.getElementById("box");
const boxWrapper = document.getElementById("box-wrapper");
const minWidth = 40;
const minHeight = 40;

let initX, initY, mousePressX, mousePressY, initW, initH, initRotate;

function repositionElement(x, y) {
  boxWrapper.style.left = x + 'px';
  boxWrapper.style.top = y + 'px';
}

function resize(w, h) {
  box.style.width = w + 'px';
  box.style.height = h + 'px';
}

function getCurrentRotation(el) {
  const st = window.getComputedStyle(el, null);
  const tm = st.getPropertyValue("-webkit-transform") ||
    st.getPropertyValue("-moz-transform") ||
    st.getPropertyValue("-ms-transform") ||
    st.getPropertyValue("-o-transform") ||
    st.getPropertyValue("transform")
  "none";
  if (tm != "none") {
    const values = tm.split('(')[1].split(')')[0].split(',');
    const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
    return (angle < 0 ? angle + 360 : angle);
  }
  return 0;
}

function rotateBox(deg) {
  boxWrapper.style.transform = `rotate(${deg}deg)`;
}

// drag support
boxWrapper.addEventListener('mousedown', function (event) {
  if (event.target.className.indexOf("dot") > -1) return;

  initX = this.offsetLeft;
  initY = this.offsetTop;
  mousePressX = event.clientX;
  mousePressY = event.clientY;

  function eventMoveHandler(event) {
    repositionElement(initX + (event.clientX - mousePressX),
      initY + (event.clientY - mousePressY));
  }

  boxWrapper.addEventListener('mousemove', eventMoveHandler, false);
  window.addEventListener('mouseup', function eventEndHandler() {
    boxWrapper.removeEventListener('mousemove', eventMoveHandler, false);
    window.removeEventListener('mouseup', eventEndHandler);
  }, false);
}, false);
// done drag support

// handle resize
const rightMid = document.getElementById("right-mid");
const leftMid = document.getElementById("left-mid");
const topMid = document.getElementById("top-mid");
const bottomMid = document.getElementById("bottom-mid");

const leftTop = document.getElementById("left-top");
const rightTop = document.getElementById("right-top");
const rightBottom = document.getElementById("right-bottom");
const leftBottom = document.getElementById("left-bottom");

function resizeHandler(event, left = false, top = false, xResize = false, yResize = false) {
  initX = boxWrapper.offsetLeft;
  initY = boxWrapper.offsetTop;
  mousePressX = event.clientX;
  mousePressY = event.clientY;

  initW = box.offsetWidth;
  initH = box.offsetHeight;

  initRotate = getCurrentRotation(boxWrapper);
  const initRadians = initRotate * Math.PI / 180;
  const cosFraction = Math.cos(initRadians);
  const sinFraction = Math.sin(initRadians);
  function eventMoveHandler(event) {
    const wDiff = (event.clientX - mousePressX);
    const hDiff = (event.clientY - mousePressY);
    let rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
    let rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;
    let newW = initW, newH = initH, newX = initX, newY = initY;
    if (xResize) {
      if (left) {
        newW = initW - rotatedWDiff;
        if (newW < minWidth) {
          newW = minWidth;
          rotatedWDiff = initW - minWidth;
        }
      } else {
        newW = initW + rotatedWDiff;
        if (newW < minWidth) {
          newW = minWidth;
          rotatedWDiff = minWidth - initW;
        }
      }
      newX += 0.5 * rotatedWDiff * cosFraction;
      newY += 0.5 * rotatedWDiff * sinFraction;
    }
    if (yResize) {
      if (top) {
        newH = initH - rotatedHDiff;
        if (newH < minHeight) {
          newH = minHeight;
          rotatedHDiff = initH - minHeight;
        }
      } else {
        newH = initH + rotatedHDiff;
        if (newH < minHeight) {
          newH = minHeight;
          rotatedHDiff = minHeight - initH;
        }
      }
      newX -= 0.5 * rotatedHDiff * sinFraction;
      newY += 0.5 * rotatedHDiff * cosFraction;
    }
    resize(newW, newH);
    repositionElement(newX, newY);
  }
  window.addEventListener('mousemove', eventMoveHandler, false);
  window.addEventListener('mouseup', function eventEndHandler() {
    window.removeEventListener('mousemove', eventMoveHandler, false);
    window.removeEventListener('mouseup', eventEndHandler);
  }, false);
}
leftTop.addEventListener('mousedown', e => resizeHandler(e, true, true, true, true));
topMid.addEventListener('mousedown', e => resizeHandler(e, false, true, false, true));
rightTop.addEventListener('mousedown', e => resizeHandler(e, false, true, true, true));
rightMid.addEventListener('mousedown', e => resizeHandler(e, false, false, true, false));
rightBottom.addEventListener('mousedown', e => resizeHandler(e, false, false, true, true));
bottomMid.addEventListener('mousedown', e => resizeHandler(e, false, false, false, true));
leftBottom.addEventListener('mousedown', e => resizeHandler(e, true, false, true, true));
leftMid.addEventListener('mousedown', e => resizeHandler(e, true, false, true, false));

// handle rotation
const rotate = document.getElementById("rotate");
rotate.addEventListener('mousedown', function (event) {
  initX = this.offsetLeft;
  initY = this.offsetTop;
  mousePressX = event.clientX;
  mousePressY = event.clientY;

  const arrow = document.querySelector("#box");
  const arrowRects = arrow.getBoundingClientRect();
  const arrowX = arrowRects.left + arrowRects.width / 2;
  const arrowY = arrowRects.top + arrowRects.height / 2;

  function eventMoveHandler(event) {
    const angle = Math.atan2(event.clientY - arrowY, event.clientX - arrowX) + Math.PI / 2;
    rotateBox(angle * 180 / Math.PI);
  }

  window.addEventListener('mousemove', eventMoveHandler, false);
  window.addEventListener('mouseup', function eventEndHandler() {
    window.removeEventListener('mousemove', eventMoveHandler, false);
    window.removeEventListener('mouseup', eventEndHandler);
  }, false);
}, false);

resize(300, 200);
repositionElement(200, 200);