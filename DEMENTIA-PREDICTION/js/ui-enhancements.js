// ===== UI ENHANCEMENTS FOR DEMENTIA DETECT APP =====
// Fixed version with error handling

class UIEnhancer {
    constructor() {
        // Add error handling to constructor
        try {
            this.init();
        } catch (error) {
            console.error('UIEnhancer initialization failed:', error);
        }
    }

    init() {
        // Wait for DOM to be ready before setting up
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAll();
            });
        } else {
            this.setupAll();
        }
    }

    setupAll() {
        try {
            this.setupScrollEffects();
            this.setupAnimations();
            this.setupRippleEffects();
            this.setupFormEnhancements();
            this.setupAccessibilityFeatures();
            this.setupPerformanceOptimizations();
        } catch (error) {
            console.error('UIEnhancer setup failed:', error);
        }
    }

    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        try {
            const header = document.querySelector('.main-header, .assessment-header');
            if (!header) return; // Exit if no header found

            let lastScrollTop = 0;
            let ticking = false;

            const handleScroll = () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (!ticking) {
                    requestAnimationFrame(() => {
                        try {
                            // Add scrolled class for header styling
                            if (scrollTop > 50) {
                                header.classList.add('scrolled');
                            } else {
                                header.classList.remove('scrolled');
                            }
                            
                            // Parallax effect for hero section (only if exists)
                            const hero = document.querySelector('.hero');
                            if (hero && scrollTop < window.innerHeight) {
                                const speed = scrollTop * 0.5;
                                hero.style.transform = `translateY(${speed}px)`;
                            }
                            
                            lastScrollTop = scrollTop;
                        } catch (error) {
                            console.warn('Scroll effect error:', error);
                        } finally {
                            ticking = false;
                        }
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
        } catch (error) {
            console.error('setupScrollEffects failed:', error);
        }
    }

    // ===== SCROLL REVEAL ANIMATIONS =====
    setupAnimations() {
        try {
            // Check if IntersectionObserver is supported
            if (!window.IntersectionObserver) {
                console.warn('IntersectionObserver not supported');
                return;
            }

            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    try {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                            
                            // Stagger animations for grids
                            if (entry.target.classList.contains('features-grid') || 
                                entry.target.classList.contains('overview-cards')) {
                                this.staggerChildAnimations(entry.target);
                            }
                        }
                    } catch (error) {
                        console.warn('Animation observer error:', error);
                    }
                });
            }, observerOptions);

            // Observe elements for animations
            const animateElements = [
                '.feature-card', '.overview-card', '.analysis-card',
                '.hero-content', '.about-text', '.stats',
                '.features-grid', '.overview-cards', '.results-grid'
            ];

            animateElements.forEach(selector => {
                try {
                    document.querySelectorAll(selector).forEach(el => {
                        observer.observe(el);
                    });
                } catch (error) {
                    console.warn(`Animation setup failed for ${selector}:`, error);
                }
            });
        } catch (error) {
            console.error('setupAnimations failed:', error);
        }
    }

    staggerChildAnimations(parent) {
        try {
            if (!parent) return;
            
            const children = parent.querySelectorAll(':scope > *');
            children.forEach((child, index) => {
                setTimeout(() => {
                    try {
                        child.classList.add('animate-in');
                    } catch (error) {
                        console.warn('Stagger animation error:', error);
                    }
                }, index * 100);
            });
        } catch (error) {
            console.error('staggerChildAnimations failed:', error);
        }
    }

    // ===== BUTTON RIPPLE EFFECTS =====
    setupRippleEffects() {
        try {
            // Setup for existing buttons
            document.querySelectorAll('.btn').forEach(btn => {
                if (!btn.dataset.rippleAdded) {
                    btn.addEventListener('click', (e) => {
                        this.createRipple(e, btn);
                    });
                    btn.dataset.rippleAdded = 'true';
                }
            });

            // Setup for form buttons that might be added dynamically
            setTimeout(() => {
                document.querySelectorAll('button[type="submit"], button[type="button"]').forEach(btn => {
                    if (!btn.dataset.rippleAdded) {
                        btn.addEventListener('click', (e) => {
                            this.createRipple(e, btn);
                        });
                        btn.dataset.rippleAdded = 'true';
                    }
                });
            }, 500); // Delay to catch dynamically added buttons
        } catch (error) {
            console.error('setupRippleEffects failed:', error);
        }
    }

    createRipple(event, button) {
        try {
            if (!event || !button) return;

            // Remove existing ripples
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) existingRipple.remove();

            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.className = 'ripple';
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                try {
                    if (ripple.parentNode) ripple.remove();
                } catch (e) {
                    console.warn('Ripple cleanup error:', e);
                }
            }, 600);
        } catch (error) {
            console.error('createRipple failed:', error);
        }
    }

    // ===== FORM ENHANCEMENTS =====
    setupFormEnhancements() {
        try {
            // Enhanced input focus effects
            document.querySelectorAll('input, select, textarea').forEach(input => {
                try {
                    const wrapper = input.closest('.input-wrapper, .form-group');
                    
                    input.addEventListener('focus', () => {
                        try {
                            wrapper?.classList.add('focused');
                            this.addInputGlow(input);
                        } catch (e) {
                            console.warn('Focus event error:', e);
                        }
                    });

                    input.addEventListener('blur', () => {
                        try {
                            wrapper?.classList.remove('focused');
                            this.removeInputGlow(input);
                        } catch (e) {
                            console.warn('Blur event error:', e);
                        }
                    });

                    // Floating label effect
                    input.addEventListener('input', () => {
                        try {
                            this.handleFloatingLabel(input);
                        } catch (e) {
                            console.warn('Input event error:', e);
                        }
                    });
                } catch (error) {
                    console.warn('Form enhancement error for input:', error);
                }
            });

            // Custom select styling
            this.enhanceSelectElements();
            
            // Form validation visual feedback
            this.setupValidationFeedback();
        } catch (error) {
            console.error('setupFormEnhancements failed:', error);
        }
    }

    addInputGlow(input) {
        try {
            if (!input || input.dataset.glowAdded) return;

            const glow = document.createElement('div');
            glow.className = 'input-glow';
            glow.style.cssText = `
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border-radius: inherit;
                background: linear-gradient(45deg, var(--primary-color, #007bff), var(--primary-hover, #0056b3));
                opacity: 0;
                animation: glowPulse 2s infinite;
                pointer-events: none;
                z-index: -1;
            `;
            
            const wrapper = input.closest('.input-wrapper') || input.parentNode;
            if (wrapper) {
                wrapper.style.position = 'relative';
                wrapper.appendChild(glow);
            }
            input.dataset.glowAdded = 'true';
        } catch (error) {
            console.warn('addInputGlow failed:', error);
        }
    }

    removeInputGlow(input) {
        try {
            if (!input) return;
            
            const wrapper = input.closest('.input-wrapper') || input.parentNode;
            const glow = wrapper?.querySelector('.input-glow');
            if (glow) {
                glow.style.animation = 'glowFadeOut 0.3s ease';
                setTimeout(() => {
                    try {
                        if (glow.parentNode) glow.remove();
                    } catch (e) {
                        console.warn('Glow cleanup error:', e);
                    }
                }, 300);
                input.removeAttribute('data-glow-added');
            }
        } catch (error) {
            console.warn('removeInputGlow failed:', error);
        }
    }

    handleFloatingLabel(input) {
        try {
            if (!input) return;
            
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                if (input.value) {
                    label.classList.add('floating');
                } else {
                    label.classList.remove('floating');
                }
            }
        } catch (error) {
            console.warn('handleFloatingLabel failed:', error);
        }
    }

    enhanceSelectElements() {
        try {
            document.querySelectorAll('select').forEach(select => {
                try {
                    if (!select.dataset.enhanced) {
                        this.createCustomSelect(select);
                        select.dataset.enhanced = 'true';
                    }
                } catch (error) {
                    console.warn('Select enhancement error:', error);
                }
            });
        } catch (error) {
            console.error('enhanceSelectElements failed:', error);
        }
    }

    createCustomSelect(select) {
        try {
            if (!select) return;
            
            // Add custom dropdown arrow with animation
            const wrapper = select.closest('.input-wrapper');
            if (wrapper && !wrapper.querySelector('.select-arrow')) {
                const arrow = document.createElement('div');
                arrow.className = 'select-arrow';
                arrow.innerHTML = '<i class="fas fa-chevron-down"></i>';
                arrow.style.cssText = `
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    transition: transform 0.3s ease;
                    color: var(--gray, #6c757d);
                `;
                wrapper.appendChild(arrow);
                
                select.addEventListener('focus', () => {
                    try {
                        arrow.style.transform = 'translateY(-50%) rotate(180deg)';
                    } catch (e) {
                        console.warn('Select focus error:', e);
                    }
                });
                
                select.addEventListener('blur', () => {
                    try {
                        arrow.style.transform = 'translateY(-50%) rotate(0deg)';
                    } catch (e) {
                        console.warn('Select blur error:', e);
                    }
                });
            }
        } catch (error) {
            console.warn('createCustomSelect failed:', error);
        }
    }

    setupValidationFeedback() {
        try {
            // Check if MutationObserver is supported
            if (!window.MutationObserver) {
                console.warn('MutationObserver not supported');
                return;
            }

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    try {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            const target = mutation.target;
                            if (target.classList.contains('input-wrapper')) {
                                this.handleValidationStateChange(target);
                            }
                        }
                    } catch (error) {
                        console.warn('Validation observer error:', error);
                    }
                });
            });

            document.querySelectorAll('.input-wrapper').forEach(wrapper => {
                try {
                    observer.observe(wrapper, { attributes: true });
                } catch (error) {
                    console.warn('Validation observer setup error:', error);
                }
            });
        } catch (error) {
            console.error('setupValidationFeedback failed:', error);
        }
    }

    handleValidationStateChange(wrapper) {
        try {
            if (!wrapper) return;
            
            // Add visual feedback for validation states
            if (wrapper.classList.contains('error')) {
                this.addValidationIcon(wrapper, 'error');
                this.shakeElement(wrapper);
            } else if (wrapper.classList.contains('success')) {
                this.addValidationIcon(wrapper, 'success');
                this.pulseElement(wrapper);
            } else if (wrapper.classList.contains('warning')) {
                this.addValidationIcon(wrapper, 'warning');
            }
        } catch (error) {
            console.warn('handleValidationStateChange failed:', error);
        }
    }

    addValidationIcon(wrapper, type) {
        try {
            if (!wrapper) return;
            
            // Remove existing icons
            const existingIcon = wrapper.querySelector('.validation-icon');
            if (existingIcon) existingIcon.remove();

            const icons = {
                error: 'fas fa-exclamation-circle',
                success: 'fas fa-check-circle',
                warning: 'fas fa-exclamation-triangle'
            };

            const colors = {
                error: 'var(--danger-color, #dc3545)',
                success: 'var(--success-color, #28a745)',
                warning: 'var(--warning-color, #ffc107)'
            };

            const icon = document.createElement('div');
            icon.className = 'validation-icon';
            icon.innerHTML = `<i class="${icons[type]}"></i>`;
            icon.style.cssText = `
                position: absolute;
                right: ${wrapper.querySelector('.input-unit') ? '60px' : '12px'};
                top: 50%;
                transform: translateY(-50%);
                color: ${colors[type]};
                font-size: 16px;
                animation: iconPop 0.3s ease;
                pointer-events: none;
                z-index: 2;
            `;
            
            wrapper.appendChild(icon);
        } catch (error) {
            console.warn('addValidationIcon failed:', error);
        }
    }

    shakeElement(element) {
        try {
            if (!element) return;
            
            element.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                try {
                    element.style.animation = '';
                } catch (e) {
                    console.warn('Shake cleanup error:', e);
                }
            }, 500);
        } catch (error) {
            console.warn('shakeElement failed:', error);
        }
    }

    pulseElement(element) {
        try {
            if (!element) return;
            
            element.style.animation = 'successPulse 0.6s ease';
            setTimeout(() => {
                try {
                    element.style.animation = '';
                } catch (e) {
                    console.warn('Pulse cleanup error:', e);
                }
            }, 600);
        } catch (error) {
            console.warn('pulseElement failed:', error);
        }
    }

    // ===== ACCESSIBILITY FEATURES =====
    setupAccessibilityFeatures() {
        try {
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
            this.setupScreenReaderSupport();
        } catch (error) {
            console.error('setupAccessibilityFeatures failed:', error);
        }
    }

    setupKeyboardNavigation() {
        try {
            // Tab navigation enhancement
            document.addEventListener('keydown', (e) => {
                try {
                    if (e.key === 'Tab') {
                        document.body.classList.add('keyboard-navigation');
                    }
                } catch (error) {
                    console.warn('Keyboard navigation error:', error);
                }
            });

            document.addEventListener('mousedown', () => {
                try {
                    document.body.classList.remove('keyboard-navigation');
                } catch (error) {
                    console.warn('Mouse navigation error:', error);
                }
            });

            // Arrow key navigation for form sections
            document.addEventListener('keydown', (e) => {
                try {
                    if (e.altKey) {
                        switch(e.key) {
                            case 'ArrowRight':
                                e.preventDefault();
                                this.focusNextSection();
                                break;
                            case 'ArrowLeft':
                                e.preventDefault();
                                this.focusPreviousSection();
                                break;
                        }
                    }
                } catch (error) {
                    console.warn('Arrow key navigation error:', error);
                }
            });
        } catch (error) {
            console.error('setupKeyboardNavigation failed:', error);
        }
    }

    focusNextSection() {
        try {
            if (typeof window.nextSection === 'function') {
                window.nextSection();
                setTimeout(() => this.focusFirstInput(), 100);
            }
        } catch (error) {
            console.warn('focusNextSection failed:', error);
        }
    }

    focusPreviousSection() {
        try {
            if (typeof window.previousSection === 'function') {
                window.previousSection();
                setTimeout(() => this.focusFirstInput(), 100);
            }
        } catch (error) {
            console.warn('focusPreviousSection failed:', error);
        }
    }

    focusFirstInput() {
        try {
            const activeSection = document.querySelector('.form-section.active');
            const firstInput = activeSection?.querySelector('input, select');
            if (firstInput) {
                firstInput.focus();
            }
        } catch (error) {
            console.warn('focusFirstInput failed:', error);
        }
    }

    setupFocusManagement() {
        try {
            // Escape key handling
            document.addEventListener('keydown', (e) => {
                try {
                    if (e.key === 'Escape') {
                        const modal = document.querySelector('.modal[style*="display: block"]');
                        if (modal) {
                            modal.style.display = 'none';
                        }
                    }
                } catch (error) {
                    console.warn('Focus management error:', error);
                }
            });
        } catch (error) {
            console.error('setupFocusManagement failed:', error);
        }
    }

    setupScreenReaderSupport() {
        try {
            // Add ARIA labels dynamically
            document.querySelectorAll('.progress-bar').forEach(bar => {
                try {
                    if (!bar.getAttribute('role')) {
                        bar.setAttribute('role', 'progressbar');
                        bar.setAttribute('aria-valuenow', '0');
                        bar.setAttribute('aria-valuemin', '0');
                        bar.setAttribute('aria-valuemax', '100');
                    }
                } catch (error) {
                    console.warn('ARIA setup error:', error);
                }
            });

            // Screen reader announcements
            if (!document.querySelector('.sr-announcer')) {
                const announcer = document.createElement('div');
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.className = 'sr-only sr-announcer';
                announcer.style.cssText = `
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                `;
                document.body.appendChild(announcer);
                
                window.announceToScreenReader = (message) => {
                    try {
                        announcer.textContent = message;
                        setTimeout(() => announcer.textContent = '', 1000);
                    } catch (error) {
                        console.warn('Screen reader announcement error:', error);
                    }
                };
            }
        } catch (error) {
            console.error('setupScreenReaderSupport failed:', error);
        }
    }

    // ===== PERFORMANCE OPTIMIZATIONS =====
    setupPerformanceOptimizations() {
        try {
            this.setupLazyLoading();
            this.setupResizeOptimization();
            this.preloadResources();
        } catch (error) {
            console.error('setupPerformanceOptimizations failed:', error);
        }
    }

    setupLazyLoading() {
        try {
            if (!window.IntersectionObserver) return;

            const images = document.querySelectorAll('img[data-src]');
            if (images.length === 0) return;

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    try {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    } catch (error) {
                        console.warn('Lazy loading error:', error);
                    }
                });
            });

            images.forEach(img => {
                try {
                    imageObserver.observe(img);
                } catch (error) {
                    console.warn('Image observer error:', error);
                }
            });
        } catch (error) {
            console.error('setupLazyLoading failed:', error);
        }
    }

    setupResizeOptimization() {
        try {
            let resizeTimer;
            window.addEventListener('resize', () => {
                try {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        this.handleResize();
                    }, 250);
                } catch (error) {
                    console.warn('Resize optimization error:', error);
                }
            });
        } catch (error) {
            console.error('setupResizeOptimization failed:', error);
        }
    }

    handleResize() {
        try {
            // Recalculate layouts if needed
            const summaryPanel = document.querySelector('.data-summary-panel');
            if (summaryPanel) {
                if (window.innerWidth <= 1024) {
                    summaryPanel.style.position = 'static';
                } else {
                    summaryPanel.style.position = 'sticky';
                }
            }
        } catch (error) {
            console.warn('handleResize failed:', error);
        }
    }

    preloadResources() {
        try {
            const nextPageLinks = ['processing.html', 'results.html'];
            nextPageLinks.forEach(link => {
                try {
                    const linkTag = document.createElement('link');
                    linkTag.rel = 'prefetch';
                    linkTag.href = link;
                    document.head.appendChild(linkTag);
                } catch (error) {
                    console.warn('Preload error for:', link, error);
                }
            });
        } catch (error) {
            console.error('preloadResources failed:', error);
        }
    }
}

