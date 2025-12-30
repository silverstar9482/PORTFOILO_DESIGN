const menuTrigger = document.querySelector('.menu-trigger');
const menu = document.querySelector('.menu');
const menuLinks = document.querySelectorAll('.menu-list a');
const asideLinks = document.querySelectorAll('aside a');
const scrollNext = document.querySelector('.scroll-next');
const sections = document.querySelectorAll('.page');
const modal = document.querySelector('.modal');
const overlay = modal.querySelector('.modal-overlay');
const closeBtn = modal.querySelector('.modal-close-btn');
const topBtn = modal.querySelector('.modal-top-btn');
const content = modal.querySelector('.modal-content');
const modalContainer = modal.querySelector('.modal-container');
const modalTitle = modal.querySelector('.modal-title');
const metaItems = modal.querySelectorAll('.project-meta-item');
const modalImage = modal.querySelector('.modal-body img');
const modalImg = modal.querySelector('.modal-body img');

let currentIndex = 0;
let isScrolling = false;
let isModalOpen = false;

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

    // Home에서는 메뉴 상태 완전 초기화
    menu.classList.remove('dark');
    menu.classList.remove('dark', 'is-open', 'is-closing');
    menuTrigger.classList.remove('dark', 'active');

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

// 스크롤 효과 (throttle 적용)
let wheelThrottle = false;
window.addEventListener(
  'wheel',
  (event) => {
    // 모달이 열려있거나, 닫히는 중(isModalOpen이 true)일 때는 메인 스크롤 완전 차단
    if (isModalOpen) {
      return;
    }

    // 기본 스크롤 방지
    event.preventDefault();

    if (isScrolling || wheelThrottle) return;

    // 휠 강도 체크 (미세한 관성은 무시)
    if (Math.abs(event.deltaY) < 40) return;

    wheelThrottle = true;
    setTimeout(() => (wheelThrottle = false), 100);

    closeMenu();

    // 인덱스 다시 확인
    currentIndex = getCurrentSectionIndex();

    if (event.deltaY > 0 && currentIndex < sections.length - 1) {
      goToSection(currentIndex + 1);
    } else if (event.deltaY < 0 && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
  },
  { passive: false }
);

// 모바일 터치 스와이프 처리
let touchStartY = 0;
const SWIPE_THRESHOLD = 50;

document.body.addEventListener(
  'touchstart',
  (e) => {
    if (isModalOpen) return;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

document.body.addEventListener(
  'touchend',
  (e) => {
    if (isModalOpen || isScrolling) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

    closeMenu();
    currentIndex = getCurrentSectionIndex();

    if (deltaY > 0 && currentIndex < sections.length - 1) {
      goToSection(currentIndex + 1);
    } else if (deltaY < 0 && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
  },
  { passive: true }
);

// 메뉴 효과 //
// 메뉴 열기 & 닫기
menuTrigger.addEventListener('click', (e) => {
  e.preventDefault();

  // 햄버거 버튼 애니메이션
  menuTrigger.classList.toggle('active');

  if (menu.classList.contains('is-open')) {
    closeMenu();
  } else {
    // 열기 (애니메이션 리셋)
    menu.classList.remove('is-closing');
    requestAnimationFrame(() => menu.classList.add('is-open'));
  }
});

// 메뉴 영역 밖 클릭 시 닫기
document.addEventListener('click', (e) => {
  // 메뉴가 열려있지 않으면 무시
  if (!menu.classList.contains('is-open')) return;

  if (menu.contains(e.target) || menuTrigger.contains(e.target)) return;

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
      updateLayoutState(currentIndex);
    }
  }, 150);
});

// modal
// 프로젝트 썸네일 클릭 → 모달 열기
document.querySelectorAll('.project-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openModal();
  });
});

// 모달 오픈 시 페이지 스크롤 차단
modalContainer.addEventListener(
  'wheel',
  (e) => {
    e.stopPropagation();
  },
  { passive: false }
);

const openModal = () => {
  modal.classList.add('is-open');
  document.body.classList.add('is-modal-open'); // 모달열면 메뉴 숨김
  document.body.style.overflow = 'hidden';
  modalContainer.scrollTop = 0;
  isModalOpen = true;
};

// 모달 닫을 때 페이지 스크롤 관성 차단
const closeModal = () => {
  // 애니메이션 시작
  modal.classList.remove('is-open');
  document.body.classList.remove('is-modal-open'); // 모달닫으면 메뉴 복귀
  document.body.style.overflow = '';

  // 위치 고정
  sections[currentIndex].scrollIntoView({
    behavior: 'auto',
    block: 'start',
  });

  // 관성 스크롤 차단 시간 (500ms~800ms 정도로 넉넉히)
  // 이 시간 동안은 wheel 이벤트 내부의 if(isModalOpen) 조건에 걸려 아무 일도 안 일어남
  setTimeout(() => {
    isModalOpen = false;
    isScrolling = false; // 혹시나 남아있을 플래그 초기화
  }, 800);
};

// 배경 클릭 → 닫기
overlay.addEventListener('click', closeModal);

// 모달 컨테이너 빈 영역 클릭 시 닫기 (content 외부 클릭 감지)
modalContainer.addEventListener('click', (e) => {
  // content 내부 클릭이 아닐 때만 닫기
  if (e.target === modalContainer) {
    closeModal();
  }
});

// 닫기 버튼
closeBtn.addEventListener('click', closeModal);

// 스크롤 → 탑버튼 표시
modalContainer.addEventListener('scroll', () => {
  topBtn.classList.toggle('is-visible', modalContainer.scrollTop > 200);
});

// 탑버튼 클릭
topBtn.addEventListener('click', () => {
  modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
});

// 프로젝트별 모달 내용 교체
document.querySelectorAll('.project-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const title = trigger.dataset.title;
    const period = trigger.dataset.period;
    const tool = trigger.dataset.tool;
    const rate = trigger.dataset.rate;
    const image = trigger.dataset.image;

    // 제목
    modalTitle.textContent = title;

    // 메타 정보
    metaItems[0].textContent = `작업기간 : ${period}`;
    metaItems[1].textContent = `작업툴 : ${tool}`;
    metaItems[2].textContent = `기여도 : ${rate}`;

    // 이미지
    modalImage.src = image;
    modalImage.alt = title;
  });
});

// 모달 - 로딩스피너
// 모달 열 때
function openModalWithLoader({ image }) {
  // 1. 로딩 상태 ON
  modal.classList.add('loading');
  modal.classList.add('open');

  // 2. 기존 이미지 강제 초기화 (잔상 방지 핵심)
  modalImg.src = '';

  // 3. 새 이미지 객체 생성 (프리로드)
  const img = new Image();
  img.src = image;

  img.onload = () => {
    // 4. 이미지 교체
    modalImg.src = image;

    // 5. 로딩 종료
    modal.classList.remove('loading');
  };
}

document.querySelectorAll('.project-item button').forEach((btn) => {
  btn.addEventListener('click', () => {
    openModalWithLoader({
      image: btn.dataset.image,
      title: btn.dataset.title,
      period: btn.dataset.period,
      tool: btn.dataset.tool,
      rate: btn.dataset.rate,
    });
  });
});

// 모달 이미지 클릭시 프로젝트 해당 링크로 이동
let currentProjectLink = null;

// 프로젝트 클릭 시
document.querySelectorAll('.project-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    currentProjectLink = trigger.dataset.link || null;
  });
});

// 모달 이미지 클릭 → 사이트 이동
modalImage.addEventListener('click', () => {
  if (!currentProjectLink) return;

  window.open(currentProjectLink, '_blank', 'noopener');
});
