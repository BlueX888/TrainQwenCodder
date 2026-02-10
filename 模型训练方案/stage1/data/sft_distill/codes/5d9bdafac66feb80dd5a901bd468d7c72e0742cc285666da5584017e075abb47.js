class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.comboTimer = null;
    this.comboResetDelay = 2000; // 2秒超时
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
    clickArea.lineStyle(3, 0x16213e, 1);
    clickArea.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click anywhere to build combo!', {
      fontSize: '20px',
      color: '#0f3460',
      fontStyle: 'bold'
    });
    hintText.setOrigin(0.5);

    // 创建combo显示文字
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'COMBO: 0', {
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#0f3460',
      strokeThickness: 4
    });
    this.comboText.setOrigin(0.5);

    // 创建状态提示文字
    this.statusText = this.add.text(width / 2, height / 2 + 50, 'Click to start!', {
      fontSize: '24px',
      color: '#e94560',
      fontStyle: 'bold'
    });
    this.statusText.setOrigin(0.5);

    // 创建计时器显示
    this.timerText = this.add.text(width / 2, height / 2 + 100, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'italic'
    });
    this.timerText.setOrigin(0.5);

    // 特效容器
    this.effectsContainer = this.add.container(0, 0);

    // 添加点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 调试信息
    console.log('Combo game initialized. Click to build combo within 2 seconds!');
  }

  onPointerDown(pointer) {
    // 增加combo
    this.combo++;
    this.comboText.setText(`COMBO: ${this.combo}`);

    // 创建点击位置特效
    this.createClickEffect(pointer.x, pointer.y);

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.comboResetDelay,
      callback: this.resetCombo,
      callbackScope: this,
      loop: false
    });

    // 更新状态文字
    if (this.combo < 3) {
      this.statusText.setText(`Keep going! ${3 - this.combo} more to trigger effect!`);
      this.statusText.setColor('#e94560');
    } else if (this.combo === 3) {
      this.statusText.setText('🎉 COMBO EFFECT TRIGGERED! 🎉');
      this.statusText.setColor('#00ff00');
      this.triggerComboEffect();
    } else {
      this.statusText.setText(`Amazing! ${this.combo} combo streak!`);
      this.statusText.setColor('#ffff00');
    }

    console.log(`Combo: ${this.combo}, Position: (${pointer.x}, ${pointer.y})`);
  }

  resetCombo() {
    console.log(`Combo reset from ${this.combo} to 0 (timeout)`);
    this.combo = 0;
    this.comboText.setText('COMBO: 0');
    this.statusText.setText('Combo reset! Click to restart!');
    this.statusText.setColor('#e94560');
    this.timerText.setText('');
    this.comboTimer = null;
  }

  createClickEffect(x, y) {
    // 创建点击位置的小圆圈扩散效果
    const circle = this.add.graphics();
    circle.lineStyle(2, 0x00ffff, 1);
    circle.strokeCircle(0, 0, 10);
    circle.setPosition(x, y);

    this.tweens.add({
      targets: circle,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        circle.destroy();
      }
    });
  }

  triggerComboEffect() {
    // 触发青色圆形扩散特效
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 创建多个同心圆扩散
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 100, () => {
        const circle = this.add.graphics();
        circle.lineStyle(4, 0x00ffff, 1);
        circle.strokeCircle(0, 0, 20);
        circle.setPosition(centerX, centerY);
        this.effectsContainer.add(circle);

        this.tweens.add({
          targets: circle,
          scaleX: 15,
          scaleY: 15,
          alpha: 0,
          duration: 1500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            circle.destroy();
          }
        });
      });
    }

    // 创建填充圆形闪烁效果
    const flashCircle = this.add.graphics();
    flashCircle.fillStyle(0x00ffff, 0.3);
    flashCircle.fillCircle(centerX, centerY, 80);
    this.effectsContainer.add(flashCircle);

    this.tweens.add({
      targets: flashCircle,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        flashCircle.destroy();
      }
    });

    // 创建粒子效果（用小方块模拟）
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const particle = this.add.graphics();
      particle.fillStyle(0x00ffff, 1);
      particle.fillRect(-3, -3, 6, 6);
      particle.setPosition(centerX, centerY);
      this.effectsContainer.add(particle);

      const distance = 200;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    console.log('Combo effect triggered at combo:', this.combo);
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.comboTimer && this.combo > 0) {
      const remaining = this.comboResetDelay - this.comboTimer.getElapsed();
      if (remaining > 0) {
        this.timerText.setText(`Time left: ${(remaining / 1000).toFixed(1)}s`);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出状态用于验证
window.getComboState = function() {
  const scene = game.scene.scenes[0];
  return {
    combo: scene.combo,
    hasTimer: scene.comboTimer !== null,
    timerElapsed: scene.comboTimer ? scene.comboTimer.getElapsed() : 0
  };
};

console.log('Game started! Use window.getComboState() to check current combo state.');