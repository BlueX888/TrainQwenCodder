class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0; // 当前连击数（可验证状态）
    this.isComboActive = false; // 连击是否激活（可验证状态）
    this.comboTimer = null; // 计时器引用
    this.hasTriggeredEffect = false; // 是否已触发20连击特效
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建白色背景
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(0, 0, width, height);

    // 创建combo显示文本（黑色，居中）
    this.comboText = this.add.text(width / 2, height / 2, 'Combo: 0', {
      fontSize: '64px',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 100, 'Click to build combo!\n(3 seconds timeout)', {
      fontSize: '24px',
      color: '#666666',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建计时器状态指示器（圆形进度条）
    this.timerGraphics = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建3秒计时器（初始暂停状态）
    this.comboTimer = this.time.addEvent({
      delay: 3000,
      callback: this.resetCombo,
      callbackScope: this,
      paused: true
    });

    // 创建粒子纹理（用于20连击特效）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffff00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不可见）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 200,
      quantity: 2,
      blendMode: 'ADD',
      emitting: false
    });

    // 创建特效文本（初始不可见）
    this.effectText = this.add.text(width / 2, height / 2 - 100, 'COMBO MASTER!', {
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffff00',
      strokeThickness: 6
    });
    this.effectText.setOrigin(0.5);
    this.effectText.setAlpha(0);
  }

  onPointerDown(pointer) {
    // 增加combo
    this.combo++;
    this.isComboActive = true;
    this.hasTriggeredEffect = false;

    // 更新显示
    this.updateComboDisplay();

    // 重置计时器
    this.comboTimer.reset({
      delay: 3000,
      callback: this.resetCombo,
      callbackScope: this,
      paused: false
    });

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 检查是否达到20连击
    if (this.combo === 20 && !this.hasTriggeredEffect) {
      this.triggerComboEffect(pointer);
    }
  }

  resetCombo() {
    this.combo = 0;
    this.isComboActive = false;
    this.hasTriggeredEffect = false;
    this.updateComboDisplay();

    // 添加重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);

    // 根据combo数量改变颜色
    if (this.combo >= 20) {
      this.comboText.setColor('#ff0000');
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff6600');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#0066ff');
    } else {
      this.comboText.setColor('#000000');
    }
  }

  triggerComboEffect(pointer) {
    this.hasTriggeredEffect = true;

    // 触发粒子爆炸
    this.particleEmitter.setPosition(pointer.x, pointer.y);
    this.particleEmitter.explode(50);

    // 显示特效文本
    this.effectText.setAlpha(1);
    this.effectText.setScale(0);

    this.tweens.add({
      targets: this.effectText,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 播放闪烁效果
    this.tweens.add({
      targets: this.comboText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 更新计时器进度指示器
    this.timerGraphics.clear();

    if (this.isComboActive && this.comboTimer) {
      const progress = this.comboTimer.getProgress();
      const angle = Phaser.Math.PI2 * progress;
      const { width, height } = this.cameras.main;

      // 绘制圆形进度条
      this.timerGraphics.lineStyle(8, 0x00ff00, 1);
      this.timerGraphics.beginPath();
      this.timerGraphics.arc(
        width / 2,
        height / 2,
        120,
        -Math.PI / 2,
        -Math.PI / 2 + angle,
        false
      );
      this.timerGraphics.strokePath();

      // 当剩余时间少于1秒时变红
      if (progress > 0.666) {
        this.timerGraphics.lineStyle(8, 0xff0000, 1);
        this.timerGraphics.beginPath();
        this.timerGraphics.arc(
          width / 2,
          height / 2,
          120,
          -Math.PI / 2,
          -Math.PI / 2 + angle,
          false
        );
        this.timerGraphics.strokePath();
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: ComboScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态供验证（可选）
window.getComboState = () => {
  const scene = game.scene.scenes[0];
  return {
    combo: scene.combo,
    isComboActive: scene.isComboActive,
    hasTriggeredEffect: scene.hasTriggeredEffect
  };
};