// ===== CSS ANIMATIONS (Added via JavaScript) =====
function addEnhancementStyles() {
    try {
        // Check if styles already added
        if (document.querySelector('#ui-enhancement-styles')) return;

        const style = document.createElement('style');
        style.id = 'ui-enhancement-styles';
        style.textContent = `
            /* Animation keyframes */
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes glowPulse {
                0%, 100% { opacity: 0; }
                50% { opacity: 0.3; }
            }
            
            @keyframes glowFadeOut {
                from { opacity: 0.3; }
                to { opacity: 0; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            @keyframes iconPop {
                0% { transform: translateY(-50%) scale(0); }
                50% { transform: translateY(-50%) scale(1.2); }
                100% { transform: translateY(-50%) scale(1); }
            }
            
            /* Animation classes */
            .animate-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Keyboard navigation styles */
            .keyboard-navigation *:focus {
                outline: 3px solid var(--primary-color, #007bff) !important;
                outline-offset: 2px !important;
            }
            
            /* Enhanced button states */
            .btn {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg, 0 8px 16px rgba(0,0,0,0.1));
            }
            
            .btn:active {
                transform: translateY(0);
            }
            
            /* Floating label styles */
            .form-group label.floating {
                transform: translateY(-20px) scale(0.85);
                color: var(--primary-color, #007bff);
            }
            
            .form-group label {
                transition: all 0.3s ease;
                transform-origin: left center;
            }
            
            /* Enhanced focus states */
            .input-wrapper.focused {
                transform: translateY(-1px);
            }
            
            /* Loading states */
            .loading-shimmer {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    } catch (error) {
        console.error('addEnhancementStyles failed:', error);
    }
}

// ===== SAFE INITIALIZATION =====
function initializeUIEnhancer() {
    try {
        addEnhancementStyles();
        window.uiEnhancer = new UIEnhancer();
        console.log('UIEnhancer initialized successfully');
    } catch (error) {
        console.error('UIEnhancer initialization failed:', error);
    }
}

// Initialize based on DOM state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUIEnhancer);
} else {
    initializeUIEnhancer();
}

// ===== EXPORT FOR EXTERNAL USE =====
window.UIEnhancer = UIEnhancer;
