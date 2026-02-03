class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboText = null;
    this.timerText = null;
    this.clickArea = null;
    this.particles = null;
    this.emitter = null;
    this.COMBO_TIMEOUT = 3000; // 3秒超时
    this.COMBO_TRIGGER = 8; // 8次连击触发特效
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建橙色背景
    const background = this.add.graphics();
    background.fillStyle(0xFF8C00, 1); // 深橙色
    background.fillRect(0, 0, width, height);

    // 创建点击区域（浅橙色）
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xFFA500, 1); // 橙色
    this.clickArea.fillRoundedRect(
      width / 2 - 150,
      height / 2 - 100,
      300,
      200,
      20
    );

    // 添加点击提示文字
    const instructionText = this.add.text(
      width / 2,
      height / 2 - 50,
      'CLICK HERE!',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }
    );
    instructionText.setOrigin(0.5);

    // 创建 combo 显示文字
    this.comboText = this.add.text(
      width / 2,
      height / 2 + 20,
      'Combo: 0',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.comboText.setOrigin(0.5);

    // 创建计时器显示文字
    this.timerText = this.add.text(
      width / 2,
      height / 2 + 80,
      '',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFF00',
        fontStyle: 'bold'
      }
    );
    this.timerText.setOrigin(0.5);

    // 创建状态显示文字（用于验证）
    this.statusText = this.add.text(
      10,
      10,
      'Status: Ready',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    // 创建橙色粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xFFFFFF, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('orangeParticle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子系统
    this.particles = this.add.particles('orangeParticle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      gravityY: 200,
      tint: [0xFF8C00, 0xFFA500, 0xFFD700], // 橙色系
      on: false
    });

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 初始化状态
    this.updateStatus('Ready - Click to start combo!');
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 更新状态
    this.updateStatus(`Clicked! Combo: ${this.combo}`);

    // 点击反馈动画
    this.tweens.add({
      targets: this.clickArea,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // 检查是否达到触发条件
    if (this.combo === this.COMBO_TRIGGER) {
      this.triggerComboEffect();
    }
  }

  triggerComboEffect() {
    // 触发特效
    this.updateStatus('🎉 COMBO x8 ACHIEVED! 🎉');

    // 爆发粒子效果
    this.emitter.explode(50);

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xFFFFFF, 0.5);
    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // combo 文字放大动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 播放后重置 combo
    this.time.delayedCall(500, () => {
      this.resetCombo();
    });
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    
    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }

    this.updateStatus('Combo reset - Click to start again!');
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);
    
    // 根据 combo 数量改变颜色
    if (this.combo >= 8) {
      this.comboText.setColor('#FFD700'); // 金色
    } else if (this.combo >= 5) {
      this.comboText.setColor('#FF4500'); // 红橙色
    } else if (this.combo >= 3) {
      this.comboText.setColor('#FFA500'); // 橙色
    } else {
      this.comboText.setColor('#FFFFFF'); // 白色
    }
  }

  updateStatus(message) {
    this.statusText.setText(`Status: ${message}`);
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(1);
      this.timerText.setText(`Time left: ${seconds}s`);
      
      // 时间快用完时文字闪烁
      if (remaining < 1000) {
        this.timerText.setColor(Math.floor(time / 100) % 2 === 0 ? '#FF0000' : '#FFFF00');
      } else {
        this.timerText.setColor('#FFFF00');
      }
    } else {
      this.timerText.setText('');
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
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    combo: scene.combo,
    hasTimer: scene.comboTimer !== null,
    timerRemaining: scene.comboTimer ? scene.comboTimer.getRemaining() : 0
  };
};