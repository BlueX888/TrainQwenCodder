class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    // 可验证的状态变量
    this.comboCount = 0;
    this.lastClickTime = 0;
    this.comboTimer = null;
    this.maxComboReached = 0; // 记录达到的最大连击数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);

    // 创建黄色点击区域（圆形）
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xffff00, 1);
    this.clickArea.fillCircle(width / 2, height / 2, 100);
    this.clickArea.setInteractive(
      new Phaser.Geom.Circle(width / 2, height / 2, 100),
      Phaser.Geom.Circle.Contains
    );

    // 创建特效层（初始透明）
    this.effectLayer = this.add.graphics();
    this.effectLayer.fillStyle(0xffff00, 0);
    this.effectLayer.fillRect(0, 0, width, height);
    this.effectLayer.setDepth(10);

    // 创建 combo 文本显示
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);
    this.comboText.setDepth(20);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 100, 'Click the yellow circle!\n1 second timeout', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.updateStatusText();

    // 监听点击事件
    this.clickArea.on('pointerdown', this.handleClick, this);

    // 初始化计时器（不启动）
    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false,
      paused: true
    });
  }

  handleClick(pointer) {
    const currentTime = this.time.now;
    
    // 增加 combo
    this.comboCount++;
    this.lastClickTime = currentTime;
    
    // 更新显示
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    this.updateStatusText();

    // 点击区域缩放反馈
    this.tweens.add({
      targets: this.clickArea,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 重置并启动计时器
    if (this.comboTimer) {
      this.comboTimer.reset({
        delay: 1000,
        callback: this.resetCombo,
        callbackScope: this,
        loop: false
      });
    }

    // 检查是否达到 3 连击
    if (this.comboCount === 3) {
      this.triggerComboEffect();
      if (this.comboCount > this.maxComboReached) {
        this.maxComboReached = this.comboCount;
      }
    }

    // 更新最大连击数
    if (this.comboCount > this.maxComboReached) {
      this.maxComboReached = this.comboCount;
      this.updateStatusText();
    }
  }

  resetCombo() {
    // 超时重置 combo
    if (this.comboCount > 0) {
      this.comboCount = 0;
      this.comboText.setText('COMBO: 0');
      this.updateStatusText();

      // 显示超时提示
      const timeoutText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 + 80,
        'TIMEOUT!',
        {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#ff0000',
          fontStyle: 'bold'
        }
      );
      timeoutText.setOrigin(0.5);
      timeoutText.setAlpha(0);

      this.tweens.add({
        targets: timeoutText,
        alpha: 1,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          timeoutText.destroy();
        }
      });
    }
  }

  triggerComboEffect() {
    // 触发黄色闪烁特效
    this.effectLayer.clear();
    this.effectLayer.fillStyle(0xffff00, 0.6);
    this.effectLayer.fillRect(0, 0, this.scale.width, this.scale.height);

    // 闪烁动画
    this.tweens.add({
      targets: this.effectLayer,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      repeat: 2,
      yoyo: true,
      onComplete: () => {
        this.effectLayer.clear();
        this.effectLayer.setAlpha(1);
      }
    });

    // 显示特效文本
    const effectText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      '★ COMBO x3 ★',
      {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#ff8800',
        strokeThickness: 6
      }
    );
    effectText.setOrigin(0.5);
    effectText.setScale(0);
    effectText.setDepth(30);

    // 文字弹出动画
    this.tweens.add({
      targets: effectText,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: effectText,
          alpha: 0,
          scale: 0.8,
          duration: 500,
          delay: 500,
          ease: 'Power2',
          onComplete: () => {
            effectText.destroy();
          }
        });
      }
    });

    // 粒子效果（使用多个小圆点）
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(this.scale.width / 2, this.scale.height / 2);
      particle.setDepth(25);

      const angle = (Math.PI * 2 * i) / 20;
      const distance = 150;

      this.tweens.add({
        targets: particle,
        x: this.scale.width / 2 + Math.cos(angle) * distance,
        y: this.scale.height / 2 + Math.sin(angle) * distance,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Status:\nCombo: ${this.comboCount}\nMax Combo: ${this.maxComboReached}\nLast Click: ${this.lastClickTime}`
    );
  }

  update(time, delta) {
    // 每帧更新逻辑（如需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ComboScene
};

new Phaser.Game(config);