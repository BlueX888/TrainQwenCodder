class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxCombo = 12;
    this.comboTimeout = 1000; // 1秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建青色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x006666, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域视觉提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(4, 0x00ffff, 1);
    clickArea.strokeRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 20);
    clickArea.fillStyle(0x008888, 0.3);
    clickArea.fillRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 20);

    // 提示文本
    this.add.text(width / 2, height / 2 - 150, 'Click to Build Combo!', {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Combo计数显示
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#003333',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 倒计时进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x003333, 1);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 60, 300, 20);

    // 倒计时进度条
    this.timerBar = this.add.graphics();

    // 目标提示
    this.targetText = this.add.text(width / 2, height / 2 + 120, 'Reach 12 Combo for Special Effect!', {
      fontSize: '18px',
      color: '#00cccc'
    }).setOrigin(0.5);

    // 状态信号（可验证）
    this.statusText = this.add.text(10, 10, 'Status: Ready', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建粒子纹理（用于特效）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不激活）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      quantity: 2,
      frequency: 50,
      emitting: false
    });
  }

  onPointerDown(pointer) {
    // 增加combo
    this.combo++;
    this.updateComboDisplay();

    // 重置计时器
    this.resetComboTimer();

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1.2, to: 1 },
      duration: 150,
      ease: 'Back.out'
    });

    // 创建点击涟漪效果
    this.createRipple(pointer.x, pointer.y);

    // 检查是否达到目标combo
    if (this.combo === this.maxCombo) {
      this.triggerSpecialEffect();
    }

    // 更新状态信号
    this.statusText.setText(`Status: Combo=${this.combo}, Timer=Active`);
  }

  resetComboTimer() {
    // 销毁旧计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 创建新计时器
    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.onComboTimeout,
      callbackScope: this,
      loop: false
    });

    // 重置进度条
    this.timerBarProgress = 1;
  }

  onComboTimeout() {
    // 超时重置combo
    this.combo = 0;
    this.updateComboDisplay();
    this.comboTimer = null;
    this.timerBarProgress = 0;

    // 更新状态信号
    this.statusText.setText(`Status: Combo=0, Timer=Expired`);

    // 重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: { from: 0.3, to: 1 },
      duration: 300
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据combo数量改变颜色
    if (this.combo >= this.maxCombo) {
      this.comboText.setColor('#ffff00'); // 金色
    } else if (this.combo >= 8) {
      this.comboText.setColor('#ff00ff'); // 紫色
    } else if (this.combo >= 4) {
      this.comboText.setColor('#00ff00'); // 绿色
    } else {
      this.comboText.setColor('#00ffff'); // 青色
    }
  }

  createRipple(x, y) {
    const ripple = this.add.graphics();
    ripple.lineStyle(3, 0x00ffff, 1);
    ripple.strokeCircle(0, 0, 10);
    ripple.setPosition(x, y);

    this.tweens.add({
      targets: ripple,
      scale: { from: 0.5, to: 3 },
      alpha: { from: 1, to: 0 },
      duration: 500,
      onComplete: () => ripple.destroy()
    });
  }

  triggerSpecialEffect() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 粒子爆炸效果
    this.particleEmitter.setPosition(width / 2, height / 2);
    this.particleEmitter.explode(50);

    // 文本闪烁和缩放动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1, to: 1.5, to: 1 },
      duration: 600,
      ease: 'Bounce.out'
    });

    this.tweens.add({
      targets: this.comboText,
      alpha: { from: 1, to: 0.3, to: 1 },
      duration: 200,
      repeat: 3
    });

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.6);
    flash.fillRect(0, 0, width, height);
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.6, to: 0 },
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // 创建星星特效
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const distance = 100;
      const star = this.add.graphics();
      star.fillStyle(0xffff00, 1);
      star.fillStar(0, 0, 5, 10, 20);
      star.setPosition(width / 2, height / 2);

      this.tweens.add({
        targets: star,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        scale: { from: 0, to: 1.5 },
        alpha: { from: 1, to: 0 },
        duration: 800,
        ease: 'Cubic.out',
        onComplete: () => star.destroy()
      });
    }

    // 更新状态信号
    this.statusText.setText(`Status: SPECIAL EFFECT TRIGGERED! Combo=${this.combo}`);
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.comboTimer) {
      const progress = 1 - this.comboTimer.getProgress();
      this.timerBar.clear();
      this.timerBar.fillStyle(0x00ffff, 1);
      const width = this.cameras.main.width;
      this.timerBar.fillRect(width / 2 - 150, this.cameras.main.height / 2 + 60, 300 * progress, 20);
    } else {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ComboScene
};

new Phaser.Game(config);