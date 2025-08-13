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
    baseUrl: PathManager.getBaseUrl(),
    expectedVideoPath: '../video/sample.mp4',
    expectedAbsolutePath: PathManager.toAbsolutePath('../video/sample.mp4')
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
  
  // 초기 파일 경로 확인 및 최적화
  const optimizeInitialPath = async () => {
    const alternativePaths = [
      '../video/sample.mp4',  // 현재 위치에서 상위의 video 폴더 (올바른 경로)
      './video/sample.mp4',   // 현재 디렉토리의 video 폴더
      '../../video/sample.mp4', // 상위의 상위 video 폴더
      './sample.mp4',         // 현재 디렉토리
      '/contents/video/sample.mp4', // 절대 경로
      '/video/sample.mp4'     // 루트 video 폴더
    ];
    
    console.log('Checking initial file paths for optimization...');
    console.log('Alternative paths to check:', alternativePaths);
    console.log('Current location pathname:', window.location.pathname);
    console.log('Expected correct path: /contents/video/sample.mp4');
    
    const existingPath = await PathManager.findExistingFile(alternativePaths);
    
    if (existingPath && existingPath !== media.src) {
      console.log(`Optimizing initial path from ${media.src} to ${existingPath}`);
      media.src = existingPath;
    } else if (existingPath) {
      console.log(`Initial path is already optimal: ${existingPath}`);
    } else {
      console.log('No existing files found, keeping initial path');
    }
  };
  
  // 초기 경로 최적화 실행
  optimizeInitialPath();
});

