/**
 * auth.js - 금융상품 가이드 카카오 로그인
 * (cha-biz-ai-v5 패턴 기반, 서버 DB 없이 localStorage만 사용)
 */
(function () {
  'use strict';

  var KAKAO_JS_KEY = 'fc0a1313d895b1956f3830e5bf14307b';
  var USER_KEY = 'finmarket_user';
  var _loginInProgress = false;

  // ── 세션 관리 ──
  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) { return null; }
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearUser() {
    localStorage.removeItem(USER_KEY);
  }

  // ── 카카오 로그인 ──
  function kakaoLogin() {
    if (_loginInProgress) return;
    _loginInProgress = true;

    var btn = document.getElementById('kakao-login-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '로그인 중...';
    }

    // 기존 토큰 정리
    try { Kakao.Auth.setAccessToken(null); } catch (e) {}

    // 45초 타임아웃
    var timeout = setTimeout(function () {
      _loginInProgress = false;
      if (btn) { btn.disabled = false; btn.textContent = '카카오 로그인'; }
      alert('로그인 시간이 초과되었습니다. 다시 시도해 주세요.');
    }, 45000);

    Kakao.Auth.login({
      success: function () {
        clearTimeout(timeout);
        proceedWithKakaoUser(btn);
      },
      fail: function (err) {
        clearTimeout(timeout);
        _loginInProgress = false;
        console.error('Kakao login failed:', err);
        if (btn) { btn.disabled = false; btn.textContent = '카카오 로그인'; }
      }
    });
  }

  function proceedWithKakaoUser(resetBtn) {
    Kakao.API.request({
      url: '/v2/user/me',
      success: function (res) {
        var nickname = (res.kakao_account && res.kakao_account.profile && res.kakao_account.profile.nickname) || '사용자';
        var kakaoId = res.id;

        var user = { kakaoId: kakaoId, name: nickname };
        saveUser(user);
        onLoginSuccess(user);
        _loginInProgress = false;
      },
      fail: function (err) {
        console.error('Kakao user info error:', err);
        _loginInProgress = false;
        if (resetBtn) { resetBtn.disabled = false; resetBtn.textContent = '카카오 로그인'; }
      }
    });
  }

  // ── 게스트 모드 ──
  function guestLogin() {
    var user = { kakaoId: null, name: '게스트' };
    saveUser(user);
    onLoginSuccess(user);
  }

  // ── 로그인 성공 처리 ──
  function onLoginSuccess(user) {
    closeLoginModal();
    updateUI(user);
    enableAIFeatures();
  }

  // ── 로그아웃 ──
  function logout() {
    try { Kakao.Auth.logout(function () {}); } catch (e) {}
    clearUser();
    disableAIFeatures();
    showLoginModal();
    updateUI(null);
  }

  // ── UI 업데이트 ──
  function updateUI(user) {
    var userBar = document.getElementById('userBar');
    var badge = document.getElementById('user-badge');
    if (user) {
      if (badge) badge.textContent = user.name;
      if (userBar) userBar.style.display = 'flex';
    } else {
      if (userBar) userBar.style.display = 'none';
    }
  }

  // ── AI 기능 게이트 ──
  function enableAIFeatures() {
    var panel = document.getElementById('chatPanel');
    if (panel) panel.classList.remove('locked');
    // 모드 탭 활성화
    document.querySelectorAll('.mode-tab').forEach(function (t) { t.classList.remove('disabled'); });
  }

  function disableAIFeatures() {
    var panel = document.getElementById('chatPanel');
    if (panel) panel.classList.add('locked');
    document.querySelectorAll('.mode-tab').forEach(function (t) { t.classList.add('disabled'); });
  }

  // ── 로그인 모달 ──
  function showLoginModal() {
    var modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('active');
      // 로그인 버튼 상태 리셋
      var btn = document.getElementById('kakao-login-btn');
      if (btn) { btn.disabled = true; btn.textContent = '카카오 로그인'; }
      // 체크박스 리셋
      document.querySelectorAll('#login-modal input[type="checkbox"]').forEach(function (c) {
        if (!c.disabled) c.checked = false;
      });
    }
  }

  function closeLoginModal() {
    var modal = document.getElementById('login-modal');
    if (modal) modal.classList.remove('active');
  }

  // ── 동의 체크박스 ──
  function setupConsent() {
    var allBox = document.getElementById('consent-all');
    var reqBoxes = document.querySelectorAll('.consent-req:not([disabled])');
    var optBoxes = document.querySelectorAll('.consent-opt');
    var allChecks = [].concat(Array.from(reqBoxes), Array.from(optBoxes));
    var kakaoBtn = document.getElementById('kakao-login-btn');

    function updateState() {
      var allReqChecked = Array.from(reqBoxes).every(function (c) { return c.checked; });
      if (kakaoBtn) kakaoBtn.disabled = !allReqChecked;
      if (allBox) allBox.checked = allChecks.every(function (c) { return c.checked; });
    }

    if (allBox) {
      allBox.addEventListener('change', function () {
        allChecks.forEach(function (c) { c.checked = allBox.checked; });
        updateState();
      });
    }
    allChecks.forEach(function (c) { c.addEventListener('change', updateState); });

    // 상세보기 토글
    var detail = document.getElementById('consent-detail-1');
    if (detail) {
      var detailLabel = detail.previousElementSibling;
      detail.style.display = 'none';
      if (detailLabel) {
        detailLabel.addEventListener('click', function (e) {
          if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
            detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
          }
        });
      }
    }
  }

  // ── 초기화 ──
  function init() {
    // Kakao SDK 초기화
    if (window.Kakao && !Kakao.isInitialized()) {
      Kakao.init(KAKAO_JS_KEY);
    }

    setupConsent();

    // 버튼 이벤트
    var kakaoBtn = document.getElementById('kakao-login-btn');
    if (kakaoBtn) kakaoBtn.addEventListener('click', kakaoLogin);

    var guestBtn = document.getElementById('login-guest-btn');
    if (guestBtn) guestBtn.addEventListener('click', guestLogin);

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // 기존 세션 확인
    var user = getStoredUser();
    if (user) {
      onLoginSuccess(user);
    } else {
      disableAIFeatures();
      setTimeout(showLoginModal, 1500);
    }
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역 노출
  window.finmarketAuth = {
    logout: logout,
    getUser: getStoredUser
  };
})();
