class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 3000; // 3秒超时
    this.COMBO_THRESHOLD = 5; // 连击5次触发特效
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建绿色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d5016, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x00ff00, 1);
    clickArea.strokeRoundedRect(width / 2 - 200, height / 2 - 100, 400, 200, 10);
    
    const clickText = this.add.text(width / 2, height / 2 - 150, 'Click anywhere to build combo!', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建Combo显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#004400',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(width / 2, height / 2 + 80, '', {
      fontSize: '24px',
      color: '#88ff88'
    }).setOrigin(0.5);

    // 创建特效容器（用于粒子效果）
    this.particleGraphics = this.add.graphics();

    // 添加点击事件监听
    this.input.on('pointerdown', this.onPointerDown, this);

    // 状态信号变量（用于验证）
    this.totalClicks = 0;
    this.maxCombo = 0;
    this.specialEffectCount = 0;
  }

  onPointerDown(pointer) {
    // 增加combo
    this.combo++;
    this.totalClicks++;
    
    // 更新最大combo记录
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // 更新显示
    this.updateComboDisplay();

    // 检查是否达到特效触发条件
    if (this.combo === this.COMBO_THRESHOLD) {
      this.triggerSpecialEffect();
    }

    // 重置或创建定时器
    this.resetComboTimer();

    // 点击反馈动画
    this.createClickFeedback(pointer.x, pointer.y);
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // Combo数字弹跳动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1.2, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 根据combo数量改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#ffff00'); // 黄色
    } else if (this.combo >= 3) {
      this.comboText.setColor('#00ffff'); // 青色
    } else {
      this.comboText.setColor('#00ff00'); // 绿色
    }
  }

  resetComboTimer() {
    // 清除旧定时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新定时器
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.onComboTimeout,
      callbackScope: this
    });
  }

  onComboTimeout() {
    // 超时重置combo
    this.combo = 0;
    this.updateComboDisplay();
    this.timerText.setText('COMBO RESET!');
    
    // 重置提示文本颜色
    this.tweens.add({
      targets: this.timerText,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power2'
    });

    this.comboTimer = null;
  }

  triggerSpecialEffect() {
    this.specialEffectCount++;

    const { width, height } = this.cameras.main;

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.5);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.5, to: 0 },
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // Combo文字爆炸缩放
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1, to: 2, to: 1 },
      duration: 600,
      ease: 'Bounce.easeOut'
    });

    // 创建粒子爆炸效果
    this.createParticleExplosion(width / 2, height / 2);

    // 显示特效提示
    const effectText = this.add.text(width / 2, height / 2 + 150, '★ COMBO MASTER! ★', {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff8800',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: { from: 0, to: 1, to: 0 },
      y: { from: height / 2 + 150, to: height / 2 + 100 },
      duration: 2000,
      ease: 'Power2',
      onComplete: () => effectText.destroy()
    });
  }

  createClickFeedback(x, y) {
    // 创建点击位置的圆圈扩散效果
    const circle = this.add.graphics();
    circle.lineStyle(3, 0x00ff00, 1);
    circle.strokeCircle(x, y, 10);

    this.tweens.add({
      targets: circle,
      alpha: { from: 1, to: 0 },
      duration: 500,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const radius = 10 + progress * 40;
        circle.clear();
        circle.lineStyle(3, 0x00ff00, 1 - progress);
        circle.strokeCircle(x, y, radius);
      },
      onComplete: () => circle.destroy()
    });
  }

  createParticleExplosion(x, y) {
    // 创建多个粒子向外扩散
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(x, y);

      const distance = 100 + Math.random() * 50;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: { from: 1, to: 0 },
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(1);
      this.timerText.setText(`Time: ${seconds}s`);
      this.timerText.setAlpha(1);
      
      // 时间快用完时变红
      if (remaining < 1000) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#88ff88');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ComboScene
};

const game = new Phaser.Game(config);

// 状态验证：可以通过 game.scene.scenes[0] 访问场景实例
// 验证变量：totalClicks, combo, maxCombo, specialEffectCount