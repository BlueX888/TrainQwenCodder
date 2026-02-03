class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 4000; // 4秒超时
    this.COMBO_TRIGGER = 8; // 8连击触发特效
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建灰色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x808080, 1);
    bg.fillRect(0, 0, width, height);

    // 创建标题文本
    this.add.text(width / 2, 50, 'Combo System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'Combo: 0', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height / 2 + 80, 'Click anywhere to increase combo!\n4 seconds timeout', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(width / 2, height / 2 + 150, '', {
      fontSize: '24px',
      color: '#ff6666'
    }).setOrigin(0.5);

    // 创建特效触发状态显示
    this.statusText = this.add.text(width / 2, height - 50, '', {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建点击反馈圆圈容器
    this.clickFeedbackGroup = this.add.group();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 初始化计时器（但不启动）
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this,
      paused: true
    });
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.comboText.setText(`Combo: ${this.combo}`);

    // 创建点击反馈效果
    this.createClickFeedback(pointer.x, pointer.y);

    // 重置或启动计时器
    if (this.comboTimer) {
      this.comboTimer.reset({
        delay: this.COMBO_TIMEOUT,
        callback: this.resetCombo,
        callbackScope: this,
        paused: false
      });
    }

    // 检查是否达到触发条件
    if (this.combo === this.COMBO_TRIGGER) {
      this.triggerSpecialEffect();
    }

    // combo 文本缩放动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  resetCombo() {
    this.combo = 0;
    this.comboText.setText(`Combo: ${this.combo}`);
    this.timerText.setText('');
    this.statusText.setText('');

    // 重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // 停止计时器
    if (this.comboTimer) {
      this.comboTimer.paused = true;
    }
  }

  createClickFeedback(x, y) {
    const circle = this.add.graphics();
    circle.lineStyle(3, 0xffffff, 1);
    circle.strokeCircle(0, 0, 20);
    circle.setPosition(x, y);

    this.clickFeedbackGroup.add(circle);

    // 扩散动画
    this.tweens.add({
      targets: circle,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        circle.destroy();
      }
    });
  }

  triggerSpecialEffect() {
    const { width, height } = this.cameras.main;
    
    this.statusText.setText('★ COMBO MASTER! ★');
    
    // 状态文本闪烁动画
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 5
    });

    // 创建粒子爆炸效果
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 100;
      
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00, 1);
      particle.fillCircle(0, 0, 8);
      particle.setPosition(width / 2, height / 2);

      const targetX = width / 2 + Math.cos(angle) * distance;
      const targetY = height / 2 + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, width, height);
    flash.setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    // 摄像机震动
    this.cameras.main.shake(300, 0.01);
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.comboTimer && !this.comboTimer.paused && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(1);
      this.timerText.setText(`Time remaining: ${seconds}s`);
      
      // 时间紧迫时变红
      if (remaining < 1000) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ff6666');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ComboScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号
console.log('Combo system initialized');
console.log('Click anywhere to start combo');
console.log('Reach 8 combo to trigger special effect');