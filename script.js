/* ═══════════════════════════════════════════════════════════════
   SURGE POWER SERVICES, script.js
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ── Scroll: add .scrolled to header ──────────────────────────
  const header = document.getElementById('site-header');

  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // ── Desktop Dropdown: hover intent ───────────────────────────
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  dropdownItems.forEach(function (item) {
    const dropdown = item.querySelector('.nav-dropdown');
    let leaveTimer;

    item.addEventListener('mouseenter', function () {
      clearTimeout(leaveTimer);
      // Close all others
      dropdownItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('dropdown-open');
          const d = other.querySelector('.nav-dropdown');
          if (d) d.classList.remove('open');
        }
      });
      item.classList.add('dropdown-open');
      if (dropdown) dropdown.classList.add('open');
    });

    item.addEventListener('mouseleave', function () {
      leaveTimer = setTimeout(function () {
        item.classList.remove('dropdown-open');
        if (dropdown) dropdown.classList.remove('open');
      }, 120);
    });

    if (dropdown) {
      dropdown.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer);
      });
      dropdown.addEventListener('mouseleave', function () {
        leaveTimer = setTimeout(function () {
          item.classList.remove('dropdown-open');
          dropdown.classList.remove('open');
        }, 120);
      });
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item.has-dropdown')) {
      dropdownItems.forEach(function (item) {
        item.classList.remove('dropdown-open');
        const d = item.querySelector('.nav-dropdown');
        if (d) d.classList.remove('open');
      });
    }
  });

  // ── Mobile Hamburger ──────────────────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('nav-drawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }

  // ── Mobile Drawer Sub-menus ───────────────────────────────────
  const drawerToggles = document.querySelectorAll('.drawer-toggle');

  drawerToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      const targetId = toggle.getAttribute('data-target');
      const parent   = toggle.closest('.drawer-item');
      const sub      = document.getElementById(targetId);

      // Close siblings
      drawerToggles.forEach(function (other) {
        if (other !== toggle) {
          other.closest('.drawer-item').classList.remove('sub-open');
        }
      });

      parent.classList.toggle('sub-open');
    });
  });

  // ── Hero Video ────────────────────────────────────────────────
  const video   = document.getElementById('hero-video');
  const playBtn = document.getElementById('hero-play-btn');

  if (video && playBtn) {
    // Attempt autoplay on load
    video.addEventListener('canplay', function () {
      if (video.paused) {
        video.play().catch(function () {
          playBtn.classList.remove('playing');
          playBtn.setAttribute('aria-label', 'Play video');
        });
      }
    });

    video.addEventListener('play', function () {
      playBtn.classList.add('playing');
      playBtn.setAttribute('aria-label', 'Pause video');
    });

    video.addEventListener('pause', function () {
      playBtn.classList.remove('playing');
      playBtn.setAttribute('aria-label', 'Play video');
    });

    // Smooth stutter recovery
    let bufferCount = 0;

    video.addEventListener('stalled', function () {
      bufferCount++;
      if (bufferCount > 2 && video.playbackRate > 0.95) {
        video.playbackRate = 0.98;
      }
    });

    video.addEventListener('canplaythrough', function () {
      video.playbackRate = 1;
      bufferCount = 0;
    });
  }

});

// ── Global: Toggle Hero Video (called from onclick) ──────────────
function toggleHeroVideo() {
  const video   = document.getElementById('hero-video');
  const playBtn = document.getElementById('hero-play-btn');

  if (!video || !playBtn) return;

  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

// ── Forms: shared validation + accessible errors + AJAX submit ─────
// One engine for every Netlify form on the site (14 pages). Submit
// stays enabled; errors are written text tied to the field with
// aria-invalid/aria-describedby, not just a red border. Success
// reveals the aria-live confirmation and moves focus to it.
(function () {
  var forms = document.querySelectorAll('form[data-netlify]');

  function validators(el) {
    var v = el.value.trim();
    if (!v) {
      return el.tagName === 'SELECT' ? 'Choose an option' : 'This field is required';
    }
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return 'Enter a valid email address';
    }
    if (el.type === 'tel' && v.replace(/\D/g, '').length !== 10) {
      return 'Enter a 10 digit phone number';
    }
    return '';
  }

  function errorHost(el) {
    var wrap = el.closest('.contact-select-wrap');
    return wrap || el;
  }

  function setError(form, el, msg) {
    var id = (form.id || 'form') + '-err-' + (el.name || 'field');
    var host = errorHost(el);
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        err.id = id;
        host.parentNode.insertBefore(err, host.nextSibling);
      }
      err.textContent = msg;
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', id);
      el.classList.add('invalid');
    } else {
      if (err) err.parentNode.removeChild(err);
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
      el.classList.remove('invalid');
    }
  }

  forms.forEach(function (form) {
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    var container = form.parentElement;
    var successEl = container ? container.querySelector('.contact-success') : null;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;

    form.querySelectorAll('input[type="tel"]').forEach(function (tel) {
      tel.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
      });
    });

    fields.forEach(function (el) {
      el.addEventListener('blur', function () {
        setError(form, el, validators(el));
      });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') && !validators(el)) setError(form, el, '');
      });
      el.addEventListener('change', function () {
        if (el.getAttribute('aria-invalid') && !validators(el)) setError(form, el, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) {
        var msg = validators(el);
        setError(form, el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) {
        firstBad.focus();
        return;
      }
      var label = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
      }
      var data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'flex';
            successEl.setAttribute('tabindex', '-1');
            successEl.focus();
          }
        } else {
          throw new Error('bad status');
        }
      }).catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = label;
        }
        alert('Something went wrong. Please try again.');
      });
    });
  });
})();

// ── Hero video: pause control + reduced motion ─────────────────────
(function () {
  var video = document.getElementById('hero-video');
  var btn = document.getElementById('hero-media-toggle');
  if (!video || !btn) return;
  function setState(playing) {
    btn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    btn.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    btn.setAttribute('aria-pressed', playing ? 'false' : 'true');
  }
  btn.addEventListener('click', function () {
    if (video.paused) {
      video.play();
      setState(true);
    } else {
      video.pause();
      setState(false);
    }
  });
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
    setState(false);
  }
})();

(function () {
  'use strict';

  // Use locations defined in index.html (window.SURGE_PROJECTS), or fall back to defaults.
  var projectLocations = (window.SURGE_PROJECTS && window.SURGE_PROJECTS.length)
    ? window.SURGE_PROJECTS.map(function (p) {
        var parts = p.city.split(', ');
        return { city: parts[0], state: parts[1] || '', lat: p.lat, lng: p.lng, project: p.name };
      })
    : [
        { city: 'Lancaster',    state: 'PA', lat: 40.0379, lng: -76.3055, project: 'Commercial Electrical: Distribution Center' },
        { city: 'York',         state: 'PA', lat: 39.9626, lng: -76.7277, project: 'Industrial HVAC: Manufacturing Plant' },
        { city: 'Baltimore',    state: 'MD', lat: 39.2904, lng: -76.6122, project: 'Commercial Plumbing: Retail Center' },
        { city: 'Harrisburg',   state: 'PA', lat: 40.2732, lng: -76.8867, project: 'Commercial Electrical: Government Building' },
        { city: 'Reading',      state: 'PA', lat: 40.3356, lng: -75.9269, project: 'Industrial Electrical: Manufacturing Facility' },
        { city: 'Wilmington',   state: 'DE', lat: 39.7447, lng: -75.5484, project: 'Commercial Electrical: Office Complex' },
        { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, project: 'Manpower & Labor: Construction Site' },
        { city: 'Trenton',      state: 'NJ', lat: 40.2171, lng: -74.7429, project: 'Commercial HVAC: Medical Facility' }
      ];

  function buildMarkerSVG(color) {
    var svg = '<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">' +
      '<path fill="' + color + '" stroke="#FFFFFF" stroke-width="1.5" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.734.354 3.396.992 4.922L12.5 41l11.508-23.578c.638-1.526.992-3.188.992-4.922C25 5.596 19.404 0 12.5 0z"/>' +
      '<circle fill="#FFFFFF" cx="12.5" cy="12.5" r="5.5"/></svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  function makeIcon(color) {
    return L.icon({
      iconUrl:     buildMarkerSVG(color),
      iconSize:    [25, 41],
      iconAnchor:  [12.5, 41],
      popupAnchor: [0, -41],
      shadowUrl:   'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize:  [41, 41],
      shadowAnchor:[12, 41]
    });
  }

  function initMap() {
    var mapDiv = document.getElementById('surge-map-container-unique');
    if (!mapDiv || typeof L === 'undefined') return;

    var surgeMap = L.map('surge-map-container-unique', {
      center: [39.8, -76.5],
      zoom: 7,
      scrollWheelZoom: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(surgeMap);

    var defaultIcon = makeIcon('#BF1E2E');
    var hoverIcon   = makeIcon('#1F272E');
    var listEl      = document.getElementById('map-project-list');
    var markers     = [];

    projectLocations.forEach(function (loc, i) {
      // List item
      if (listEl) {
        var li = document.createElement('li');
        li.setAttribute('data-index', i);
        li.innerHTML =
          '<p class="map-list-name">' + loc.city + ', ' + loc.state + '</p>' +
          '<p class="map-list-detail">' + loc.project + '</p>';
        listEl.appendChild(li);
      }

      // Marker
      var marker = L.marker([loc.lat, loc.lng], { icon: defaultIcon }).addTo(surgeMap);
      markers.push(marker);

      var tipHtml =
        '<div class="map-popup-city">' + loc.city + ', ' + loc.state + '</div>' +
        '<div class="map-popup-project">' + loc.project + '</div>';

      marker.bindTooltip(tipHtml, { direction: 'top', offset: [0, -10] });
      marker.bindPopup(tipHtml);

      marker.on('mouseover', function () { this.setIcon(hoverIcon); });
      marker.on('mouseout',  function () { this.setIcon(defaultIcon); });
      marker.on('popupopen',  function () { this.closeTooltip(); this.unbindTooltip(); });
      marker.on('popupclose', function () { this.bindTooltip(tipHtml, { direction: 'top', offset: [0, -10] }); });
    });

    // List item hover syncs with map
    if (listEl) {
      listEl.addEventListener('mouseover', function (e) {
        var li = e.target.closest('li');
        if (!li) return;
        var idx = parseInt(li.getAttribute('data-index'));
        markers[idx].setIcon(hoverIcon);
        markers[idx].openTooltip();
        document.querySelectorAll('#map-project-list li').forEach(function (el) { el.classList.remove('active'); });
        li.classList.add('active');
      });
      listEl.addEventListener('mouseout', function (e) {
        var li = e.target.closest('li');
        if (!li) return;
        var idx = parseInt(li.getAttribute('data-index'));
        markers[idx].setIcon(defaultIcon);
        markers[idx].closeTooltip();
      });
      listEl.addEventListener('click', function (e) {
        var li = e.target.closest('li');
        if (!li) return;
        var idx = parseInt(li.getAttribute('data-index'));
        surgeMap.setView([projectLocations[idx].lat, projectLocations[idx].lng], 10, { animate: true });
        markers[idx].openPopup();
      });
    }

    // Fit all markers
    var group = L.featureGroup(markers);
    surgeMap.fitBounds(group.getBounds().pad(0.15));

    setTimeout(function () { surgeMap.invalidateSize(true); }, 400);
  }

  // Wait for Leaflet to be available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initMap, 800);
    });
  } else {
    setTimeout(initMap, 800);
  }
})();

// ── Shared volume across all videos with controls ─────────────────
// If a visitor lowers the volume (or mutes) on one testimonial video,
// every other video follows, and the choice is remembered across
// pages via localStorage. The muted background hero video is not
// affected (no controls attribute).
(function () {
  var KEY = 'sps-video-volume';
  var vids = Array.prototype.slice.call(document.querySelectorAll('video[controls]'));
  if (!vids.length) return;

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (saved && typeof saved.volume === 'number') {
    vids.forEach(function (v) {
      v.volume = Math.min(1, Math.max(0, saved.volume));
      v.muted = !!saved.muted;
    });
  }

  var syncing = false;
  vids.forEach(function (v) {
    v.addEventListener('volumechange', function () {
      if (syncing) return;
      syncing = true;
      vids.forEach(function (o) {
        if (o === v) return;
        if (o.volume !== v.volume) o.volume = v.volume;
        if (o.muted !== v.muted) o.muted = v.muted;
      });
      try { localStorage.setItem(KEY, JSON.stringify({ volume: v.volume, muted: v.muted })); } catch (e) {}
      syncing = false;
    });
  });
})();

// ── Only one video plays at a time ─────────────────────────────────
// Starting any testimonial video pauses whichever one was playing,
// so two crew members never talk over each other.
(function () {
  var vids = Array.prototype.slice.call(document.querySelectorAll('video[controls]'));
  if (vids.length < 2) return;
  vids.forEach(function (v) {
    v.addEventListener('play', function () {
      vids.forEach(function (o) {
        if (o !== v && !o.paused) o.pause();
      });
    });
  });
})();

// ── Expandable "How it Works" steps ────────────────────────────────
// Unified boxed process steps: click/tap/Enter opens the step and
// reveals its description (same text the page's HowTo schema carries).
(function () {
  var heads = document.querySelectorAll('.pstep-q');
  if (!heads.length) return;
  heads.forEach(function (q) {
    var li = q.parentElement;
    function toggle() {
      var open = li.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    q.addEventListener('click', toggle);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
})();
