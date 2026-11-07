document.getElementById('year').textContent = new Date().getFullYear();

// ── Mobile nav toggle ──────────────────────────────────────
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', function() {
    var isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// ── Email subject: which page + which button opened the form ──
function getPageName() {
  var active = document.querySelector('#navLinks .is-active a');
  if (active) return active.textContent.replace(/\s+/g, ' ').trim();
  var file = location.pathname.split('/').pop().replace('.html', '');
  return file ? file.charAt(0).toUpperCase() + file.slice(1) : 'Home';
}

function setEmailSubject(source) {
  var subjectInput = document.querySelector('#contactForm input[name="subject"]');
  if (subjectInput) {
    subjectInput.value = 'Website enquiry - ' + getPageName() + ' page - ' + source;
  }
}

// "email me" / "contact the artist" links within page text
document.querySelectorAll('.email-link').forEach(function(el) {
  el.addEventListener('click', function() {
    setEmailSubject('"' + el.textContent.replace(/\s+/g, ' ').trim() + '" link in page text');
  }, true);
});

document.querySelectorAll('.forSale-btn').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // Pre-fill message with painting title and item type (original vs print)
    var section = el.closest('section');
    if (section) {
      var h2 = section.querySelector('h2');
      if (h2) {
        var h2Clone = h2.cloneNode(true);
        var shipNameEl = h2Clone.querySelector('.heading-ship-name');
        if (shipNameEl) shipNameEl.remove();
        var title = h2Clone.textContent.trim();

        var buttonText = el.textContent.trim().toLowerCase();
        var itemType = buttonText.indexOf('print') !== -1 ? 'print' :
          buttonText.indexOf('original') !== -1 ? 'painting' :
          'painting or print';

        setEmailSubject('"' + el.textContent.trim() + '" button: ' + title);

        document.getElementById('cf-message').value = 'Regarding the ' + title + ' ' + itemType + '.\n\nPlease add your message here...';
      }
    }

    var sheet = document.getElementById('contactOverlay');
    if (sheet.classList.contains('is-open')) {
      closeContact();
    } else {
      openContact();
    }
  }, true);
});

// ── Contact modal ──────────────────────────────────────────
var overlay = document.getElementById('contactOverlay');
var openBtn = document.getElementById('contactOpenBtn');
var closeBtn = document.getElementById('contactCloseBtn');
var form = document.getElementById('contactForm');
var success = document.getElementById('modalSuccess');
var formHeading = document.getElementById('contact-heading');
var formHiMsg = document.getElementById('contact-hi-msg');

function openContact() {
    overlay.classList.add('is-open');
}

var autoCloseTimer = null;

// Put the form back to its starting state (after a message has been sent)
function resetContactForm() {
    var submitBtn = form.querySelector('.modal-submit');
    form.reset();
    form.style.display = '';
    formHeading.style.display = '';
    formHiMsg.style.display = '';
    success.classList.remove('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
}

function closeContact() {
    overlay.classList.remove('is-open');

    // If the thank-you message is showing, reset the form once the close animation finishes,
    // whether it was closed by the X, Escape, clicking outside, or the auto-close timer
    if (success.classList.contains('visible')) {
        clearTimeout(autoCloseTimer);
        setTimeout(resetContactForm, 300);
    }
}

openBtn.addEventListener('click', function(e) {
    // Only a real click on the header button counts as "header".
    // (The "email me" links trigger this button in code, so isTrusted is false for those.)
    if (e.isTrusted) setEmailSubject('header Contact button');
    openContact();
});
closeBtn.addEventListener('click', closeContact);

overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeContact();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeContact();
});

function validate(groupId, fieldId, checkFn) {
    var group = document.getElementById(groupId);
    var field = document.getElementById(fieldId);
    var ok = checkFn(field.value.trim());
    group.classList.toggle('invalid', !ok);
    return ok;
}

function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

['cf-name', 'cf-email', 'cf-message'].forEach(function(fieldId) {
    var groupId = 'group-' + fieldId.replace('cf-', '');
    document.getElementById(fieldId).addEventListener('input', function() {
        document.getElementById(groupId).classList.remove('invalid');
    });
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var validName = validate('group-name', 'cf-name', function(v) { return v.length > 0; });
    var validEmail = validate('group-email', 'cf-email', isValidEmail);
    var validMessage = validate('group-message', 'cf-message', function(v) { return v.length > 0; });

    if (!validName || !validEmail || !validMessage) return;

    var submitBtn = form.querySelector('.modal-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
        var data = new FormData(form);
        data.append('access_key', 'd2d8e837-019b-4239-9ff1-48ebb0515a1e');

        var response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: data
        });
        var result = await response.json();

        if (result.success) {
            form.style.display = 'none';
            formHeading.style.display = 'none';
            formHiMsg.style.display = 'none';
            success.classList.add('visible');
            autoCloseTimer = setTimeout(closeContact, 3500);
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            alert('Something went wrong. Please try again.');
        }
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        alert('Network error. Please check your connection and try again.');
    }
});
