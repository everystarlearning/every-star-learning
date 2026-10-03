/* The existing Analytics property, shared by all six public pages.
   Local previews are excluded. Etsy events contain fixed labels, never child details. */
(function () {
  'use strict';
  if (!['everystarlearning.co.uk', 'www.everystarlearning.co.uk'].includes(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-QJ55EGXKBS');
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=G-QJ55EGXKBS';
  document.head.appendChild(tag);
  var pageNames = {
    '/': 'home', '/index.html': 'home', '/about.html': 'about', '/faq.html': 'faq',
    '/adhd-learning-resources.html': 'adhd_resources',
    '/autism-learning-resources.html': 'autism_resources',
    '/send-home-education-resources.html': 'send_home_education'
  };
  function recordEtsyClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href); } catch (_) { return; }
    if (url.hostname !== 'www.etsy.com' && url.hostname !== 'etsy.com') return;
    var placement = link.dataset.etsyLocation || (link.closest('.age-card') ? 'age_group' : link.closest('#packs') ? 'pack_details' : 'page_cta');
    window.gtag('event', 'etsy_click', {
      page_name: pageNames[location.pathname] || 'other',
      cta_location: placement,
      link_domain: 'etsy.com',
      transport_type: 'beacon'
    });
  }
  document.addEventListener('click', recordEtsyClick);
  document.addEventListener('auxclick', recordEtsyClick);
})();
