const $canvasBox = $('#canvasBox');
const $figureBox = $('#figure');
const $drawTool = $('#drawTool');
const $$tab = $drawTool.querySelectorAll('.tab button');
const $$dSection = $drawTool.querySelectorAll('section');
const $inputHue = $('input[type="range"]#hue');
const $color = $('.colorPicker');
let thickness = 10, colorPick, drawTool = 'pen', colors = '#000';

const canvas = document.getElementById('canvas');
const highlightCanvas = document.getElementById('highlightCanvas');
canvas.width = 1280;
canvas.height = 800;
highlightCanvas.width = canvas.width;
highlightCanvas.height = canvas.height;
const paint = new Draw(canvas);
paint.ondraw();
const highlightPaint = new Draw(highlightCanvas);
highlightPaint.ondraw();

const ctx = paint.ctx;
const hctx = highlightPaint.ctx;

const drawToolBox = new Drag($drawTool);
drawToolBox.isStop = true;
drawToolBox.ondrag();

// History
let history = [];
let historyIdx = 0;
let historyImg = new Image;
historyImg.onload = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(this, 0, 0);
}

// History(추가)
const addHistory = (url) => {
  history.splice(historyIdx + 1, history.length, url);
  historyIdx = history.length - 1;
}
// History(이전)
const prevHistory = () => {
  if (--historyIdx <= -1) {
    historyIdx = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    historyImg.src = history[historyIdx];
  }
}
// History(다음)
const nextHistory = () => {
  if (historyIdx + 1 != history.length) {
    historyImg.src = history[++historyIdx];
  }
}

