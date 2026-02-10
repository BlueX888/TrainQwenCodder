class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboTimeout = 1000; // 1秒超时
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建紫色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b3d, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x9b59b6, 1);
    clickArea.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click anywhere to combo!', {
      fontSize: '20px',
      color: '#9b59b6',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // Combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'Combo: 0', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#9b59b6',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);

    // 状态提示文本
    this.statusText = this.add.text(width / 2, height / 2 + 50, 'Click to start!', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'italic'
    });
    this.statusText.setOrigin(0.5);

    // 倒计时进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x34495e, 1);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 100, 300, 20);

    // 倒计时进度条
    this.timerBar = this.add.graphics();

    // 创建紫色粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x9b59b6, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('purpleParticle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不激活）
    this.particles = this.add.particles('purpleParticle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: -1, // 手动发射
      quantity: 30
    });

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 初始化计时器（不启动）
    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false,
      paused: true
    });

    // 用于验证的状态变量
    this.totalClicks = 0;
    this.maxCombo = 0;
    this.specialTriggered = false;
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.totalClicks++;

    // 更新最大 combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // 更新显示
    this.updateComboDisplay();

    // 重置并重启计时器
    if (this.comboTimer) {
      this.comboTimer.reset({
        delay: this.comboTimeout,
        callback: this.resetCombo,
        callbackScope: this,
        loop: false
      });
    }

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1.2, to: 1 },
      duration: 100,
      ease: 'Back.easeOut'
    });

    // 创建点击位置的涟漪效果
    const ripple = this.add.graphics();
    ripple.lineStyle(3, 0x9b59b6, 1);
    ripple.strokeCircle(pointer.x, pointer.y, 10);
    
    this.tweens.add({
      targets: ripple,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 3 },
      duration: 500,
      onComplete: () => ripple.destroy()
    });

    // 检查是否达到 20 连击
    if (this.combo === 20) {
      this.triggerSpecialEffect();
    }

    // 更新状态文本
    if (this.combo < 20) {
      this.statusText.setText(`Keep going! ${20 - this.combo} more to special!`);
    }
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);
    
    // 根据 combo 数量改变颜色
    if (this.combo >= 20) {
      this.comboText.setColor('#e74c3c');
      this.comboText.setStroke('#c0392b', 6);
    } else if (this.combo >= 15) {
      this.comboText.setColor('#f39c12');
      this.comboText.setStroke('#d68910', 5);
    } else if (this.combo >= 10) {
      this.comboText.setColor('#3498db');
      this.comboText.setStroke('#2980b9', 4);
    } else {
      this.comboText.setColor('#ffffff');
      this.comboText.setStroke('#9b59b6', 4);
    }
  }

  resetCombo() {
    if (this.combo > 0) {
      this.combo = 0;
      this.updateComboDisplay();
      this.statusText.setText('Combo reset! Try again!');
      this.statusText.setColor('#e74c3c');
      
      // 重置状态文本颜色
      this.time.delayedCall(1000, () => {
        this.statusText.setColor('#ecf0f1');
        this.statusText.setText('Click to start!');
      });
    }
  }

  triggerSpecialEffect() {
    this.specialTriggered = true;
    this.statusText.setText('🎉 AMAZING! 20 COMBO! 🎉');
    this.statusText.setColor('#f1c40f');
    this.statusText.setFontSize('32px');

    const { width, height } = this.cameras.main;

    // 发射粒子
    this.emitter.explode(50, width / 2, height / 2);

    // 屏幕紫色闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0x9b59b6, 0.5);
    flash.fillRect(0, 0, width, height);
    flash.setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0.5, to: 0 },
      duration: 500,
      repeat: 2,
      yoyo: true,
      onComplete: () => flash.destroy()
    });

    // 摄像机震动
    this.cameras.main.shake(300, 0.01);

    // Combo 文本特殊动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1, to: 1.5 },
      angle: { from: -10, to: 10 },
      duration: 200,
      yoyo: true,
      repeat: 3
    });

    // 创建环绕粒子效果
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 100, () => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 150;
        const x = width / 2 + Math.cos(angle) * distance;
        const y = height / 2 + Math.sin(angle) * distance;
        this.emitter.explode(10, x, y);
      });
    }

    // 恢复状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setFontSize('24px');
      this.statusText.setText('Keep the combo going!');
      this.statusText.setColor('#ecf0f1');
    });
  }

  update(time, delta) {
    // 更新倒计时进度条
    if (this.comboTimer && !this.comboTimer.paused && this.combo > 0) {
      const progress = 1 - (this.comboTimer.getProgress());
      const barWidth = 300 * progress;
      
      this.timerBar.clear();
      
      // 根据剩余时间改变颜色
      let color = 0x2ecc71; // 绿色
      if (progress < 0.3) {
        color = 0xe74c3c; // 红色
      } else if (progress < 0.6) {
        color = 0xf39c12; // 橙色
      }
      
      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 100,
        barWidth,
        20
      );
    } else if (this.combo === 0) {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d1b3d',
  scene: ComboScene,
  parent: 'game-container'
};

new Phaser.Game(config);