class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboTimeout = 1000; // 1秒超时
    this.maxCombo = 15;
    this.lastClickTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域背景（灰色）
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0x7f8c8d, 1);
    this.clickArea.fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    this.clickArea.lineStyle(4, 0xecf0f1, 1);
    this.clickArea.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);

    // 创建combo显示背景
    this.comboDisplayBg = this.add.graphics();
    this.updateComboDisplayBg(0x95a5a6);

    // 创建combo文本
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height / 2 + 50, 'Click rapidly!\n(15 combo for special effect)', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建倒计时进度条
    this.progressBar = this.add.graphics();
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x34495e, 1);
    this.progressBarBg.fillRect(width / 2 - 150, height / 2 + 100, 300, 20);

    // 创建特效文本（初始隐藏）
    this.specialText = this.add.text(width / 2, height / 2 - 120, '★ AMAZING! ★', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.specialText.setOrigin(0.5);
    this.specialText.setVisible(false);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      gravityY: 300,
      tint: [0xf39c12, 0xe74c3c, 0x3498db, 0x2ecc71, 0x9b59b6],
      frequency: -1 // 手动触发
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 状态信号变量（用于验证）
    this.totalClicks = 0;
    this.maxComboReached = 0;
  }

  onPointerDown(pointer) {
    const currentTime = this.time.now;
    
    // 增加combo
    this.combo++;
    this.totalClicks++;

    // 更新combo文本
    this.comboText.setText(`COMBO: ${this.combo}`);

    // 添加点击动画
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 1.2, to: 1 },
      duration: 100,
      ease: 'Back.easeOut'
    });

    // 根据combo数量改变背景颜色
    const color = this.getComboColor(this.combo);
    this.updateComboDisplayBg(color);

    // 检查是否达到最大combo
    if (this.combo >= this.maxCombo && this.maxComboReached < this.combo) {
      this.triggerSpecialEffect();
      this.maxComboReached = this.combo;
    }

    // 重置或创建定时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this
    });

    this.lastClickTime = currentTime;
  }

  updateComboDisplayBg(color) {
    const { width, height } = this.cameras.main;
    this.comboDisplayBg.clear();
    this.comboDisplayBg.fillStyle(color, 0.8);
    this.comboDisplayBg.fillRoundedRect(width / 2 - 180, height / 2 - 90, 360, 80, 15);
  }

  getComboColor(combo) {
    if (combo >= 15) return 0xf39c12; // 金色
    if (combo >= 10) return 0xe74c3c; // 红色
    if (combo >= 5) return 0x3498db;  // 蓝色
    return 0x95a5a6; // 灰色
  }

  resetCombo() {
    this.combo = 0;
    this.comboText.setText('COMBO: 0');
    this.updateComboDisplayBg(0x95a5a6);
    
    // 重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: { from: 0.3, to: 1 },
      duration: 200
    });

    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }
  }

  triggerSpecialEffect() {
    const { width, height } = this.cameras.main;

    // 显示特效文字
    this.specialText.setVisible(true);
    this.specialText.setScale(0);
    this.specialText.setAlpha(1);

    this.tweens.add({
      targets: this.specialText,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.specialText.setVisible(false);
      }
    });

    // 触发粒子爆炸
    this.emitter.explode(50, width / 2, height / 2);

    // 屏幕震动效果
    this.cameras.main.shake(300, 0.01);

    // 闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, width, height);
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.5, to: 0 },
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  update(time, delta) {
    // 更新进度条
    if (this.comboTimer && this.combo > 0) {
      const elapsed = time - this.lastClickTime;
      const progress = Math.max(0, 1 - elapsed / this.comboTimeout);
      
      const { width, height } = this.cameras.main;
      this.progressBar.clear();
      
      // 根据进度改变颜色
      let barColor = 0x2ecc71; // 绿色
      if (progress < 0.3) barColor = 0xe74c3c; // 红色
      else if (progress < 0.6) barColor = 0xf39c12; // 橙色
      
      this.progressBar.fillStyle(barColor, 1);
      this.progressBar.fillRect(width / 2 - 150, height / 2 + 100, 300 * progress, 20);
    } else {
      this.progressBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);