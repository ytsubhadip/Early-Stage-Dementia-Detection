
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    STORAGE_KEYS: {
        ASSESSMENT_DATA: 'dementiaAssessmentData',
        PREDICTION_RESULT: 'dementiaPredictionResult',
        USER_HISTORY: 'dementiaUserHistory'
    },
    TIMEOUTS: {
        PROCESSING_MIN: 3000,
        PROCESSING_MAX: 8000,
        API_TIMEOUT: 30000
    }
};

// Utility Functions
const Utils = {
    // Format date to readable string
    formatDate: (date) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    // Get relative time (e.g., "2 days ago")
    getRelativeTime: (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffInSeconds = Math.floor((now - then) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return Utils.formatDate(date);
    },

    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Store data in localStorage with error handling
    storeData: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    },

    // Retrieve data from localStorage with error handling
    getData: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error retrieving data:', error);
            return defaultValue;
        }
    },

    // Show notification/toast message
    showNotification: (message, type = 'info', duration = 3000) => {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        // Add to document
        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// API Service
const ApiService = {
    // Make API request with error handling
    makeRequest: async (endpoint, options = {}) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUTS.API_TIMEOUT);

            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // Submit assessment data for prediction
    submitAssessment: async (assessmentData) => {
        try {
            const result = await ApiService.makeRequest('/predict', {
                method: 'POST',
                body: JSON.stringify(assessmentData)
            });
            return result;
        } catch (error) {
            // Return demo data if API fails
            console.warn('API unavailable, using demo data');
            return ApiService.getDemoResult(assessmentData);
        }
    },

    // Generate demo result for testing
    getDemoResult: (assessmentData) => {
        const age = parseInt(assessmentData.age) || 65;
        const memoryScore = parseFloat(assessmentData.memory_names) || 5;
        const mathResult = parseInt(assessmentData.math_test) || 0;
        
        // Simple risk calculation for demo
        let riskScore = 0;
        if (age > 70) riskScore += 0.3;
        if (memoryScore < 5) riskScore += 0.4;
        if (mathResult !== 79) riskScore += 0.2; // 100-7-7-7 = 79
        if (assessmentData.family_history && assessmentData.family_history.includes('dementia')) {
            riskScore += 0.3;
        }

        const isHighRisk = riskScore > 0.5;
        const confidence = Math.min(95, Math.max(65, 85 + Math.random() * 20));

        return {
            prediction: isHighRisk ? 1 : 0,
            risk_level: isHighRisk ? 'High Risk' : 'Low Risk',
            confidence: Math.round(confidence),
            memory_score: Math.max(1, Math.min(10, memoryScore + Math.random() * 2)),
            cognitive_score: Math.max(1, Math.min(10, 8 - riskScore * 5 + Math.random())),
            attention_score: Math.max(1, Math.min(10, 7.5 - riskScore * 3 + Math.random())),
            language_score: Math.max(1, Math.min(10, 8.5 - riskScore * 2 + Math.random()))
        };
    }
};

// History Management
const HistoryManager = {
    // Add new assessment to history
    addAssessment: (assessmentData, result) => {
        const history = Utils.getData(CONFIG.STORAGE_KEYS.USER_HISTORY, []);
        const assessment = {
            id: Utils.generateId(),
            date: new Date().toISOString(),
            data: assessmentData,
            result: result,
            timestamp: Date.now()
        };
        
        history.unshift(assessment); // Add to beginning
        
        // Keep only last 50 assessments
        if (history.length > 50) {
            history.splice(50);
        }
        
        Utils.storeData(CONFIG.STORAGE_KEYS.USER_HISTORY, history);
        return assessment;
    },

    // Get assessment history
    getHistory: (limit = null) => {
        const history = Utils.getData(CONFIG.STORAGE_KEYS.USER_HISTORY, []);
        return limit ? history.slice(0, limit) : history;
    },

    // Get assessment by ID
    getAssessmentById: (id) => {
        const history = HistoryManager.getHistory();
        return history.find(assessment => assessment.id === id);
    },

    // Clear all history
    clearHistory: () => {
        Utils.storeData(CONFIG.STORAGE_KEYS.USER_HISTORY, []);
    },

    // Export history as CSV
    exportHistoryAsCSV: () => {
        const history = HistoryManager.getHistory();
        if (history.length === 0) {
            Utils.showNotification('No assessment history to export', 'info');
            return;
        }

        let csv = 'Date,Risk Level,Confidence,Memory Score,Cognitive Score,Attention Score,Age,Gender\n';
        
        history.forEach(assessment => {
            const result = assessment.result;
            const data = assessment.data;
            csv += [
                Utils.formatDate(assessment.date),
                result.risk_level,
                `${result.confidence}%`,
                result.memory_score?.toFixed(1) || 'N/A',
                result.cognitive_score?.toFixed(1) || 'N/A',
                result.attention_score?.toFixed(1) || 'N/A',
                data.age || 'N/A',
                data.gender || 'N/A'
            ].join(',') + '\n';
        });

        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dementia_assessment_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        Utils.showNotification('History exported successfully!', 'success');
    }
};

// Animation utilities
const AnimationUtils = {
    // Fade in element
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Fade out element
    fadeOut: (element, duration = 300) => {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (initialOpacity * (1 - progress)).toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Slide in from right
    slideInRight: (element, duration = 300) => {
        element.style.transform = 'translateX(100%)';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.style.transform = `translateX(${100 * (1 - easeOut)}%)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                this.disabled = true;
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 5000);
            }
        });
    });

    // Add animation classes to elements that come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, observerOptions);

    // Observe elements for animations
    document.querySelectorAll('.feature-card, .overview-card, .analysis-card').forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for animations
const animationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        padding: 0;
        margin: 0;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Export for use in other files
window.DementiaApp = {
    Utils,
    ApiService,
    HistoryManager,
    AnimationUtils,
    CONFIG
};
