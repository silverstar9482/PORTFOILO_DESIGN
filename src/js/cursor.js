const cursor = document.getElementById('cursor');

// 터치 디바이스면 커서 숨기기
const isTouchDevice =
  window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0;

if (isTouchDevice && cursor) {
  cursor.style.display = 'none';
}

/* 커서 위치 추적 (PC만) */
document.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') {
    requestAnimationFrame(() => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  }
});

/* 클릭 시 파장 */
document.addEventListener('click', (e) => {
  createRipple(e.clientX, e.clientY);
});

/* 파장 생성 */
function createRipple(x, y) {
  const primary = document.createElement('span');
  primary.className = 'cursor-ripple primary';
  primary.style.left = `${x}px`;
  primary.style.top = `${y}px`;

  const secondary = document.createElement('span');
  secondary.className = 'cursor-ripple secondary';
  secondary.style.left = `${x}px`;
  secondary.style.top = `${y}px`;

  document.body.append(primary, secondary);

  setTimeout(() => {
    primary.remove();
    secondary.remove();
  }, 1700);
}
