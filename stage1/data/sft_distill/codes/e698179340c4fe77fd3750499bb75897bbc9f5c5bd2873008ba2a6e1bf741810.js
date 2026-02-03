class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 500; // 0.5秒
    this.COMBO_THRESHOLD = 8; // 连击8次触发特效
    this.hasTriggeredEffect = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建绿色点击区域背景
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0x00ff00, 0.3);
    this.clickArea.fillRoundedRect(
      width / 2 - 200,
      height / 2 - 150,
      400,
      300,
      20
    );

    // 创建点击提示文本
    this.add.text(width / 2, height / 2 - 100, 'Click Here!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建 Combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'Combo: 0', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 创建状态提示文本
    this.statusText = this.add.text(width / 2, height / 2 + 80, '', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建特效容器（用于粒子效果）
    this.effectGraphics = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 添加说明文本
    this.add.text(10, 10, 'Click rapidly to build combo!\n0.5s timeout | 8 hits = Special Effect', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, height - 30, '', {
      fontSize: '14px',
      color: '#cccccc'
    });
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 清除旧的定时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新的 0.5 秒定时器
    this.comboTimer = this.time.delayedCall(
      this.COMBO_TIMEOUT,
      this.resetCombo,
      [],
      this
    );

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 检查是否达到连击阈值
    if (this.combo === this.COMBO_THRESHOLD && !this.hasTriggeredEffect) {
      this.triggerSpecialEffect();
    }

    // 创建点击位置的视觉反馈
    this.createClickFeedback(pointer.x, pointer.y);
  }

  resetCombo() {
    const previousCombo = this.combo;
    this.combo = 0;
    this.hasTriggeredEffect = false;
    this.updateComboDisplay();

    // 显示重置提示
    this.statusText.setText('Combo Reset!');
    this.statusText.setColor('#ff0000');

    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.statusText.setAlpha(1);
        this.statusText.setText('');
      }
    });

    console.log(`Combo reset from ${previousCombo} to 0`);
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);

    // 根据 combo 数量改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#ff00ff'); // 紫色
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ffff00'); // 黄色
    } else if (this.combo >= 3) {
      this.comboText.setColor('#00ffff'); // 青色
    } else {
      this.comboText.setColor('#00ff00'); // 绿色
    }

    // 更新调试信息
    const timeRemaining = this.comboTimer 
      ? Math.max(0, this.comboTimer.getRemaining()).toFixed(0)
      : 0;
    this.debugText.setText(`Combo: ${this.combo} | Timer: ${timeRemaining}ms`);
  }

  triggerSpecialEffect() {
    this.hasTriggeredEffect = true;

    // 显示特效提示
    this.statusText.setText('🎉 COMBO MASTER! 🎉');
    this.statusText.setColor('#ffff00');
    this.statusText.setFontSize('32px');

    // 文本爆炸效果
    this.tweens.add({
      targets: this.comboText,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });

    // 颜色闪烁效果
    let colorIndex = 0;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const colorInterval = this.time.addEvent({
      delay: 100,
      repeat: 15,
      callback: () => {
        this.comboText.setColor(colors[colorIndex % colors.length]);
        colorIndex++;
      }
    });

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // 粒子爆炸效果
    this.createParticleExplosion(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    console.log('Special effect triggered at combo:', this.combo);
  }

  createClickFeedback(x, y) {
    // 创建点击位置的圆圈扩散效果
    const circle = this.add.graphics();
    circle.lineStyle(3, 0x00ff00, 1);
    circle.strokeCircle(x, y, 10);

    this.tweens.add({
      targets: circle,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => circle.destroy()
    });
  }

  createParticleExplosion(x, y) {
    // 创建多个粒子向四周扩散
    const particleCount = 20;
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 200 + Math.random() * 100;
      const distance = 150;

      const particle = this.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(x, y);

      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  update(time, delta) {
    // 持续更新调试信息
    if (this.comboTimer && this.comboTimer.getRemaining) {
      const timeRemaining = Math.max(0, this.comboTimer.getRemaining()).toFixed(0);
      this.debugText.setText(`Combo: ${this.combo} | Timer: ${timeRemaining}ms`);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ComboScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);