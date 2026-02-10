class ComboGameScene extends Phaser.Scene {
  constructor() {
    super('ComboGameScene');
    this.combo = 0; // 可验证的状态信号
    this.comboTimer = null;
    this.comboText = null;
    this.clickArea = null;
    this.maxCombo = 8; // 触发特效的连击数
    this.comboTimeout = 3000; // 3秒超时
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建点击区域（橙色圆形）
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xff6b35, 1);
    this.clickArea.fillCircle(400, 300, 100);
    this.clickArea.setInteractive(
      new Phaser.Geom.Circle(400, 300, 100),
      Phaser.Geom.Circle.Contains
    );

    // 创建combo文本
    this.comboText = this.add.text(400, 300, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    const hintText = this.add.text(400, 100, 'Click the orange circle!\n3 seconds timeout\nGet 8 combo for special effect!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffcc00',
      align: 'center'
    });
    hintText.setOrigin(0.5);

    // 创建计时器显示
    this.timerText = this.add.text(400, 500, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    this.timerText.setOrigin(0.5);

    // 监听点击事件
    this.clickArea.on('pointerdown', this.onClickArea, this);

    // 初始化计时器（不启动）
    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false,
      paused: true
    });

    console.log('Game initialized. Click the orange circle to start combo!');
  }

  onClickArea(pointer) {
    // 增加combo
    this.combo++;
    console.log(`Combo: ${this.combo}`);

    // 更新文本
    this.updateComboText();

    // 重置计时器
    this.comboTimer.reset({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 点击波纹效果
    this.createClickRipple(pointer.x, pointer.y);

    // 检查是否达到最大连击
    if (this.combo === this.maxCombo) {
      this.triggerComboEffect();
    }

    // 文字弹跳动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateComboText() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据combo数改变颜色
    if (this.combo >= this.maxCombo) {
      this.comboText.setColor('#ff0000');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ffaa00');
    } else if (this.combo >= 3) {
      this.comboText.setColor('#ffff00');
    } else {
      this.comboText.setColor('#ffffff');
    }
  }

  createClickRipple(x, y) {
    const ripple = this.add.graphics();
    ripple.lineStyle(4, 0xffffff, 1);
    ripple.strokeCircle(0, 0, 10);
    ripple.setPosition(x, y);

    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  triggerComboEffect() {
    console.log('COMBO EFFECT TRIGGERED!');

    // 创建粒子爆炸效果
    this.createParticleExplosion(400, 300);

    // 特效文字
    const effectText = this.add.text(400, 200, 'AMAZING!', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    effectText.setOrigin(0.5);
    effectText.setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 500,
      onComplete: () => {
        effectText.destroy();
      }
    });

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 闪光效果
    this.cameras.main.flash(500, 255, 255, 255);
  }

  createParticleExplosion(x, y) {
    const particleCount = 30;
    const colors = [0xff6b35, 0xffaa00, 0xff0000, 0xffff00];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 200 + Math.random() * 100;
      const particle = this.add.graphics();
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 5 + Math.random() * 5);
      particle.setPosition(x, y);

      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      this.tweens.add({
        targets: particle,
        x: x + velocityX,
        y: y + velocityY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  resetCombo() {
    console.log('Combo timeout! Reset to 0');
    this.combo = 0;
    this.updateComboText();
    
    // 重置文字颜色
    this.comboText.setColor('#ffffff');

    // 计时器文本闪烁
    this.tweens.add({
      targets: this.timerText,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.comboTimer && !this.comboTimer.paused) {
      const remaining = this.comboTimer.getRemaining();
      this.timerText.setText(`Time remaining: ${(remaining / 1000).toFixed(1)}s`);
    } else {
      this.timerText.setText('Click to start!');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ComboGameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露combo状态用于验证
window.getComboState = function() {
  const scene = game.scene.scenes[0];
  return {
    combo: scene.combo,
    maxCombo: scene.maxCombo,
    timerActive: scene.comboTimer && !scene.comboTimer.paused
  };
};