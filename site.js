/* Consent-first website analytics. No Google request before an affirmative choice.
   Staff browsers and local previews never send analytics. */
(function () {
  'use strict';
  var consentKey = 'esl_analytics_consent_v1';
  var staffKey = 'esl_staff_browser_v1';
  var maxAge = 180 * 24 * 60 * 60 * 1000;
  var measurement = 'G-QJ55EGXKBS';
  var production = ['everystarlearning.co.uk', 'www.everystarlearning.co.uk'].includes(location.hostname);
  var staffPage = location.pathname === '/staff-browser.html';
  var loaded = false, choice = readChoice();
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function readChoice() {
    try {
      var c = JSON.parse(read(consentKey));
      return c && ['granted','denied'].includes(c.value) && typeof c.time === 'number' && c.time <= Date.now() && Date.now() - c.time < maxAge ? c.value : null;
    } catch (_) { return null; }
  }
  function isStaff() { return read(staffKey) === 'on'; }
  function permitted() { return choice === 'granted'; }
  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(function (item) {
      var name = item.trim().split('=')[0];
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) return;
      ['', location.hostname, '.' + location.hostname, 'everystarlearning.co.uk', '.everystarlearning.co.uk'].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    });
  }
  function startAnalytics() {
    if (loaded || !production || staffPage || isStaff() || !permitted()) return;
    loaded = true;
    window['ga-disable-' + measurement] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    window.gtag('consent', 'update', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', measurement, {allow_google_signals:false, allow_ad_personalization_signals:false, cookie_expires:15552000});
    var tag = document.createElement('script'); tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurement;
    document.head.appendChild(tag);
  }
  var panel, choiceOpener;
  function showChoice(event) {
    if (!panel) return;
    choiceOpener = event && event.currentTarget;
    panel.hidden = false;
    panel.querySelector('h2').focus();
  }
  function choose(value) {
    choice = value;
    write(consentKey, JSON.stringify({value:value, time:Date.now()}));
    panel.hidden = true;
    if (choiceOpener && choiceOpener.isConnected) choiceOpener.focus({preventScroll:true});
    choiceOpener = null;
    if (value === 'granted') startAnalytics();
    else {
      window['ga-disable-' + measurement] = true;
      if (loaded) window.gtag('consent', 'update', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
      removeAnalyticsCookies();
      if (loaded) location.reload();
    }
  }
  function initialise() {
    panel = document.createElement('section');
    panel.className = 'cookie-panel'; panel.setAttribute('aria-labelledby','cookie-title');
    panel.hidden = Boolean(choice) || isStaff() || staffPage;
    panel.innerHTML = '<div><h2 id="cookie-title" tabindex="-1">A choice about cookies</h2><p>May we use Google Analytics to understand visits and clicks to our Etsy shop? Optional analytics stays off unless you accept. Shopping works either way. <a href="privacy.html">Privacy &amp; cookies</a></p></div><div class="cookie-actions"><button type="button" data-consent="denied">Reject analytics</button><button type="button" data-consent="granted">Accept analytics</button></div>';
    document.body.appendChild(panel);
    panel.querySelectorAll('[data-consent]').forEach(function(b) { b.addEventListener('click',function(){choose(b.dataset.consent);}); });
    document.querySelectorAll('[data-cookie-settings]').forEach(function(b) { b.addEventListener('click',showChoice); });
    document.querySelectorAll('[data-staff-setting]').forEach(function(b) { b.addEventListener('click',function(){
      var enabled = b.dataset.staffSetting === 'on';
      if (!write(staffKey,enabled ? 'on' : 'off')) {
        document.getElementById('staff-status').textContent = 'This browser is blocking local storage. The staff setting could not be saved. Keep analytics rejected here.'; return;
      }
      if (enabled) { window['ga-disable-' + measurement] = true; removeAnalyticsCookies(); }
      renderStaffStatus();
    }); });
    renderStaffStatus();
    if (!permitted() || isStaff()) { window['ga-disable-' + measurement] = true; removeAnalyticsCookies(); }
    startAnalytics();
  }
  function renderStaffStatus() {
    var status = document.getElementById('staff-status');
    if (status) status.textContent = isStaff() ? 'Staff mode is ON. This browser sends no Google Analytics visits or Etsy clicks.' : 'Staff mode is OFF. Analytics follows the cookie choice in this browser.';
  }
  var pageNames = {
    '/space-study-workbook-ages-5-11.html': 'space_study_workbook_ages_5_11',
    '/space-activity-workbook-ages-3-5.html': 'space_activity_workbook_ages_3_5',
    '/printable-number-cards-1-20.html': 'printable_number_cards_1_20',
    '/printable-blending-word-cards.html': 'printable_blending_word_cards',
    '/printable-phonics-cards.html': 'printable_phonics_cards',
    '/supermarket-pretend-play-printable.html': 'supermarket_pretend_play_printable',
    '/cafe-pretend-play-printable.html': 'cafe_pretend_play_printable',
    '/space-activity-printables.html': 'space_activity_printables',
    '/pretend-play-printables.html': 'pretend_play_printables',
    '/phonics-number-printables.html': 'phonics_number_printables',
    '/gingerbread-house-printable.html': 'gingerbread_house_printable',
    '/christmas-winter-printables.html': 'christmas_winter', '/communication-visual-support.html': 'communication', '/learning-printables.html': 'learning_printables', '/sentence-builder-pencil-case.html': 'sentence_builder', '/shop.html': 'shop', '/packs.html': 'packs', '/': 'home', '/index.html': 'home', '/about.html': 'about', '/faq.html': 'faq',
    '/adhd-learning-resources.html': 'adhd_resources',
    '/autism-learning-resources.html': 'autism_resources',
    '/send-home-education-resources.html': 'send_home_education'
  };
  function recordEtsyClick(event) {
    if (!loaded || !permitted() || isStaff()) return;
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href); } catch (_) { return; }
    if (url.hostname !== 'www.etsy.com' && url.hostname !== 'etsy.com') return;
    var placement = link.dataset.etsyLocation || (link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : link.closest('.product') ? 'product_card' : link.closest('.hero') ? 'hero' : link.closest('.review-band') ? 'review' : link.closest('.seasonal') ? 'seasonal' : link.closest('.closing') ? 'closing' : 'page_cta');
    var product = url.pathname.match(/\/listing\/(\d+)/);
    var details = {
      page_name: pageNames[location.pathname] || 'other',
      cta_location: placement,
      link_domain: 'etsy.com',
      product_id: product ? product[1] : 'shop',
      transport_type: 'beacon'
    };
    window.gtag('event', 'etsy_click', details);
    // Separate purchase-intent clicks from shop/review browsing; neither is a sale.
    window.gtag('event', product ? 'etsy_product_click' : url.hash === '#reviews' ? 'etsy_review_click' : 'etsy_shop_click', details);
  }
  window.addEventListener('storage', function (event) {
    if (event.key === consentKey || event.key === staffKey || event.key === null) {
      window['ga-disable-' + measurement] = true;
      location.reload();
    }
  });
  document.addEventListener('click', recordEtsyClick);
  document.addEventListener('auxclick', recordEtsyClick);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initialise); else initialise();
})();
