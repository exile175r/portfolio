let root = document.querySelector('project-content') ? document.querySelector('project-content').shadowRoot : document;
const $ = function(sel){return root.querySelector(sel)};
const $$ = function(sel){return root.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();

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

// 페이지 로드 완료 후 영상 상태 확인
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking video element...');
  console.log('Video element:', media);
  console.log('Initial video src:', media.src);
  console.log('Video readyState:', media.readyState);
  console.log('Video networkState:', media.networkState);
  console.log('Current location analysis:', {
    href: window.location.href,
    pathname: window.location.pathname,
    expectedVideoPath: '/contents/player/video/sample.mp4'
  });
  
  // 영상 로드 상태 모니터링
  const checkVideoStatus = () => {
    console.log('Video status check:');
    console.log('- src:', media.src);
    console.log('- readyState:', media.readyState);
    console.log('- networkState:', media.networkState);
    console.log('- error:', media.error);
    console.log('- duration:', media.duration);
  };
  
  // 1초 후 상태 확인
  setTimeout(checkVideoStatus, 1000);
  
  // 3초 후 상태 확인
  setTimeout(checkVideoStatus, 3000);
  
  // 비디오 로드 확인
  console.log('Video loading check completed');
  
  // 비디오 경로 자동 수정
  PathManager.fixVideoPath();
});

// 간단한 경로 관리 유틸리티
const PathManager = {
  // 현재 비디오 경로 확인
  getCurrentVideoPath: () => {
    return media.src || './video/sample.mp4';
  },
  
  // 비디오 로드 상태 확인
  checkVideoLoad: () => {
    console.log('Current video path:', media.src);
    console.log('Video ready state:', media.readyState);
    console.log('Video network state:', media.networkState);
  },
  
  // 비디오 경로 자동 수정
  fixVideoPath: () => {
    const currentSrc = media.src;
    console.log('Current video src:', currentSrc);
    
    // 경로가 잘못되었을 경우 수정
    if (currentSrc && currentSrc.includes('/contents/player/video/')) {
      const newSrc = currentSrc.replace('/contents/player/video/', './video/');
      console.log('Fixing video path from', currentSrc, 'to', newSrc);
      media.src = newSrc;
    }
  }
};

// 영상 로드 에러 처리 추가
media.addEventListener('error', function(e) {
  console.error('Video loading error:', e);
  console.log('Current video src:', media.src);
  console.log('Error details:', {
    error: media.error,
    networkState: media.networkState,
    readyState: media.readyState,
    currentSrc: media.currentSrc
  });
  
  // 에러 처리 및 경로 수정 시도
  if (media.error) {
    console.log(`MediaError Code: ${media.error.code}, Message: ${media.error.message}`);
    
    // 경로 문제인 경우 자동 수정 시도
    if (media.error.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
      console.log('Attempting to fix video path...');
      PathManager.fixVideoPath();
      
      // 수정된 경로로 다시 로드 시도
      setTimeout(() => {
        if (media.error) {
          console.log('Path fix failed, showing error message');
          showVideoError();
        }
      }, 1000);
    } else {
      showVideoError();
    }
  }
});

// 비디오 에러 메시지 표시
function showVideoError() {
  let userMessage = '샘플 영상을 로드할 수 없습니다. ';
  if (media.error) {
    switch (media.error.code) {
      case 1: userMessage += '영상 로드가 중단되었습니다.'; break;
      case 2: userMessage += '네트워크 오류가 발생했습니다.'; break;
      case 3: userMessage += '영상 파일이 손상되었을 수 있습니다.'; break;
      case 4: userMessage += '영상 파일 경로를 찾을 수 없습니다.'; break;
      default: userMessage += '알 수 없는 오류가 발생했습니다.';
    }
  }
  userMessage += ' 영상 파일을 드래그 앤 드롭으로 업로드해주세요.';
  
  alert(userMessage);
}

// 영상 로드 성공 시 처리
media.addEventListener('loadeddata', function() {
  console.log('Video loaded successfully from:', media.src);
  // 영상 정보 업데이트
  if (media.duration && isFinite(media.duration)) {
    $totalTime.textContent = player.duration();
  }
});

// 영상 로드 시작 시 처리
media.addEventListener('loadstart', function() {
  console.log('Video loading started from:', media.src);
  console.log('Current location:', window.location.href);
});

// 영상 로드 완료 시 처리
media.addEventListener('canplay', function() {
  console.log('Video can play from:', media.src);
});

const updatePlayPauseIcon = (isPlaying) => {
  if(isPlaying) {
    $playIcon.classList.replace('fa-play', 'fa-pause');
    $screenIcon.classList.replace('fa-play', 'fa-pause');
  } else {
    $playIcon.classList.replace('fa-pause', 'fa-play');
    $screenIcon.classList.replace('fa-pause', 'fa-play');
  }
}

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
      console.log('Dropped file:', file.name, 'Type:', file.type, 'Size:', file.size);
      const url = URL.createObjectURL(file);
      console.log('Created blob URL:', url);
      media.src = url;
      media.load();
      media.onloadedmetadata = () => {
        console.log('Video metadata loaded successfully');
        media.currentTime = 0;
        player.currentTime = 0;
        $totalTime.textContent = player.duration();
        updatePlayPauseIcon(false);
        timeupdate();
      };
      media.onerror = (error) => {
        console.error('Error loading dropped video:', error);
        alert('영상 파일을 로드하는 중 오류가 발생했습니다.');
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