class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 1000; // 1秒超时
    this.COMBO_THRESHOLD = 10; // 连击10次触发特效
  }

  preload() {
    // 程序化生成粒子纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建白色背景
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建提示文字
    this.add.text(400, 100, 'Click to build combo!', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 140, '(1 second timeout)', {
      fontSize: '16px',
      color: '#666666',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建combo显示文字
    this.comboText = this.add.text(400, 300, 'COMBO: 0', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建状态文字
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建粒子发射器（初始不活跃）
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 200,
      tint: [0xff0000, 0xff6600, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff],
      active: false,
      frequency: -1
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial'
    });

    // 初始化计时器变量
    this.lastClickTime = 0;
  }

  onPointerDown(pointer) {
    const currentTime = this.time.now;
    
    // 增加combo
    this.combo++;
    this.lastClickTime = currentTime;
    
    // 更新显示
    this.updateComboDisplay();

    // 重置计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 创建新的超时计时器
    this.comboTimer = this.time.delayedCall(this.COMBO_TIMEOUT, () => {
      this.resetCombo();
    });

    // 检查是否达到连击阈值
    if (this.combo === this.COMBO_THRESHOLD) {
      this.triggerComboEffect();
    }

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据combo数量改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#ff00ff');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ff6600');
    } else {
      this.comboText.setColor('#ff0000');
    }
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.statusText.setText('');
    this.comboText.setColor('#ff0000');
    
    // 重置文字缩放
    this.comboText.setScale(1);
  }

  triggerComboEffect() {
    // 显示祝贺文字
    this.statusText.setText('🎉 COMBO MASTER! 🎉');
    
    // 文字放大动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 状态文字闪烁动画
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut'
    });

    // 触发粒子爆炸效果
    this.particles.setPosition(400, 300);
    this.particles.explode(50);

    // 屏幕震动效果
    this.cameras.main.shake(300, 0.01);

    // 额外的粒子效果（环形爆发）
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = 400 + Math.cos(angle) * 100;
      const y = 300 + Math.sin(angle) * 100;
      
      this.particles.setPosition(x, y);
      this.particles.explode(5);
    }
  }

  update(time, delta) {
    // 更新调试信息
    const timeLeft = this.comboTimer ? 
      Math.max(0, this.COMBO_TIMEOUT - (time - this.lastClickTime)) : 0;
    
    this.debugText.setText([
      `Combo: ${this.combo}`,
      `Time Left: ${Math.ceil(timeLeft / 1000)}s`,
      `Status: ${this.combo >= this.COMBO_THRESHOLD ? 'THRESHOLD REACHED!' : 'Building...'}`,
      `Clicks to threshold: ${Math.max(0, this.COMBO_THRESHOLD - this.combo)}`
    ]);

    // 如果有计时器，显示进度条
    if (this.comboTimer && this.combo > 0) {
      const progress = timeLeft / this.COMBO_TIMEOUT;
      
      // 绘制进度条
      if (!this.progressBar) {
        this.progressBar = this.add.graphics();
      }
      
      this.progressBar.clear();
      this.progressBar.fillStyle(0x333333, 0.3);
      this.progressBar.fillRect(300, 350, 200, 10);
      
      this.progressBar.fillStyle(0xff0000, 1);
      this.progressBar.fillRect(300, 350, 200 * progress, 10);
    } else if (this.progressBar) {
      this.progressBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: ComboScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);