const cursor = document.getElementById('cursor');

// 실제 마우스 사용이 가능한 기기인지 확인
const hasFinePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;

if (!hasFinePointer && cursor) {
  cursor.style.display = 'none';
}

/* 커서 위치 추적 + 클릭 가능한 요소 감지 */
document.addEventListener('pointermove', (e) => {
  if (!cursor || e.pointerType !== 'mouse') return;

  const element = e.target instanceof Element ? e.target : e.target.parentElement;

  const clickable = element?.closest(`
    a,
    button,
    input,
    label,
    [role='button'],
    .scroll-next,
    .menu-trigger,
    .project-trigger,
    .modal-close-btn,
    .modal-top-btn,
    .modal-body img.has-link
  `);

  requestAnimationFrame(() => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    cursor.classList.toggle('is-pointer', Boolean(clickable));
  });
});

/* 브라우저 밖으로 나갔다 들어왔을 때 커서 상태 복구 */
document.documentElement.addEventListener('mouseenter', () => {
  if (!cursor) return;

  cursor.classList.remove('is-pointer');
});

window.addEventListener('focus', () => {
  if (!cursor) return;

  cursor.classList.remove('is-pointer');
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
