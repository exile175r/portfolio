const $ = function(sel){return document.querySelector(sel)};
const $$ = function(sel){return document.querySelectorAll(sel)};
const $frag = (function () { let range = document.createRange(); return function (v) { return range.createContextualFragment(v) } })();
const clamp = (MIN, VAL, MAX) => Math.max(MIN, Math.min(VAL, MAX));

// resize
let zoom, zoomL;
const resize = (wrap) => {
  const $wrap = $('#wrap') || wrap;
  const {offsetWidth, offsetHeight} = document.body;
	const {clientWidth, clientHeight} = $wrap;
  zoom = clientWidth * Math.min(offsetWidth / clientWidth, offsetHeight / clientHeight) / clientWidth;
	zoomL = (offsetWidth / zoom - clientWidth) / 2;
  $wrap.style.transform = `scale(${zoom}) translateX(${zoomL}px)`;
}
onload = () => { resize($('#wrap')); }
onresize = resize;

const figureInfo = [];

// 도형의 실제 위치 계산 함수
const getFigureCenter = (figure) => {
  const x = JSON.parse(figure.getAttribute('x'));
  const y = JSON.parse(figure.getAttribute('y'));
  const width = JSON.parse(figure.getAttribute('width'));
  const height = JSON.parse(figure.getAttribute('height'));
  
  // transform 값에서 translate 추출
  const parent = figure.closest('g');
  const parentStyle = parent?.style.transform || '';
  const translateMatch = parentStyle.match(/translate\(([^)]+)\)/) || null;
  let translateX = 0, translateY = 0;
  
  if(translateMatch) {
    const translateValues = translateMatch[1].match(/-?\d+(\.\d+)?/g);
    if(translateValues && translateValues.length >= 2) {
      translateX = parseFloat(translateValues[0]);
      translateY = parseFloat(translateValues[1]);
    }
  }
  
  // 도형의 중심점 계산 (translate 값 포함)
  return {
    x: x + width / 2 + translateX,
    y: y + height / 2 + translateY
  };
};

// transform 값 관리 함수
const updateTransform = (element, translate, rotate) => {
  const figure = element.querySelector('rect, circle, path');
  if (!figure) return;
  
  // 도형의 중심점 계산
  const center = getFigureCenter(figure);
  
  // transformOrigin을 도형 중심으로 설정
  element.style.transformOrigin = `${center.x}px ${center.y}px`;
  
  // transform 적용 (translate와 rotate)
  element.style.transform = `translate(${translate.x}px, ${translate.y}px) rotate(${rotate}deg)`;
};