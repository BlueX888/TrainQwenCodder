class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0; // 可验证状态
    this.comboTimer = null;
    this.isSpecialEffectActive = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建灰色背景
    const background = this.add.graphics();
    background.fillStyle(0x808080, 1);
    background.fillRect(0, 0, width, height);

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'Combo: 0', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height / 2 + 50, 'Click to build combo!\n(4 seconds timeout)', {
      fontSize: '24px',
      color: '#cccccc',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建特效文本（初始隐藏）
    this.specialText = this.add.text(width / 2, height / 2 + 120, 'COMBO MASTER!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff0000',
      strokeThickness: 4
    });
    this.specialText.setOrigin(0.5);
    this.specialText.setVisible(false);

    // 创建特效背景闪光
    this.flashGraphics = this.add.graphics();
    this.flashGraphics.setAlpha(0);

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 创建计时器文本显示
    this.timerText = this.add.text(width / 2, 50, 'Timer: 4.00s', {
      fontSize: '32px',
      color: '#ffffff'
    });
    this.timerText.setOrigin(0.5);

    // 初始化计时器剩余时间
    this.timerRemaining = 0;
  }

  handleClick() {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建 4 秒倒计时
    this.comboTimer = this.time.addEvent({
      delay: 4000,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 记录计时器开始时间
    this.timerStartTime = this.time.now;

    // 检查是否达到 8 连击
    if (this.combo === 8 && !this.isSpecialEffectActive) {
      this.triggerSpecialEffect();
    }

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboTimer = null;
    this.timerRemaining = 0;
    this.timerText.setText('Timer: 4.00s');
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);
    
    // 根据 combo 数量改变颜色
    if (this.combo >= 8) {
      this.comboText.setColor('#ffff00');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ff8800');
    } else {
      this.comboText.setColor('#ffffff');
    }
  }

  triggerSpecialEffect() {
    this.isSpecialEffectActive = true;

    // 显示特效文本
    this.specialText.setVisible(true);
    this.specialText.setAlpha(0);

    // 特效文本淡入淡出动画
    this.tweens.add({
      targets: this.specialText,
      alpha: 1,
      scale: 1.5,
      duration: 300,
      ease: 'Power2',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.specialText.setVisible(false);
        this.specialText.setScale(1);
        this.isSpecialEffectActive = false;
      }
    });

    // 闪光特效
    const { width, height } = this.cameras.main;
    this.flashGraphics.clear();
    this.flashGraphics.fillStyle(0xffff00, 0.5);
    this.flashGraphics.fillRect(0, 0, width, height);

    this.tweens.add({
      targets: this.flashGraphics,
      alpha: 0,
      duration: 500,
      ease: 'Power2'
    });

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 创建粒子效果（使用 Graphics 生成圆形）
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(width / 2, height / 2);

      const angle = (Math.PI * 2 * i) / 20;
      const distance = 200;

      this.tweens.add({
        targets: particle,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.comboTimer && this.timerStartTime) {
      const elapsed = time - this.timerStartTime;
      this.timerRemaining = Math.max(0, 4000 - elapsed);
      const seconds = (this.timerRemaining / 1000).toFixed(2);
      this.timerText.setText(`Timer: ${seconds}s`);

      // 计时器快结束时改变颜色
      if (this.timerRemaining < 1000) {
        this.timerText.setColor('#ff0000');
      } else if (this.timerRemaining < 2000) {
        this.timerText.setColor('#ff8800');
      } else {
        this.timerText.setColor('#ffffff');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#808080',
  scene: ComboScene
};

new Phaser.Game(config);