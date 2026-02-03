class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 3000; // 3秒超时
    this.COMBO_THRESHOLD = 20; // 连击20次触发特效
    this.hasTriggeredEffect = false;
  }

  preload() {
    // 创建点的纹理用于粒子效果
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // Combo 显示文本
    this.comboText = this.add.text(400, 200, 'Combo: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.comboText.setOrigin(0.5);

    // 提示文本
    this.hintText = this.add.text(400, 300, 'Click anywhere to build combo!\n(3 seconds timeout)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 计时器显示
    this.timerText = this.add.text(400, 370, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.timerText.setOrigin(0.5);

    // 状态信号（可验证）
    this.statusText = this.add.text(10, 10, 'Status: Ready', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });

    // 点击反馈容器
    this.clickFeedbacks = this.add.group();

    // 粒子发射器（用于特效）
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: -1, // 手动发射
      quantity: 50
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 初始化计时器（不启动）
    this.resetComboTimer();
  }

  onPointerDown(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 重置计时器
    this.resetComboTimer();

    // 点击反馈效果
    this.createClickFeedback(pointer.x, pointer.y);

    // 检查是否达到连击阈值
    if (this.combo === this.COMBO_THRESHOLD && !this.hasTriggeredEffect) {
      this.triggerComboEffect();
    }

    // 更新状态
    this.statusText.setText(`Status: Combo=${this.combo}, Time=${(this.COMBO_TIMEOUT / 1000).toFixed(1)}s`);
  }

  resetComboTimer() {
    // 移除旧计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新计时器
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.onComboTimeout,
      callbackScope: this,
      loop: false
    });

    this.timerStartTime = this.time.now;
  }

  onComboTimeout() {
    // 超时重置 combo
    if (this.combo > 0) {
      this.combo = 0;
      this.hasTriggeredEffect = false;
      this.updateComboDisplay();
      this.statusText.setText('Status: Combo Reset (Timeout)');
      
      // 显示超时提示
      const timeoutText = this.add.text(400, 450, 'TIMEOUT!', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ff0000'
      });
      timeoutText.setOrigin(0.5);
      
      this.tweens.add({
        targets: timeoutText,
        alpha: 0,
        y: 420,
        duration: 1000,
        onComplete: () => timeoutText.destroy()
      });
    }
    
    this.timerText.setText('');
  }

  updateComboDisplay() {
    this.comboText.setText(`Combo: ${this.combo}`);
    
    // Combo 数字动画
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // 根据 combo 数改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#ff00ff');
    } else if (this.combo >= 10) {
      this.comboText.setColor('#ffff00');
    } else if (this.combo >= 5) {
      this.comboText.setColor('#00ffff');
    } else {
      this.comboText.setColor('#ffffff');
    }
  }

  createClickFeedback(x, y) {
    // 创建点击位置的圆形反馈
    const circle = this.add.graphics();
    circle.lineStyle(3, 0xffffff, 1);
    circle.strokeCircle(x, y, 10);
    
    this.clickFeedbacks.add(circle);

    // 动画：扩散并淡出
    this.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onUpdate: (tween) => {
        const progress = tween.progress;
        circle.clear();
        circle.lineStyle(3, 0xffffff, 1 - progress);
        circle.strokeCircle(x, y, 10 + progress * 40);
      },
      onComplete: () => {
        circle.destroy();
      }
    });
  }

  triggerComboEffect() {
    this.hasTriggeredEffect = true;
    this.statusText.setText(`Status: COMBO EFFECT TRIGGERED! (${this.COMBO_THRESHOLD} hits)`);

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, 800, 600);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 粒子爆炸效果（中心位置）
    this.emitter.explode(100, 400, 300);

    // 特效文字
    const effectText = this.add.text(400, 150, 'AMAZING COMBO!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff00ff',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    effectText.setOrigin(0.5);
    effectText.setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scale: 1.5,
      duration: 300,
      yoyo: true,
      hold: 500,
      onComplete: () => effectText.destroy()
    });

    // 额外粒子效果（四周爆炸）
    this.time.delayedCall(200, () => {
      this.emitter.explode(30, 100, 100);
      this.emitter.explode(30, 700, 100);
      this.emitter.explode(30, 100, 500);
      this.emitter.explode(30, 700, 500);
    });
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.comboTimer && this.combo > 0) {
      const elapsed = time - this.timerStartTime;
      const remaining = Math.max(0, (this.COMBO_TIMEOUT - elapsed) / 1000);
      this.timerText.setText(`Time remaining: ${remaining.toFixed(2)}s`);
      
      // 时间紧迫时变红
      if (remaining < 1) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ComboScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);