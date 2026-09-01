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

/* ========================================
   PROJECT 페이지 단계별 애니메이션
======================================== */

const workSections = document.querySelectorAll('.uxui, .web, .editorial, .detailed-page');

/* 처음부터 프로젝트 페이지를 애니메이션 준비 상태로 */
workSections.forEach((section) => {
  section.classList.add('work-motion');
});

const isWorkSection = (section) => {
  return section.matches('.uxui, .web, .editorial, .detailed-page');
};

/* 제목을 정확히 화면 중앙으로 보내기 */
const setTitleCenterPosition = (section) => {
  const title = section.querySelector('.section-title');

  if (!title) return;

  const sectionHeight = section.clientHeight;

  /* transform 적용 전 원래 제목 위치 기준 */
  const titleCenter = title.offsetTop + title.offsetHeight / 2;

  const sectionCenter = sectionHeight / 2;

  const shift = sectionCenter - titleCenter;

  section.style.setProperty('--title-center-shift', `${shift}px`);
};

/* 프로젝트 페이지 처음 진입 */
const prepareWorkSection = (section) => {
  if (!isWorkSection(section)) return;

  /* 프로젝트 페이지 진입 시 내부 목록 맨 위로 */
  const projectList = section.querySelector('.project-list');

  if (projectList) {
    projectList.scrollTop = 0;
  }

  /* 먼저 제목 중앙 위치 계산 */
  setTitleCenterPosition(section);

  /* 그 다음 애니메이션 클래스 적용 */
  section.classList.add('work-motion');

  /* 카드 순차 등장 딜레이 */
  const items = section.querySelectorAll('.project-item');

  items.forEach((item, index) => {
    const delay = 0.25 + index * 0.16;

    item.style.setProperty('--item-delay', `${delay}s`);
  });

  /* 애니메이션 초기화 */
  section.classList.remove('is-title-only', 'is-content-open');

  /* 브라우저에 초기 상태 강제 적용 */
  section.offsetHeight;
};

const waitForSectionArrival = (section, callback) => {
  const checkPosition = () => {
    const distance = Math.abs(section.getBoundingClientRect().top);

    if (distance <= 20) {
      callback();
      return;
    }

    requestAnimationFrame(checkPosition);
  };

  requestAnimationFrame(checkPosition);
};

/* 콘텐츠 열기 */
const openWorkContent = (section) => {
  section.classList.remove('is-title-only');
  section.classList.add('is-content-open');
};

/* 위로 스크롤할 경우 다시 제목 상태 */
const closeWorkContent = (section) => {
  section.classList.remove('is-content-open');
  section.classList.add('is-title-only');

  isScrolling = true;

  setTimeout(() => {
    isScrolling = false;
  }, 900);
};

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

const syncFixedUI = () => {
  const visibleIndex = getCurrentSectionIndex();
  const visibleSection = sections[visibleIndex];

  const isHome = visibleIndex === 0;
  const isLight = visibleSection.id === 'about';

  document.body.classList.toggle('is-light', isLight);

  menuTrigger.classList.toggle('dark', isLight);
  menu.classList.toggle('dark', isLight);
};

// 레이아웃 상태 관리
const updateLayoutState = (index) => {
  const section = sections[index];
  const isHome = index === 0;
  const isLight = section.id === 'about';

  /* 모든 페이지 active 초기화 */
  sections.forEach((section) => {
    section.classList.remove('is-active');
  });

  requestAnimationFrame(() => {
    section.classList.add('is-active');
  });

  /* 현재 페이지 색상 상태 */
  document.body.classList.toggle('is-light', isLight);

  menuTrigger.classList.toggle('dark', isLight);
  menu.classList.toggle('dark', isLight);

  /* HOME */
  if (isHome) {
    document.body.classList.remove('show-aside');
    document.body.classList.remove('is-light');

    asideLinks.forEach((link) => {
      link.classList.remove('is-active');
    });

    menu.classList.remove('dark', 'is-open', 'is-closing');
    menuTrigger.classList.remove('dark', 'active');

    return;
  }

  /* 현재 페이지 ID와 같은 번호만 활성화 */
  asideLinks.forEach((link) => {
    const targetId = link.getAttribute('href').replace('#', '');

    link.classList.toggle('is-active', targetId === section.id);
  });

  /* 페이지 번호 표시 */
  document.body.classList.add('show-aside');

  /* About 진입 시 스킬 애니메이션 */
  if (isLight) {
    setTimeout(animateSkills, 300);
  }
};

