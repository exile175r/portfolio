addEventListener('load', function(){

    const $$button = document.querySelectorAll('button');
    const $prev = document.querySelector('button.prev');
    const $next = document.querySelector('button.next');
    const $slideBox = document.querySelector('article div');
    const $$list = document.querySelectorAll('section');
    
    let n = 0;

    const {width} = $$list[n].getBoundingClientRect();
    
    function slide(){
        let key = this.className;
        switch (key) {
            case 'prev':
                if(n > 0) n--;
            break;
            case 'next':
                if(n != $$list.length-1) n++;
            break;
        }
        $slideBox.style.transform = 'translateX('+ (-width * n) +'px)';

        if(n > 0) $prev.classList.remove('hidden');
        else $prev.classList.add('hidden');

        if(n == $$list.length-1) $next.classList.add('hidden');
        else $next.classList.remove('hidden');
        
    }

    for (const $ of $$button)
    $.addEventListener('click', slide);
})