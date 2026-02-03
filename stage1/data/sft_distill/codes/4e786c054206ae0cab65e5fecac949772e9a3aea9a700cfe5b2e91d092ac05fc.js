class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 3000; // 3秒超时
    this.COMBO_THRESHOLD = 20; // 20连击触发特效
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0xffffff, 1);
    clickArea.strokeRect(50, 50, width - 100, height - 100);
    
    const hintText = this.add.text(width / 2, 80, 'Click anywhere to build combo!', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2, 'COMBO: 0', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(width / 2, height / 2 + 80, '', {
      fontSize: '32px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    this.timerText.setOrigin(0.5);

    // 创建状态提示文本
    this.statusText = this.add.text(width / 2, height - 50, 'Get 20 combo for special effect!', {
      fontSize: '20px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    this.statusText.setOrigin(0.5);

    // 创建粒子纹理
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
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
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 3,
      frequency: 50,
      on: false
    });

    // 创建闪烁效果的白色覆盖层
    this.flashOverlay = this.add.graphics();
    this.flashOverlay.fillStyle(0xffffff, 0);
    this.flashOverlay.fillRect(0, 0, width, height);
    this.flashOverlay.setDepth(100);

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 用于验证的状态信号
    this.maxComboReached = false;
    this.totalClicks = 0;
  }

  onPointerDown(pointer) {
    // 增加 combo
    this.combo++;
    this.totalClicks++;

    // 更新显示
    this.updateComboDisplay();

    // 播放点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 在点击位置创建临时标记
    this.createClickFeedback(pointer.x, pointer.y);

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.delayedCall(this.COMBO_TIMEOUT, this.resetCombo, [], this);

    // 检查是否达到 20 连击
    if (this.combo === this.COMBO_THRESHOLD) {
      this.triggerSpecialEffect();
    }
  }

  createClickFeedback(x, y) {
    const feedback = this.add.graphics();
    feedback.lineStyle(2, 0xffffff, 1);
    feedback.strokeCircle(0, 0, 20);
    feedback.setPosition(x, y);

    this.tweens.add({
      targets: feedback,
      scale: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据 combo 数改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#ffff00'); // 黄色
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ff8800'); // 橙色
    } else {
      this.comboText.setColor('#ffffff'); // 白色
    }
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.timerText.setText('');
    
    // 重置颜色
    this.comboText.setColor('#ffffff');
    
    // 显示重置提示
    this.statusText.setText('Combo Reset! Try again!');
    this.statusText.setColor('#ff4444');
    
    this.time.delayedCall(2000, () => {
      this.statusText.setText('Get 20 combo for special effect!');
      this.statusText.setColor('#888888');
    });
  }

  triggerSpecialEffect() {
    this.maxComboReached = true;
    
    // 更新状态文本
    this.statusText.setText('★ AMAZING! 20 COMBO ACHIEVED! ★');
    this.statusText.setColor('#ffff00');
    this.statusText.setFontSize('28px');

    // 启动粒子效果
    this.emitter.start();
    
    // 3秒后停止粒子
    this.time.delayedCall(3000, () => {
      this.emitter.stop();
    });

    // 屏幕闪烁效果
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      repeat: 5,
      ease: 'Power2'
    });

    // combo 文本脉冲效果
    this.tweens.add({
      targets: this.comboText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut'
    });

    // 旋转效果
    this.tweens.add({
      targets: this.comboText,
      angle: 360,
      duration: 1000,
      ease: 'Power2'
    });

    // 2秒后恢复状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('Keep going! Build another combo!');
      this.statusText.setFontSize('20px');
      this.statusText.setColor('#888888');
    });
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(1);
      this.timerText.setText(`Time left: ${seconds}s`);
      
      // 倒计时快结束时变红
      if (remaining < 1000) {
        this.timerText.setColor('#ff4444');
      } else {
        this.timerText.setColor('#aaaaaa');
      }
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

// 可验证的状态信号（用于测试）
// game.scene.scenes[0].combo - 当前连击数
// game.scene.scenes[0].maxComboReached - 是否达到20连击
// game.scene.scenes[0].totalClicks - 总点击次数