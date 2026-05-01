/* ============================================================
 * SVG Icon Symbols + Checkbox Toggle
 * ============================================================ */
(function () {
  // SVG 심볼 정의
  var svgSymbols = ''
    + '<svg style="display:none">'
    +   '<defs>'
    +     '<symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M20 6 9 17l-5-5"/>'
    +     '</symbol>'
    +     '<symbol id="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M5 12h14"/><path d="M12 5v14"/>'
    +     '</symbol>'
    +     '<symbol id="icon-chevron-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="m15 18-6-6 6-6"/>'
    +     '</symbol>'
    +     '<symbol id="icon-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="m9 18 6-6-6-6"/>'
    +     '</symbol>'
    +     '<symbol id="icon-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
    +     '</symbol>'
    +     '<symbol id="icon-briefcase" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>'
    +     '</symbol>'
    +     '<symbol id="icon-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'
    +     '</symbol>'
    +     '<symbol id="icon-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'
    +     '</symbol>'
    +     '<symbol id="icon-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>'
    +     '</symbol>'
    +     '<symbol id="icon-alert-triangle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
    +     '</symbol>'
    +     '<symbol id="icon-circle-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
    +     '</symbol>'
    +     '<symbol id="icon-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<path d="m6 9 6 6 6-6"/>'
    +     '</symbol>'
    +     '<symbol id="icon-list-todo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +       '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><line x1="13" x2="21" y1="6" y2="6"/><line x1="13" x2="21" y1="12" y2="12"/><line x1="13" x2="21" y1="18" y2="18"/>'
    +     '</symbol>'
    +   '</defs>'
    + '</svg>';

  document.body.insertAdjacentHTML('beforeend', svgSymbols);

  // Checkbox 토글 로직
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.proto-checkbox:not(.proto-checkbox-disabled)').forEach(function (cb) {
      function toggle() {
        var isChecked = cb.getAttribute('aria-checked') === 'true';
        cb.setAttribute('aria-checked', String(!isChecked));
        cb.classList.toggle('proto-checkbox-checked');
        var box = cb.querySelector('.proto-checkbox-box');
        if (!isChecked) {
          box.innerHTML = '<svg width="14" height="14"><use href="#icon-check"></use></svg>';
        } else {
          box.innerHTML = '';
        }
      }
      cb.addEventListener('click', toggle);
      cb.addEventListener('keydown', function (e) {
        if (e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  });

  // 아코디언 토글 로직 (Epic + TodoItem 공용)
  document.addEventListener('click', function (e) {
    // Epic 아코디언
    var header = e.target.closest('.proto-epic-accordion-header');
    if (header) {
      var item = header.closest('.proto-epic-accordion-item');
      if (item) {
        var isExpanded = item.getAttribute('data-expanded') === 'true';
        item.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
      }
      return;
    }
    // TodoItem 아코디언 — chevron 또는 title 영역 클릭
    var chevron = e.target.closest('.proto-todo-item-accordion-chevron');
    var todoItem = e.target.closest('.proto-todo-item-accordion > .proto-todo-item');
    var trigger = chevron || todoItem;
    if (!trigger) return;
    // 체크박스 클릭은 제외
    if (e.target.closest('.proto-checkbox')) return;
    var accordion = trigger.closest('.proto-todo-item-accordion');
    if (!accordion) return;
    var isExpanded = accordion.getAttribute('data-expanded') === 'true';
    accordion.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
  });

  // IssueCard 아코디언 토글
  document.addEventListener('click', function (e) {
    var chevron = e.target.closest('.proto-issue-card-accordion-chevron');
    var cardTodoItem = e.target.closest('.proto-issue-card-accordion > .proto-todo-item');
    var trigger = chevron || cardTodoItem;
    if (!trigger) return;
    if (e.target.closest('.proto-checkbox')) return;
    var accordion = trigger.closest('.proto-issue-card-accordion');
    if (!accordion) return;
    var isExpanded = accordion.getAttribute('data-expanded') === 'true';
    accordion.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
  });
})();
