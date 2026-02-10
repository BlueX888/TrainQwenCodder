class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.comboCount = 0; // 可验证的状态变量
    this.comboTimer = null;
    this.isComboActive = false;
    this.COMBO_TIMEOUT = 2500; // 2.5秒
    this.COMBO_TARGET = 15; // 15连击目标
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建橙色背景
    const background = this.add.graphics();
    background.fillStyle(0xFF8C00, 1); // 橙色
    background.fillRect(0, 0, width, height);

    // 创建点击区域（中央深橙色矩形）
    const clickZone = this.add.graphics();
    clickZone.fillStyle(0xFF6600, 1);
    clickZone.fillRect(width / 2 - 200, height / 2 - 150, 400, 300);
    clickZone.lineStyle(4, 0xFFFFFF, 1);
    clickZone.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);

    // 创建粒子纹理（程序化生成）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xFFFF00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不发射）
    this.particleEmitter = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      emitting: false
    });

    // Combo 计数文本
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'COMBO: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.comboText.setOrigin(0.5);

    // 提示文本
    this.hintText = this.add.text(width / 2, height / 2 + 50, 'Click to start combo!\n(2.5s timeout)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(width / 2, height - 50, '', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.statusText.setOrigin(0.5);

    // 计时器进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 0.8);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 100, 300, 20);

    // 计时器进度条
    this.timerBar = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 记录计时器开始时间
    this.timerStartTime = 0;
  }

  handleClick(pointer) {
    // 增加 combo
    this.comboCount++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.timerStartTime = this.time.now;
    this.isComboActive = true;

    this.comboTimer = this.time.delayedCall(this.COMBO_TIMEOUT, () => {
      this.resetCombo();
    });

    // 检查是否达到15连击
    if (this.comboCount === this.COMBO_TARGET) {
      this.triggerComboEffect();
    }

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    
    // 根据combo数量改变颜色
    if (this.comboCount >= this.COMBO_TARGET) {
      this.comboText.setColor('#FFD700'); // 金色
    } else if (this.comboCount >= 10) {
      this.comboText.setColor('#FF4500'); // 红橙色
    } else if (this.comboCount >= 5) {
      this.comboText.setColor('#FFA500'); // 橙色
    } else {
      this.comboText.setColor('#FFFFFF'); // 白色
    }
  }

  resetCombo() {
    const previousCombo = this.comboCount;
    this.comboCount = 0;
    this.isComboActive = false;
    this.updateComboDisplay();
    
    if (previousCombo > 0) {
      this.statusText.setText(`Combo broken! (was ${previousCombo})`);
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
      });
    }
  }

  triggerComboEffect() {
    // 触发粒子特效
    this.particleEmitter.explode(50);

    // 显示成功文本
    this.statusText.setText('🎉 15 COMBO ACHIEVED! 🎉');
    this.statusText.setColor('#FFD700');

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 文字闪烁动画
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 5
    });

    // 背景闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xFFFFFF, 0.5);
    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.isComboActive && this.comboTimer) {
      const elapsed = time - this.timerStartTime;
      const progress = Math.max(0, 1 - elapsed / this.COMBO_TIMEOUT);
      
      this.timerBar.clear();
      
      // 根据剩余时间改变颜色
      let barColor;
      if (progress > 0.5) {
        barColor = 0x00FF00; // 绿色
      } else if (progress > 0.25) {
        barColor = 0xFFFF00; // 黄色
      } else {
        barColor = 0xFF0000; // 红色
      }
      
      this.timerBar.fillStyle(barColor, 1);
      this.timerBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 100,
        300 * progress,
        20
      );
    } else {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#FF8C00',
  scene: ComboScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);