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
    // 创建紫色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0033, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x9933ff, 1);
    clickArea.strokeRect(200, 200, 400, 200);
    
    const hintText = this.add.text(400, 300, 'CLICK HERE', {
      fontSize: '32px',
      color: '#9933ff',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // 创建 combo 显示文本
    this.comboText = this.add.text(400, 100, 'COMBO: 0', {
      fontSize: '48px',
      color: '#ff33ff',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.tipText = this.add.text(400, 500, 'Click within 1 second to keep combo!\nReach 20 combo for special effect!', {
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    });
    this.tipText.setOrigin(0.5);

    // 创建紫色粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff33ff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('purpleParticle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles('purpleParticle');
    this.emitter = this.particles.createEmitter({
      x: 400,
      y: 300,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 20,
      quantity: 5,
      on: false
    });

    // 创建闪烁效果层
    this.flashOverlay = this.add.graphics();
    this.flashOverlay.setAlpha(0);

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 创建状态显示（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.updateStatus();
  }

  handleClick(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 清除旧的计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新的超时计时器
    this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
      this.resetCombo();
    }, [], this);

    // 检查是否达到 20 连击
    if (this.combo === 20) {
      this.triggerSpecialEffect();
    }

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    this.updateStatus();
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboTimer = null;

    // 重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    this.updateStatus();
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据 combo 数量改变颜色
    if (this.combo >= 20) {
      this.comboText.setColor('#ff00ff');
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff66ff');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#ff99ff');
    } else {
      this.comboText.setColor('#ff33ff');
    }
  }

  triggerSpecialEffect() {
    // 启动粒子发射器
    this.emitter.start();
    
    // 2秒后停止
    this.time.delayedCall(2000, () => {
      this.emitter.stop();
    }, [], this);

    // 屏幕紫色闪烁效果
    this.flashOverlay.clear();
    this.flashOverlay.fillStyle(0x9933ff, 0.6);
    this.flashOverlay.fillRect(0, 0, 800, 600);
    
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      repeat: 3,
      yoyo: true
    });

    // 文字爆炸效果
    this.tweens.add({
      targets: this.comboText,
      scale: 2,
      angle: 360,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.comboText.setScale(1);
        this.comboText.setAngle(0);
      }
    });

    // 显示成就文本
    const achievementText = this.add.text(400, 400, '★ 20 COMBO! ★', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#ff00ff',
      strokeThickness: 6
    });
    achievementText.setOrigin(0.5);
    achievementText.setAlpha(0);

    this.tweens.add({
      targets: achievementText,
      alpha: 1,
      scale: { from: 0, to: 1.5 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: achievementText,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => {
              achievementText.destroy();
            }
          });
        });
      }
    });

    this.updateStatus();
  }

  updateStatus() {
    const timeLeft = this.comboTimer ? 
      Math.ceil(this.comboTimer.getRemaining() / 1000) : 0;
    
    this.statusText.setText(
      `Status:\n` +
      `Combo: ${this.combo}\n` +
      `Time Left: ${timeLeft}s\n` +
      `Special Effect: ${this.combo >= 20 ? 'TRIGGERED!' : 'Not Yet'}`
    );
  }

  update(time, delta) {
    // 实时更新状态显示
    if (this.comboTimer) {
      this.updateStatus();
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
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);