// 경로 관리 유틸리티
const PathManager = {
  // 현재 페이지의 기본 URL 가져오기
  getBaseUrl: () => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    // /contents/player/ 에서 /contents/ 까지
    return pathParts.slice(0, -1).join('/');
  },
  
  // 상대 경로를 절대 경로로 변환
  toAbsolutePath: (relativePath) => {
    const baseUrl = PathManager.getBaseUrl();
    console.log('toAbsolutePath input:', { relativePath, baseUrl });
    
    if (relativePath.startsWith('./')) {
      // 현재 디렉토리 기준
      const result = baseUrl + relativePath.substring(1);
      console.log('toAbsolutePath ./ result:', result);
      return result;
    } else if (relativePath.startsWith('../')) {
      // 상위 디렉토리로 이동
      const pathParts = baseUrl.split('/').filter(part => part.length > 0);
      const upLevels = (relativePath.match(/\.\.\//g) || []).length;
      const newPath = pathParts.slice(0, -upLevels).join('/');
      const result = '/' + newPath + '/' + relativePath.replace(/\.\.\//g, '');
      console.log('toAbsolutePath ../ result:', result);
      return result;
    } else if (relativePath.startsWith('/')) {
      // 절대 경로
      const result = window.location.origin + relativePath;
      console.log('toAbsolutePath / result:', result);
      return result;
    } else {
      // 기본 경로
      const result = baseUrl + '/' + relativePath;
      console.log('toAbsolutePath default result:', result);
      return result;
    }
  },
  
  // 파일명 추출
  getFileName: (src) => {
    try {
      const url = new URL(src, window.location.href);
      return url.pathname.split('/').pop();
    } catch (e) {
      return src.split('/').pop();
    }
  },
  
  // 파일 존재 여부 확인 (HEAD 요청)
  checkFileExists: async (url) => {
    try {
      // URL이 상대 경로인 경우 절대 경로로 변환
      let fullUrl = url;
      if (!url.startsWith('http')) {
        if (url.startsWith('/')) {
          fullUrl = window.location.origin + url;
        } else {
          fullUrl = window.location.origin + '/' + url;
        }
      }
      
      console.log(`Checking file existence: ${fullUrl}`);
      const response = await fetch(fullUrl, { method: 'HEAD' });
      const exists = response.ok;
      console.log(`File ${fullUrl} exists: ${exists}`);
      return exists;
    } catch (error) {
      console.log(`File check failed for ${url}:`, error);
      return false;
    }
  },
  
  // 여러 경로 중 존재하는 파일 찾기
  findExistingFile: async (paths) => {
    for (const path of paths) {
      console.log(`Checking path: ${path}`);
      
      // 상대 경로를 절대 경로로 변환
      let absolutePath;
      if (path.startsWith('./')) {
        // 현재 디렉토리 기준
        absolutePath = window.location.pathname.replace(/\/[^\/]*$/, '') + path.substring(1);
      } else if (path.startsWith('../')) {
        // 상위 디렉토리로 이동
        const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
        const upLevels = (path.match(/\.\.\//g) || []).length;
        const newPath = pathParts.slice(0, -upLevels).join('/');
        absolutePath = '/' + newPath + '/' + path.replace(/\.\.\//g, '');
      } else if (path.startsWith('/')) {
        // 절대 경로
        absolutePath = path;
      } else {
        // 기본 경로
        absolutePath = window.location.pathname.replace(/\/[^\/]*$/, '') + '/' + path;
      }
      
      console.log(`Converted to absolute path: ${absolutePath}`);
      const exists = await PathManager.checkFileExists(absolutePath);
      if (exists) {
        console.log(`Found existing file: ${absolutePath}`);
        return path;
      }
    }
    return null;
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
  
  // MediaError 코드별 상세 분석
  if (media.error) {
    const errorCode = media.error.code;
    const errorMessage = media.error.message;
    console.log(`MediaError Code: ${errorCode}, Message: ${errorMessage}`);
    
    switch (errorCode) {
      case 1: // MEDIA_ERR_ABORTED
        console.log('Media loading was aborted by user');
        break;
      case 2: // MEDIA_ERR_NETWORK
        console.log('Network error occurred while loading media');
        break;
      case 3: // MEDIA_ERR_DECODE
        console.log('Media decoding error - file may be corrupted');
        break;
      case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
        console.log('Media source not supported - path or format issue');
        break;
      default:
        console.log('Unknown media error');
    }
  }
  
  // 현재 src에서 파일명 추출
  const currentFileName = PathManager.getFileName(media.src);
  console.log('Current filename:', currentFileName);
  
  // 샘플 영상 로드 실패 시 대체 경로들을 시도
  const alternativePaths = [
    '../video/sample.mp4',  // 현재 위치에서 상위의 video 폴더 (올바른 경로)
    './video/sample.mp4',   // 현재 디렉토리의 video 폴더
    '../../video/sample.mp4', // 상위의 상위 video 폴더
    './sample.mp4',         // 현재 디렉토리
    '/contents/video/sample.mp4', // 절대 경로
    '/video/sample.mp4'     // 루트 video 폴더
  ];
  
  // 현재 시도한 경로가 어떤 것인지 확인
  let currentPathIndex = -1;
  for (let i = 0; i < alternativePaths.length; i++) {
    const path = alternativePaths[i];
    const pathFileName = path.split('/').pop();
    if (pathFileName === currentFileName) {
      currentPathIndex = i;
      break;
    }
  }
  
  console.log('Current path index:', currentPathIndex);
  console.log('Current base URL:', PathManager.getBaseUrl());
  
  // 스마트한 경로 선택
  const selectNextPath = () => {
    if (currentPathIndex >= 0 && currentPathIndex < alternativePaths.length - 1) {
      // 다음 경로 시도
      return alternativePaths[currentPathIndex + 1];
    } else if (currentPathIndex === -1) {
      // 현재 src가 목록에 없으면 현재 위치에 맞는 경로 선택
      const baseUrl = PathManager.getBaseUrl();
      if (baseUrl.includes('/contents/player')) {
        return '../video/sample.mp4'; // 현재 위치에서 상위의 video 폴더 (올바른 경로)
      } else if (baseUrl.includes('/contents')) {
        return './video/sample.mp4'; // contents 디렉토리 내의 video 폴더
      } else {
        return alternativePaths[0]; // 기본값
      }
    } else {
      // 모든 경로 시도 완료
      return null;
    }
  };
  
  const nextPath = selectNextPath();
  
  if (nextPath) {
    console.log('Trying next path:', nextPath);
    console.log('Absolute path would be:', PathManager.toAbsolutePath(nextPath));
    
    // 에러 코드 4인 경우 추가 디버깅
    if (media.error && media.error.code === 4) {
      console.log('Attempting to fix MEDIA_ERR_SRC_NOT_SUPPORTED...');
      console.log('Current location:', window.location.href);
      console.log('Current pathname:', window.location.pathname);
      console.log('File path analysis:', {
        currentSrc: media.src,
        nextPath: nextPath,
        absolutePath: PathManager.toAbsolutePath(nextPath),
        baseUrl: PathManager.getBaseUrl(),
        expectedCorrectPath: '/contents/video/sample.mp4',
        expectedCorrectUrl: window.location.origin + '/contents/video/sample.mp4'
      });
      
      // 파일 존재 여부 자동 확인
      PathManager.findExistingFile(alternativePaths).then(existingPath => {
        if (existingPath) {
          console.log(`Auto-found existing file: ${existingPath}`);
          media.src = existingPath;
        } else {
          console.log('No existing files found, using selected path');
          media.src = nextPath;
        }
      }).catch(error => {
        console.log('File check failed, using selected path:', error);
        media.src = nextPath;
      });
    } else {
      media.src = nextPath;
    }
  } else {
    // 모든 경로 시도 완료
    console.error('All alternative paths failed');
    console.log('Tried paths:', alternativePaths);
    
    // 에러 코드별 사용자 안내
    let userMessage = '샘플 영상을 로드할 수 없습니다. ';
    if (media.error) {
      switch (media.error.code) {
        case 1:
          userMessage += '영상 로드가 중단되었습니다.';
          break;
        case 2:
          userMessage += '네트워크 오류가 발생했습니다.';
          break;
        case 3:
          userMessage += '영상 파일이 손상되었을 수 있습니다.';
          break;
        case 4:
          userMessage += '영상 파일 경로를 찾을 수 없습니다.';
          break;
        default:
          userMessage += '알 수 없는 오류가 발생했습니다.';
      }
    }
    userMessage += ' 영상 파일을 드래그 앤 드롭으로 업로드해주세요.';
    
    alert(userMessage);
    
    // 마지막으로 한 번 더 시도 (절대 경로)
    const absolutePath = window.location.origin + '/contents/video/sample.mp4';
    console.log('Trying absolute path as last resort:', absolutePath);
    media.src = absolutePath;
  }
});

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
  console.log('Base URL:', PathManager.getBaseUrl());
  console.log('Full URL analysis:', {
    origin: window.location.origin,
    pathname: window.location.pathname,
    href: window.location.href,
    videoSrc: media.src,
    absolutePath: PathManager.toAbsolutePath(media.src)
  });
});

// 영상 로드 중 에러 발생 시 처리
media.addEventListener('stalled', function() {
  console.log('Video loading stalled from:', media.src);
});

media.addEventListener('suspend', function() {
  console.log('Video loading suspended from:', media.src);
});

// 영상 로드 완료 시 처리
media.addEventListener('canplay', function() {
  console.log('Video can play from:', media.src);
});

media.addEventListener('canplaythrough', function() {
  console.log('Video can play through from:', media.src);
});

// 영상 로드 실패 시 추가 정보
media.addEventListener('abort', function() {
  console.log('Video loading aborted from:', media.src);
});

media.addEventListener('emptied', function() {
  console.log('Video emptied from:', media.src);
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