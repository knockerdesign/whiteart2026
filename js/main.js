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

// ── Contact modal ──────────────────────────────────────────
var overlay = document.getElementById('contactOverlay');
var openBtn = document.getElementById('contactOpenBtn');
var closeBtn = document.getElementById('contactCloseBtn');
var form = document.getElementById('contactForm');
var success = document.getElementById('modalSuccess');

function openContact() {
    overlay.classList.add('is-open');
}

function closeContact() {
    overlay.classList.remove('is-open');
}

openBtn.addEventListener('click', openContact);
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
            success.classList.add('visible');
            setTimeout(function() {
                closeContact();
                setTimeout(function() {
                    form.reset();
                    form.style.display = '';
                    success.classList.remove('visible');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }, 300);
            }, 2500);
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
