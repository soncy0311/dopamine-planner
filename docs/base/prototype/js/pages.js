/* ============================================================
 * Page Prototypes — Tab Switch + Checkbox Toggle
 * ============================================================ */

// === 데스크톱 사이드 네비게이션 전환 (인터랙티브 데모) ===
(function () {
  var nav = document.getElementById('desktop-interactive-nav');
  if (!nav) return;

  var items = nav.querySelectorAll('[data-desktop-panel]');
  var frame = nav.closest('.proto-desktop-frame');

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      // 활성 네비 전환
      items.forEach(function (i) {
        i.classList.remove('desktop-nav-item-active');
      });
      item.classList.add('desktop-nav-item-active');

      // 패널 전환
      var panelId = item.getAttribute('data-desktop-panel');
      frame.querySelectorAll('.desktop-panel').forEach(function (panel) {
        panel.classList.remove('desktop-panel-active');
      });
      var target = frame.querySelector('#' + panelId);
      if (target) target.classList.add('desktop-panel-active');
    });
  });
})();

// === 탭 전환 (인터랙티브 데모) ===
(function () {
  var tabBar = document.getElementById('interactive-tab-bar');
  if (!tabBar) return;

  var tabs = tabBar.querySelectorAll('[role="tab"]');
  var frame = document.getElementById('page-main-interactive');

  function switchTab(selectedTab) {
    tabs.forEach(function (tab) {
      var panelId = tab.getAttribute('data-panel');
      var panel = frame.querySelector('#' + panelId);
      var isSelected = tab === selectedTab;

      // 패널 표시/숨김
      if (panel) {
        panel.style.display = isSelected ? 'block' : 'none';
      }

      // 탭 활성/비활성 클래스 전환
      tab.classList.toggle('proto-tab-bar-item-active', isSelected);
      tab.classList.toggle('proto-tab-bar-item-inactive', !isSelected);

      // ARIA 상태 업데이트
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      // tabindex 관리 (로빙 탭인덱스)
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });
  }

  // 클릭 이벤트
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      switchTab(tab);
    });
  });

  // 키보드 탐색 (좌우 방향키)
  tabBar.addEventListener('keydown', function (e) {
    var tabArray = Array.from(tabs);
    var currentIndex = tabArray.indexOf(document.activeElement);
    var newIndex = -1;

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabArray.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
    }

    if (newIndex >= 0) {
      e.preventDefault();
      tabArray[newIndex].focus();
      switchTab(tabArray[newIndex]);
    }
  });
})();

// === 체크박스 토글 (페이지 프로토타입) ===
(function () {
  var pagesSection = document.querySelector('.proto-main');
  if (!pagesSection) return;

  function toggleCheckbox(checkbox) {
    var isChecked = checkbox.getAttribute('aria-checked') === 'true';
    var todoItem = checkbox.closest('.proto-todo-item');
    var subIssue = checkbox.closest('.proto-epic-sub-issue');

    // 체크박스 상태 토글
    checkbox.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
    checkbox.classList.toggle('proto-checkbox-checked', !isChecked);

    // 체크 아이콘 추가/제거
    var box = checkbox.querySelector('.proto-checkbox-box');
    if (!isChecked) {
      if (!box.querySelector('svg')) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-check');
        svg.appendChild(use);
        box.appendChild(svg);
      }
    } else {
      var svg = box.querySelector('svg');
      if (svg) svg.remove();
    }

    // 부모 TodoItem 또는 서브 이슈 완료 스타일 토글
    if (todoItem) {
      todoItem.classList.toggle('proto-todo-item-completed', !isChecked);
    }
    if (subIssue) {
      subIssue.classList.toggle('proto-epic-sub-issue-completed', !isChecked);
    }

    // 캐스케이딩: 아코디언 메인 체크박스 → 모든 서브 이슈 일괄 체크/해제
    var accordion = checkbox.closest('.proto-issue-card-accordion');
    if (accordion && todoItem && !subIssue) {
      var subCheckboxes = accordion.querySelectorAll('.proto-epic-sub-issue .proto-checkbox');
      subCheckboxes.forEach(function (subCb) {
        var subChecked = subCb.getAttribute('aria-checked') === 'true';
        // 메인이 체크되면 서브도 체크, 해제되면 서브도 해제
        if (!isChecked && !subChecked) {
          toggleCheckbox(subCb);
        } else if (isChecked && subChecked) {
          toggleCheckbox(subCb);
        }
      });
    }
  }

  // 이벤트 위임: 컨테이너에서 체크박스 클릭 감지
  pagesSection.addEventListener('click', function (e) {
    var checkbox = e.target.closest('.proto-checkbox:not(.proto-checkbox-disabled)');
    if (!checkbox) return;

    // 배경 콘텐츠(투두 생성 페이지) 내 체크박스는 토글하지 않음
    if (checkbox.closest('.page-todo-create-bg')) return;

    toggleCheckbox(checkbox);
  });

  // 키보드 접근성: Space 키로 체크박스 토글
  pagesSection.addEventListener('keydown', function (e) {
    if (e.key !== ' ') return;

    var checkbox = e.target.closest('.proto-checkbox:not(.proto-checkbox-disabled)');
    if (!checkbox) return;
    if (checkbox.closest('.page-todo-create-bg')) return;

    e.preventDefault();
    toggleCheckbox(checkbox);
  });
})();

