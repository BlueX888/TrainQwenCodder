class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.maxComboReached = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建紫色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0033, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x9933ff, 1);
    clickArea.strokeRoundedRect(width / 2 - 200, height / 2 - 100, 400, 200, 20);
    
    const clickText = this.add.text(width / 2, height / 2, 'CLICK HERE!', {
      fontSize: '32px',
      color: '#9933ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建Combo显示文本
    this.comboText = this.add.text(width / 2, 100, 'COMBO: 0', {
      fontSize: '48px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 50, 'Click within 1 second to build combo!', {
      fontSize: '20px',
      color: '#cc99ff'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(width / 2, 160, '', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff00ff, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      gravityY: 300,
      frequency: 20,
      on: false
    });

    // 创建特效光圈
    this.glowCircle = this.add.graphics();
    this.glowCircle.setVisible(false);

    // 添加点击事件监听
    this.input.on('pointerdown', this.onPointerDown, this);

    // 添加键盘空格键支持
    this.input.keyboard.on('keydown-SPACE', this.onPointerDown, this);
  }

  onPointerDown() {
    // 增加combo
    this.combo++;
    
    // 更新显示
    this.updateComboDisplay();

    // 清除旧的定时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 创建新的1秒定时器
    this.comboTimer = this.time.delayedCall(1000, this.resetCombo, [], this);

    // 检查是否达到20连击
    if (this.combo === 20 && !this.maxComboReached) {
      this.triggerSpecialEffect();
    }

    // 添加点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  resetCombo() {
    // 重置combo
    this.combo = 0;
    this.maxComboReached = false;
    
    // 更新显示
    this.updateComboDisplay();
    
    // 停止特效
    this.emitter.stop();
    this.glowCircle.setVisible(false);
    
    // 显示重置提示
    this.statusText.setText('COMBO RESET!');
    this.statusText.setColor('#ff0000');
    
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据combo数量改变颜色
    if (this.combo >= 20) {
      this.comboText.setColor('#ff00ff');
      this.comboText.setStroke('#ffff00', 6);
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff66ff');
      this.comboText.setStroke('#ffffff', 4);
    } else {
      this.comboText.setColor('#ff00ff');
      this.comboText.setStroke('#ffffff', 4);
    }
  }

  triggerSpecialEffect() {
    this.maxComboReached = true;
    
    // 显示成就文本
    this.statusText.setText('★ 20 COMBO ACHIEVED! ★');
    this.statusText.setColor('#ffff00');
    
    // 启动粒子效果
    this.emitter.start();
    
    // 显示并动画化光圈
    const { width, height } = this.cameras.main;
    this.glowCircle.setVisible(true);
    
    // 创建脉冲光圈动画
    this.tweens.add({
      targets: { radius: 0, alpha: 1 },
      radius: 300,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      onUpdate: (tween) => {
        const value = tween.getValue();
        this.glowCircle.clear();
        this.glowCircle.lineStyle(5, 0xff00ff, value.alpha);
        this.glowCircle.strokeCircle(width / 2, height / 2, value.radius);
      }
    });

    // 屏幕闪烁效果
    this.cameras.main.flash(500, 255, 0, 255);
    
    // 震动效果
    this.cameras.main.shake(300, 0.01);
  }

  update(time, delta) {
    // 如果有定时器，显示剩余时间
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const progress = remaining / 1000;
      
      // 时间快用完时改变颜色
      if (progress < 0.3) {
        this.hintText.setColor('#ff6666');
      } else {
        this.hintText.setColor('#cc99ff');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a0033',
  scene: ComboScene,
  parent: 'game-container'
};

new Phaser.Game(config);