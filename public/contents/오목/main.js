const $ = function (sel) { return document.querySelector(sel) };
const $$ = function (sel) { return document.querySelectorAll(sel) };
const $frag = (function () { let range = document.createRange(); return function (v) { return range.createContextualFragment(v) } })();

let scale, scaleL;
const resize = () => {
  const $wrap = $('#wrap');
  const {offsetWidth, offsetHeight} = document.body;
	const {clientWidth, clientHeight} = $wrap;
  scale = clientWidth * Math.min(offsetWidth / clientWidth, offsetHeight / clientHeight) / clientWidth;
	scaleL = (offsetWidth / scale - clientWidth) / 2;
  $wrap.style.transform = `scale(${scale}) translate(${scaleL}px, 0px)`;
}

onload = resize;
onresize = resize;

const data = {
  row: 11,
  column: 11,
  area: []
}

let {row, column, area} = data;
let turn = 1;
let isFinish = false;

$('#plate').innerHTML = `${Array(row * column).fill(null).map(_ => {
  area.push(0);
  return '<div><span></span></div>';
}).join('')}`;

const $resetBtn = $('.reset');

const completion = (obj) => {
  // console.log(obj);
  window.compList = {}
  for (const key in obj) {
    compList[key] = obj[key].map(v => v = area[v]);
  }
  // console.log(compList);
  const list = [];
  for (const key in compList) {
    for (const v of compList[key]){
      if(v == turn) list.push(v);
      else{
        if(list.length < 5) list.length = 0;
        else break;
      }
    }
    if(list.length == 5) break;
    else list.length = 0;
  }
  if(list.length == 5){
    isFinish = true;
    $('#plate').style.pointerEvents = 'none';
    setTimeout(()=>{
      alert(`${turn == 1 ? 'black' : 'white'} win`);
      $resetBtn.classList.remove('hide');
    }, 300);
  }
}

$resetBtn.onclick = () => {
  isFinish = false;
  $resetBtn.classList.add('hide');
  $('#plate').removeAttribute('style');
  turn = 1;
  area = area.map(v => v = 0);
  $$rack.forEach(v => v.className = '');
  $$('aside dd').forEach((v, i) => {
    if(i == 0) v.className = 'on';
    else v.className = '';
  })
}

const check = (idx) => {
  const checkData = {r: [], c: [], d1: [], d2: []};
  let tI, bI, ltI, rbI, rtI, lbI;

  for (const key in checkData) checkData[key].push(idx);

  // left
  for (let l = idx; l > (idx-5); l--) {
    if(l != idx) checkData.r.push(l);
    if(l % row == 0) break;
  }
  // right
  for (let r = idx; r < (idx+5); r++) {
    if(r != idx) checkData.r.push(r);
    if(r % row == row-1) break;
  }
  // top
  for (let t = 0; t < 5; t++) {
    tI = idx - (row*t);
    if(tI < 0) break;
    if(t != 0) checkData.c.push(tI);
  }
  // bottom
  for (let b = 0; b < 5; b++) {
    bI = idx + (row*b);
    if(bI > row**2-1) break;
    if(b != 0) checkData.c.push(bI);
  }
  // left top
  for (let lt = 0; lt < 5; lt++) {
    ltI = (idx-lt) - (row*lt);
    if(ltI < 0) break;
    else{
      if(lt != 0) checkData.d1.push(ltI);
      if(ltI % row == 0) break;
    }
  }
  // right bottom
  for (let rb = 0; rb < 5; rb++) {
    rbI = (idx+rb) + (row*rb);
    if(rbI > row**2) break;
    else{
      if(rb != 0) checkData.d1.push(rbI);
      if(rbI % row == row-1) break;
    }
  }
  // right top
  for (let rt = 0; rt < 5; rt++) {
    rtI = (idx+rt) - (row*rt);
    if(rtI < 1) break;
    else{
      if(rt != 0) checkData.d2.push(rtI);
      if(rtI % row == row-1) break;
    }
  }
  // left bottom
  for (let lb = 0; lb < 5; lb++) {
    lbI = (idx-lb) + (row*lb);
    if(lbI > row**2) break;
    else{
      if(lb != 0) checkData.d2.push(lbI);
      if(lbI % row == 0) break;
    }
  }

  for (const key in checkData) checkData[key].sort((a, b) => a - b);
  completion(checkData)
}

const $$rack = $$('#plate span');
for (const rack of $$rack)
rack.onclick = ({target}) => {
  const idx = [...$$rack].indexOf(target);
  // console.log('idx: ', idx);
  for (const $ of $$('#plate span')) $.removeAttribute('style');
  area[idx] = turn;
  target.className = turn == 1 ? 'b' : 'w';
  check(idx);
  if(isFinish) return;
  turn = turn == 1 ? 2 : 1;
  $$('aside dd').forEach($ => $.classList.toggle('on'));
}