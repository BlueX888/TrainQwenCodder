class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboTimeout = 1000; // 1秒超时
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

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2 - 100, 'COMBO: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height / 2 + 50, 'Click anywhere to build combo!\n(1 second timeout)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建状态文本（显示剩余时间）
    this.statusText = this.add.text(width / 2, height / 2 + 150, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffaa00'
    });
    this.statusText.setOrigin(0.5);

    // 创建用于生成粒子纹理的 Graphics
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不启动）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2 - 100,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      gravityY: 200,
      quantity: 30,
      on: false
    });

    // 创建点击反馈 Graphics
    this.clickFeedback = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 创建闪烁效果的背景遮罩
    this.flashOverlay = this.add.graphics();
    this.flashOverlay.setAlpha(0);
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 点击反馈动画
    this.showClickFeedback(pointer.x, pointer.y);

    // 检查是否达到 10 连击
    if (this.combo === 10) {
      this.triggerComboEffect();
    }
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 文字缩放动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 根据 combo 数改变颜色
    if (this.combo >= 10) {
      this.comboText.setColor('#ff00ff');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ffaa00');
    } else {
      this.comboText.setColor('#ffffff');
    }
  }

  showClickFeedback(x, y) {
    // 清除之前的反馈
    this.clickFeedback.clear();

    // 绘制点击位置的圆圈
    this.clickFeedback.lineStyle(3, 0xffffff, 1);
    this.clickFeedback.strokeCircle(x, y, 20);

    // 圆圈扩散动画
    const tempCircle = { radius: 20, alpha: 1 };
    this.tweens.add({
      targets: tempCircle,
      radius: 60,
      alpha: 0,
      duration: 300,
      onUpdate: () => {
        this.clickFeedback.clear();
        this.clickFeedback.lineStyle(3, 0xffffff, tempCircle.alpha);
        this.clickFeedback.strokeCircle(x, y, tempCircle.radius);
      },
      onComplete: () => {
        this.clickFeedback.clear();
      }
    });
  }

  triggerComboEffect() {
    const { width, height } = this.cameras.main;

    // 触发粒子爆发
    this.emitter.setPosition(width / 2, height / 2 - 100);
    this.emitter.explode(50);

    // 屏幕闪烁效果
    this.flashOverlay.clear();
    this.flashOverlay.fillStyle(0xffffff, 0.5);
    this.flashOverlay.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: 500,
      ease: 'Power2'
    });

    // 文字特效
    this.tweens.add({
      targets: this.comboText,
      scale: 2,
      angle: 360,
      duration: 500,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 显示成就文本
    const achievementText = this.add.text(width / 2, height / 2 + 20, '★ 10 COMBO! ★', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff00ff',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    achievementText.setOrigin(0.5);
    achievementText.setAlpha(0);

    this.tweens.add({
      targets: achievementText,
      alpha: 1,
      y: height / 2,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: achievementText,
        alpha: 0,
        y: height / 2 - 50,
        duration: 300,
        onComplete: () => {
          achievementText.destroy();
        }
      });
    });
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboText.setColor('#ffffff');
    this.statusText.setText('Combo Reset!');
    
    // 重置提示淡出
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });

    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = null;
    }
  }

  update(time, delta) {
    // 显示剩余时间
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const percentage = (remaining / this.comboTimeout * 100).toFixed(0);
      this.statusText.setText(`Time: ${percentage}%`);
      
      // 时间紧迫时改变颜色
      if (percentage < 30) {
        this.statusText.setColor('#ff0000');
      } else {
        this.statusText.setColor('#ffaa00');
      }
    } else if (this.combo === 0) {
      this.statusText.setText('');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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