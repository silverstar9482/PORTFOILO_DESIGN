const menuTrigger = document.querySelector('.menu-trigger');
const menu = document.querySelector('.menu');
const menuLinks = document.querySelectorAll('.menu-list a');
const asideLinks = document.querySelectorAll('aside a');
const scrollNext = document.querySelector('.scroll-next');
const sections = document.querySelectorAll('.page');

let currentIndex = 0;
let isScrolling = false;

// 메뉴 닫기 공통 함수
const closeMenu = () => {
  if (!menu.classList.contains('is-open')) return;

  // 메뉴 닫기
  menu.classList.remove('is-open');
  menu.classList.add('is-closing');
  // 햄버거 버튼 원상복구
  menuTrigger.classList.remove('active');

  setTimeout(() => {
    menu.classList.remove('is-closing');
  }, 600);
};

// SKILLS 애니메이션 (리셋 후 재생)
const animateSkills = () => {
  document.querySelectorAll('.skill-ring').forEach((ring) => {
    const percent = ring.dataset.percent;
    const circle = ring.querySelector('.ring-progress');
    const circumference = 2 * Math.PI * 50;

    circle.style.transition = 'none';
    circle.style.strokeDashoffset = circumference;
    circle.getBoundingClientRect();

    circle.style.transition = 'stroke-dashoffset 1s ease';
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  });
};

// 현재 보이는 섹션의 인덱스 찾기
const getCurrentSectionIndex = () => {
  let closestIndex = 0;
  let minDistance = Infinity;

  sections.forEach((section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

// 레이아웃 상태 관리
const updateLayoutState = (index) => {
  const section = sections[index];
  const isHome = index === 0;
  const isLight = section.id === 'about';

  // ASIDE 표시 여부
  document.body.classList.toggle('show-aside', !isHome);

  /* Home이면 여기서 끝 (aside 관련 계산 금지) */
  if (isHome) {
    document.body.classList.remove('is-light');

    // 🔥 Home에서는 메뉴 상태 완전 초기화
    menu.classList.remove('dark');
    menuTrigger.classList.remove('dark');
    menu.classList.remove('is-open');
    menu.classList.remove('is-closing');
    menuTrigger.classList.remove('active');

    return;
  }

  // About 밝은 배경 처리

  document.body.classList.toggle('is-light', isLight);

  menuTrigger.classList.toggle('dark', isLight);
  menu.classList.toggle('dark', isLight);

  // aside active 표시
  asideLinks.forEach((link) => {
    const targetId = link.getAttribute('href').replace('#', '');
    link.classList.toggle('is-active', targetId === section.id);
  });

  // About 진입 시 스킬 애니메이션
  if (isLight) {
    setTimeout(animateSkills, 300);
  }
};

// 페이지 이동
const goToSection = (index) => {
  if (isScrolling) return;

  isScrolling = true;
  currentIndex = index;

  sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
  updateLayoutState(currentIndex);

  setTimeout(() => {
    isScrolling = false;
  }, 900);
};

// 스크롤 효과
window.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();
    if (isScrolling) return;
    if (Math.abs(event.deltaY) < 40) return;

    closeMenu();
    currentIndex = getCurrentSectionIndex();

    if (event.deltaY > 0 && currentIndex < sections.length - 1) {
      goToSection(currentIndex + 1);
    }

    if (event.deltaY < 0 && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
  },
  { passive: false }
);

// 메뉴 효과 //
// 메뉴 열기 & 닫기
menuTrigger.addEventListener('click', (event) => {
  event.preventDefault();

  // 햄버거 버튼 애니메이션
  event.currentTarget.classList.toggle('active');

  if (menu.classList.contains('is-open')) {
    closeMenu();
  } else {
    // 열기 (애니메이션 리셋)
    menu.classList.remove('is-closing');
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
    });
  }
});

// 메뉴 영역 밖 클릭 시 닫기
document.addEventListener('click', (e) => {
  // 메뉴가 열려있지 않으면 무시
  if (!menu.classList.contains('is-open')) return;

  const isClickInsideMenu = menu.contains(e.target);
  const isClickOnTrigger = menuTrigger.contains(e.target);

  // 메뉴 내부나 햄버거 버튼 클릭이면 닫지 않음
  if (isClickInsideMenu || isClickOnTrigger) return;

  // 그 외 영역 클릭 → 메뉴 닫기
  closeMenu();
});

// 메뉴 링크 클릭 시 해당 섹션으로 이동
menuLinks.forEach((link, index) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => goToSection(index), 100);
  });
});

// ASIDE 사이드바
asideLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    const targetIndex = [...sections].findIndex((section) => section.id === targetId);
    if (targetIndex !== -1) {
      goToSection(targetIndex);
    }
  });
});

// 다음 페이지 버튼 클릭
scrollNext.addEventListener('click', () => {
  closeMenu();
  goToSection(1);
});

// 초기 로드
window.addEventListener('load', () => {
  currentIndex = getCurrentSectionIndex();
  updateLayoutState(currentIndex);
});

// 스크롤 시 인덱스 동기화
let syncTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    if (!isScrolling) {
      currentIndex = getCurrentSectionIndex();
      updateLayoutState(currentIndex);
    }
  }, 150);
});

// modal
/* 모달 열기 */
document.querySelectorAll('.project-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog);
    if (dialog) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }
  });
});

/* 모달 닫기 (닫기 버튼) */
document.querySelectorAll('dialog.project-modal').forEach((dialog) => {
  dialog.addEventListener('click', (e) => {
    const inner = dialog.querySelector('.modal-inner');

    // modal-inner 바깥 클릭이면 닫기
    if (!inner.contains(e.target)) {
      dialog.close();
      document.body.style.overflow = '';
    }
  });
});

/* ESC 키 닫기 */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const openDialog = document.querySelector('dialog[open]');
  if (openDialog) {
    openDialog.close();
    document.body.style.overflow = '';
  }
});
