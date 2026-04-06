/* ============================================================
   FURNISH TEMPLATE — index.js
   Carousel logic + scroll-triggered animation wiring
   ============================================================ */

/* === YEAR === */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* === MOBILE MENU === */

const menuOpenBtn  = document.getElementById('menu-open-button');
const menuCloseBtn = document.getElementById('menu-close-button');

if (menuOpenBtn)  menuOpenBtn.addEventListener('click',  function() { document.body.classList.add('show-mobile-menu'); });
if (menuCloseBtn) menuCloseBtn.addEventListener('click', function() { document.body.classList.remove('show-mobile-menu'); });


/* === HERO SLIDEE CAROUSEL === */

const slides    = document.querySelectorAll('.one-two .slidee');
const prevBtn   = document.getElementById('slidee-prev');
const nextBtn   = document.getElementById('slidee-next');
let   current   = 0;

function showSlide(index) {
    slides.forEach(function(s) { s.classList.remove('slidee--active'); });
    slides[index].classList.add('slidee--active');
}

if (slides.length > 0) {
    showSlide(current);

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            current = (current + 1) % slides.length;
            showSlide(current);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        });
    }
}


/* === FAVORITE COLLECTION CAROUSEL (with dots) === */

function initProductCarousel() {
    const track    = document.getElementById('track');
    const dotsWrap = document.getElementById('dots');
    if (!track || !dotsWrap) return;

    const cards = Array.from(track.children);
    const total = cards.length;

    let current  = 0;
    let isMobile = false;
    let steps    = 0;
    let dots     = [];

    function getIsMobile() {
        return window.innerWidth <= 768;
    }

    function buildDots(count) {
        dotsWrap.innerHTML = '';
        dots = Array.from({ length: count }, function(_, i) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            d.addEventListener('click', function() { goTo(i); });
            dotsWrap.appendChild(d);
            return d;
        });
    }

    function applyCardSizes() {
        if (isMobile) {
            const vw = track.parentElement.getBoundingClientRect().width;
            cards.forEach(function(c) {
                c.style.flex  = '0 0 ' + vw + 'px';
                c.style.width = vw + 'px';
            });
            track.style.gap = '0px';
        } else {
            const gap     = 30;
            const wrapper = track.parentElement.getBoundingClientRect().width;
            const cardW   = (wrapper - gap * 2) / 3;
            cards.forEach(function(c) {
                c.style.flex  = '0 0 ' + cardW + 'px';
                c.style.width = cardW + 'px';
            });
            track.style.gap = gap + 'px';
        }
    }

    function goTo(index, animate) {
        if (animate === undefined) animate = true;
        current = Math.max(0, Math.min(index, steps - 1));

        if (!animate) track.style.transition = 'none';
        else          track.style.transition  = 'transform 520ms cubic-bezier(0.4, 0, 0.2, 1)';

        if (isMobile) {
            const cardW = track.parentElement.getBoundingClientRect().width;
            track.style.transform = 'translateX(-' + (current * cardW) + 'px)';
        } else {
            const gap   = 30;
            const cardW = cards[0].getBoundingClientRect().width;
            track.style.transform = 'translateX(-' + (current * (cardW + gap)) + 'px)';
        }

        dots.forEach(function(d, i) {
            d.classList.toggle('active', i === current);
        });

        if (!animate) {
            requestAnimationFrame(function() {
                track.style.transition = 'transform 520ms cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }
    }

    function init() {
        const mobile       = getIsMobile();
        const visibleCount = mobile ? 1 : 3;
        const newSteps     = total - visibleCount + 1;

        if (mobile === isMobile && newSteps === steps) {
            applyCardSizes();
            goTo(current, false);
            return;
        }

        isMobile = mobile;
        steps    = newSteps;

        applyCardSizes();
        current = Math.min(current, steps - 1);
        buildDots(steps);
        goTo(current, false);
    }

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    });

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 80);
    });

    init();
}

initProductCarousel();


/* === SCROLL-TRIGGERED ANIMATIONS — IntersectionObserver === */

/*
 * HOW IT WORKS:
 * Elements with animation classes (anim-fade-up, anim-slide-right, etc.)
 * start with opacity:0 (set in animations.css).
 * When they enter the viewport, the observer adds .is-visible,
 * which triggers the CSS keyframe animation.
 * Stagger delay classes (anim-delay-1 through anim-delay-6)
 * are auto-assigned to siblings within the same parent group.
 */

function initScrollAnimations() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(
        '.anim-fade-up, .anim-slide-right, .anim-slide-left, ' +
        '.anim-scale-in, .anim-pop-in, .anim-testimony'
    ).forEach(function(el) {
        observer.observe(el);
    });
}

/* ---- Assign animation classes to page elements ---- */

function assignAnimations() {

    /* Section headings — fade up */
    document.querySelectorAll('.title-description, .title-one, .h-title').forEach(function(el) {
        el.classList.add('anim-fade-up');
    });

    /* Section sub-descriptions — fade up with slight delay */
    document.querySelectorAll('.title-subdescription:not(.product-more-details .title-subdescription):not(.card-body .title-subdescription)').forEach(function(el) {
        el.classList.add('anim-fade-up', 'anim-delay-1');
    });

    /* About image — already has heartbeat; give it a fade-up entry too */
    const aboutImg = document.querySelector('.image-wrapper');
    if (aboutImg) aboutImg.classList.add('anim-slide-left');

    /* About text content — slide in from right */
    const aboutContent = document.querySelector('.about-us-section-content');
    if (aboutContent) aboutContent.classList.add('anim-slide-right');

    /* Meet Our Team — each member card slides in from right with stagger */
    document.querySelectorAll('.our-team-content-one').forEach(function(el, i) {
        el.classList.add('anim-slide-right');
        el.classList.add('anim-delay-' + ((i % 4) + 1));
    });

    /* Core Value cards — pop in with stagger */
    document.querySelectorAll('.value-content').forEach(function(el, i) {
        el.classList.add('anim-pop-in');
        el.classList.add('anim-delay-' + (i + 1));
    });

    /* Product option cards — scale in with stagger */
    document.querySelectorAll('.products-options').forEach(function(el, i) {
        el.classList.add('anim-scale-in');
        el.classList.add('anim-delay-' + ((i % 3) + 1));
    });

    /* Product section image-003 — already covered by .products-options parent */

    /* Testimonial cards — fade in with stagger */
    document.querySelectorAll('.client-testimony').forEach(function(el, i) {
        el.classList.add('anim-testimony');
        el.classList.add('anim-delay-' + ((i % 3) + 1));
    });

    /* Filter sidebar — slide in from left */
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) filterSection.classList.add('anim-slide-left');

    /* Newsletter section — fade up */
    const newsletter = document.getElementById('newsletter-section');
    if (newsletter) newsletter.classList.add('anim-fade-up');

    /* Contact info sidebar — fade up */
    const contactFilter = document.querySelector('#contact-section .filter-section');
    if (contactFilter) {
        contactFilter.classList.remove('anim-slide-left');
        contactFilter.classList.add('anim-fade-up');
    }

    /* Contact form — slide in from right */
    const contactForm = document.querySelector('#contact-section .selection-section');
    if (contactForm) contactForm.classList.add('anim-slide-right');

    /* Footer semi-headers — fade up */
    document.querySelectorAll('.semi-header').forEach(function(el, i) {
        el.classList.add('anim-fade-up');
        el.classList.add('anim-delay-' + (i + 1));
    });
}

/* Run on DOM ready */
document.addEventListener('DOMContentLoaded', function() {
    assignAnimations();
    initScrollAnimations();
});