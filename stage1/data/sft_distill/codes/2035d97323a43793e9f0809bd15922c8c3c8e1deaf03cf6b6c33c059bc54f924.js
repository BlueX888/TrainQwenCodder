class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxCombo = 0; // 用于验证的最高连击数
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

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x00ffff, 1);
    clickArea.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click Here!', {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建Combo显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '64px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 创建最高连击显示
    this.maxComboText = this.add.text(width / 2, height / 2 + 80, 'Max Combo: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.tipText = this.add.text(width / 2, height - 50, 'Click within 1 second to build combo! Reach 12 for special effect!', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建点击反馈纹理
    const clickGraphics = this.add.graphics();
    clickGraphics.fillStyle(0x00ffff, 0.5);
    clickGraphics.fillCircle(20, 20, 20);
    clickGraphics.generateTexture('clickFeedback', 40, 40);
    clickGraphics.destroy();

    // 创建粒子发射器（初始时停止）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      frequency: -1 // 手动发射
    });

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer);
    });

    // 初始化计时器（但不启动）
    this.setupTimer();
  }

  setupTimer() {
    // 清除旧计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 创建新的1秒计时器
    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 初始时暂停计时器
    this.comboTimer.paused = true;
  }

  handleClick(pointer) {
    // 增加combo
    this.combo++;
    
    // 更新最高连击
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
      this.maxComboText.setText(`Max Combo: ${this.maxCombo}`);
    }

    // 更新显示
    this.updateComboDisplay();

    // 创建点击反馈效果
    this.createClickFeedback(pointer.x, pointer.y);

    // 重置并启动计时器
    this.comboTimer.reset({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 检查是否达到12连击
    if (this.combo === 12) {
      this.triggerSpecialEffect();
    }
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 添加缩放动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 根据combo数量改变颜色
    if (this.combo >= 12) {
      this.comboText.setColor('#ff00ff');
    } else if (this.combo >= 8) {
      this.comboText.setColor('#ffff00');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#00ff00');
    } else {
      this.comboText.setColor('#00ffff');
    }
  }

  createClickFeedback(x, y) {
    const feedback = this.add.image(x, y, 'clickFeedback');
    feedback.setAlpha(0.8);
    
    this.tweens.add({
      targets: feedback,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  triggerSpecialEffect() {
    const { width, height } = this.cameras.main;

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0x00ffff, 0.5);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    // 粒子爆炸效果
    this.particleEmitter.setPosition(width / 2, height / 2);
    this.particleEmitter.explode(50);

    // 文字特效
    const specialText = this.add.text(width / 2, height / 2 - 100, '★ AMAZING! ★', {
      fontSize: '48px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: specialText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: specialText,
          alpha: 0,
          y: height / 2 - 150,
          duration: 1000,
          delay: 500,
          ease: 'Power2',
          onComplete: () => {
            specialText.destroy();
          }
        });
      }
    });

    // 相机震动
    this.cameras.main.shake(500, 0.01);
  }

  resetCombo() {
    if (this.combo > 0) {
      // 添加重置动画
      this.tweens.add({
        targets: this.comboText,
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          this.combo = 0;
          this.updateComboDisplay();
        }
      });
    }
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证变量（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, ComboScene };
}