// === Select 드롭박스 토글 ===
(function () {
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.proto-select-trigger');
    if (trigger) {
      var select = trigger.closest('.proto-select');
      var isOpen = select.getAttribute('data-open') === 'true';
      // 다른 Select/Combobox 닫기
      document.querySelectorAll('.proto-select[data-open="true"], .proto-combobox[data-open="true"]').forEach(function (el) {
        if (el !== select) el.setAttribute('data-open', 'false');
      });
      select.setAttribute('data-open', isOpen ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      return;
    }

    var option = e.target.closest('.proto-select-option');
    if (option) {
      var select = option.closest('.proto-select');
      var textEl = select.querySelector('.proto-select-trigger-text');
      // 기존 선택 해제
      select.querySelectorAll('.proto-select-option').forEach(function (opt) {
        opt.removeAttribute('data-selected');
      });
      option.setAttribute('data-selected', 'true');
      textEl.textContent = option.textContent;
      textEl.removeAttribute('data-placeholder');
      select.setAttribute('data-open', 'false');
      select.querySelector('.proto-select-trigger').setAttribute('aria-expanded', 'false');
      return;
    }

    // 외부 클릭 닫기
    document.querySelectorAll('.proto-select[data-open="true"]').forEach(function (el) {
      el.setAttribute('data-open', 'false');
      var trig = el.querySelector('.proto-select-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    });
  });
})();

// === Combobox 자동완성 ===
(function () {
  document.querySelectorAll('.proto-combobox').forEach(function (combobox) {
    var input = combobox.querySelector('.proto-combobox-input');
    var options = combobox.querySelectorAll('.proto-combobox-option');

    input.addEventListener('focus', function () {
      // 다른 Select/Combobox 닫기
      document.querySelectorAll('.proto-select[data-open="true"], .proto-combobox[data-open="true"]').forEach(function (el) {
        if (el !== combobox) el.setAttribute('data-open', 'false');
      });
      combobox.setAttribute('data-open', 'true');
      // 포커스 시 전체 표시
      options.forEach(function (opt) {
        opt.removeAttribute('data-hidden');
      });
    });

    input.addEventListener('input', function () {
      var query = input.value.toLowerCase();
      options.forEach(function (opt) {
        var text = opt.textContent.toLowerCase();
        if (text.indexOf(query) >= 0) {
          opt.removeAttribute('data-hidden');
        } else {
          opt.setAttribute('data-hidden', 'true');
        }
      });
    });

    combobox.addEventListener('click', function (e) {
      var option = e.target.closest('.proto-combobox-option');
      if (!option) return;
      // 기존 선택 해제
      options.forEach(function (opt) {
        opt.removeAttribute('data-selected');
      });
      option.setAttribute('data-selected', 'true');
      input.value = option.textContent;
      combobox.setAttribute('data-open', 'false');
    });
  });

  // 외부 클릭 닫기
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.proto-combobox')) {
      document.querySelectorAll('.proto-combobox[data-open="true"]').forEach(function (el) {
        el.setAttribute('data-open', 'false');
      });
    }
  });
})();

// === DateNavigator 달력 토글 ===
(function () {
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.proto-date-nav-toggle');
    if (!toggle) return;
    var navigator = toggle.closest('.proto-date-navigator');
    if (!navigator) return;
    // 배경 콘텐츠 내 토글은 무시
    if (navigator.closest('.page-todo-create-bg')) return;
    var isExpanded = navigator.getAttribute('data-expanded') === 'true';
    navigator.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
  });
})();

// === 필터 칩 ===
(function () {
  document.querySelectorAll('.proto-filter-chips').forEach(function (container) {
    var chips = container.querySelectorAll('.proto-filter-chip');
    // 필터링 대상: 같은 페이지 프레임 또는 패널 내의 카드들
    var parent = container.closest('.page-content') || container.closest('.page-interactive-panel') || container.parentElement;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        // 활성 칩 전환
        chips.forEach(function (c) {
          c.classList.remove('proto-filter-chip-active');
        });
        chip.classList.add('proto-filter-chip-active');

        var filter = chip.getAttribute('data-filter');
        var cards = parent.querySelectorAll('[data-category]');

        cards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  });
})();
