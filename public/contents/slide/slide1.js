const $slideMoveBox = document.querySelector('article > div');
const $$slideBtn = document.querySelectorAll('button');
let n = 0;

for (let i = 0; i < $$slideBtn.length; i++) {
  $$slideBtn[i].addEventListener('click', function ({target}) {
    switch (target.classList[0]) {
      case 'prev':
        n--
      break;
      case 'next':
        n++
      break;
    }
    console.log(n);
  });
}