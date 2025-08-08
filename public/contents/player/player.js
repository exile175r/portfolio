const $ = function(sel){return document.querySelector(sel)};
const $$ = function(sel){return document.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();

function loadSampleVideo() {
  fetch('/video/sample.mp4')
    .then(res => {
      if (!res.ok) throw new Error('Sample video not found');
      return res.blob();
    })
    .then(blob => {
      if (!blob.type.startsWith('video/')) throw new Error('Invalid video type: ' + blob.type);
      const url = URL.createObjectURL(blob);
      const video = document.getElementById('video');
      video.removeAttribute('src'); // 기존 src 제거
      video.load();
      video.src = url;
      video.load();
    })
    .catch(err => {
      alert('샘플 영상을 불러올 수 없습니다.');
      console.error(err);
    });
}

onload = () => {

const media = $('video');
const $playBtn = $('#play');
const $playIcon = $playBtn.querySelector('i');
const $progressBar = $("#timeline");
const $volume = $('#volume');
const $muteBtn = $('#mute');
const $muteIcon = $muteBtn.querySelector('i');
const $current = $("#currentTime");
const $totalTime = $('#totalTime');
const $screen = $('#screen');
const $screenIcon = $screen.querySelector('i');
let player = { paused: true };

const updatePlayPauseIcon = (isPlaying) => {
  if(isPlaying) {
    $playIcon.classList.replace('fa-play', 'fa-pause');
    $screenIcon.classList.replace('fa-play', 'fa-pause');
  } else {
    $playIcon.classList.replace('fa-pause', 'fa-play');
    $screenIcon.classList.replace('fa-pause', 'fa-play');
  }
}

loadSampleVideo();

function Player() {
  const $this = this;
  let playTimer;
  $this.currentTime = 0;
  $this.play = function () {
    updatePlayPauseIcon(true);
    media.play();
    $this.currentTime = media.currentTime; // 동기화
    playTimer = setInterval(function () {
      // $this.currentTime = media.currentTime; // 항상 동기화
      $this.currentTime += .5;
      if($this.currentTime >= media.duration) {
        $this.currentTime = 0;
        $this.pause();
        if($this.onended) $this.onended();
      }
      if($this.ontimeupdate) $this.ontimeupdate();
    }, 500);
    $this.paused = false;
  };
  $this.pause = function () {
    updatePlayPauseIcon(false);
    media.pause();
    clearInterval(playTimer);
    if($this.ontimeupdate) $this.ontimeupdate();
    $this.paused = true;
  };
  $this.duration = function () {
    let dur = media.duration;
    if(isNaN(dur) || !isFinite(dur) || dur <= 0) return '00:00:00';
    let hr = parseInt(dur / 3600);
    let min = parseInt((dur % 3600) / 60);
    let sec = parseInt(dur % 60);
    if(hr < 10) hr = `0${hr}`;
    if(min < 10) min = `0${min}`;
    if(sec < 10) sec = `0${sec}`;
    return `${hr}:${min}:${sec}`;
  }
};

player = new Player();

const waitForDuration = (callback, interval = 100, maxTry = 50) => {
  let tryCount = 0;
  const timer = setInterval(() => {
    if (!isNaN(media.duration) && isFinite(media.duration) && media.duration > 0) {
      clearInterval(timer);
      callback(media.duration);
    } else if (++tryCount > maxTry) {
      clearInterval(timer);
      callback(0); // 실패 시 0 반환
    }
  }, interval);
}

// 사용 예시
waitForDuration(() => {
  $totalTime.textContent = player.duration();
});

let maxduration, percentage;
let hr, min, sec, playTime = 0;
const timeupdate = () => {
  playTime = media.currentTime;
  hr = parseInt(playTime / 3600);
  min = parseInt((playTime % 3600) / 60);
  sec = parseInt(playTime % 60);

  if(hr < 10) hr = `0${hr}`;
  if(min < 10) min = `0${min}`;
  if(sec < 10) sec = `0${sec}`;
  $current.textContent = `${hr}:${min}:${sec}`;

  maxduration = media.duration;
  percentage = 100 * playTime / maxduration;
  $progressBar.value = percentage;
  
  if(playTime >= maxduration) {
    media.currentTime = 0;
    player.pause();
    updatePlayPauseIcon(false);
  }
}

const play_pause = ({ target }) => {
  if(!player.ontimeupdate) player.ontimeupdate = timeupdate;
  if(media.paused) {
    player.play();
    updatePlayPauseIcon(true);
  }else{
    player.pause();
    updatePlayPauseIcon(false);
  }
  if(target.id == 'video') {
    $screen.className = '';
    setTimeout(() => $screen.className = 'on', 0);
    // $screen.className = 'on';
  }
}

$playBtn.onclick = play_pause;
media.onclick = play_pause;

$("#stop").onclick = () => {
  media.currentTime = 0;
  player.pause();
  timeupdate();
  if(!media.paused) $playBtn.textContent = 'play';
  $progressBar.value = 0;
};

const $min = Math.min;
const $max = Math.max;
const clamp = function (MIN, VAL, MAX) { return $max(MIN, $min(VAL, MAX)); }

let timeDrag;
let offsetX = 0;
const updatebar = (x) => {
  const maxWidth = parseInt(getComputedStyle($progressBar).getPropertyValue('width'));
  const percent = clamp(0, 100 * x / maxWidth, 100);
  media.currentTime = media.duration * percent / 100;
  $progressBar.value = percent;
  timeupdate();
};
$progressBar.onpointerdown = ({ pageX, button }) => {
  if(button == 2) return;
  offsetX = $progressBar.getBoundingClientRect().x;
  timeDrag = true;
  updatebar(pageX - offsetX);
  onpointermove = move;
  onpointerup = end;
};
const move = ({ pageX }) => { if(timeDrag) updatebar(pageX - offsetX); }
const end = () => {
  if(timeDrag) timeDrag = false;
  timeupdate();
  onpointermove = null;
  onpointerup = null;
}

let volume = media.volume;
let isMute = false;
$volume.onpointermove = ({ target }) => {
  let val = Number(target.value);
  media.volume = val;
  if(val >= 0.5) $muteIcon.className = 'fas fa-volume-up';
  else if(val < 0.5 && val > 0) $muteIcon.className = 'fas fa-volume-down';
  else{
    $muteIcon.className = 'fas fa-volume-mute';
    $volume.value = 0;
    media.volume = 0;
    isMute = true;
  }
  if(val) isMute = false;
}
$volume.onpointerup = ({ target }) => {
  if(+target.value) {
    volume = target.value;
  }
}

$muteBtn.onclick = () => {
  isMute = !isMute;
  // console.log(volume);
  if(isMute) {
    $muteIcon.className = 'fas fa-volume-mute';
    $volume.value = 0;
    media.volume = 0;
  }else{
    if(volume >= 0.5) $muteIcon.className = 'fas fa-volume-up';
    else if(volume < 0.5 && volume > 0) $muteIcon.className = 'fas fa-volume-down';
    $volume.value = volume;
    media.volume = volume;
  }
}

// 드래그&드롭 영역(플레이어 전체에 적용)
const $playerArea = $('.video-container');
let dragCounter = 0;

const fileDrop = function(e){
  e.preventDefault();
  const target = e.target.closest('#videoContainer');
  if(!target) return;
  switch(e.type){
    case 'dragenter':
      document.body.classList.add('dragover');
      $playerArea.classList.add('on');
      dragCounter++;
    break;
    case 'dragover':
      $playerArea.classList.add('on');
    break;
    case 'dragleave':
      dragCounter--;
      if(dragCounter === 0){
        $playerArea.classList.remove('on');
      }
    break;
    case 'drop':
      dragCounter = 0;
      document.body.classList.remove('dragover');
      $playerArea.classList.remove('on');
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('video/')) {
        alert('비디오 파일만 업로드할 수 있습니다.');
        return;
      }
      const url = URL.createObjectURL(file);
      media.src = url;
      media.load();
      media.onloadedmetadata = () => {
        media.currentTime = 0;
        player.currentTime = 0;
        $totalTime.textContent = player.duration();
        updatePlayPauseIcon(false);
        timeupdate();
      };
    break;
  }
}
addEventListener('dragover', fileDrop);
addEventListener('dragenter', fileDrop);
addEventListener('dragleave', fileDrop);
addEventListener('drop', fileDrop);

// 접근성: aria-label 추가
$playBtn.setAttribute('aria-label', '재생/일시정지');
$muteBtn.setAttribute('aria-label', '음소거');
$volume.setAttribute('aria-label', '볼륨 조절');
$progressBar.setAttribute('aria-label', '재생 위치 조절');
$screen.setAttribute('aria-label', '전체화면');

// 접근성: 키보드 제어 (Space/Enter로 재생/일시정지, M으로 음소거, ←/→로 탐색)
$playBtn.tabIndex = 0;
$muteBtn.tabIndex = 0;
$volume.tabIndex = 0;
$progressBar.tabIndex = 0;
$screen.tabIndex = 0;

let delay;
document.addEventListener('keydown', (e) => {
  // 입력창 등에서 입력 중일 때는 무시
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if(delay) clearTimeout(delay);

  switch (e.key) {
    case ' ': case 'Spacebar': // 구형 브라우저 호환
      play_pause({ target: $playBtn });
      e.preventDefault();
    break;
    case 'm': case 'M':
      $muteBtn.click();
      e.preventDefault();
    break;
    case 'ArrowLeft':
      media.currentTime = Math.max(0, media.currentTime - 5);
      timeupdate();
      e.preventDefault();
    break;
    case 'ArrowRight':
      media.currentTime = Math.min(media.duration, media.currentTime + 5);
      timeupdate();
      e.preventDefault();
    break;
    case 'ArrowUp':
      media.volume = Math.min(1, media.volume + 0.1);
      $volume.value = media.volume;
      e.preventDefault();
    break;
    case 'ArrowDown':
      media.volume = Math.max(0, media.volume - 0.1);
      $volume.value = media.volume;
      e.preventDefault();
    break;
  }
  const $controlBar = $('.controls');
  $controlBar.style.opacity = 1;
  delay = setTimeout(() => {
    $controlBar.style.opacity = null;
  }, 300)
});

const $intro = $('#intro');
const $introClose = $('#introClose');
$introClose.onclick = () => {
  $intro.style.display = 'none';
};
}