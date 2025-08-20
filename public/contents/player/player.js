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
  // 비디오 경로 자동 수정
  PathManager.fixVideoPath();
  
  // 주기적으로 duration 확인 (백업 방법)
  setInterval(() => {
    if (media.duration && isFinite(media.duration) && media.duration > 0) {
      if ($totalTime.textContent === '00:00:00') {
        updateDuration();
      }
    }
  }, 1000); // 1초마다 확인
});

// 간단한 경로 관리 유틸리티
const PathManager = {
  // 현재 비디오 경로 확인
  getCurrentVideoPath: () => {
    return media.src || '/contents/player/video/sample-video.mp4';
  },
  
  // 비디오 경로 자동 수정
  fixVideoPath: () => {
    const currentSrc = media.src;
    
    // 잘못된 경로를 올바른 절대 경로로 수정
    if (currentSrc && !currentSrc.includes('/contents/player/video/')) {
      const baseUrl = window.location.origin;
      const newSrc = `${baseUrl}/contents/player/video/sample-video.mp4`;
      media.src = newSrc;
    }
  }
};

// 영상 로드 에러 처리 추가
media.addEventListener('error', function(e) {
  // 에러 처리 및 경로 수정 시도
  if (media.error) {
    // 경로 문제인 경우 자동 수정 시도
    if (media.error.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
      PathManager.fixVideoPath();
      
      // 수정된 경로로 다시 로드 시도
      setTimeout(() => {
        if (media.error) {
          showVideoError();
        }
      }, 2000);
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
  // 영상 정보 업데이트
  updateDuration();
});

// duration이 변경될 때마다 업데이트
media.addEventListener('durationchange', function() {
  updateDuration();
});

// 메타데이터가 로드될 때도 업데이트
media.addEventListener('loadedmetadata', function() {
  updateDuration();
});

// canplay 이벤트에서도 duration 확인
media.addEventListener('canplay', function() {
  updateDuration();
});

// canplaythrough 이벤트에서도 duration 확인
media.addEventListener('canplaythrough', function() {
  updateDuration();
});

// progress 이벤트에서도 duration 확인
media.addEventListener('progress', function() {
  updateDuration();
});

// timeupdate 이벤트에서도 duration 확인 (재생 중)
media.addEventListener('timeupdate', function() {
  updateDuration();
});

// duration 업데이트 함수
const updateDuration = () => {
  // 여러 방법으로 duration을 가져오기 시도
  let duration = media.duration;
  // media.duration 직접 확인
  if (duration && isFinite(duration) && duration > 0) {
    $totalTime.textContent = player.duration();
    return;
  }
};

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

    // 이전 타이머 정리
    if(playTimer) clearInterval(playTimer);
    
    // 새로운 타이머 시작
    playTimer = setInterval(function () {
      $this.currentTime = media.currentTime; // 실제 시간과 동기화
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
    
    // 타이머만 정리 (timeupdate는 유지)
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    
    $this.paused = true;
  };
  
  $this.duration = function () {
    let dur = media.duration;
    
    // 여러 방법으로 duration을 가져오기 시도
    if (dur && isFinite(dur) && dur > 0) {
      // 정상적인 경우
    } else if (media.readyState >= 1) {
      // readyState가 HAVE_METADATA 이상인 경우 강제로 다시 확인
      dur = media.duration;
    } else if (media.buffered && media.buffered.length > 0) {
      // buffered 정보가 있는 경우 end time을 duration으로 사용
      dur = media.buffered.end(media.buffered.length - 1);
    }
    
    if(isNaN(dur) || !isFinite(dur) || dur <= 0) return '00:00:00';
    
    let hr = parseInt(dur / 3600);
    let min = parseInt((dur % 3600) / 60);
    let sec = parseInt(dur % 60);
    if(hr < 10) hr = `0${hr}`;
    if(min < 10) min = `0${min}`;
    if(sec < 10) sec = `0${sec}`;
    return `${hr}:${min}:${sec}`;
  }
  
  // duration이 로드되었는지 확인하는 메서드 추가
  $this.isDurationLoaded = function () {
    return media.duration && isFinite(media.duration) && media.duration > 0;
  }
};

player = new Player();

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
  
  // duration이 유효한 경우에만 프로그레스바 업데이트
  if (maxduration && isFinite(maxduration) && maxduration > 0) {
    percentage = 100 * playTime / maxduration;
    $progressBar.value = percentage;
    
    if(playTime >= maxduration) {
      media.currentTime = 0;
      player.pause();
      updatePlayPauseIcon(false);
      $progressBar.value = 0;
      playTime = 0;
    }
  } else {
    // duration이 아직 로드되지 않은 경우 프로그레스바를 0으로 설정
    $progressBar.value = 0;
  }
}

const play_pause = ({ target }) => {
  // timeupdate 함수는 한 번만 등록
  if(!player.ontimeupdate) player.ontimeupdate = timeupdate;
  if(isIntro) return;
  
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
  }
}

$playBtn.onclick = play_pause;
media.onclick = play_pause;

$("#stop").onclick = () => {
  media.currentTime = 0;
  player.pause();
  
  // stop 시에는 timeupdate를 한 번만 실행하여 UI 업데이트
  timeupdate();
  
  // 프로그레스바와 시간 표시 초기화
  $progressBar.value = 0;
  $current.textContent = '00:00:00';
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
      $playerArea.classList.remove('on');
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('video/')) {
        alert('비디오 파일만 업로드할 수 있습니다.');
        return;
      }
      
      // 이전 비디오 정리
      if (media.src && media.src.startsWith('blob:')) {
        URL.revokeObjectURL(media.src);
      }
      
      // 플레이어 상태 초기화
      player.pause();
      player.currentTime = 0;
      
      const url = URL.createObjectURL(file);
      media.src = url;
      media.load();
      
      media.onloadedmetadata = () => {
        // 상태 초기화
        media.currentTime = 0;
        player.currentTime = 0;
        $totalTime.textContent = player.duration();
        updatePlayPauseIcon(false);
        
        // 프로그레스바 초기화
        $progressBar.value = 0;
        $current.textContent = '00:00:00';
        
        // timeupdate는 한 번만 실행
        timeupdate();
      };
      
      media.onerror = (error) => {
        console.error('Error loading dropped video:', error);
        alert('영상 파일을 로드하는 중 오류가 발생했습니다.');
      };
    break;
  }
}

// 이벤트 리스너 등록 (on 이벤트로 간단하게)
root.addEventListener('dragover', fileDrop);
root.addEventListener('dragenter', fileDrop);
root.addEventListener('dragleave', fileDrop);
root.addEventListener('drop', fileDrop);

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
  if(isIntro) return;

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
  
  // 안전하게 controlBar 확인 후 스타일 변경
  const $controlBar = $('#controls');
  if ($controlBar) {
    $controlBar.style.opacity = 1;
    delay = setTimeout(() => {
      if ($controlBar) {
        $controlBar.style.opacity = null;
      }
    }, 300);
  }
});

const $intro = $('#intro');
const $introClose = $('#introClose');
let isIntro = true;
$introClose.onclick = () => {
  if($totalTime.textContent == '') $totalTime.textContent = player.duration();
  $intro.style.display = 'none';
  isIntro = false;
};