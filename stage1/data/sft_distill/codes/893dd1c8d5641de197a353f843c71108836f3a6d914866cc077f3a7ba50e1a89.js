class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0; // 可验证的状态变量
    this.comboTimer = null;
    this.isComboActive = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建灰色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x808080, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(4, 0xffffff, 1);
    clickArea.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click Here!', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // 创建combo显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'Combo: 0', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);

    // 创建倒计时提示文本
    this.timerText = this.add.text(width / 2, height / 2 + 60, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.timerText.setOrigin(0.5);

    // 创建特效提示文本（初始隐藏）
    this.achievementText = this.add.text(width / 2, 100, '15 COMBO!!!', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffff00',
      strokeThickness: 6
    });
    this.achievementText.setOrigin(0.5);
    this.achievementText.setVisible(false);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffd700, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 200,
      quantity: 3,
      frequency: 50,
      emitting: false
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 状态日志
    console.log('Combo game initialized. Click to start combo!');
  }

  onPointerDown(pointer) {
    // 增加combo
    this.combo++;
    this.updateComboDisplay();

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    this.isComboActive = true;

    // 检查是否达到15连击
    if (this.combo === 15) {
      this.triggerComboEffect();
    }

    console.log(`Combo: ${this.combo}`);
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);
    
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
    if (this.combo >= 15) {
      this.comboText.setColor('#ff0000');
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff8800');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ffff00');
    } else {
      this.comboText.setColor('#ffffff');
    }
  }

  resetCombo() {
    console.log('Combo timeout! Reset to 0');
    this.combo = 0;
    this.comboText.setText('Combo: 0');
    this.comboText.setColor('#ffff00');
    this.timerText.setText('');
    this.isComboActive = false;
    
    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = null;
    }
  }

  triggerComboEffect() {
    console.log('15 COMBO ACHIEVED!');
    
    // 显示成就文本
    this.achievementText.setVisible(true);
    this.achievementText.setAlpha(0);
    this.achievementText.setScale(0.5);

    // 文字动画
    this.tweens.add({
      targets: this.achievementText,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: this.achievementText,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.achievementText.setVisible(false);
            }
          });
        });
      }
    });

    // 启动粒子效果
    this.particles.start();
    this.time.delayedCall(2000, () => {
      this.particles.stop();
    });

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 相机震动
    this.cameras.main.shake(500, 0.01);
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.comboTimer && this.isComboActive) {
      const remaining = this.comboTimer.getRemaining();
      this.timerText.setText(`Time: ${(remaining / 1000).toFixed(2)}s`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);