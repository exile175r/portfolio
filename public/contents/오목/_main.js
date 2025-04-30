const $ = function(sel){return document.querySelector(sel)};
const $$ = function(sel){return document.querySelectorAll(sel)};
const $frag = (function(){let range = document.createRange();return function(v){return range.createContextualFragment(v)}})();

onload = () => {
    const $article = $('article');
    let i = 0;
    function addTag(){
        const tag = $frag(`<div></div>`);
        if(i < 100){
            $article.append(tag);
            i++;
            addTag();
        }
    }
    addTag();

    let columns = 11;
    let rows = 11;
    function point() {
        const {width, height} = $article.getBoundingClientRect();
        const $section = $('section');
        let x, y;
        let w = width / 16;
        let h = height / 16;
        for (let j = 0; j < rows; ++j) {
            for (let i = 0; i < columns; ++i) {
                x = (i * (width / 10)) - (w / 2);
                y = (j * (height / 10)) - (h / 2);
                const point = $frag(`<div class="point" style="width: ${w}px;height: ${h}px;left: ${x}px;top: ${y}px"></div>`);
                $section.appendChild(point);
            }
        }
    }
    point();

    const arr = new Array(columns * rows);
    const chk = color => {
        let colWin = false;
        let chkCol = 1; // 가로 개수

        let rowWin = false;
        let chkRow = 1; // 세로 개수

        let leftDiaWin = false;
        let chkLeftDia = 1; // 대각선1 개수
        
        let righttDiaWin = false;
        let chkRightDia = 1; // 대각선2 개수

        // check
        for(let i = 1; i <= 5; i++){
            if(!colWin){
                if(color == arr[idx + i]){
                    if(arr[idx + i] == undefined) break;
                    console.log('asd'+color)
                    chkCol++;
                }
                if(color == arr[idx - i]){
                    if(arr[idx - i] == undefined) break;
                    console.log('qwe'+color)
                    chkCol++;
                }

                console.log(chkCol)

                if(chkCol == 5) colWin = true;
                else colWin = false;
            }

            if(!rowWin){
                if(color == arr[idx + i * columns]) chkRow++;
                if(color == arr[idx - i * columns]) chkRow++;

                if(chkRow == 5) rowWin = true;
                else rowWin = false;
            }
            
            if(!leftDiaWin){
                if(color == arr[idx + i * (columns - 1)]) chkLeftDia++;
                if(color == arr[idx - i * (columns + 1)]) chkLeftDia++;

                if(chkLeftDia == 5) leftDiaWin = true;
                else leftDiaWin = false;
            }

            if(!righttDiaWin){
                if(color == arr[idx + i * (columns + 1)]) chkRightDia++;
                if(color == arr[idx - i * (columns - 1)]) chkRightDia++;

                if(chkRightDia == 5) righttDiaWin = true;
                else righttDiaWin = false;
            }
        }

        if(colWin || rowWin || leftDiaWin || righttDiaWin) {
            return true;
        }
    }

    const $$point = $$('.point');
    let num = 0;
    let idx;
    function clickFn(){
        idx = [...$$point].indexOf(this);
        num++;
        if(num % 2 == 0){
            this.classList.add('p1');
            arr[idx] = 1;
        }else{
            this.classList.add('p2');
            arr[idx] = 0;
        }
        
        if(chk(arr[idx])){
            if(arr[idx] == 0){
                alert('흑 이김');
            }else if(arr[idx] == 1){
                alert('백 이김');
            }
        }

    }
    for (const $ of $$point)
    $.addEventListener('click', clickFn);
}