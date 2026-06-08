/* ============================================================
   N&C Reset Remodeling Corp — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Year ─────────────────────────────────────────────── */
  document.querySelectorAll('.current-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ── 2. Sticky Nav ───────────────────────────────────────── */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  /* ── 3. Hamburger / Mobile Menu ──────────────────────────── */
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 4. Active Nav Link ──────────────────────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === '') currentPage = 'index.html';

  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var page = href.split('#')[0].split('/').pop();
    if (page === currentPage || (currentPage === 'index.html' && (page === '' || page === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ── 5. Scroll Fade-In (IntersectionObserver) ────────────── */
  var fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

      fadeEls.forEach(function (el) { io.observe(el); });
    } else {
      fadeEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ── 6. Form Setup ───────────────────────────────────────── */
  function setupForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return;

    var successEl = form.closest('.form-card') ?
      form.closest('.form-card').querySelector('.form-success') :
      document.getElementById(formId + '-success');
    var submitBtn = form.querySelector('.btn-submit');

    /* Validate a single field and toggle error state */
    function validateField(field) {
      var group = field.closest('.form-group');
      if (!group) return field.checkValidity();
      var errMsg = group.querySelector('.error-msg');
      var ok = field.checkValidity();
      if (!ok) {
        field.classList.add('has-error');
        if (errMsg) errMsg.classList.add('show');
      } else {
        field.classList.remove('has-error');
        if (errMsg) errMsg.classList.remove('show');
      }
      return ok;
    }

    /* Live validation on blur */
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.classList.contains('has-error')) validateField(field);
      });
      field.addEventListener('change', function () {
        if (field.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validate all required fields */
      var allValid = true;
      form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });
      if (!allValid) {
        var firstErr = form.querySelector('.has-error');
        if (firstErr) firstErr.focus();
        return;
      }

      /* Submit */
      var origHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (result.ok) {
          form.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'block';
            successEl.focus();
          }
        } else {
          var errText = (result.data.errors || []).map(function (e) { return e.message; }).join(', ') || 'Something went wrong. Please try again.';
          alert('Error: ' + errText);
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHTML;
        }
      })
      .catch(function () {
        alert('Network error. Please try again or call us directly at (718) 788-9482.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHTML;
      });
    });
  }

  setupForm('careers-form');
  setupForm('contact-form');

  /* ── 7. Number Counter Animation ────────────────────────── */
  (function () {
    var counters = document.querySelectorAll('.stat-num, .big-num');
    if (!counters.length) return;

    /* Respect prefers-reduced-motion */
    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Parse "35+" → { num: 35, suffix: "+" }  /  "100%" → { num: 100, suffix: "%" } */
    function parse(text) {
      var m = text.trim().match(/^(\d+)(.*)/);
      return m ? { num: parseInt(m[1], 10), suffix: m[2] || '' } : null;
    }

    /* Ease-out quart — snappy start, smooth landing */
    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    function runCounter(el, target, suffix, duration) {
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(easeOut(p) * target) + suffix;
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;   /* exact final value */
          el.classList.add('count-done');     /* trigger pop */
        }
      }
      requestAnimationFrame(step);
    }

    /* Duration scales with the size of the number */
    function duration(num) {
      if (num >= 200) return 2200;
      if (num >= 50)  return 1600;
      return 1100;
    }

    if (reducedMotion) return; /* skip animation, keep static text */

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var val = parse(el.getAttribute('data-count'));
          if (!val) return;
          obs.unobserve(el);
          setTimeout(function () {
            runCounter(el, val.num, val.suffix, duration(val.num));
          }, 120);
        });
      }, { threshold: 0.6 });

      counters.forEach(function (el) {
        el.setAttribute('data-count', el.textContent.trim());
        obs.observe(el);
      });
    }
  }());

  /* ── 8. File Input Label ─────────────────────────────────── */
  var fileInput = document.getElementById('resume-file');
  var fileLabelText = document.getElementById('file-label-text');
  if (fileInput && fileLabelText) {
    fileInput.addEventListener('change', function () {
      fileLabelText.textContent = fileInput.files && fileInput.files[0]
        ? fileInput.files[0].name
        : 'Click to upload resume (PDF or Word — optional)';
    });
  }

})();