// 전체 지우기
const allClear = () => {
  if(confirm('정말 삭제하시겠습니까?')){
    if(confirm(`도형 포함 모두 삭제하시겠습니까? (확인: 도형 포함 모두 지워짐, 취소: 도형을 제외하고 모두 지워짐)`)){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      $figureBox.textContent = '';
    }else{
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  // addHistory(canvas.toDataURL());
}

// 그리기 텍스트 전환 탭
for (const $ of $$tab)
$.onclick = ({target}) => {
  const idx = [...$$tab].indexOf(target);
  $drawTool.querySelector('.tab button.on').classList.remove('on');
  target.classList.add('on');
  $drawTool.querySelector('section:not(.hide)').classList.add('hide');
  $$dSection[idx].classList.remove('hide');
}

// 배경 색 변경 (input[range])
const $$drawBack = $drawTool.querySelectorAll('.drawBack li');
const $transparency = $('.transparency');
let opacity = 0.95;
for (const $ of $$drawBack)
$.onclick = ({target}) => {
  $drawTool.querySelector('.drawBack li.on').classList.remove('on');
  target.classList.add('on');
  if(target.textContent == '칠판'){
    Object.assign($canvasBox.style, {
      'backgroundColor': `rgba(48, 74, 64, ${opacity})`,
      'boxShadow': 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
    });
    $transparency.classList.remove('hidden');
  }else{
    $canvasBox.removeAttribute('style');
    $transparency.classList.add('hidden');
  }
}

// 그리기 툴 벼튼
for (const $ of $drawTool.querySelectorAll('.drawToolSelect button'))
$.onclick = ({target}) => {
  drawTool = target.dataset.tool;
  if(drawTool != 'allClear'){
    $drawTool.querySelector('.drawToolSelect button.on').className = '';
    target.className = 'on';
  }
  if(drawTool != 'highlighter'){
    if(!highlightCanvas.classList.contains('hide'))
      highlightCanvas.classList.add('hide');
  }
  if(drawTool != 'line' || drawTool != 'arrow' || drawTool != 'rect' || drawTool != 'ellipse'){
    if(!$figureBox.classList.contains('eNone'))
      $figureBox.classList.add('eNone');
  }
  const figureDrawEnd = () => {
    const $g = $figureBox.querySelector('g:last-child');
    const $lastFigure = $g.children[0];
    $g.classList.add('on');
    const figureDrag = new Drag($lastFigure);
    figureDrag.ondrag();
    figureDrag.$t = $g;
    $lastFigure.addEventListener('pointerdown', ({target}) => {
      $figureBox.querySelector('g.on')?.classList.remove('on');
      target.closest('g').classList.add('on');
    })
    // $lastFigure.querySelectorAll('.re').forEach($ => $.onpointerdown = () => { figureDrag.removeEvent(); })
  }
  switch (drawTool) {
    case 'highlighter':
      $color.classList.remove('hidden');
      highlightCanvas.classList.remove('hide');
    break;
    case 'clear':
      $color.classList.add('hidden');
      paint.color = '';
    break;
    case 'allClear':
      allClear();
    break;
    case 'line':
      $color.classList.remove('hidden');
      $figureBox.classList.remove('eNone');
      const line = new Figure($figureBox, drawTool);
      line.ondraw();
      line.onFigureDrawStart = () => {
        line.color = colors;
      }
      line.onFigureDrawEnd = () => figureDrawEnd();
    break;
    case 'arrow':
      $color.classList.remove('hidden');
      $figureBox.classList.remove('eNone');
      const arrow = new Figure($figureBox, drawTool);
      arrow.ondraw();
      arrow.onFigureDrawStart = () => {
        arrow.color = colors;
      }
      arrow.onFigureDrawEnd = () => figureDrawEnd();
    break;
    case 'rect':
      $color.classList.remove('hidden');
      $figureBox.classList.remove('eNone');
      const rect = new Figure($figureBox, drawTool);
      rect.ondraw();
      rect.onFigureDrawStart = () => {
        rect.color = colors;
        rect.thickness = thickness;
      }
      rect.onFigureDrawEnd = () => figureDrawEnd();
    break;
    case 'ellipse':
      $color.classList.remove('hidden');
      $figureBox.classList.remove('eNone');
      const ellipse = new Figure($figureBox, drawTool);
      ellipse.ondraw();
      ellipse.onFigureDrawStart = () => {
        ellipse.color = colors;
        ellipse.thickness = thickness;
      }
      ellipse.onFigureDrawEnd = () => figureDrawEnd();
    break;
    default:
      $drawTool.querySelector('.drawColor').classList.remove('hide');
      $color.classList.remove('hidden');
    break;
  }
}

addEventListener('pointerdown', ({target}) => {
  if(target.tagName == 'g' || target.parentNode.tagName == 'g') return;
  $figureBox.querySelector('g.on')?.classList.remove('on');
})

// color 선택
for (const $ of $drawTool.querySelectorAll('.drawColor li'))
$.onclick = ({target}) => {
  const dataColor = target.dataset.color;
  if(target.className){
    $color.className = 'colorPicker';
    colorPick = target;
    if(dataColor) colors = dataColor;
  }else{
    colors = dataColor;
  }
  const targetOn = $drawTool.querySelector('.drawColor li.on');
  if(targetOn) targetOn.className = '';
  if(target.dataset.color) target.className = 'on';
}

// 두께 선택
for (const $ of $drawTool.querySelectorAll('.drawThickness li'))
$.onclick = ({target}) => {
  $drawTool.querySelector('.drawThickness li.on').classList.remove('on');
  target.classList.add('on');
  thickness = Number(target.dataset.thickness);
}

paint.ondrawstart = () => {
  switch (drawTool) {
    case 'pen':
      paint.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    break;
    case 'clear':
      paint.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
    break;
  }
  paint.color = colors;
  paint.size = thickness;
}

highlightPaint.ondrawstart = () => {
  highlightPaint.color = colors;
  highlightPaint.size = thickness;
}
highlightPaint.ondrawend = () => {
  ctx.globalAlpha = .5;
  ctx.drawImage(highlightCanvas, 0, 0);
  hctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
}

// ************** //
//  color picker  //
// ************** //
const hsv2hsl = ({h, s, v}) => ({h, s, l: v - s/2});
const min = Math.min;
const max = Math.max;
const round = Math.round;
const ceil = Math.ceil;
const floor = Math.floor;
const hsv2rgb = ({h, s, v}) => {
  s /= 100;
  v /= 100;
  if (!s) {
    const c = round(v * 255);
    return { r: c, g: c, b: c }
  } else {
    let r = 0, g = 0, b = 0;
    const _h = h / 60;
    const i = Math.floor(_h);
    const f = _h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: round(r * 255), g: round(g * 255), b: round(b * 255) };
  }
}
const hsv = {
  h: 0,
  s: 100,
  v: 0
};
const addColor = () => {
  const rgb = `rgb(${hsv2rgb(hsv).r}, ${hsv2rgb(hsv).g}, ${hsv2rgb(hsv).b})`;
  colors = rgb;
  colorPick.dataset.color = rgb;
  colorPick.style.backgroundColor = rgb;
  colorPick.textContent = '';
  colorPick.className = 'on';
}
const hueColor = () => {
  $color.style.setProperty('--hue', (hsv.h = +$inputHue.value) + 'deg');
  // console.log(hsv2rgb(hsv));
  addColor();
}
$inputHue.oninput = hueColor;
const $colorPlate = $('.cp_color_plate');
let plateL, plateT, plateH, plateW;
$colorPlate.onpointerdown = (e) => {
  e.stopPropagation();
  const { left, top, height, width } = $colorPlate.getBoundingClientRect();
  plateL = left; plateT = top; plateH = height; plateW = width;
  let x = e.x;
  let y = e.y
  plateMove({x, y})
  addEventListener('pointermove', plateMove, { passive: true });
  addEventListener('pointerup', plateMoveEnd, { once: true });
};
const plateMove = ({ x, y }) => {
  const s = clamp(0, x - plateL, plateW);
  const v = clamp(0, y - plateT, plateH);
  $colorPlate.style.cssText = `
    --x:${s}px;
    --y:${v}px;
  `;
  Object.assign(hsv, { s: Math.ceil(s / 2.6), v: Math.ceil(100 - v * 1.25) });
  // console.log('hsv: ', hsv);
  // console.log(hsv2rgb(hsv));
}
const plateMoveEnd = () => {
  removeEventListener('pointermove', plateMove, { passive: true });
  removeEventListener('pointerup', plateMoveEnd, { once: true });
  addColor();
}

const $textBox = $('#textBox');
const $textAdd = $drawTool.querySelector('.textAdd button');
let fontSize = 12;

$textAdd.onclick = () => {
  $textBox.querySelector('.text.on')?.classList.remove('on');
  $textBox.append($frag(`
    <div class="text on" style="left: ${innerWidth / 2 - 180}px;top: ${innerHeight / 2 - 35}px">
      <textarea></textarea>
      <button><img src="img/close_button.svg"></button>
      <div class="resize"><img src="img/text_resize_button.svg"></div>
      <div class="rotate"><img src="img/rotate_button.svg"></div>
    </div>
  `));
  const $text = $textBox.querySelector('.text:last-child');
  const textBox = new Drag($text);
  textBox.calc.wMax = innerWidth;
  textBox.calc.hMax = innerHeight;
  textBox.$t = $text.closest('.text');
  textBox.ondrag();

  $text.querySelector('button').onclick = ({target}) => {
    target.closest('.text').remove();
  }

  $text.querySelector('textarea').onpointerdown = ({target}) => {
    $textBox.querySelector('.text.on')?.classList.remove('on');
    target.closest('.text').classList.add('on');

    if(target.style.fontSize == '') fontSize = 12;

    $drawTool.querySelectorAll('.textSetting div span').textContent = fontSize;
  }
  window.onpointerdown = ({target}) => {
    if($textBox.querySelectorAll('.text').length && !target.closest('#drawTool') && !target.closest('.text')){
      $textBox.querySelector('.text.on')?.classList.remove('on');
    }
  }
}

$drawTool.querySelectorAll('.textSetting div button').forEach($ => {
  $.onclick = ({target}) => {
    switch (target.dataset.text) {
      case 'down':
        if(fontSize > 12) fontSize--;
      break;
      case 'up':
        fontSize++;
      break;
    }
    target.closest('div').querySelector('span').textContent = fontSize;
    Object.assign($textBox.querySelector('.text.on textarea').style, {
      fontSize: `${fontSize}px`,
      lineHeight: `${fontSize}px`
    });
  }
});

$drawTool.querySelectorAll('.textSetting div label').forEach($ => {
  $.onclick = ({target}) => {
    const $textarea = $textBox.querySelector('.text.on textarea');
    switch (target.dataset.text) {
      case 'bold':
        $textarea.style.fontWeight = 'bold';
      break;
      case 'italic':
        $textarea.style.fontStyle = 'italic';
      break;
      case 'underline':
        $textarea.style.textDecoration = 'underline';
      break;
    }
  }
});






$('input[type="range"]#gauge').oninput = ({target}) => {
  const min = target.min;
  const max = target.max;
  const val = target.value;
  target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%';

  opacity = 0.95 - (val / 10);
  Object.assign($canvasBox.style, {
    'backgroundColor': `rgba(48, 74, 64, ${opacity})`,
  });
}