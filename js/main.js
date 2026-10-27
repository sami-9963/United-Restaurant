/* ==========================================================================
   UNITED RESTAURANT - SCRIPT
   Interactive Menu Filtering, Fast Search, Mobile Menu, Scroll Effects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initScrollAnimations();
  initMenuFiltersAndSearch();
  initToastForms();
});

/* 1. Header scroll effect */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* 2. Mobile Navigation Toggle */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    toggleBtn.innerHTML = isOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
    toggleBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when clicking any link or action button inside drawer
  navLinks.addEventListener('click', (e) => {
    const clickable = e.target.closest('a, button');
    if (clickable && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      document.body.style.overflow = '';
    }
  });
}

/* 3. Scroll Reveal Animations (Intersection Observer) */
function initScrollAnimations() {
  const animElements = document.querySelectorAll('.fade-in-up');
  if (!animElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animElements.forEach(el => observer.observe(el));
}

/* 4. Menu Filtering and Instant Search */
function initMenuFiltersAndSearch() {
  const tabs = document.querySelectorAll('.cuisine-tab-btn');
  const searchInput = document.querySelector('.menu-search-input');
  const sections = document.querySelectorAll('.menu-section-block');
  const dishes = document.querySelectorAll('.dish-card');

  if (!tabs.length && !searchInput) return;

  // Filter by Tab
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCategory = tab.getAttribute('data-category');

      if (targetCategory === 'all') {
        sections.forEach(sec => sec.style.display = 'block');
        dishes.forEach(dish => dish.style.display = 'flex');
      } else {
        sections.forEach(sec => {
          if (sec.id === `section-${targetCategory}`) {
            sec.style.display = 'block';
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            sec.style.display = 'none';
          }
        });
      }
    });
  });

  // Search Dishes dynamically
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();

      if (!term) {
        // Reset view
        sections.forEach(sec => sec.style.display = 'block');
        dishes.forEach(dish => dish.style.display = 'flex');
        return;
      }

      // If user is searching, show all sections and filter cards
      sections.forEach(sec => {
        let hasVisibleDishes = false;
        const sectionDishes = sec.querySelectorAll('.dish-card');

        sectionDishes.forEach(dish => {
          const name = dish.querySelector('.dish-name')?.textContent.toLowerCase() || '';
          const desc = dish.querySelector('.dish-desc')?.textContent.toLowerCase() || '';
          const tags = dish.querySelector('.dish-tags')?.textContent.toLowerCase() || '';

          if (name.includes(term) || desc.includes(term) || tags.includes(term)) {
            dish.style.display = 'flex';
            hasVisibleDishes = true;
          } else {
            dish.style.display = 'none';
          }
        });

        sec.style.display = hasVisibleDishes ? 'block' : 'none';
      });
    });
  }
}

/* 5. Toast Feedback for interactive forms */
function initToastForms() {
  const forms = document.querySelectorAll('form[data-toast]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = form.getAttribute('data-toast') || 'Request received! We will be in touch shortly.';
      showToast(message);
      form.reset();
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-red"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
