function Drag(target){
  this.$t = target;
  this.pos = {x: 0, y: 0};
  this.isGet = true;
  this.isStop = false;
  this.calc = {tMax: 0, lMax: 0, gap: 100};
  this.width = null;
  this.parent = null;
  const bounding = {};
  let prevX = 0, prevY = 0, prevZ = 0, resizing = 0, rotateMatch = null;
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

    // 현재 transform에서 rotate 값 추출
    const currentTransform = this.$t.style.transform;
    rotateMatch = currentTransform.match(/rotate\(([^)]+)\)/);
    const currentRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;

    this.ondown?.();
    onpointermove = move;
    onpointerup = dragEnd;
  }
  const move = ({x, y}) => {
    const l = x / zoom - prevX;
    const t = y / zoom - prevY;
    const currentRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    
    // 위치 업데이트 시 중심점도 함께 업데이트
    updateTransform(this.$t, {x: l, y: t}, currentRotation);
    this.pos.x = l;
    this.pos.y = t;
    this.onmove?.();
  }
  const dragEnd = () => {
    // 드래그 종료 시 figureInfo 업데이트
    const figure = this.$t?.closest('g')?.querySelector('rect, circle, path');
    if (figure) {
      const idx = figureInfo.findIndex(info => info.id === figure.id);
      if (idx !== -1) {
        figureInfo[idx].x = this.pos.x;
        figureInfo[idx].y = this.pos.y;
      }
    }
    
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