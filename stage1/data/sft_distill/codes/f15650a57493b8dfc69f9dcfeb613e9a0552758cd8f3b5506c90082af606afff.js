class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    // 可验证的状态变量
    this.comboCount = 0;
    this.maxCombo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 500; // 0.5秒
    this.COMBO_TRIGGER = 8; // 8连击触发特效
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建绿色背景
    const background = this.add.graphics();
    background.fillStyle(0x2d5016, 1);
    background.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x88cc44, 1);
    clickArea.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click anywhere to build combo!', {
      fontSize: '20px',
      color: '#88cc44',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // 创建 Combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#004400',
      strokeThickness: 6
    });
    this.comboText.setOrigin(0.5);

    // 创建最大 Combo 记录显示
    this.maxComboText = this.add.text(width / 2, height / 2 + 80, 'MAX: 0', {
      fontSize: '24px',
      color: '#88cc44',
      fontStyle: 'bold'
    });
    this.maxComboText.setOrigin(0.5);

    // 创建计时器提示条
    this.timerBar = this.add.graphics();
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x003300, 1);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 120, 300, 20);

    // 创建粒子纹理（用于特效）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ff00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始为停止状态）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: -1, // 手动发射
      quantity: 30
    });

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 状态信息显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#88cc44',
      backgroundColor: '#002200',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();
  }

  handleClick(pointer) {
    // 增加 combo
    this.comboCount++;
    
    // 更新最大 combo
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }

    // 更新显示
    this.updateComboDisplay();

    // 重置计时器
    this.resetComboTimer();

    // 检查是否达到 8 连击
    if (this.comboCount === this.COMBO_TRIGGER) {
      this.triggerComboEffect();
    }

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 创建点击位置的临时粒子效果
    const clickParticle = this.add.graphics();
    clickParticle.fillStyle(0x00ff00, 0.8);
    clickParticle.fillCircle(pointer.x, pointer.y, 20);
    this.tweens.add({
      targets: clickParticle,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => clickParticle.destroy()
    });
  }

  resetComboTimer() {
    // 清除旧的计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新的计时器
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 记录开始时间用于进度条
    this.timerStartTime = this.time.now;
  }

  resetCombo() {
    this.comboCount = 0;
    this.updateComboDisplay();
    this.comboTimer = null;
    this.timerStartTime = null;
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    this.maxComboText.setText(`MAX: ${this.maxCombo}`);
    
    // 根据 combo 数量改变颜色
    if (this.comboCount >= this.COMBO_TRIGGER) {
      this.comboText.setColor('#ffff00'); // 黄色
      this.comboText.setStroke('#884400', 6);
    } else if (this.comboCount >= 5) {
      this.comboText.setColor('#00ffff'); // 青色
      this.comboText.setStroke('#004444', 6);
    } else {
      this.comboText.setColor('#00ff00'); // 绿色
      this.comboText.setStroke('#004400', 6);
    }

    this.updateStatusText();
  }

  triggerComboEffect() {
    const { width, height } = this.cameras.main;

    // 发射粒子
    this.emitter.setPosition(width / 2, height / 2);
    this.emitter.explode(50);

    // 文本闪烁动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      ease: 'Power2'
    });

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 创建扩散圆环特效
    const ring = this.add.graphics();
    ring.lineStyle(5, 0xffff00, 1);
    ring.strokeCircle(width / 2, height / 2, 50);
    
    this.tweens.add({
      targets: ring,
      alpha: 0,
      duration: 1000,
      onUpdate: (tween) => {
        const progress = tween.progress;
        ring.clear();
        ring.lineStyle(5 * (1 - progress), 0xffff00, 1 - progress);
        ring.strokeCircle(width / 2, height / 2, 50 + progress * 200);
      },
      onComplete: () => ring.destroy()
    });

    console.log('🎉 8 COMBO ACHIEVED! 🎉');
  }

  updateStatusText() {
    this.statusText.setText(
      `Status:\n` +
      `Current Combo: ${this.comboCount}\n` +
      `Max Combo: ${this.maxCombo}\n` +
      `Timeout: ${this.COMBO_TIMEOUT}ms\n` +
      `Trigger: ${this.COMBO_TRIGGER} hits`
    );
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.comboTimer && this.timerStartTime) {
      const elapsed = time - this.timerStartTime;
      const progress = Math.min(elapsed / this.COMBO_TIMEOUT, 1);
      
      const { width, height } = this.cameras.main;
      const barWidth = 300 * (1 - progress);
      
      this.timerBar.clear();
      
      // 根据剩余时间改变颜色
      let color = 0x00ff00;
      if (progress > 0.7) {
        color = 0xff0000; // 红色警告
      } else if (progress > 0.4) {
        color = 0xffff00; // 黄色提醒
      }
      
      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRect(width / 2 - 150, height / 2 + 120, barWidth, 20);
    } else {
      // 没有活动计时器时清空进度条
      this.timerBar.clear();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ComboScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    comboCount: scene.comboCount,
    maxCombo: scene.maxCombo,
    hasActiveTimer: scene.comboTimer !== null
  };
};