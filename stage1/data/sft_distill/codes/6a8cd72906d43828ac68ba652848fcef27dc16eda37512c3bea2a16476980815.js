class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboTimeout = 3000; // 3秒超时
  }

  preload() {
    // 无需外部资源
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x00ff00, 1);
    clickArea.strokeRoundedRect(200, 200, 400, 200, 10);
    
    const hintText = this.add.text(400, 300, 'CLICK HERE', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // Combo显示文本
    this.comboText = this.add.text(400, 100, 'COMBO: 0', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 倒计时进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 1);
    this.timerBarBg.fillRect(250, 150, 300, 20);

    // 倒计时进度条
    this.timerBar = this.add.graphics();

    // 状态信息显示
    this.statusText = this.add.text(400, 550, 'Click to start combo!', {
      fontSize: '20px',
      color: '#ffffff'
    });
    this.statusText.setOrigin(0.5);

    // 特效容器
    this.effectsContainer = this.add.container(0, 0);

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 用于验证的状态变量
    this.totalClicks = 0;
    this.maxCombo = 0;
    this.specialEffectTriggered = 0;
  }

  handleClick(pointer) {
    // 增加combo
    this.combo++;
    this.totalClicks++;
    
    // 更新最大combo记录
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // 更新combo显示
    this.updateComboDisplay();

    // 点击反馈特效
    this.createClickEffect(pointer.x, pointer.y);

    // 重置或创建倒计时
    this.resetComboTimer();

    // 检查是否达到5连击
    if (this.combo === 5) {
      this.triggerSpecialEffect();
    }

    // 更新状态文本
    this.updateStatusText();
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 文字弹跳动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Cubic.easeOut'
    });

    // 根据combo数量改变颜色
    if (this.combo >= 5) {
      this.comboText.setColor('#ffff00'); // 黄色
    } else if (this.combo >= 3) {
      this.comboText.setColor('#00ffff'); // 青色
    } else {
      this.comboText.setColor('#00ff00'); // 绿色
    }
  }

  resetComboTimer() {
    // 移除旧的计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新的3秒倒计时
    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeout,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 重置倒计时开始时间
    this.timerStartTime = this.time.now;
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    this.comboText.setColor('#00ff00');
    this.statusText.setText('Combo reset! Click to start again.');
    
    // 清空进度条
    this.timerBar.clear();
  }

  createClickEffect(x, y) {
    // 创建点击波纹效果
    const ripple = this.add.graphics();
    ripple.lineStyle(3, 0x00ff00, 1);
    ripple.strokeCircle(0, 0, 10);
    ripple.setPosition(x, y);

    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  triggerSpecialEffect() {
    this.specialEffectTriggered++;
    this.statusText.setText('🎉 AMAZING! 5 COMBO! 🎉');

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.5);
    flash.fillRect(0, 0, 800, 600);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 粒子爆炸效果（使用多个圆形模拟）
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      const color = Phaser.Math.Between(0, 1) ? 0xffff00 : 0x00ff00;
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 8);
      particle.setPosition(400, 100);

      const angle = (Math.PI * 2 / 20) * i;
      const speed = Phaser.Math.Between(100, 300);
      const targetX = 400 + Math.cos(angle) * speed;
      const targetY = 100 + Math.sin(angle) * speed;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // Combo文字超级缩放
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });
  }

  updateStatusText() {
    if (this.combo < 5) {
      const remaining = 5 - this.combo;
      this.statusText.setText(`${remaining} more click${remaining > 1 ? 's' : ''} to special effect!`);
    }
  }

  update(time, delta) {
    // 更新倒计时进度条
    if (this.comboTimer && this.combo > 0) {
      const elapsed = time - this.timerStartTime;
      const progress = 1 - (elapsed / this.comboTimeout);
      
      this.timerBar.clear();
      if (progress > 0) {
        const barWidth = 300 * progress;
        const color = progress > 0.5 ? 0x00ff00 : (progress > 0.25 ? 0xffaa00 : 0xff0000);
        this.timerBar.fillStyle(color, 1);
        this.timerBar.fillRect(250, 150, barWidth, 20);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ComboScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号（可通过控制台访问）
// game.scene.scenes[0].combo - 当前combo数
// game.scene.scenes[0].maxCombo - 最大combo记录
// game.scene.scenes[0].totalClicks - 总点击次数
// game.scene.scenes[0].specialEffectTriggered - 特效触发次数