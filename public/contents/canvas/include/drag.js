function Drag(target){
  this.$t = target;
  this.pos = {x: 0, y: 0};
  this.isGet = true;
  this.isStop = false;
  this.calc = {tMax: 0, lMax: 0, gap: 100};
  this.width = null;
  this.parent = null;
  const bounding = {};
  let prevX = 0, prevY = 0, prevZ = 0, resizing = 0;
  const dragstart = ({target, x, y}) => {
    if(this.isStop && target != this.$t) return;
    if(this.isGet){
      this.isGet = false;
      const getBounding = this.$t.getBoundingClientRect();
      for (const key in getBounding) bounding[key] = getBounding[key];
      prevZ = zoomL;
      if(this.width) bounding.width = this.width;
    }
    document.body.style.pointerEvents = 'none';
    prevX = x / zoom - this.pos.x;
    prevY = y / zoom - this.pos.y;
    resizing = zoomL - prevZ == 0 ? 0 : zoomL - prevZ;
    this.ondown?.();
    onpointermove = move;
    onpointerup = dragEnd;
  }
  const move = ({x, y}) => {
    // const l = clamp(-(bounding.x - zoomL) - resizing, x / zoom - prevX, 1920 - bounding.x - (bounding.width - this.calc.lMax) + zoomL - resizing);
    // const t = clamp(-bounding.y, y / zoom - prevY, 1080 - bounding.y - bounding.height - this.calc.tMax);
    const l = x / zoom - prevX;
    const t = y / zoom - prevY;
    this.onmove?.();
    this.$t.style.transform = `translate(${l}px, ${t}px)`;
    this.pos.x = l;
    this.pos.y = t;
  }
  const dragEnd = () => {
    onpointermove = null;
    onpointerup = null;
    document.body.style.pointerEvents = null;
    this.onend?.();
  }
  this.ondrag = () => {
    this.$t.onpointerdown = dragstart;
  }
  this.removeEvent = () => {
    this.$t.onpointerdown = null;
  }
}