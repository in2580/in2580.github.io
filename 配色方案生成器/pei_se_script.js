class ColorPaletteGenerator {
    constructor() {
        this.baseColorInput = document.querySelector('#baseColor');
        this.hexInput = document.querySelector('#hexValue');
        this.colorCards = document.querySelectorAll('.color-card');
        this.generateRandomBtn = document.querySelector('#generateRandom');
        this.generateHarmonyBtn = document.querySelector('#generateHarmony');
        this.exportBtn = document.querySelector('#export');

        // 设置初始颜色
        const initialColor = '#FF5733';
        this.baseColorInput.value = initialColor;
        this.hexInput.value = initialColor;
        this.generateHarmoniousColors(initialColor);

        // 添加下拉菜单状态
        this.dropdownOpen = false;

        // 初始化下拉菜单元素
        this.dropdownBtn = document.querySelector('#generateHarmony');
        this.dropdownContent = document.querySelector('#dropdownContent');

        // 绑定点击处理器到实例
        this.handleDocumentClick = this.handleDocumentClick.bind(this);

        // 设置默认配色方案
        this.currentScheme = 'complementary';
        this.updateSchemeButtonText();

        // 初始化颜色数量
        this.minColors = 3; // 最小颜色数
        this.maxColors = 6; // 最大颜色数
        this.currentColors = 3; // 当前颜色数

        // 初始化添加颜色按钮
        this.addColorBtn = document.querySelector('.add-color-btn');

        // 使用默认配色方案生成初始颜色
        this.generateSpecificScheme(this.currentScheme);

        this.initializeEventListeners();
        this.initializeColorCardEvents();
        this.activeToast = null; // 添加活动提示框追踪

        // 初始化主题
        this.initializeTheme();

        // 初始化保存相关元素
        this.saveBtn = document.querySelector('#savePalette');
        this.showSavedBtn = document.querySelector('#showSaved');
        this.saveModal = document.querySelector('#saveModal');
        this.savedPalettesModal = document.querySelector('#savedPalettesModal');
        this.paletteNameInput = document.querySelector('#paletteName');

        this.initializeSaveFeatures();
    }

    initializeTheme() {
        // 获取主题切换按钮
        this.themeToggle = document.querySelector('#themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');

        // 从本地存储获取主题设置
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // 添加主题切换事件
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // 更新图标
        this.themeIcon.textContent = theme === 'dark' ? '🌙' : '🌞';

        // 更新按钮提示
        this.themeToggle.title = theme === 'dark' ? '切换到日间模式' : '切换到夜间模式';
    }

    initializeEventListeners() {
        // 颜色选择器变化事件
        this.baseColorInput.addEventListener('input', (e) => {
            this.hexInput.value = e.target.value.toUpperCase();
            this.generateSpecificScheme(this.currentScheme); // 使用当前方案
        });

        // 十六进制输入框变化事件
        this.hexInput.addEventListener('input', (e) => {
            if (this.isValidHex(e.target.value)) {
                this.baseColorInput.value = e.target.value;
                this.generateSpecificScheme(this.currentScheme);
            }
        });

        // 随机生成按钮
        this.generateRandomBtn.addEventListener('click', () => {
            const randomColor = this.generateRandomColor();
            this.baseColorInput.value = randomColor;
            this.hexInput.value = randomColor.toUpperCase();

            // 随机选择配色方案
            const schemes = ['complementary', 'triadic', 'analogous', 'split'];
            const randomScheme = schemes[Math.floor(Math.random() * schemes.length)];
            this.currentScheme = randomScheme;
            this.generateSpecificScheme(randomScheme);
            // 只在随机生成时显示一次提示
            this.showToast(`当前配色方案: ${this.getSchemeNameInChinese(randomScheme)}`);
        });

        // 和谐配色按钮
        this.dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            this.toggleDropdown();
        });

        // 配色方案选项点击事件
        document.querySelectorAll('.scheme-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const schemeType = item.dataset.scheme;
                this.generateSpecificScheme(schemeType);
                this.closeDropdown(); // 选择后关闭下拉菜单
            });
        });

        // 导出按钮
        this.exportBtn.addEventListener('click', () => {
            this.exportPalette();
        });

        // 初始化颜色卡片点击事件
        this.colorCards.forEach(card => {
            card.addEventListener('click', () => {
                this.copyToClipboard(card.dataset.color);
            });
        });

        // 添加全局点击事件监听
        document.addEventListener('click', this.handleDocumentClick);

        // 添加颜色按钮事件
        this.addColorBtn.addEventListener('click', () => {
            this.addNewColor();
        });

        // 初始化删除按钮事件
        this.initializeRemoveButtons();
    }

    // 生成随机颜色
    generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    // 验证十六进制颜色值
    isValidHex(hex) {
        return /^#?([0-9A-F]{3}){1,2}$/i.test(hex);
    }

    // 生成和谐色
    generateHarmoniousColors(baseColor) {
        // 获取不同的和谐配色方案
        const schemes = {
            complementary: this.getComplementaryColors(baseColor),
            triadic: this.getTriadicColors(baseColor),
            analogous: this.getAnalogousColors(baseColor),
            split: this.getSplitComplementaryColors(baseColor)
        };

        // 随机选择一种配色方案
        const schemeTypes = Object.keys(schemes);
        const randomScheme = schemeTypes[Math.floor(Math.random() * schemeTypes.length)];
        const colors = schemes[randomScheme];

        this.updateColorCards(colors);
    }

    // 获取互补色
    getComplementaryColors(baseColor, count) {
        const hsl = this.colorToHSL(baseColor);
        const colors = [baseColor];

        // 生成互补色系列
        const step = 180 / (count - 1);
        for (let i = 1; i < count; i++) {
            const h = (hsl[0] + (step * i)) % 360;
            const s = hsl[1];
            const l = Math.max(20, Math.min(80, hsl[2] + (i % 2 ? 10 : -10)));
            colors.push(this.hslToHex(h, s, l));
        }

        return colors;
    }

    // 获取三角配色
    getTriadicColors(baseColor, count) {
        const hsl = this.colorToHSL(baseColor);
        const colors = [baseColor];

        // 生成三角配色系列
        const step = 120 / (count - 1);
        for (let i = 1; i < count; i++) {
            const h = (hsl[0] + (step * i)) % 360;
            const s = hsl[1];
            const l = Math.max(20, Math.min(80, hsl[2] + (i % 2 ? 10 : -10)));
            colors.push(this.hslToHex(h, s, l));
        }

        return colors;
    }

    // 获取邻近色
    getAnalogousColors(baseColor, count) {
        const hsl = this.colorToHSL(baseColor);
        const colors = [baseColor];

        // 生成邻近色系列
        const step = 30 / (count - 1);
        for (let i = 1; i < count; i++) {
            const h = (hsl[0] + (step * i)) % 360;
            const s = Math.min(100, hsl[1] + (i % 2 ? 5 : -5));
            const l = Math.max(20, Math.min(80, hsl[2] + (i % 2 ? 10 : -10)));
            colors.push(this.hslToHex(h, s, l));
        }

        return colors;
    }

    // 获取分裂互补色
    getSplitComplementaryColors(baseColor, count) {
        const hsl = this.colorToHSL(baseColor);
        const colors = [baseColor];

        // 生成分裂互补色系列
        const step = 150 / (count - 1);
        for (let i = 1; i < count; i++) {
            const h = (hsl[0] + (step * i)) % 360;
            const s = Math.min(100, hsl[1] + (i % 2 ? 5 : -5));
            const l = Math.max(20, Math.min(80, hsl[2] + (i % 2 ? 10 : -10)));
            colors.push(this.hslToHex(h, s, l));
        }

        return colors;
    }

    // 将颜色转换为HSL
    colorToHSL(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h = h * 60;
        }

        return [h, s * 100, l * 100];
    }

    // 获取方案中文名称
    getSchemeNameInChinese(scheme) {
        const names = {
            complementary: '互补色',
            triadic: '三角配色',
            analogous: '邻近色',
            split: '分裂互补色'
        };
        return names[scheme] || '未知方案';
    }

    // 更新颜色卡片
    updateColorCards(colors) {
        const cards = document.querySelectorAll('.color-card');
        cards.forEach((card, index) => {
            if (colors[index]) {
                const color = colors[index].toUpperCase();
                card.style.backgroundColor = color;
                card.dataset.color = color;
            }
        });
    }

    // 复制颜色值到剪贴板
    copyToClipboard(color) {
        navigator.clipboard.writeText(color).then(() => {
            this.showToast(`已复制颜色值: ${color}`);
        });
    }

    // 显示提示信息
    showToast(message) {
        // 如果存在活动提示框，先移除它
        if (this.activeToast) {
            this.activeToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 保存当前活动提示框引用
        this.activeToast = toast;

        // 动画结束后移除提示
        setTimeout(() => {
            if (this.activeToast === toast) {
                toast.remove();
                this.activeToast = null;
            }
        }, 2000);
    }

    // 导出配色方案
    exportPalette() {
        const colors = Array.from(this.colorCards).map(card => card.dataset.color);
        const css = this.generateCSS(colors);
        this.downloadFile('palette.css', css);
    }

    // 生成 CSS
    generateCSS(colors) {
            return `:root {\n${colors.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n')}\n}`;
    }

    // 下载文件
    downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // 添加 HSL 转 Hex 的方法
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        const rgb = [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];

        return '#' + rgb
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }

    // 添加指定方案生成方法
    generateSpecificScheme(schemeType) {
        this.currentScheme = schemeType;
        const baseColor = this.baseColorInput.value;
        let colors = [];
        
        switch(schemeType) {
            case 'complementary':
                colors = this.getComplementaryColors(baseColor, this.currentColors);
                break;
            case 'triadic':
                colors = this.getTriadicColors(baseColor, this.currentColors);
                break;
            case 'analogous':
                colors = this.getAnalogousColors(baseColor, this.currentColors);
                break;
            case 'split':
                colors = this.getSplitComplementaryColors(baseColor, this.currentColors);
                break;
        }
        
        this.updateColorCards(colors);
        this.updateSchemeButtonText(); // 只更新按钮文本，不显示 toast
    }

    // 切换下拉菜单
    toggleDropdown() {
        if (this.dropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    // 打开下拉菜单
    openDropdown() {
        this.dropdownContent.classList.add('show');
        this.dropdownOpen = true;
    }

    // 关闭下拉菜单
    closeDropdown() {
        this.dropdownContent.classList.remove('show');
        this.dropdownOpen = false;
    }

    // 处理全局点击事件
    handleDocumentClick(e) {
        if (!this.dropdownContent.contains(e.target) && !this.dropdownBtn.contains(e.target)) {
            this.closeDropdown();
        }
    }

    // 添加新的颜色卡片
    addNewColor() {
        if (this.currentColors >= this.maxColors) {
            this.showToast('最多支持6种颜色');
            return;
        }

        const newCard = document.createElement('div');
        newCard.className = 'color-card';
        newCard.dataset.color = '#FFFFFF';
        
        // 添加删除按钮
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-color-btn';
        removeBtn.title = '删除此颜色';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeColorCard(newCard);
        });
        
        newCard.appendChild(removeBtn);
        
        // 在添加按钮前插入新卡片
        this.addColorBtn.parentNode.insertBefore(newCard, this.addColorBtn);
        this.currentColors++;
        
        // 重新生成配色方案
        this.generateSpecificScheme(this.currentScheme);
        this.updateMinimumClass();
    }

    // 更新方案按钮文本
    updateSchemeButtonText() {
        const schemeName = this.getSchemeNameInChinese(this.currentScheme);
        this.dropdownBtn.textContent = `${schemeName} ▼`;
    }

    // 初始化删除按钮
    initializeRemoveButtons() {
        document.querySelectorAll('.remove-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeColorCard(btn.parentElement);
            });
        });
    }

    // 删除颜色卡片
    removeColorCard(card) {
        if (this.currentColors <= this.minColors) {
            this.showToast('至少需要保留3种颜色');
            return;
        }
        
        card.remove();
        this.currentColors--;
        this.generateSpecificScheme(this.currentScheme);
        this.updateMinimumClass();
    }

    // 更新最小颜色卡片类
    updateMinimumClass() {
        const cards = document.querySelectorAll('.color-card');
        cards.forEach(card => {
            if (this.currentColors <= this.minColors) {
                card.classList.add('minimum');
            } else {
                card.classList.remove('minimum');
            }
        });
    }

    initializeColorCardEvents() {
        // 添加触摸事件支持
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.color-card');
            if (card) {
                e.preventDefault(); // 防止双击缩放
                this.copyColorToClipboard(card.dataset.color);
            }
        });

        // 保留原有的点击事件
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.color-card');
            if (card) {
                this.copyColorToClipboard(card.dataset.color);
            }
        });
    }

    // 复制颜色到剪贴板
    copyColorToClipboard(color) {
        navigator.clipboard.writeText(color).then(() => {
            this.showToast(`已复制颜色代码：${color}`);
        }).catch(err => {
            this.showToast('复制失败，请手动复制');
        });
    }

    initializeSaveFeatures() {
        // 保存按钮点击事件
        this.saveBtn.addEventListener('click', () => {
            this.openSaveModal();
        });

        // 查看已保存按钮点击事件
        this.showSavedBtn.addEventListener('click', () => {
            this.showSavedPalettes();
        });

        // 确认保存
        document.querySelector('#confirmSave').addEventListener('click', () => {
            this.savePalette();
        });

        // 取消保存
        document.querySelector('#cancelSave').addEventListener('click', () => {
            this.closeSaveModal();
        });

        // 关闭已保存列表
        document.querySelector('#closeSavedPalettes').addEventListener('click', () => {
            this.closeSavedPalettesModal();
        });
    }

    openSaveModal() {
        this.saveModal.classList.add('show');
        this.paletteNameInput.focus();
    }

    closeSaveModal() {
        this.saveModal.classList.remove('show');
        this.paletteNameInput.value = '';
    }

    savePalette() {
        const name = this.paletteNameInput.value.trim();
        if (!name) {
            this.showToast('请输入配色方案名称');
            return;
        }

        const colors = Array.from(document.querySelectorAll('.color-card'))
            .map(card => card.dataset.color);

        const savedPalettes = this.getSavedPalettes();
        
        if (savedPalettes[name]) {
            this.showToast('该名称已存在，请使用其他名称');
            return;
        }

        savedPalettes[name] = {
            colors,
            timestamp: Date.now(),
            scheme: this.currentScheme
        };

        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
        this.showToast('配色方案已保存');
        this.closeSaveModal();
    }

    getSavedPalettes() {
        return JSON.parse(localStorage.getItem('savedPalettes') || '{}');
    }

    showSavedPalettes() {
        const container = this.savedPalettesModal.querySelector('.saved-palettes-container');
        container.innerHTML = '';
        const palettes = this.getSavedPalettes();

        Object.entries(palettes)
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .forEach(([name, data]) => {
                const paletteElement = this.createPaletteElement(name, data);
                container.appendChild(paletteElement);
            });

        this.savedPalettesModal.classList.add('show');
    }

    createPaletteElement(name, data) {
        const div = document.createElement('div');
        div.className = 'saved-palette';
        
        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'palette-colors';
        data.colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorsDiv.appendChild(colorDiv);
        });

        const infoDiv = document.createElement('div');
        infoDiv.className = 'palette-info';
        infoDiv.innerHTML = `
            <span>${name}</span>
            <div class="palette-actions">
                <button class="load-palette">使用</button>
                <button class="delete-palette">删除</button>
            </div>
        `;

        div.appendChild(colorsDiv);
        div.appendChild(infoDiv);

        // 添加事件监听
        div.querySelector('.load-palette').addEventListener('click', () => {
            this.loadPalette(data);
            this.closeSavedPalettesModal();
        });

        div.querySelector('.delete-palette').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deletePalette(name);
            div.remove();
        });

        return div;
    }

    loadPalette(data) {
        // 先调整颜色卡片数量
        this.adjustColorCardCount(data.colors.length);
        
        // 更新配色方案和颜色卡片
        this.currentScheme = data.scheme;
        this.updateColorCards(data.colors);
        this.updateSchemeButtonText();
        this.showToast('已加载配色方案');
    }

    // 添加新方法：调整颜色卡片数量
    adjustColorCardCount(targetCount) {
        // 获取当前颜色卡片数量
        const currentCards = document.querySelectorAll('.color-card');
        const currentCount = currentCards.length;
        
        if (currentCount === targetCount) {
            return; // 如果数量相同，无需调整
        }
        
        const paletteDisplay = document.querySelector('.palette-display');
        const addColorBtn = document.querySelector('.add-color-btn');
        
        if (currentCount < targetCount) {
            // 需要添加卡片
            for (let i = currentCount; i < targetCount; i++) {
                if (i < this.maxColors) {  // 确保不超过最大限制
                    const newCard = document.createElement('div');
                    newCard.className = 'color-card';
                    newCard.dataset.color = '#FFFFFF';
                    
                    // 添加删除按钮
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-color-btn';
                    removeBtn.title = '删除此颜色';
                    removeBtn.textContent = '×';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeColorCard(newCard);
                    });
                    
                    newCard.appendChild(removeBtn);
                    paletteDisplay.insertBefore(newCard, addColorBtn);
                    this.currentColors++;
                }
            }
        } else {
            // 需要移除多余的卡片
            for (let i = currentCount - 1; i >= targetCount && i >= this.minColors; i--) {
                currentCards[i].remove();
                this.currentColors--;
            }
        }
        
        this.updateMinimumClass();
    }

    deletePalette(name) {
        const palettes = this.getSavedPalettes();
        delete palettes[name];
        localStorage.setItem('savedPalettes', JSON.stringify(palettes));
        this.showToast('配色方案已删除');
    }

    closeSavedPalettesModal() {
        this.savedPalettesModal.classList.remove('show');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteGenerator();
});