const BGM = new Audio("../common/media/bgm2.mp3");
function bgmPlayFn(is, volume = 0.3) {
    if(is){
        autoPlayFn(BGM);
        BGM.volume = volume;
        // BGM.onended = () => { bgmPlayFn(true, volume); };
    }else{
        BGM.pause();
    }
}

let isBingo = [false, false, false];
const bingo = (list) => {
  const data = new Object();
  const t = Math.sqrt(list.length);
  const len = list.length;
  data.diag = new Array(2).fill(null).map(() => []); // 대각선 체크 배열
  data.col = new Array(t).fill(null).map(() => []); // 가로 체크 배열
  data.row = new Array(t).fill(null).map(() => []); // 세로 체크 배열
  for (let i = 0; i < t; i++) {
    data.diag[0].push(list[(t + 1) * i]); // 대각선1
    data.diag[1].push(list[t - 1 + (t - 1) * i]); // 대각선2
    for (let j = 0; j < len; j += t) {
      const v = list[i + j]; // 값
      data.col[j / t].push(v); // 가로
      data.row[i].push(v); // 세로
    }
  }
  window.bingos = [];
  let isBingoIdx = 0;
  for (const [k] of Object.entries(data)) {
    for (let i = 0; i < data[k].length; i++) {
      if (!data[k][i].includes(false)) {
        isBingo[isBingoIdx] = true;
        isBingoIdx++;
        bingos.push([k, i]);
      }
    }
  }
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
const indexInt = new Set;
let dragIdx;
const randomIdx = () => {
    indexInt.add(getRandomInt(0, arr.drag.length));
    if(indexInt.size != arr.drag.length) randomIdx();
    else dragIdx = [...indexInt];
};

const sentenceAudio = [];
arrAudio('../common/media/word/e_$', sentenceAudio);

onload = async () => {
    const $main = $('main');
    const $finger = $main.querySelector('.finger');
    const $dropBox = $main.querySelector('.dropArea');
    const $$dropArea = $dropBox.querySelectorAll('[data-drop]');
    const $dragBox = $main.querySelector('.dragArea');
    const $$dragObject = $dragBox.querySelectorAll('li');
    const $$dragText = $dragBox.querySelectorAll('li span');
    const $quizTextBox = $main.querySelector('.cat');
    const $textBox = $quizTextBox.querySelector('.textBox');
    const $quizText = $textBox.querySelector('span');
    const $$effText = $textBox.querySelectorAll('em');
    const $$catImg = $quizTextBox.querySelectorAll('.catImg img');
    const $bingoEff = $dropBox.querySelector('.bingo');
    const $bingoEffBox = $dropBox.querySelector('p');
    const $bingoEffImg = $dropBox.querySelector('.bingo p img');
    const $nextStep = $main.querySelector('.nextStep');
    const $blind = $('#blind');
    let quizNum = 0;
    let cnt = 0;
    let bingoCnt = 0;

    const blind = (state) => {state == 'on' ? $blind.classList.remove('hide') : $blind.classList.add('hide');}

    randomIdx();

    arr.drag.forEach((text, i) => {
        $$dragText[dragIdx[i]].innerHTML = text;
        if(text == arr.bingo[i]){
            $$dragObject[dragIdx[i]].dataset.bingoText = '';
        }
    });

    $main.style.opacity = 1;

    // const titleSound1 = new Audio('../common/media/title/3.mp3');
    // titleSound1.muted = true;

    // blind('on');
    // autoPlayFn(titleSound1);
    // await delay('ended', titleSound1);
    // bgmPlayFn(true, 0.2);
    // $finger.classList.add('drag', 'move');
    // await delay('animationstart', $finger);
    // autoPlayFn(effectAudio[8]);
    // await delay('animationend', $finger);
    // await delay(500);
    // $finger.remove();
    // blind('off');

    let _this;
    let prevX = 0, prevY = 0, moveX = 0, moveY = 0;
    const dragEventStart = ({x, y, target}) => {
        _this = target;
        prevX = x;
        prevY = y;
        _this.style.pointerEvents = 'none';
        _this.style.zIndex = 10;
        addEventListener('pointermove', dragObjectMove, {passive: true});
        addEventListener('pointerup', dragEventEnd, {once: true});
    }

    const dragObjectMove = ({x, y}) => {
        _this.style.transform = `translate(${moveX + (x - prevX)}px, ${moveY + (y - prevY)}px)`;
    }

    const dragEventEnd = async ({x, y}) => {
        removeEventListener('pointermove', dragObjectMove, {passive: true});
        removeEventListener('pointerup', dragEventEnd, {once: true});
        let $area = document.elementFromPoint(x, y);
        while($area){
            if($area.matches('body, [data-drop]')) break;
            $area = $area.parentNode;
        }
        _this.removeAttribute("style");

        const $dropText = $area.querySelector('li span');
        const $dragText = _this.querySelector('span');

        if($area.dataset.drop == null) return;
        if($area){
            if(!effectAudio[7].paused){
                effectAudio[7].pause();
                effectAudio[7].currentTime = 0;
            }
            autoPlayFn(effectAudio[7]);
            $dropText.innerHTML = $dragText.innerHTML;
            _this.classList.add('hidden');
            $area.classList.add('eNone');

            cnt++;
            if(cnt == $$dragObject.length){
                await delay('ended', effectAudio[7]);
                blind('on');
                $quizText.classList.add('info');
                $quizText.textContent = '우리말 뜻에 알맞은 영어 표현을 찾아보는 거야!';
                $dragBox.classList.add('down');
                $quizTextBox.classList.add('quiz');
                let titleSound2;
                for (let i = 0; i < 3; i++) {
                    if(i == 1) $quizText.textContent = '문제를 모두 맞히고 나면, 빙고는 1개부터 5개까지 나올 수 있어.';
                    else if(i == 2) $quizText.textContent = '자, 그럼 빙고 게임을 시작해 볼까?';
                    titleSound2 = new Audio(`../common/media/title/4-${i+1}.mp3`);
                    titleSound2.muted = true;
                    autoPlayFn(titleSound2);
                    await delay('ended', titleSound2);
                    await delay(500);
                }
                blind('off');
                $main.dataset.quiz = 1;
                $$catImg[$$catImg.length-1].remove();
                $quizText.classList.remove('info');
                $quizText.style.opacity = 0;
                $quizText.textContent = arr.quiz[quizNum];
                await delay(500);
                $quizText.removeAttribute('style');

                for (const $ of $$dropArea){
                    $.onclick = quizClick;
                    $.classList.remove('eNone');
                }
            }
        }
    }
    for (let i = 0; i < $$dragObject.length; i++)
    $$dragObject[i].addEventListener('pointerdown', dragEventStart);

    const bingoList = new Array($$dropArea.length).fill(false);
    const soundList = [9, 10, 15, 17, 18];
    const quizClick = async ({target}) => {
        const idx = [...$$dropArea].indexOf(target);
        const text = target.textContent;
        let sound;
        if(text == arr.bingo[quizNum]){
            if(!effectAudio[1].paused){
                effectAudio[1].pause();
                effectAudio[1].currentTime = 0;
            }
            autoPlayFn(effectAudio[1]);
            blind('on');
            target.classList.add('on', 'eNone');
            await delay('ended', effectAudio[1]);
            autoPlayFn(sentenceAudio[quizNum]);
            await delay('ended', sentenceAudio[quizNum]);

            bingoList[idx] = true;
            bingo(bingoList);
            const result = {};
            isBingo.forEach((x) => { result[x] = (result[x] || 0) + 1; });
            const bingoLen = parseInt(result.true);
            if(bingoLen){
                for (let i = 0; i < bingoLen; i++) {
                    const t = bingos[i];
                    const eff = $bingoEff.querySelectorAll(`[data-type="${t[0]}"]`)[t[1]];
                    if(eff.classList.contains('on')) continue;
                    eff.classList.add('on');
                    autoPlayFn(effectAudio[16]);
                    await delay('ended', effectAudio[16]);
                    $bingoEffBox.classList.add('on');
                    $bingoEffImg.src = `./image/bingo.webp?${quizNum}`;
                    await delay(500);
                    sound = effectAudio[soundList[bingoCnt]];
                    autoPlayFn(sound);
                    $$effText[bingoCnt].classList.add('on');
                    $quizTextBox.classList.add('answer');
                    $quizText.classList.add('hidden');
                    await delay('ended', sound);
                    $$effText[bingoCnt].classList.remove('on');
                    await delay(500);
                    bingoCnt++;
                }
            }
            $bingoEffBox.classList.remove('on');
            $quizTextBox.classList.remove('answer');
            quizNum++;
            if(quizNum != arr.bingo.length){
                $main.dataset.quiz = quizNum + 1;
                $quizText.textContent = arr.quiz[quizNum];
                $quizText.classList.remove('hidden');
                await delay(500);
                blind('off');
            }else{
                $quizTextBox.classList.add('hide');
                await delay(500);
                autoPlayFn(effectAudio[12]);
                $nextStep.classList.remove('hidden');
                oncompleteChk(1);
            }
        }else{
            effectAudio[2].pause();
            effectAudio[2].currentTime = 0;
            autoPlayFn(effectAudio[2]);
        }
    }

    const $bgmBtn = $('.bgmBtn');
    BGM.onended = () => { $bgmBtn.classList.add('click'); }
    $bgmBtn.onclick = ({target}) => {
        target.classList.toggle('click');
        if(!BGM.paused) BGM.pause();
        else autoPlayFn(BGM);
    }

    $nextStep.onclick = () => { if(isApp) swcontobj.fnIndexNext(); }
}