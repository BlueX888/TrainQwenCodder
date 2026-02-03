class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.comboCount = 0; // 可验证的状态变量
    this.comboTimer = null;
    this.comboText = null;
    this.isSpecialEffectPlaying = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x16213e, 1);
    clickArea.strokeRect(50, 50, width - 100, height - 100);
    
    const hintText = this.add.text(width / 2, 100, 'Click anywhere to build combo!', {
      fontSize: '24px',
      color: '#0f3460',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '64px',
      color: '#00d9ff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建计时器进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 1);
    this.timerBarBg.fillRect(width / 2 - 200, height - 100, 400, 20);

    // 创建计时器进度条
    this.timerBar = this.add.graphics();

    // 创建提示文本
    this.timerText = this.add.text(width / 2, height - 60, 'Click to start combo!', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.timerText.setOrigin(0.5);

    // 添加点击事件监听
    this.input.on('pointerdown', this.handleClick, this);

    // 创建特效容器（预先创建，避免在 update 中创建）
    this.effectParticles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x00d9ff, 1);
      particle.fillCircle(0, 0, 8);
      particle.setVisible(false);
      this.effectParticles.push(particle);
    }
  }

  handleClick(pointer) {
    // 增加 combo
    this.comboCount++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 创建点击位置的涟漪效果
    const ripple = this.add.graphics();
    ripple.lineStyle(3, 0x00d9ff, 1);
    ripple.strokeCircle(pointer.x, pointer.y, 10);
    
    this.tweens.add({
      targets: ripple,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 500,
      onComplete: () => ripple.destroy()
    });

    // 检查是否达到 15 连击
    if (this.comboCount === 15 && !this.isSpecialEffectPlaying) {
      this.triggerSpecialEffect();
    }
  }

  resetCombo() {
    this.comboCount = 0;
    this.updateComboDisplay();
    this.comboTimer = null;
    
    // 更新提示文本
    this.timerText.setText('Combo Reset! Click to start again.');
    this.timerText.setColor('#ff6b6b');
    
    this.time.delayedCall(1000, () => {
      this.timerText.setText('Click to start combo!');
      this.timerText.setColor('#ffffff');
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    
    // 根据 combo 数改变颜色
    if (this.comboCount >= 15) {
      this.comboText.setColor('#ff00ff');
    } else if (this.comboCount >= 10) {
      this.comboText.setColor('#ffff00');
    } else if (this.comboCount >= 5) {
      this.comboText.setColor('#00ff00');
    } else {
      this.comboText.setColor('#00d9ff');
    }
  }

  triggerSpecialEffect() {
    this.isSpecialEffectPlaying = true;
    const { width, height } = this.cameras.main;

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // 文字爆炸放大效果
    this.tweens.add({
      targets: this.comboText,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });

    // 粒子爆炸效果
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.effectParticles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / this.effectParticles.length;
      const distance = 200;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;
      
      particle.setPosition(centerX, centerY);
      particle.setVisible(true);
      particle.setAlpha(1);
      
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.setVisible(false)
      });
    });

    // 显示祝贺文本
    const congratsText = this.add.text(width / 2, height / 2 + 100, '★ 15 COMBO! ★', {
      fontSize: '48px',
      color: '#ff00ff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    congratsText.setOrigin(0.5);
    congratsText.setAlpha(0);
    
    this.tweens.add({
      targets: congratsText,
      alpha: 1,
      y: height / 2 + 80,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: congratsText,
        alpha: 0,
        duration: 500,
        onComplete: () => congratsText.destroy()
      });
    });

    // 重置特效标志
    this.time.delayedCall(1500, () => {
      this.isSpecialEffectPlaying = false;
    });
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.comboTimer && this.comboCount > 0) {
      const progress = 1 - (this.comboTimer.getProgress());
      const { width } = this.cameras.main;
      
      this.timerBar.clear();
      
      // 根据剩余时间改变颜色
      let color = 0x00ff00; // 绿色
      if (progress < 0.3) {
        color = 0xff0000; // 红色
      } else if (progress < 0.6) {
        color = 0xffff00; // 黄色
      }
      
      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRect(width / 2 - 200, this.cameras.main.height - 100, 400 * progress, 20);
      
      // 更新提示文本
      const timeLeft = (this.comboTimer.delay * (1 - this.comboTimer.getProgress()) / 1000).toFixed(1);
      this.timerText.setText(`Time left: ${timeLeft}s | Combo: ${this.comboCount}`);
    } else if (this.comboCount === 0) {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ComboScene
};

const game = new Phaser.Game(config);