class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxComboTime = 2500; // 2.5秒
  }

  preload() {
    // 创建橙色圆形纹理用于粒子
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建橙色点击区域
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xff6600, 1);
    this.clickArea.fillRoundedRect(250, 200, 300, 200, 20);
    this.clickArea.lineStyle(4, 0xff8800, 1);
    this.clickArea.strokeRoundedRect(250, 200, 300, 200, 20);

    // 创建点击提示文本
    this.clickText = this.add.text(400, 300, 'CLICK HERE!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.clickText.setOrigin(0.5);

    // 创建combo显示文本
    this.comboText = this.add.text(400, 100, 'Combo: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff6600',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建倒计时条
    this.timerBar = this.add.graphics();
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 0.5);
    this.timerBarBg.fillRect(200, 450, 400, 20);

    // 创建状态提示文本
    this.statusText = this.add.text(400, 500, 'Click to start combo!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffaa00'
    });
    this.statusText.setOrigin(0.5);

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: 400,
      y: 300,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: -1,
      quantity: 30,
      blendMode: 'ADD'
    });
    this.emitter.stop();

    // 设置点击区域交互
    this.clickArea.setInteractive(
      new Phaser.Geom.Rectangle(250, 200, 300, 200),
      Phaser.Geom.Rectangle.Contains
    );

    // 监听点击事件
    this.clickArea.on('pointerdown', this.onClickArea, this);

    // 添加全局点击监听（用于调试）
    this.input.on('pointerdown', (pointer) => {
      // 检查是否在橙色区域内
      const bounds = new Phaser.Geom.Rectangle(250, 200, 300, 200);
      if (bounds.contains(pointer.x, pointer.y)) {
        this.onClickArea();
      }
    });
  }

  onClickArea() {
    // 增加combo
    this.combo++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.maxComboTime,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 点击反馈动画
    this.tweens.add({
      targets: this.clickArea,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    // 检查是否达到15连击
    if (this.combo === 15) {
      this.triggerComboEffect();
    }

    // 更新状态文本
    this.statusText.setText(`Keep clicking! ${(this.maxComboTime / 1000).toFixed(1)}s to continue`);
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);

    // Combo文本跳动动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 根据combo数量改变颜色
    if (this.combo >= 15) {
      this.comboText.setColor('#ff0000');
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff3300');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ff6600');
    } else {
      this.comboText.setColor('#ff9900');
    }
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboText.setColor('#ff6600');
    this.statusText.setText('Combo reset! Click to start again');

    // 清除计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }
  }

  triggerComboEffect() {
    // 触发粒子特效
    this.emitter.explode();

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 文本特效
    this.tweens.add({
      targets: this.comboText,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      yoyo: true,
      ease: 'Elastic.easeOut'
    });

    // 显示特殊消息
    const specialText = this.add.text(400, 350, '15 COMBO!!!', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 6
    });
    specialText.setOrigin(0.5);

    this.tweens.add({
      targets: specialText,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        specialText.destroy();
      }
    });

    // 背景闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.3);
    flash.fillRect(0, 0, 800, 600);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });

    this.statusText.setText('AMAZING! 15 Combo achieved!');
  }

  update(time, delta) {
    // 更新倒计时条
    if (this.comboTimer && this.combo > 0) {
      const elapsed = this.comboTimer.getElapsed();
      const remaining = this.maxComboTime - elapsed;
      const progress = Math.max(0, remaining / this.maxComboTime);

      this.timerBar.clear();
      this.timerBar.fillStyle(0xff6600, 1);
      this.timerBar.fillRect(200, 450, 400 * progress, 20);

      // 时间快用完时变红
      if (progress < 0.3) {
        this.timerBar.clear();
        this.timerBar.fillStyle(0xff0000, 1);
        this.timerBar.fillRect(200, 450, 400 * progress, 20);
      }
    } else {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ComboScene,
  parent: 'game-container'
};

new Phaser.Game(config);