// 페이지 이동
const goToSection = (index) => {
  if (isScrolling) return;

  const previousIndex = currentIndex;

  isScrolling = true;
  currentIndex = index;

  const targetSection = sections[currentIndex];
  const workPage = isWorkSection(targetSection);

  const isLongJump = Math.abs(currentIndex - previousIndex) > 1;

  /* 이동 시작과 동시에 목적지 페이지 번호 활성화 */
  if (currentIndex !== 0) {
    asideLinks.forEach((link) => {
      const targetId = link.getAttribute('href').replace('#', '');

      link.classList.toggle('is-active', targetId === targetSection.id);
    });
  }

  /* 프로젝트 페이지 초기화 */
  if (workPage) {
    prepareWorkSection(targetSection);
  }

  /* 페이지 이동 */
  targetSection.scrollIntoView({
    behavior: isLongJump ? 'auto' : 'smooth',
  });

  if (workPage) {
    /* 프로젝트 페이지 */
    waitForSectionArrival(targetSection, () => {
      /* 페이지에 완전히 도착한 뒤 번호 표시 */
      updateLayoutState(currentIndex);

      requestAnimationFrame(() => {
        targetSection.classList.add('is-title-only');
      });

      setTimeout(() => {
        openWorkContent(targetSection);
      }, 900);

      setTimeout(() => {
        isScrolling = false;
      }, 1200);
    });
  } else if (currentIndex === 0) {
    /* =========================
     HOME
     실제 화면에 도착한 뒤 애니메이션 시작
  ========================= */

    /* 혹시 남아있는 상태 확실하게 초기화 */
    targetSection.classList.remove('is-active');

    waitForSectionArrival(targetSection, () => {
      /* 빈 화면 상태를 브라우저에 먼저 적용 */
      targetSection.offsetHeight;

      /* 그 다음 처음부터 애니메이션 실행 */
      updateLayoutState(currentIndex);

      setTimeout(() => {
        isScrolling = false;
      }, 500);
    });
  } else {
    /* 일반 페이지 */
    waitForSectionArrival(targetSection, () => {
      /* 페이지에 완전히 도착한 뒤 번호 표시 */
      updateLayoutState(currentIndex);

      setTimeout(() => {
        isScrolling = false;
      }, 500);
    });
  }
};

// 스크롤 효과
let wheelThrottle = false;

window.addEventListener(
  'wheel',
  (event) => {
    if (isModalOpen) {
      return;
    }

    /* 페이지 이동 중 남은 휠 관성 차단 */
    if (isScrolling) {
      event.preventDefault();
      return;
    }

    /* 모바일 프로젝트 목록 내부 스크롤 */
    if (window.innerWidth <= 480) {
      const projectList = event.target.closest('.project-list');

      if (projectList) {
        const maxScrollTop = projectList.scrollHeight - projectList.clientHeight;

        const canScrollDown = event.deltaY > 0 && projectList.scrollTop < maxScrollTop - 2;

        const canScrollUp = event.deltaY < 0 && projectList.scrollTop > 2;

        /* 목록을 더 스크롤할 수 있으면
           페이지 이동을 막지 않고 목록만 스크롤 */
        if (canScrollDown || canScrollUp) {
          return;
        }
      }
    }

    event.preventDefault();

    if (wheelThrottle) return;

    if (Math.abs(event.deltaY) < 40) return;

    wheelThrottle = true;

    setTimeout(() => {
      wheelThrottle = false;
    }, 150);

    closeMenu();

    currentIndex = getCurrentSectionIndex();
    const currentSection = sections[currentIndex];

    /* 아래로 */
    if (event.deltaY > 0) {
      if (currentIndex < sections.length - 1) {
        goToSection(currentIndex + 1);
      }
    } else {
      /* 위로 */
      if (currentIndex > 0) {
        goToSection(currentIndex - 1);
      }
    }
  },

  { passive: false },
);

// 모바일 터치 스와이프 처리
let touchStartY = 0;
let touchProjectList = null;
let touchProjectStartTop = 0;
let touchProjectMaxTop = 0;

const SWIPE_THRESHOLD = 50;

document.body.addEventListener(
  'touchstart',
  (e) => {
    if (isModalOpen) return;

    touchStartY = e.touches[0].clientY;

    touchProjectList = window.innerWidth <= 480 ? e.target.closest('.project-list') : null;

    if (touchProjectList) {
      touchProjectStartTop = touchProjectList.scrollTop;
      touchProjectMaxTop = touchProjectList.scrollHeight - touchProjectList.clientHeight;
    } else {
      touchProjectStartTop = 0;
      touchProjectMaxTop = 0;
    }
  },
  { passive: true },
);

document.body.addEventListener(
  'touchend',
  (e) => {
    if (isModalOpen || isScrolling) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

    /* 프로젝트 목록이 실제로 스크롤 가능한 경우에만
   페이지 이동 대신 내부 스크롤 */
    if (touchProjectList) {
      const canScrollDown = deltaY > 0 && touchProjectStartTop < touchProjectMaxTop - 2;

      const canScrollUp = deltaY < 0 && touchProjectStartTop > 2;

      touchProjectList = null;

      if (canScrollDown || canScrollUp) {
        return;
      }
    }

    closeMenu();

    currentIndex = getCurrentSectionIndex();

    if (deltaY > 0 && currentIndex < sections.length - 1) {
      goToSection(currentIndex + 1);
    } else if (deltaY < 0 && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
  },
  { passive: true },
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

// 스크롤 시 고정 UI 색상 실시간 동기화
let syncTimeout;

window.addEventListener('scroll', () => {
  /* 스크롤 중에도 현재 화면 배경에 맞게 바로 색상 변경 */
  syncFixedUI();

  clearTimeout(syncTimeout);

  syncTimeout = setTimeout(() => {
    if (!isScrolling) {
      currentIndex = getCurrentSectionIndex();
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
  { passive: false },
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

    modalImage.classList.toggle('has-link', Boolean(currentProjectLink));
  });
});

// 모달 이미지 클릭 → 사이트 이동
modalImage.addEventListener('click', () => {
  if (!currentProjectLink) return;

  window.open(currentProjectLink, '_blank', 'noopener');
});
