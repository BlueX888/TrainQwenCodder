class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboTimeLimit = 3000; // 3秒
    this.lastClickTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建绿色点击区域
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0x00ff00, 1);
    this.clickArea.fillRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 16);
    
    // 添加点击提示文字
    this.add.text(width / 2, height / 2, 'CLICK ME!', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Combo 计数显示
    this.comboText = this.add.text(width / 2, 100, 'COMBO: 0', {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 倒计时进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 1);
    this.timerBarBg.fillRect(width / 2 - 150, 150, 300, 20);

    // 倒计时进度条
    this.timerBar = this.add.graphics();

    // 状态提示文字
    this.statusText = this.add.text(width / 2, height - 50, '', {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建粒子纹理（用于特效）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffff00, 1);
    particleGraphics.fillCircle(8, 8, 8);
    particleGraphics.generateTexture('particle', 16, 16);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      quantity: 20,
      frequency: -1 // 手动触发
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 初始化状态信号（用于验证）
    this.comboState = {
      currentCombo: 0,
      maxComboReached: 0,
      totalClicks: 0,
      specialTriggered: 0
    };
  }

  onPointerDown(pointer) {
    const { width, height } = this.cameras.main;
    
    // 检查是否点击在绿色区域内
    const inArea = pointer.x >= width / 2 - 150 && 
                   pointer.x <= width / 2 + 150 &&
                   pointer.y >= height / 2 - 100 && 
                   pointer.y <= height / 2 + 100;

    if (!inArea) return;

    // 增加combo
    this.combo++;
    this.comboState.currentCombo = this.combo;
    this.comboState.totalClicks++;
    
    if (this.combo > this.comboState.maxComboReached) {
      this.comboState.maxComboReached = this.combo;
    }

    // 更新显示
    this.comboText.setText(`COMBO: ${this.combo}`);
    this.comboText.setScale(1.3);
    this.tweens.add({
      targets: this.comboText,
      scale: 1,
      duration: 200,
      ease: 'Back.out'
    });

    // 清除旧的计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    // 创建新的3秒计时器
    this.lastClickTime = this.time.now;
    this.comboTimer = this.time.addEvent({
      delay: this.comboTimeLimit,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 检查是否达到5连击
    if (this.combo === 5) {
      this.triggerSpecialEffect(pointer.x, pointer.y);
    }

    // 更新状态提示
    if (this.combo < 5) {
      this.statusText.setText(`Keep going! ${5 - this.combo} more for special!`);
    }
  }

  triggerSpecialEffect(x, y) {
    this.comboState.specialTriggered++;

    // 粒子爆炸
    this.particleEmitter.setPosition(x, y);
    this.particleEmitter.explode();

    // 特效文字
    const specialText = this.add.text(x, y - 50, 'AWESOME!', {
      fontSize: '64px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 文字动画
    this.tweens.add({
      targets: specialText,
      y: y - 150,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        specialText.destroy();
      }
    });

    // 屏幕震动效果
    this.cameras.main.shake(300, 0.01);

    // 更新状态提示
    this.statusText.setText('🎉 SPECIAL COMBO TRIGGERED! 🎉');
    this.statusText.setColor('#ff00ff');
    
    this.time.delayedCall(2000, () => {
      this.statusText.setColor('#00ffff');
    });
  }

  resetCombo() {
    if (this.combo > 0) {
      this.combo = 0;
      this.comboState.currentCombo = 0;
      this.comboText.setText('COMBO: 0');
      this.statusText.setText('Combo Reset! Try again!');
      this.statusText.setColor('#ff0000');
      
      this.time.delayedCall(1500, () => {
        this.statusText.setText('');
        this.statusText.setColor('#00ffff');
      });

      // 清空进度条
      this.timerBar.clear();
    }
    this.comboTimer = null;
  }

  update(time, delta) {
    // 更新倒计时进度条
    if (this.comboTimer && this.combo > 0) {
      const elapsed = time - this.lastClickTime;
      const remaining = Math.max(0, this.comboTimeLimit - elapsed);
      const progress = remaining / this.comboTimeLimit;

      this.timerBar.clear();
      
      // 根据剩余时间改变颜色
      let barColor = 0x00ff00; // 绿色
      if (progress < 0.3) {
        barColor = 0xff0000; // 红色
      } else if (progress < 0.6) {
        barColor = 0xffff00; // 黄色
      }

      this.timerBar.fillStyle(barColor, 1);
      this.timerBar.fillRect(
        this.cameras.main.width / 2 - 150,
        150,
        300 * progress,
        20
      );
    } else if (this.combo === 0) {
      this.timerBar.clear();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ComboScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

// 验证状态信号访问
game.scene.scenes[0].events.on('create', () => {
  console.log('Game State:', game.scene.scenes[0].comboState);
});