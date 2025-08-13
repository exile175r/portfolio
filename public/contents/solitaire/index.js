let root = document.querySelector('project-content') ? document.querySelector('project-content').shadowRoot : document;
const $ = function(sel){return root.querySelector(sel)};
const $$ = function(sel){return root.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();

const number = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const shape = ['♠', '♣', '◆', '♥'];
const list = Array(13*4).fill().map((_, i) => {
  return {s: shape[Math.floor(i/13)], n: number[i % 13]};
});

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const set = new Set;
const randomIdxList = () => {
  set.add(getRandomInt(0, list.length));
  if(set.size != list.length) randomIdxList();
}
randomIdxList();

const cardList = [...set].map(v => list[v]);

const $$list = $$('#list div');
let len = 1, idx = 0;
for (let i = 0; i < $$list.length; i++) {
  let j = 0;
  while (j < len) {
    const {s, n} = cardList[idx];
    $$list[i].append($frag(`
      <div ${j != len-1 ? 'class="turn"' : ''} data-drag="${n}" data-type="${s}">
        <div>
          <span><em>${n == 1 ? 'A' : n == 11 ? 'J' : n == 12 ? 'Q' : n == 13 ? 'K' : n}</em><em>${s}</em></span>
          <span>${s}</span>
        </div>
        <div class="back"></div>
      </div>`));
    j++;
    idx++;
  }
  len++;
}

const $cards = $('#cards');
let c = 0;
for (let i = idx; i < cardList.length; i++) {
  const {s, n} = cardList[i];
  $cards.append($frag(`
    <div class="turn" data-drag="${n}" data-type="${s}" style="margin-top: ${c-=.3}px;">
      <div>
        <span><em>${n == 1 ? 'A' : n == 11 ? 'J' : n == 12 ? 'Q' : n == 13 ? 'K' : n}</em><em>${s}</em></span>
        <span>${s}</span>
      </div>
      <div class="back"></div>
    </div>`));
}

const $drag = $('#drag');
$cards.onclick = ({target}) => {
  if(target.id == 'cards'){
    [...$cards.children].forEach($ => $.classList.remove('hidden'));
    $drag.innerHTML = '';
    return;
  }
  const clone = target.cloneNode(true);
  $drag.append(clone);
  clone.className = '';
  clone.removeAttribute('style');
  target.classList.add('hidden');
}

const $main = $('main');
let prevX, prevY, $this, parent, isList, styles = [], dragList = [];
$main.onpointerdown = ({x, y, target}) => {
  if(!target.closest('[data-drag]') || target.closest('.turn') || target.parentNode.id == 'drop') return;
  $this = target;
  prevX = x;
  prevY = y;
  isList = $this.closest('#list');
  parent = $this.parentNode;
  if(isList){
    const children = parent.children;
    const idx = [...children].indexOf($this);
    for (let i = idx; i < children.length; i++) {
      dragList.push(children[i]);
      styles.push(children[i].getAttribute('style'));
    }
  }
  onpointermove = move;
  onpointerup = end;
}
const move = ({x, y}) => {
  if(isList){
    dragList.forEach($ => {
      Object.assign($.style, {
        transform: `translate(${x - prevX}px, ${y - prevY}px)`,
        zIndex: 10
      });
    });
  }else{
    Object.assign($this.style, {
      transform: `translate(${x - prevX}px, ${y - prevY}px)`,
      zIndex: 10
    });
  }
  
}
const end = ({x, y}) => {
  if(isList) dragList.forEach($ => $.removeAttribute('style'));
  else $this.removeAttribute('style');
  const $area = root.elementFromPoint(x, y);
  const dropParent = $area.parentNode;
  const dataType = $area.dataset.type;
  let isChild = true, isDrop = false, clones;
  if(dropParent.id == 'list' && !$area.childElementCount && +$this.dataset.drag == 13) isChild = false;
  if(dropParent.id != 'drop'){
    switch($this.dataset.type){
      case '♠': case '♣':
        if(dataType == '◆' || dataType == '♥') isDrop = true;
      break;
      case '◆': case '♥':
        if(dataType == '♠' || dataType == '♣') isDrop = true;
      break;
    }
  }else{
    isDrop = true;
  }
  if(!isChild || (isDrop && +$this.dataset.drag == +$area.dataset.drag-1)){
    const clone = $this.cloneNode(true);
    if(dropParent.id == 'drop'){
      if($area.dataset.drag == '2'){
        $area.dataset.type = $this.dataset.type;
      }else{
        if($area.dataset.type != $this.dataset.type) {
          $this.style = styles[0];
          dragList.length = 0;
          styles.length = 0;
          onpointermove = null;
          onpointerup = null;
          return;
        }
      }
      let num = +$area.dataset.drag;
      $area.dataset.drag = ++num;
      $area.append(clone);
    }else{
      if(isChild){
        if(!isList) dropParent.append(clone);
        else{
          for (let i = 0; i < dragList.length; i++) {
            clones = dragList[i].cloneNode(true);
            dropParent.append(clones);
          }
        }
      }else{
        if(!isList) $area.append(clone);
        else{
          for (let i = 0; i < dragList.length; i++) {
            clones = dragList[i].cloneNode(true);
            $area.append(clones);
          }
        }
      }
    }
    if(isList){
      dragList.forEach($ => $.remove());
      if(parent.childElementCount)
        parent.querySelector('[data-drag]:last-child').className = '';
    }else{
      $this.remove();
    }
    if(parent.id == 'drag'){
      let i = $cards.childElementCount - $drag.childElementCount - 1;
      $cards.querySelectorAll('[data-drag]')[i].remove();
    }
  }else{
    if(isList) dragList.forEach(($, i) => $.style = styles[i]);
  }
  dragList.length = 0;
  styles.length = 0;
  onpointermove = null;
  onpointerup = null;

  // Clear!!!!
  setTimeout(() => {
    if([...$$('#drop > div')].map(v => +v.dataset.drag).every(v => v == 15)){
      alert('Clear!!!!');
    }
  }, 500);
}

const $$dropBox = $$('#drop > div');
$main.ondblclick = ({target}) => {
  if(!target.closest('[data-drag]') || target.closest('.turn')) return;
  const dropList = [...$$dropBox].map(v => v.dataset.type);
  let isDrop = dropList.some(v => v);
  const {drag, type} = target.dataset;
  const parent = target.parentNode;
  let idx;
  if(isDrop){
    let isDropAll = dropList.every(v => v);
    let typeIdx = dropList.indexOf(type);
    if(isDropAll){
      // 상단 드랍 영역이 모두 object가 있는 경우
      const {drag: boxDrag} = $$dropBox[typeIdx].dataset;
      if(+boxDrag - 1 == +drag) idx = typeIdx;
      else return;
    }else{
      // 상단 드랍 영역이 하나 이상 비어있는 경우
      if(typeIdx < 0){
        if(+drag != 1) return;
        idx = dropList.map((v, i) => {if(!v) return i}).filter(v => v != undefined)[0];
      }else{
        const {drag: boxDrag} = $$dropBox[typeIdx].dataset;
        if(+boxDrag - 1 == +drag) idx = typeIdx;
        else return;
      }
    }
  }else{
    // 상단 드랍 영역이 모두 비어있는 경우
    if(+drag == 1) idx = 0;
    else return;
  }
  let isList = parent.closest('#list');
  let targetCard = isList ? target : target.cloneNode(true);
  $$dropBox[idx].dataset.type = type;
  $$dropBox[idx].dataset.drag = +$$dropBox[idx].dataset.drag + 1;
  $$dropBox[idx].append(targetCard);
  
  if(isList && parent.children.length)
    parent.querySelector('[data-drag]:last-child').className = '';

  if(parent.closest('#drag')) {
    target.remove();
    let i = $cards.childElementCount - $drag.childElementCount - 1;
    $cards.querySelectorAll('[data-drag]')[i].remove();
  }

  // Clear!!!!
  if([...$$('#drop > div')].map(v => +v.dataset.drag).every(v => v == 15)){
    alert('Clear!!!!');
  }
}

