// ── Contact sheet ──────────────────────────────────────────────
var retractTimer = null;
var cleanupTimer = null;

function resetContactForm() {
  var sheet = document.getElementById('contactSheet');
  var form  = document.getElementById('WAcontactForm');
  var sheetSuccess = document.getElementById('sheetSuccess');
  var submitBtn = form.querySelector('.sheet-submit');
  var heading = sheet.querySelector('h2');
  var subtitle = sheet.querySelector('.sheet-subtitle');

  sheet.style.transform = '';
  form.style.display = '';
  if (heading) heading.style.display = '';
  if (subtitle) subtitle.style.display = '';
  sheetSuccess.classList.remove('visible');
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
  form.reset();
}

function openContactSheet() {
  document.getElementById('contactSheet').classList.add('open');
}

function closeContactSheet() {
  clearTimeout(retractTimer);
  clearTimeout(cleanupTimer);

  var sheet = document.getElementById('contactSheet');
  var sheetSuccess = document.getElementById('sheetSuccess');

  if (sheetSuccess.classList.contains('visible')) {
    // Closing from success — slide away first, then reset
    sheet.style.transform = 'translateY(110%)';
    cleanupTimer = setTimeout(function() {
      sheet.classList.remove('open');
      resetContactForm();
    }, 400);
  } else {
    sheet.classList.remove('open');
  }
}

// Toggle sheet via #contactPanelBtn, overriding the old flyout handler
function handleContactSheetToggle(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  var sheet = document.getElementById('contactSheet');
  if (sheet.classList.contains('open')) {
    closeContactSheet();
  } else {
    openContactSheet();
  }
}

document.getElementById('contactPanelBtn').addEventListener('click', handleContactSheetToggle, true);

document.querySelectorAll('.forSale').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // Pre-fill message with painting title
    var section = el.closest('section');
    if (section) {
      var h2 = section.querySelector('h2');
      if (h2) {
        var title = h2.textContent.trim();
        document.getElementById('cf-message').value = 'Regarding the ' + title + ' painting or print.\n\nPlease add your message here';
      }
    }

    var sheet = document.getElementById('contactSheet');
    if (sheet.classList.contains('open')) {
      closeContactSheet();
    } else {
      openContactSheet();
    }
  }, true);
});




// Close button
document.getElementById('sheetCloseBtn').addEventListener('click', closeContactSheet);

// .email-link anchors open the contact sheet
Array.prototype.forEach.call(document.querySelectorAll('.email-link'), function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openContactSheet();
  });
});

// Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeContactSheet();
});

// Form validation & submission
var form = document.getElementById('WAcontactForm');
var sheetSuccess = document.getElementById('sheetSuccess');

function validate(groupId, fieldId, checkFn) {
  var group = document.getElementById(groupId);
  var field = document.getElementById(fieldId);
  if (!checkFn(field.value.trim())) {
    group.classList.add('invalid');
    return false;
  }
  group.classList.remove('invalid');
  return true;
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

  var validName    = validate('group-name',    'cf-name',    function(v) { return v.length > 0; });
  var validEmail   = validate('group-email',   'cf-email',   function(v) { return isValidEmail(v); });
  var validMessage = validate('group-message', 'cf-message', function(v) { return v.length > 0; });

  if (!validName || !validEmail || !validMessage) return;

  var submitBtn = form.querySelector('.sheet-submit');
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
      var sheet = document.getElementById('contactSheet');
      var heading = sheet.querySelector('h2');
      var subtitle = sheet.querySelector('.sheet-subtitle');
      form.style.display = 'none';
      if (heading) heading.style.display = 'none';
      if (subtitle) subtitle.style.display = 'none';
      sheetSuccess.classList.add('visible');

      // Auto-retract after 4s
      retractTimer = setTimeout(function() {
        sheet.style.transform = 'translateY(110%)';
        cleanupTimer = setTimeout(function() {
          sheet.classList.remove('open');
          resetContactForm();
        }, 400);
      }, 4000);
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      alert('Something went wrong. Please try again.');
    }
  } catch(err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    alert('Network error. Please check your connection and try again.');
  }
});
