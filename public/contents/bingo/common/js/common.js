const isApp = 'swcontobj' in window;
const $ = function(sel){return document.querySelector(sel)};
const $$ = function(sel){return document.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();
const delay = (_ = 250, $) => new Promise(res => {if(typeof _ == 'number'){setTimeout(res, _);}else{($ || this).addEventListener(_, res, {passive: true, once: true});}});
const induce = async (target, isInduce) => {
    if(target.length){
        if(isInduce){
            target.forEach($ => {
                $.classList.add('induce');
            });
            await delay('animationend', target[0]);
            target.forEach($ => {
                $.classList.remove('induce');
            });
        }else{
            target.forEach($ => {
                $.classList.remove('induce');
            });
        }
    }else{
        if(isInduce) target.classList.add('induce');
        else target.classList.remove('induce');
    }
}

/***************************
	사운드
****************************/
let arrAudio = function (fileName, arr, i) {
    arr = arr ? arr : [];
    i = i ? i : 0;
    let audio = new Audio(fileName.replace('$', ++i) + '.mp3');
    audio.muted = true;

    arr.push(audio);
    audio.onloadeddata = function () {
        arrAudio(fileName, arr, i);
        ++i;
    };
    audio.onerror = function () {
        if (window.onaudioload) window.onaudioload();
        arr.pop();
    };
    audio.load();
    return arr;
}
const startAudio = [];
const introAudio = [];
arrAudio('../common/media/start/$', startAudio);
arrAudio('../common/media/intro/$', introAudio);

const effectAudioFn = (arr) => {
    let arrName = ['effect', 'right', 'fail', 'timer', 'slide', 'writeAll', 'learnCompleted', 'dragGuide1', 'dragGuide2', 'bingo1', 'bingo2', 'down', 'clear', 'change', 'induce2', 'bingo3', 'bingoArrow', 'bingo4', 'bingo5'];
    let audio;
    let i = 0;
    while(i < arrName.length){
        audio = new Audio(`../common/media/${arrName[i]}.mp3`);
        audio.muted = true;
        arr.push(audio);
        i++;
    }
    audio.load();
    return arr
}

const effectAudio = [];
effectAudioFn(effectAudio);

const autoPlayFn = (audio) => {
  audio.play();
  audio.muted = false;
}

/***************************
	완료
****************************/
window.oncompleteChk = function (index) {
	if (isApp) swcontobj.fnClkStudyFinish();
    if(index == 2){
        let stampAudio = new Audio('../common/media/stamp.mp3');
        stampAudio.muted = true;
        $('.stamp').classList.remove('hide')
        autoPlayFn(stampAudio);
	    bgmPlayFn(false);
    }
}