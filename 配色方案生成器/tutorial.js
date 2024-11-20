class ColorTutorial {
    constructor() {
        this.initializeInteractiveExamples();
        this.initializeTheme();
    }

    initializeInteractiveExamples() {
        // 添加交互示例
        const examples = document.querySelectorAll('.color-example');
        examples.forEach(example => {
            this.makeInteractive(example);
        });
    }

    makeInteractive(example) {
        const colorBlocks = example.querySelectorAll('.color-block');
        colorBlocks.forEach(block => {
            // 添加点击复制功能
            block.addEventListener('click', () => {
                const color = block.style.backgroundColor;
                this.copyToClipboard(this.rgbToHex(color));
            });

            // 添加悬停提示
            block.setAttribute('title', '点击复制颜色代码');
        });
    }

    rgbToHex(rgb) {
        // RGB转换为HEX的方法
        const rgbValues = rgb.match(/\d+/g);
        return '#' + rgbValues.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('颜色代码已复制：' + text);
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    }
}

// 初始化教程
document.addEventListener('DOMContentLoaded', () => {
    new ColorTutorial();
});