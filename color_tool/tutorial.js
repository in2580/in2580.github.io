// 主题切换功能
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        if (!this.themeToggle) {
            console.error('Theme toggle button not found');
            return;
        }
        this.init();
    }

    init() {
        // 从本地存储加载主题设置
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // 添加切换事件
        this.themeToggle.addEventListener('click', () => {
            console.log('Theme button clicked');
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            console.log('Switching theme to:', newTheme);
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // 更新图标
        const icon = this.themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '🌞';
        }
        console.log('Theme set to:', theme);
    }
}

// 滚动监听功能
class ScrollSpy {
    constructor() {
        this.sections = document.querySelectorAll('.chapter');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
        this.updateActiveSection();
    }

    updateActiveSection() {
        const fromTop = window.scrollY + 100;

        this.sections.forEach(section => {
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);

            if (
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                if (link) {
                    link.classList.add('active');
                }
            } else {
                if (link) {
                    link.classList.remove('active');
                }
            }
        });
    }
}

// 添加滚动效果
function handleScroll() {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

class ScrollManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // 获取header高度，用于调整滚动位置
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// 添加移动端菜单切换功能
class MobileMenuManager {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.mainNav = document.querySelector('.main-nav');
        this.init();
    }

    init() {
        if (!this.menuToggle || !this.mainNav) return;

        this.menuToggle.addEventListener('click', () => {
            this.mainNav.classList.toggle('active');
            this.menuToggle.setAttribute('aria-expanded',
                this.mainNav.classList.contains('active'));
        });

        // 点击导航链接后关闭菜单
        this.mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.mainNav.classList.remove('active');
                this.menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new ScrollSpy();
    new ScrollManager();
    new MobileMenuManager();
    window.addEventListener('scroll', handleScroll);
});