const $textBox = $('#textBox');
const $textAdd = $drawTool.querySelector('.textAdd button');
let fontSize = 12;

$textAdd.onclick = () => {
  $textBox.querySelector('.text.on')?.classList.remove('on');
  $textBox.append($frag(`
    <div class="text on" style="left: ${innerWidth / 2 - 180}px;top: ${innerHeight / 2 - 35}px">
      <textarea></textarea>
      <button><img src="img/close_button.svg"></button>
      <div class="resize"><img src="img/resize_button.svg"></div>
      <div class="rotate"><img src="img/rotate_button.svg"></div>
    </div>
  `));
  const $text = $textBox.querySelector('.text:last-child');
  const textBox = new Drag($text);
  textBox.calc.wMax = innerWidth;
  textBox.calc.hMax = innerHeight;
  textBox.$t = $text.closest('.text');
  textBox.ondrag();

  $text.querySelector('button').onclick = ({target}) => {
    target.closest('.text').remove();
  }

  $text.querySelector('textarea').onpointerdown = ({target}) => {
    $textBox.querySelector('.text.on')?.classList.remove('on');
    target.closest('.text').classList.add('on');

    if(target.style.fontSize == '') fontSize = 12;

    $drawTool.querySelectorAll('.textSetting div span').textContent = fontSize;
  }
  window.onpointerdown = ({target}) => {
    if($textBox.querySelectorAll('.text').length && !target.closest('#drawTool') && !target.closest('.text')){
      $textBox.querySelector('.text.on')?.classList.remove('on');
    }
  }
}

$drawTool.querySelectorAll('.textSetting div button').forEach($ => {
  $.onclick = ({target}) => {
    switch (target.dataset.text) {
      case 'down':
        if(fontSize > 12) fontSize--;
      break;
      case 'up':
        fontSize++;
      break;
    }
    target.closest('div').querySelector('span').textContent = fontSize;
    Object.assign($textBox.querySelector('.text.on textarea').style, {
      fontSize: `${fontSize}px`,
      lineHeight: `${fontSize}px`
    });
  }
});

$drawTool.querySelectorAll('.textSetting div label').forEach($ => {
  $.onclick = ({target}) => {
    const $textarea = $textBox.querySelector('.text.on textarea');
    switch (target.dataset.text) {
      case 'bold':
        $textarea.style.fontWeight = 'bold';
      break;
      case 'italic':
        $textarea.style.fontStyle = 'italic';
      break;
      case 'underline':
        $textarea.style.textDecoration = 'underline';
      break;
    }
  }
});