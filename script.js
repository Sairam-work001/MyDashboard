// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('sg-theme', theme);
}

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('sg-theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(0,0,0,0.15)'
    : 'none';
});

// ===== Scroll Animations =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-in to sections
document.querySelectorAll('.timeline-item, .project-card, .skill-category, .edu-card, .highlight-card, .contact-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Edit Mode =====
const editToggleBtn = document.getElementById('editToggleBtn');
const editBanner = document.getElementById('editBanner');
const exitEditMode = document.getElementById('exitEditMode');
const passwordModal = document.getElementById('passwordModal');
const editPasswordInput = document.getElementById('editPassword');
const modalSubmit = document.getElementById('modalSubmit');
const modalCancel = document.getElementById('modalCancel');
const modalError = document.getElementById('modalError');

const PASS_KEY = 'sg-edit-pass';
const EDITS_KEY = 'sg-edits';

// Load saved edits on page load
function loadEdits() {
  const edits = JSON.parse(localStorage.getItem(EDITS_KEY) || '{}');
  document.querySelectorAll('.editable').forEach(el => {
    const field = el.getAttribute('data-field');
    if (field && edits[field]) {
      el.textContent = edits[field];
    }
  });
}

function saveEdit(field, value) {
  const edits = JSON.parse(localStorage.getItem(EDITS_KEY) || '{}');
  edits[field] = value;
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
}

// Hash password (simple SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function enableEditMode() {
  document.body.classList.add('edit-mode');
  editBanner.classList.add('active');

  document.querySelectorAll('.editable').forEach(el => {
    el.setAttribute('contenteditable', 'true');
    el.addEventListener('blur', function handler() {
      const field = el.getAttribute('data-field');
      if (field) {
        saveEdit(field, el.textContent);
      }
    });
  });
}

function disableEditMode() {
  document.body.classList.remove('edit-mode');
  editBanner.classList.remove('active');
  document.querySelectorAll('.editable').forEach(el => {
    el.removeAttribute('contenteditable');
  });
}

editToggleBtn.addEventListener('click', () => {
  if (document.body.classList.contains('edit-mode')) {
    disableEditMode();
    return;
  }
  passwordModal.classList.add('active');
  editPasswordInput.value = '';
  modalError.textContent = '';
  editPasswordInput.focus();
});

modalCancel.addEventListener('click', () => {
  passwordModal.classList.remove('active');
});

editPasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') modalSubmit.click();
});

modalSubmit.addEventListener('click', async () => {
  const password = editPasswordInput.value.trim();
  if (!password) {
    modalError.textContent = 'Please enter a password.';
    return;
  }
  if (password.length < 4) {
    modalError.textContent = 'Password must be at least 4 characters.';
    return;
  }

  const hashed = await hashPassword(password);
  const storedHash = localStorage.getItem(PASS_KEY);

  if (!storedHash) {
    // First time — set the password
    localStorage.setItem(PASS_KEY, hashed);
    passwordModal.classList.remove('active');
    enableEditMode();
  } else if (hashed === storedHash) {
    // Correct password
    passwordModal.classList.remove('active');
    enableEditMode();
  } else {
    modalError.textContent = 'Incorrect password. Try again.';
  }
});

exitEditMode.addEventListener('click', () => {
  disableEditMode();
});

// Close modal on overlay click
passwordModal.addEventListener('click', (e) => {
  if (e.target === passwordModal) {
    passwordModal.classList.remove('active');
  }
});

// Load saved edits on page load
loadEdits();
