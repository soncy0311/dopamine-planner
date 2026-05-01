/* ============================================================
 * Sidebar — 동적 생성 + 활성 링크 감지
 * ============================================================ */
(function () {
  var path = location.pathname;

  // 현재 페이지 판별
  var page = 'index';
  if (path.indexOf('/pages/tokens.html') !== -1) page = 'tokens';
  else if (path.indexOf('/pages/icons.html') !== -1) page = 'icons';
  else if (path.indexOf('/pages/atoms.html') !== -1) page = 'atoms';
  else if (path.indexOf('/pages/molecules.html') !== -1) page = 'molecules';
  else if (path.indexOf('/pages/organisms.html') !== -1) page = 'organisms';
  else if (path.indexOf('/pages/page-prototypes-desktop.html') !== -1) page = 'page-prototypes-desktop';
  else if (path.indexOf('/pages/page-prototypes.html') !== -1) page = 'page-prototypes';

  // pages/ 하위인지에 따라 경로 접두사 결정
  var isSubPage = page !== 'index';
  var prefix = isSubPage ? '../' : './';
  var pagesPrefix = isSubPage ? './' : './pages/';

  function link(href, label, key) {
    var cls = 'proto-sidebar-link';
    if (key === page) cls += ' proto-sidebar-link--active';
    return '<a class="' + cls + '" href="' + href + '">' + label + '</a>';
  }

  var html = ''
    + '<aside class="proto-sidebar">'
    +   '<div class="proto-sidebar-header">'
    +     '<div class="proto-sidebar-header-title">Design System</div>'
    +     '<div class="proto-sidebar-header-subtitle">Prototype</div>'
    +   '</div>'
    +   '<nav class="proto-sidebar-nav">'
    +     link(prefix + 'index.html', 'Overview', 'index')
    +     '<div class="proto-sidebar-group">'
    +       '<div class="proto-sidebar-group-label">Foundation</div>'
    +       link(pagesPrefix + 'tokens.html', '디자인 토큰', 'tokens')
    +       link(pagesPrefix + 'icons.html', '아이콘 시스템', 'icons')
    +     '</div>'
    +     '<div class="proto-sidebar-group">'
    +       '<div class="proto-sidebar-group-label">Components</div>'
    +       link(pagesPrefix + 'atoms.html', 'Atoms', 'atoms')
    +       link(pagesPrefix + 'molecules.html', 'Molecules', 'molecules')
    +       link(pagesPrefix + 'organisms.html', 'Organisms', 'organisms')
    +     '</div>'
    +     '<div class="proto-sidebar-group">'
    +       '<div class="proto-sidebar-group-label">Pages</div>'
    +       link(pagesPrefix + 'page-prototypes.html', '모바일 프로토타입', 'page-prototypes')
    +       link(pagesPrefix + 'page-prototypes-desktop.html', '데스크톱 프로토타입', 'page-prototypes-desktop')
    +     '</div>'
    +   '</nav>'
    + '</aside>';

  document.body.insertAdjacentHTML('afterbegin', html);
})();
