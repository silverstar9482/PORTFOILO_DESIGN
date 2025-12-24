const cursor = document.getElementById('cursor');

/* 커서 위치 추적 */
document.addEventListener('mousemove', (e) => {
  requestAnimationFrame(() => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
});

/* 클릭 의도가 있는 요소 기준 */
const CLICKABLE_SELECTOR = 'a, button, [role="button"]';

/* 상태 변수 */
let lastTarget = null;
let hoverTimer = null;
let lastRippleTime = 0;

/* 클릭 가능한 요소 판별 함수 */
const getClickableTarget = (eventTarget) => {
  if (!eventTarget) return null;

  const el = eventTarget.closest(CLICKABLE_SELECTOR);
  if (el) return el;

  // cursor: pointer 인 요소도 허용
  const pointerEl = eventTarget.closest('*');
  if (pointerEl && window.getComputedStyle(pointerEl).cursor === 'pointer') {
    return pointerEl;
  }

  return null;
};

/* hover 진입 */
document.addEventListener('mouseover', (e) => {
  const target = getClickableTarget(e.target);
  if (!target) return;

  // 같은 요소 중복 방지
  if (lastTarget === target) return;

  // 쿨타임
  const now = Date.now();
  if (now - lastRippleTime < 300) return;

  clearTimeout(hoverTimer);
  lastTarget = target;

  // 일정 시간 머물렀을 때만 실행
  hoverTimer = setTimeout(() => {
    const x = cursor.style.left;
    const y = cursor.style.top;

    const primary = document.createElement('span');
    primary.className = 'cursor-ripple primary';
    primary.style.left = x;
    primary.style.top = y;

    const secondary = document.createElement('span');
    secondary.className = 'cursor-ripple secondary';
    secondary.style.left = x;
    secondary.style.top = y;

    document.body.append(primary, secondary);
    lastRippleTime = Date.now();

    secondary.addEventListener(
      'animationend',
      () => {
        primary.remove();
        secondary.remove();
      },
      { once: true }
    );
  }, 120);
});

/* hover 이탈 */
document.addEventListener('mouseout', (e) => {
  const target = getClickableTarget(e.target);
  if (!target) return;

  // 아직 같은 요소 내부면 무시
  if (target.contains(e.relatedTarget)) return;

  clearTimeout(hoverTimer);
  hoverTimer = null;
  lastTarget = null;
});

// 마우스 팅커벨 효과
