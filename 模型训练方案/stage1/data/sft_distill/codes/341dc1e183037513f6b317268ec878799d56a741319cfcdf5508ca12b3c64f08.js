class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.comboCount = 0; // 可验证的状态变量
    this.comboTimer = null;
    this.comboText = null;
    this.isSpecialEffectPlaying = false;
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

    // 创建combo显示文本（青色）
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ffff', // 青色
      fontStyle: 'bold',
      stroke: '#0088aa',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    const hintText = this.add.text(width / 2, height - 80, 'Click to build combo!\n(12 hits for special effect)', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00cccc',
      align: 'center'
    });
    hintText.setOrigin(0.5);

    // 创建计时器进度条背景
    const timerBarBg = this.add.graphics();
    timerBarBg.fillStyle(0x333333, 1);
    timerBarBg.fillRect(width / 2 - 150, 100, 300, 20);

    // 创建计时器进度条
    this.timerBar = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建粒子纹理（用于特效）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0x00ffff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始不激活）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      quantity: 3,
      frequency: 50,
      emitting: false
    });

    // 初始化计时器（不启动）
    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false,
      paused: true
    });
  }

  onPointerDown(pointer) {
    // 如果特效正在播放，忽略点击
    if (this.isSpecialEffectPlaying) {
      return;
    }

    // 增加combo
    this.comboCount++;
    this.updateComboDisplay();

    // 重置计时器
    if (this.comboTimer) {
      this.comboTimer.reset({
        delay: 1000,
        callback: this.resetCombo,
        callbackScope: this,
        loop: false
      });
    }

    // 检查是否达到12连击
    if (this.comboCount === 12) {
      this.triggerSpecialEffect();
    }

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    
    // 根据combo数量改变颜色
    if (this.comboCount >= 10) {
      this.comboText.setColor('#ffff00'); // 黄色
    } else if (this.comboCount >= 5) {
      this.comboText.setColor('#00ff00'); // 绿色
    } else {
      this.comboText.setColor('#00ffff'); // 青色
    }
  }

  resetCombo() {
    if (this.isSpecialEffectPlaying) {
      return;
    }

    this.comboCount = 0;
    this.updateComboDisplay();
    
    // 重置文本颜色
    this.comboText.setColor('#00ffff');
    
    // 添加重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });
  }

  triggerSpecialEffect() {
    this.isSpecialEffectPlaying = true;
    const { width, height } = this.cameras.main;

    // 暂停计时器
    if (this.comboTimer) {
      this.comboTimer.paused = true;
    }

    // 1. 文字放大动画
    this.tweens.add({
      targets: this.comboText,
      scale: 2,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.comboText.setText('COMBO MAX!');
    this.comboText.setColor('#ffff00');

    // 2. 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy()
    });

    // 3. 粒子爆炸效果
    this.particleEmitter.setPosition(width / 2, height / 2);
    this.particleEmitter.explode(50);

    // 4. 连续粒子发射
    this.particleEmitter.start();
    this.time.delayedCall(1000, () => {
      this.particleEmitter.stop();
    });

    // 5. 相机震动
    this.cameras.main.shake(500, 0.01);

    // 6. 创建扩散圆环效果
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        const ring = this.add.graphics();
        ring.lineStyle(4, 0x00ffff, 1);
        ring.strokeCircle(width / 2, height / 2, 20);
        
        this.tweens.add({
          targets: ring,
          alpha: 0,
          duration: 800,
          ease: 'Quad.easeOut',
          onUpdate: (tween) => {
            ring.clear();
            ring.lineStyle(4, 0x00ffff, 1 - tween.progress);
            const radius = 20 + tween.progress * 300;
            ring.strokeCircle(width / 2, height / 2, radius);
          },
          onComplete: () => ring.destroy()
        });
      });
    }

    // 2秒后重置
    this.time.delayedCall(2000, () => {
      this.comboCount = 0;
      this.updateComboDisplay();
      this.comboText.setScale(1);
      this.isSpecialEffectPlaying = false;
      
      // 恢复计时器
      if (this.comboTimer) {
        this.comboTimer.paused = false;
      }
    });
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.comboTimer && !this.comboTimer.paused && this.comboCount > 0 && !this.isSpecialEffectPlaying) {
      const progress = 1 - (this.comboTimer.getProgress());
      const { width } = this.cameras.main;
      
      this.timerBar.clear();
      this.timerBar.fillStyle(0x00ffff, 1);
      this.timerBar.fillRect(width / 2 - 150, 100, 300 * progress, 20);
    } else {
      this.timerBar.clear();
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
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);