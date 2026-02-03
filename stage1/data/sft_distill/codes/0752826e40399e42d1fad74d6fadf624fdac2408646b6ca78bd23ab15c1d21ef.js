class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxCombo = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);

    // 程序化生成粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建可点击的白色圆形区域
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xffffff, 1);
    this.clickArea.fillCircle(width / 2, height / 2, 80);
    this.clickArea.setInteractive(
      new Phaser.Geom.Circle(width / 2, height / 2, 80),
      Phaser.Geom.Circle.Contains
    );

    // 添加悬停效果
    this.clickArea.on('pointerover', () => {
      this.clickArea.clear();
      this.clickArea.fillStyle(0xcccccc, 1);
      this.clickArea.fillCircle(width / 2, height / 2, 80);
    });

    this.clickArea.on('pointerout', () => {
      this.clickArea.clear();
      this.clickArea.fillStyle(0xffffff, 1);
      this.clickArea.fillCircle(width / 2, height / 2, 80);
    });

    // 点击事件处理
    this.clickArea.on('pointerdown', () => {
      this.handleClick();
    });

    // 创建Combo文本显示
    this.comboText = this.add.text(width / 2, height / 2, '0', {
      fontSize: '48px',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 100, 'Click the circle!\nCombo resets after 1 second', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建最高连击显示
    this.maxComboText = this.add.text(width / 2, 50, 'Max Combo: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.maxComboText.setOrigin(0.5);

    // 创建特效文本（初始隐藏）
    this.specialText = this.add.text(width / 2, height / 2 - 120, 'COMBO x10!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4
    });
    this.specialText.setOrigin(0.5);
    this.specialText.setVisible(false);

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 200,
      quantity: 2,
      frequency: 50,
      emitting: false
    });
    this.particles.setPosition(width / 2, height / 2);

    // 创建计时器指示条
    this.timerBar = this.add.graphics();
    this.timerBarWidth = 300;
    this.timerBarHeight = 10;
    this.timerBarX = width / 2 - this.timerBarWidth / 2;
    this.timerBarY = height / 2 + 120;
    this.currentTimerWidth = 0;
  }

  handleClick() {
    // 增加combo
    this.combo++;
    this.comboText.setText(this.combo.toString());

    // 更新最高连击
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
      this.maxComboText.setText('Max Combo: ' + this.maxCombo);
    }

    // 添加点击动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 检查是否达到10连击
    if (this.combo === 10) {
      this.triggerSpecialEffect();
    }

    // 重置或创建定时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 重置计时器宽度
    this.currentTimerWidth = this.timerBarWidth;
  }

  resetCombo() {
    this.combo = 0;
    this.comboText.setText('0');
    this.comboTimer = null;
    this.currentTimerWidth = 0;

    // 添加重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  triggerSpecialEffect() {
    // 显示特效文本
    this.specialText.setVisible(true);
    this.specialText.setAlpha(1);
    this.specialText.setScale(0.5);

    // 文字动画
    this.tweens.add({
      targets: this.specialText,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.specialText.setVisible(false);
      }
    });

    // 触发粒子特效
    this.particles.start();
    this.time.delayedCall(2000, () => {
      this.particles.stop();
    });

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 圆形闪烁效果
    this.tweens.add({
      targets: this.clickArea,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5
    });
  }

  update(time, delta) {
    // 更新计时器指示条
    if (this.comboTimer && this.currentTimerWidth > 0) {
      const elapsed = this.comboTimer.getElapsed();
      const progress = 1 - (elapsed / 1000);
      this.currentTimerWidth = this.timerBarWidth * progress;
    }

    // 绘制计时器指示条
    this.timerBar.clear();
    
    // 背景条
    this.timerBar.fillStyle(0x444444, 1);
    this.timerBar.fillRect(this.timerBarX, this.timerBarY, this.timerBarWidth, this.timerBarHeight);
    
    // 进度条
    if (this.currentTimerWidth > 0) {
      const color = this.currentTimerWidth < this.timerBarWidth * 0.3 ? 0xff0000 : 0x00ff00;
      this.timerBar.fillStyle(color, 1);
      this.timerBar.fillRect(this.timerBarX, this.timerBarY, this.currentTimerWidth, this.timerBarHeight);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 可验证的状态信号
game.events.on('ready', () => {
  const scene = game.scene.scenes[0];
  console.log('Game State:', {
    combo: scene.combo,
    maxCombo: scene.maxCombo,
    timerActive: scene.comboTimer !== null
  });
});