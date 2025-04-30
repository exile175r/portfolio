const $ = function(sel){return document.querySelector(sel)};
const $$ = function(sel){return document.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();

onload = function(){
    const media = $('video');
    const $playBtn = $('#play');
    const $playIcon = $playBtn.querySelector('i');
    const $progressBar = $("#timeline");
    const $volume = $('#volume');
    const $muteBtn =$('#mute');
    const $muteIcon = $muteBtn.querySelector('i');
    const $current = $("#currentTime");
    const $totalTime = $('#totalTime');
    const $screen = $('#screen');
    const $screenIcon = $screen.querySelector('i');
    let player = {paused: true};

    function Player(){
        const $this = this;
        let playTimer;
        $this.currentTime = 0;
        $this.play = function(){
            $playIcon.classList.replace('fa-play', 'fa-pause');
            media.play();
            playTimer = setInterval(function(){
                $this.currentTime += .5;
                if($this.currentTime >= media.duration){
                    $this.currentTime = 0;
                    $this.pause();
                    if($this.onended) $this.onended();
                }
                if($this.ontimeupdate) $this.ontimeupdate();
            }, 500);
            $this.paused = false;
        };
        $this.pause = function(){
            $playIcon.classList.replace('fa-pause', 'fa-play');
            media.pause();
            clearInterval(playTimer);
            if($this.ontimeupdate) $this.ontimeupdate();
            $this.paused = true;
        };
        $this.duration = function(){
            let dur = media.duration;
            let hr = parseInt(dur / 3600);
            let min = parseInt(dur / 60);
            let sec = parseInt(dur % 60);
            if(min < 10) min = '0' + min;
            if(sec < 10) sec = '0' + sec;
            return `${hr}:${min < 10 ? `0${min}`:min}:${sec < 10 ? `0${sec}`:sec}`;
        }
    };

    player = new Player();
    $totalTime.textContent = player.duration();

    let maxduration, percentage;
    let hr, min, sec, playTime = 0;
    function timeupdate(){
        playTime = media.currentTime;
        hr = parseInt(playTime / 3600);
        min = parseInt(playTime / 60);
        sec = parseInt(playTime % 60);

        if(min < 10) min = '0' + min;
        if(sec < 10) sec = '0' + sec;
        $current.textContent = hr + ':' + min + ':' + sec;

        maxduration = media.duration;
        percentage = 100 * playTime / maxduration;
        $progressBar.value = percentage;

        if(playTime >= maxduration) {
            media.currentTime = 0;
            player.pause();
            $playIcon.classList.replace('fa-play', 'fa-pause');
        }
    }

    const play_pause = ({target}) => {
        if(!player.ontimeupdate) player.ontimeupdate = timeupdate;
        if(media.paused){
            player.play();
            $playIcon.classList.replace('fa-play', 'fa-pause');
            $screenIcon.classList.replace('fa-play', 'fa-pause');
        }else{
            player.pause();
            $playIcon.classList.replace('fa-pause', 'fa-play');
            $screenIcon.classList.replace('fa-pause', 'fa-play');
        }
        if(target.id == 'video'){
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
    const clamp = function(MIN, VAL, MAX){return $max(MIN, $min(VAL, MAX));}
    
    let timeDrag;
    let offsetX = 0;
    const updatebar = (x) => {
        const maxWidth = parseInt(getComputedStyle($progressBar).getPropertyValue('width'));
        const percent = clamp(0, 100 * x / maxWidth, 100);
        media.currentTime = media.duration * percent / 100;
        $progressBar.value = percent;
        timeupdate();
    };
    $progressBar.addEventListener('pointerdown', ({pageX, button}) => {
        if(button == 2) return;
        offsetX = $progressBar.getBoundingClientRect().x;
        timeDrag = true;
        updatebar(pageX - offsetX);
        addEventListener('pointermove', move, {passive: true});
        addEventListener('pointerup', end, {once: true});
    });
    const move = ({pageX}) => { if (timeDrag) updatebar(pageX - offsetX); }
    const end = () => {
        if (timeDrag) timeDrag = false;
        removeEventListener('pointermove', move, {passive: true});
        removeEventListener('pointerup', end, {once: true});
    }

    let volume = null;
    let isMute = false;
    $volume.onpointermove = ({target}) => {
        let val = Number(target.value);
        media.volume = val;
        if(val >= 0.5) $muteIcon.className = 'fas fa-volume-up';
        else if(val < 0.5 && val > 0) $muteIcon.className = 'fas fa-volume-down';
        else {
            $muteIcon.className = 'fas fa-volume-mute';
            $volume.value = 0;
            media.volume = 0;
            isMute = true;
        }
        if(val){
            isMute = false;
        }
    }
    $volume.onpointerup = ({target}) => {
        if(+target.value){
            volume = target.value;
        }
    }

    $muteBtn.onclick = () => {
        isMute = !isMute;
        console.log(volume);
        if(isMute){
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
}
