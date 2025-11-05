// ===== MEDICAL ASSESSMENT FORM HANDLER =====
// Improved version with better error handling and debugging

class MedicalAssessment {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 3;
        this.formData = {};
        this.validationRules = this.setupValidationRules();
        this.isInitialized = false;
        
        console.log('MedicalAssessment constructor called');
        
        // Wait for DOM to be ready if not already
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // Small delay to ensure all elements are rendered
            setTimeout(() => this.init(), 100);
        }
    }

    init() {
        try {
            console.log('Initializing MedicalAssessment...');
            
            // Check if already initialized
            if (this.isInitialized) {
                console.log('Already initialized, skipping...');
                return;
            }

            // Verify essential elements exist
            if (!this.verifyEssentialElements()) {
                console.error('Essential elements not found, retrying in 500ms...');
                setTimeout(() => this.init(), 500);
                return;
            }

            this.bindEvents();
            this.setupNavigationHandlers();
            this.setupTooltips();
            this.updateNavigation();
            this.updateSummaryPanel();
            this.loadDraftData();
            
            this.isInitialized = true;
            console.log('MedicalAssessment initialized successfully');
            
        } catch (error) {
            console.error('Initialization failed:', error);
            // Retry once
            setTimeout(() => this.init(), 1000);
        }
    }

    verifyEssentialElements() {
        const essentialElements = [
            'medicalAssessmentForm',
            'nextBtn',
            'cognitiveSection',
            'imagingSection',
            'demographicSection'
        ];

        const missing = essentialElements.filter(id => !document.getElementById(id));
        
        if (missing.length > 0) {
            console.error('Missing essential elements:', missing);
            return false;
        }

        return true;
    }

    setupNavigationHandlers() {
        try {
            console.log('Setting up navigation handlers...');
            
            const nextBtn = document.getElementById('nextBtn');
            const prevBtn = document.getElementById('prevBtn');
            const submitBtn = document.getElementById('submitBtn');

            if (nextBtn) {
                // Remove all existing event listeners by cloning the element
                const newNextBtn = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
                
                newNextBtn.removeAttribute('onclick');
                newNextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next button clicked');
                    this.nextSection();
                }, { once: false });
                
                console.log('Next button handler attached');
            } else {
                console.error('Next button not found');
            }

            if (prevBtn) {
                const newPrevBtn = prevBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
                
                newPrevBtn.removeAttribute('onclick');
                newPrevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Previous button clicked');
                    this.previousSection();
                }, { once: false });
                
                console.log('Previous button handler attached');
            }

            if (submitBtn) {
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                
                newSubmitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Submit button clicked');
                    this.handleSubmit(e);
                }, { once: false });
                
                console.log('Submit button handler attached');
            }
        } catch (error) {
            console.error('setupNavigationHandlers failed:', error);
        }
    }

    setupValidationRules() {
        return {
            mmse: { 
                min: 0, 
                max: 30, 
                type: 'number', 
                required: true,
                warningThreshold: { low: 18, high: 30 }
            },
            cdr: { 
                type: 'select', 
                required: true 
            },
            nwbv: { 
                min: 0.5, 
                max: 1.0, 
                type: 'number', 
                required: true,
                warningThreshold: { low: 0.7, high: 1.0 }
            },
            etiv: { 
                min: 1000, 
                max: 2500, 
                type: 'number', 
                required: true 
            },
            asf: { 
                min: 0.8, 
                max: 1.8, 
                type: 'number', 
                required: true 
            },
            age: { 
                min: 18, 
                max: 120, 
                type: 'number', 
                required: true,
                warningThreshold: { low: 65, high: 120 }
            },
            education: { 
                min: 0, 
                max: 25, 
                type: 'number', 
                required: true 
            },
            gender: { 
                type: 'select', 
                required: true 
            },
            ses: { 
                type: 'select', 
                required: true 
            }
        };
    }

    bindEvents() {
        try {
            const form = document.getElementById('medicalAssessmentForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('Form submit event triggered');
                    this.handleSubmit(e);
                });
            }

            // Real-time validation and progress tracking
            const inputs = document.querySelectorAll('#medicalAssessmentForm input, #medicalAssessmentForm select');
            console.log(`Found ${inputs.length} form inputs`);
            
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.validateField(input);
                    this.updateSummaryPanel();
                    this.autoSave();
                });

                input.addEventListener('blur', () => {
                    this.validateField(input);
                    this.showFieldFeedback(input);
                });

                input.addEventListener('focus', () => {
                    this.clearFieldError(input);
                });
            });

            // Section indicators click handlers
            const indicators = document.querySelectorAll('.indicator');
            console.log(`Found ${indicators.length} section indicators`);
            
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    console.log(`Indicator ${index} clicked`);
                    if (index <= this.currentSection || this.canNavigateToSection(index)) {
                        this.goToSection(index);
                    }
                });
            });
        } catch (error) {
            console.error('bindEvents failed:', error);
        }
    }

    setupTooltips() {
        try {
            const infoElements = document.querySelectorAll('.input-info');
            console.log(`Setting up ${infoElements.length} tooltips`);
            
            infoElements.forEach(info => {
                const tooltip = info.querySelector('.tooltip');
                if (tooltip) {
                    // Set initial state
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateY(5px)';
                    tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    
                    info.addEventListener('mouseenter', () => {
                        tooltip.style.opacity = '1';
                        tooltip.style.transform = 'translateY(0)';
                    });

                    info.addEventListener('mouseleave', () => {
                        tooltip.style.opacity = '0';
                        tooltip.style.transform = 'translateY(5px)';
                    });
                }
            });
        } catch (error) {
            console.error('setupTooltips failed:', error);
        }
    }

    validateField(field) {
        try {
            if (!field) return true;
            
            const fieldName = field.name;
            const value = field.value.trim();
            const rule = this.validationRules[fieldName];
            
            if (!rule) return true;

            let isValid = true;
            let errorMessage = '';
            let warningMessage = '';
            const wrapper = field.closest('.input-wrapper');

            if (!wrapper) return true;

            // Clear previous states
            wrapper.classList.remove('error', 'success', 'warning');

            // Required field check
            if (rule.required && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            } else if (value) {
                // Type-specific validation
                if (rule.type === 'number') {
                    const num = parseFloat(value);
                    if (isNaN(num)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid number';
                    } else if (rule.min !== undefined && num < rule.min) {
                        isValid = false;
                        errorMessage = `Value must be at least ${rule.min}`;
                    } else if (rule.max !== undefined && num > rule.max) {
                        isValid = false;
                        errorMessage = `Value must not exceed ${rule.max}`;
                    } else {
                        warningMessage = this.checkMedicalValidity(fieldName, num);
                    }
                }
            }

            // Apply validation state
            if (isValid && value) {
                if (warningMessage) {
                    wrapper.classList.add('warning');
                    field.setAttribute('data-warning', warningMessage);
                } else {
                    wrapper.classList.add('success');
                }
                this.formData[fieldName] = value;
            } else if (!isValid) {
                wrapper.classList.add('error');
                field.setAttribute('data-error', errorMessage);
                // Remove from formData if invalid
                delete this.formData[fieldName];
            }

            return isValid;
        } catch (error) {
            console.error('validateField failed:', error);
            return true;
        }
    }

    checkMedicalValidity(fieldName, value) {
        switch(fieldName) {
            case 'mmse':
                if (value < 12) return 'Score suggests severe cognitive impairment';
                if (value < 18) return 'Score suggests moderate cognitive impairment';
                if (value < 24) return 'Score suggests mild cognitive impairment';
                break;
            case 'nwbv':
                if (value < 0.7) return 'Low brain volume may indicate atrophy';
                break;
            case 'age':
                if (value > 75) return 'Age increases dementia risk';
                break;
        }
        return '';
    }

    showFieldFeedback(field) {
        try {
            if (!field) return;
            
            const wrapper = field.closest('.input-wrapper');
            if (!wrapper) return;

            const errorMsg = field.getAttribute('data-error');
            const warningMsg = field.getAttribute('data-warning');
            
            // Remove existing feedback
            const existingFeedback = wrapper.parentNode.querySelector('.field-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            // Show error or warning
            if (errorMsg || warningMsg) {
                const feedback = document.createElement('div');
                const isError = !!errorMsg;
                const message = errorMsg || warningMsg;
                
                feedback.className = `field-feedback ${isError ? 'error' : 'warning'}`;
                feedback.innerHTML = `
                    <i class="fas fa-${isError ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                    <span>${message}</span>
                `;
                
                feedback.style.cssText = `
                    margin-top: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: ${isError ? '#f8d7da' : '#fff3cd'};
                    color: ${isError ? '#721c24' : '#856404'};
                    border: 1px solid ${isError ? '#f5c6cb' : '#ffeaa7'};
                    animation: slideDown 0.3s ease;
                `;
                
                wrapper.parentNode.appendChild(feedback);

                // Auto-hide warnings after 5 seconds
                if (!isError) {
                    setTimeout(() => {
                        if (feedback.parentNode) {
                            feedback.remove();
                        }
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('showFieldFeedback failed:', error);
        }
    }

    clearFieldError(field) {
        try {
            if (!field) return;
            
            const wrapper = field.closest('.input-wrapper');
            if (!wrapper) return;

            const feedback = wrapper.parentNode.querySelector('.field-feedback.error');
            if (feedback) {
                feedback.remove();
            }
            
            // Also clear error attributes
            field.removeAttribute('data-error');
            wrapper.classList.remove('error');
        } catch (error) {
            console.error('clearFieldError failed:', error);
        }
    }

    validateCurrentSection() {
        try {
            console.log(`Validating section ${this.currentSection}`);
            
            const sections = ['cognitiveSection', 'imagingSection', 'demographicSection'];
            const currentSectionElement = document.getElementById(sections[this.currentSection]);
            
            if (!currentSectionElement) {
                console.error(`Section element not found: ${sections[this.currentSection]}`);
                return false;
            }

            const requiredFields = currentSectionElement.querySelectorAll('[required]');
            console.log(`Found ${requiredFields.length} required fields in current section`);
            
            let isValid = true;
            const errors = [];

            requiredFields.forEach(field => {
                const fieldValid = this.validateField(field);
                if (!fieldValid) {
                    isValid = false;
                    errors.push(field.name);
                    this.showFieldFeedback(field);
                }
            });

            if (!isValid) {
                console.log('Validation errors:', errors);
                this.showNotification(
                    'Please complete all required fields in this section.',
                    'error'
                );
                
                // Focus on first invalid field
                const firstInvalidField = currentSectionElement.querySelector('.input-wrapper.error input, .input-wrapper.error select');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            console.log(`Section validation result: ${isValid}`);
            return isValid;
        } catch (error) {
            console.error('validateCurrentSection failed:', error);
            return false;
        }
    }

    nextSection() {
        try {
            console.log(`Moving to next section from ${this.currentSection}`);
            
            if (!this.validateCurrentSection()) {
                console.log('Validation failed, staying in current section');
                return;
            }

            if (this.currentSection < this.totalSections - 1) {
                this.goToSection(this.currentSection + 1);
            } else {
                console.log('Already on last section');
            }
        } catch (error) {
            console.error('nextSection failed:', error);
        }
    }

    previousSection() {
        try {
            console.log(`Moving to previous section from ${this.currentSection}`);
            
            if (this.currentSection > 0) {
                this.goToSection(this.currentSection - 1);
            } else {
                console.log('Already on first section');
            }
        } catch (error) {
            console.error('previousSection failed:', error);
        }
    }

    goToSection(sectionIndex) {
        try {
            console.log(`Going to section ${sectionIndex}`);
            
            if (sectionIndex < 0 || sectionIndex >= this.totalSections) {
                console.error(`Invalid section index: ${sectionIndex}`);
                return;
            }
            
            // Hide current section
            const sections = document.querySelectorAll('.form-section');
            if (sections[this.currentSection]) {
                sections[this.currentSection].classList.remove('active');
            }
            
            // Update current section
            this.currentSection = sectionIndex;
            
            // Show new section
            if (sections[this.currentSection]) {
                sections[this.currentSection].classList.add('active');
                
                // Add fade in animation
                sections[this.currentSection].style.animation = 'fadeInSlide 0.4s ease';
                setTimeout(() => {
                    if (sections[this.currentSection]) {
                        sections[this.currentSection].style.animation = '';
                    }
                }, 400);
            }
            
            this.updateNavigation();
            this.updateSectionIndicators();
            this.scrollToTop();
            
        } catch (error) {
            console.error('goToSection failed:', error);
        }
    }

    scrollToTop() {
        try {
            const assessmentCard = document.querySelector('.assessment-card');
            if (assessmentCard) {
                assessmentCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (error) {
            console.error('scrollToTop failed:', error);
        }
    }

    updateNavigation() {
        try {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');

            console.log(`Updating navigation for section ${this.currentSection}`);

            // Update previous button
            if (prevBtn) {
                prevBtn.style.display = this.currentSection > 0 ? 'inline-flex' : 'none';
            }

            // Update next/submit buttons
            if (this.currentSection === this.totalSections - 1) {
                if (nextBtn) nextBtn.style.display = 'none';
                if (submitBtn) submitBtn.style.display = 'inline-flex';
            } else {
                if (nextBtn) nextBtn.style.display = 'inline-flex';
                if (submitBtn) submitBtn.style.display = 'none';
            }

            // Update progress text
            const progressText = document.getElementById('progressText');
            if (progressText) {
                const sectionNames = ['Cognitive Assessment', 'Brain Imaging', 'Demographics'];
                progressText.textContent = sectionNames[this.currentSection] || 'Medical Assessment';
            }
        } catch (error) {
            console.error('updateNavigation failed:', error);
        }
    }

    updateSectionIndicators() {
        try {
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.remove('active', 'completed');
                
                if (index === this.currentSection) {
                    indicator.classList.add('active');
                } else if (index < this.currentSection) {
                    indicator.classList.add('completed');
                }
            });
        } catch (error) {
            console.error('updateSectionIndicators failed:', error);
        }
    }

    updateSummaryPanel() {
        try {
            const totalFields = Object.keys(this.validationRules).length;
            const completedFields = Object.keys(this.formData).length;
            const completionRate = Math.round((completedFields / totalFields) * 100);

            // Update completion rate
            const completionElement = document.getElementById('completionRate');
            if (completionElement) {
                completionElement.textContent = `${completionRate}%`;
            }

            // Update quality indicator
            const qualityFill = document.getElementById('qualityFill');
            if (qualityFill) {
                qualityFill.style.width = `${completionRate}%`;
            }

            // Update required count
            const requiredCount = document.getElementById('requiredCount');
            if (requiredCount) {
                requiredCount.textContent = `${completedFields}/${totalFields}`;
            }

            // Update progress bar in header
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                const sectionProgress = ((this.currentSection + 1) / this.totalSections) * 100;
                progressFill.style.width = `${sectionProgress}%`;
            }
        } catch (error) {
            console.error('updateSummaryPanel failed:', error);
        }
    }

    canNavigateToSection(sectionIndex) {
        // Allow navigation to current and previous sections, and next section if current is valid
        return sectionIndex <= this.currentSection + 1;
    }

    autoSave() {
        try {
            const draftData = {
                section: this.currentSection,
                formData: this.formData,
                timestamp: Date.now()
            };
            
            localStorage.setItem('medicalAssessmentDraft', JSON.stringify(draftData));
        } catch (error) {
            console.warn('Unable to save draft:', error);
        }
    }

    loadDraftData() {
        try {
            const draft = localStorage.getItem('medicalAssessmentDraft');
            if (draft) {
                const draftData = JSON.parse(draft);
                // Check if draft is less than 24 hours old
                if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
                    if (confirm('Continue from your saved progress?')) {
                        this.formData = draftData.formData || {};
                        this.restoreFormData();
                        this.goToSection(draftData.section || 0);
                    }
                }
            }
        } catch (error) {
            console.warn('Error loading draft data:', error);
        }
    }

    restoreFormData() {
        try {
            Object.keys(this.formData).forEach(key => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = this.formData[key];
                    this.validateField(field);
                }
            });
            this.updateSummaryPanel();
        } catch (error) {
            console.error('restoreFormData failed:', error);
        }
    }

    async handleSubmit(e) {
        try {
            e.preventDefault();
            
            console.log('Form submission started');
            
            if (!this.validateCurrentSection()) {
                console.log('Final validation failed');
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            if (!submitBtn) {
                console.error('Submit button not found');
                return;
            }
            
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            submitBtn.disabled = true;

            // Collect all form data
            const formElements = document.querySelectorAll('#medicalAssessmentForm input, #medicalAssessmentForm select');
            formElements.forEach(element => {
                if (element.value.trim()) {
                    this.formData[element.name] = element.value.trim();
                }
            });

            console.log('Collected form data:', this.formData);

            // Store assessment data
            localStorage.setItem('dementiaAssessmentData', JSON.stringify(this.formData));
            localStorage.removeItem('medicalAssessmentDraft');

            this.showNotification(
                'Medical assessment completed successfully! Redirecting to analysis...',
                'success'
            );

            setTimeout(() => {
                window.location.href = 'processing.html';
            }, 2000);

        } catch (error) {
            console.error('handleSubmit failed:', error);
            this.showNotification('Error processing assessment. Please try again.', 'error');
            
            // Reset submit button
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze Risk';
                submitBtn.disabled = false;
            }
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        try {
            // Create a better notification system
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 400px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideInRight 0.3s ease;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 1rem; cursor: pointer;">×</button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        } catch (error) {
            console.error('showNotification failed:', error);
            // Fallback to alert
            alert(message);
        }
    }
}

// ===== ENHANCED GLOBAL FUNCTIONS =====
window.nextSection = function() {
    console.log('Global nextSection called');
    try {
        if (window.medicalAssessment && window.medicalAssessment.isInitialized) {
            window.medicalAssessment.nextSection();
        } else {
            console.error('Medical assessment not initialized');
            // Try to initialize if not already done
            if (!window.medicalAssessment) {
                window.medicalAssessment = new MedicalAssessment();
            }
        }
    } catch (error) {
        console.error('Global nextSection failed:', error);
    }
};

window.previousSection = function() {
    console.log('Global previousSection called');
    try {
        if (window.medicalAssessment && window.medicalAssessment.isInitialized) {
            window.medicalAssessment.previousSection();
        } else {
            console.error('Medical assessment not initialized');
        }
    } catch (error) {
        console.error('Global previousSection failed:', error);
    }
};

// ===== ENHANCED INITIALIZATION =====
function initializeMedicalAssessment() {
    try {
        console.log('DOM loaded, initializing MedicalAssessment...');
        
        // Prevent multiple initializations
        if (window.medicalAssessment && window.medicalAssessment.isInitialized) {
            console.log('MedicalAssessment already initialized');
            return;
        }
        
        window.medicalAssessment = new MedicalAssessment();
        
        // Debug: Check if elements exist
        setTimeout(() => {
            console.log('Next button:', document.getElementById('nextBtn'));
            console.log('Previous button:', document.getElementById('prevBtn'));
            console.log('Submit button:', document.getElementById('submitBtn'));
            console.log('Form:', document.getElementById('medicalAssessmentForm'));
        }, 100);
        
    } catch (error) {
        console.error('MedicalAssessment initialization failed:', error);
    }
}

// Initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMedicalAssessment);
} else {
    // DOM already loaded
    initializeMedicalAssessment();
}

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    try {
        if (window.medicalAssessment) {
            window.medicalAssessment.autoSave();
        }
    } catch (error) {
        console.error('Auto-save on unload failed:', error);
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); max-height: 0; }
        to { opacity: 1; transform: translateY(0); max-height: 50px; }
    }
    
    @keyframes fadeInSlide {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(style);
