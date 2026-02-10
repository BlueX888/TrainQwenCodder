class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxCombo = 0;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x00ff00, 0.5);
    clickArea.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 16);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click anywhere to build combo!', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建 combo 显示文字
    this.comboText = this.add.text(width / 2, height / 2, 'Combo: 0', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#003300',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 创建最高连击显示
    this.maxComboText = this.add.text(width / 2, height / 2 + 80, 'Max Combo: 0', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建计时器提示条
    this.timerBar = this.add.graphics();
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x003300, 0.5);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 120, 300, 20);

    // 创建特效容器
    this.specialEffectText = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ff00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      on: false
    });

    // 创建点击反馈圆圈
    this.clickFeedback = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 状态信号变量（用于验证）
    this.totalClicks = 0;
    this.specialTriggered = 0;
  }

  handleClick(pointer) {
    this.totalClicks++;

    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 更新最高连击
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
      this.maxComboText.setText(`Max Combo: ${this.maxCombo}`);
    }

    // 点击反馈动画
    this.showClickFeedback(pointer.x, pointer.y);

    // 检查是否达到 8 连击
    if (this.combo === 8) {
      this.triggerSpecialEffect();
    }

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: 500,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 启动计时器进度条动画
    this.startTimerBarAnimation();
  }

  showClickFeedback(x, y) {
    // 清除之前的反馈
    this.clickFeedback.clear();

    // 绘制点击位置的圆圈
    this.clickFeedback.lineStyle(3, 0x00ff00, 1);
    this.clickFeedback.strokeCircle(x, y, 30);

    // 动画效果
    this.tweens.add({
      targets: this.clickFeedback,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.clickFeedback.clear();
        this.clickFeedback.setAlpha(1);
      }
    });
  }

  startTimerBarAnimation() {
    // 清除之前的进度条
    this.timerBar.clear();

    // 绘制满进度条
    const { width, height } = this.cameras.main;
    this.timerBar.fillStyle(0x00ff00, 1);
    this.timerBar.fillRect(width / 2 - 150, height / 2 + 120, 300, 20);

    // 创建缩放动画
    this.tweens.add({
      targets: this.timerBar,
      scaleX: 0,
      duration: 500,
      ease: 'Linear',
      onUpdate: (tween) => {
        const progress = 1 - tween.progress;
        this.timerBar.clear();
        this.timerBar.fillStyle(0x00ff00, 1);
        this.timerBar.fillRect(width / 2 - 150, height / 2 + 120, 300 * progress, 20);
      }
    });
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboTimer = null;

    // 清除进度条
    this.timerBar.clear();
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);

    // 文字缩放动画
    this.comboText.setScale(1.2);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Back.out'
    });

    // 根据 combo 数改变颜色
    if (this.combo >= 8) {
      this.comboText.setColor('#ffff00');
      this.comboText.setStroke('#ff0000', 6);
    } else if (this.combo >= 5) {
      this.comboText.setColor('#00ffff');
      this.comboText.setStroke('#0066cc', 6);
    } else {
      this.comboText.setColor('#00ff00');
      this.comboText.setStroke('#003300', 6);
    }
  }

  triggerSpecialEffect() {
    this.specialTriggered++;

    const { width, height } = this.cameras.main;

    // 显示特效文字
    this.specialEffectText.setText('★ MEGA COMBO! ★');
    this.specialEffectText.setVisible(true);
    this.specialEffectText.setAlpha(0);
    this.specialEffectText.setScale(0.5);

    // 文字出现动画
    this.tweens.add({
      targets: this.specialEffectText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.out',
      yoyo: true,
      hold: 500,
      onComplete: () => {
        this.specialEffectText.setVisible(false);
      }
    });

    // 触发粒子爆炸
    this.emitter.setPosition(width / 2, height / 2);
    this.emitter.explode(50);

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, width, height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 屏幕震动
    this.cameras.main.shake(300, 0.01);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 状态信号输出（用于验证）
console.log('Game initialized. Click to build combo!');
console.log('State signals: scene.totalClicks, scene.combo, scene.maxCombo, scene.specialTriggered');