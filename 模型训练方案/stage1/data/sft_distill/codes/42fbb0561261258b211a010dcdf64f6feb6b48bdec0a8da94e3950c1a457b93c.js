class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.comboCount = 0; // 可验证状态变量
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 2000; // 2秒超时
    this.COMBO_TRIGGER = 3; // 连击3次触发特效
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建青色背景
    const bg = this.add.graphics();
    bg.fillStyle(0x00CED1, 1); // 青色
    bg.fillRect(0, 0, width, height);

    // 创建combo显示区域背景
    const comboBox = this.add.graphics();
    comboBox.fillStyle(0x008B8B, 1); // 深青色
    comboBox.fillRoundedRect(width / 2 - 150, 50, 300, 100, 16);
    this.comboBox = comboBox;

    // 创建combo文本
    this.comboText = this.add.text(width / 2, 100, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 100, 'Click anywhere to build combo!\n(2 seconds timeout)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建状态指示器（显示剩余时间）
    this.timeBar = this.add.graphics();
    this.timeBarWidth = 300;
    this.timeBarHeight = 10;
    this.timeBarX = width / 2 - this.timeBarWidth / 2;
    this.timeBarY = 170;
    this.remainingTime = 0;

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建粒子效果容器（用于特效）
    this.particles = [];

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    });
  }

  onPointerDown(pointer) {
    // 增加combo
    this.comboCount++;
    this.comboText.setText(`COMBO: ${this.comboCount}`);

    // 文本弹跳动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 重置计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.remainingTime = this.COMBO_TIMEOUT;
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 在点击位置创建涟漪效果
    this.createRipple(pointer.x, pointer.y);

    // 检查是否达到连击触发条件
    if (this.comboCount === this.COMBO_TRIGGER) {
      this.triggerComboEffect();
    }

    // 更新调试信息
    this.updateDebugInfo();
  }

  createRipple(x, y) {
    const ripple = this.add.graphics();
    ripple.lineStyle(3, 0xFFFFFF, 1);
    ripple.strokeCircle(0, 0, 10);
    ripple.setPosition(x, y);

    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  triggerComboEffect() {
    const { width, height } = this.cameras.main;

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xFFFFFF, 0.5);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });

    // combo文本特效
    this.tweens.add({
      targets: this.comboText,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // 创建粒子爆发效果
    this.createParticleBurst(width / 2, 100);

    // 显示特效文本
    const effectText = this.add.text(width / 2, height / 2, 'COMBO x3!', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#FF4500',
      strokeThickness: 6
    });
    effectText.setOrigin(0.5);
    effectText.setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: effectText,
      alpha: 0,
      y: height / 2 - 100,
      duration: 1000,
      delay: 500,
      ease: 'Power2',
      onComplete: () => {
        effectText.destroy();
      }
    });
  }

  createParticleBurst(x, y) {
    const particleCount = 20;
    const colors = [0x00FFFF, 0xFFFFFF, 0x00CED1, 0xFFD700];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 200 + Math.random() * 100;
      const size = 8 + Math.random() * 8;
      
      const particle = this.add.graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: particle,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboText.setText('COMBO: 0');
    this.comboTimer = null;
    this.remainingTime = 0;

    // 重置动画
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.5,
      duration: 200,
      yoyo: true
    });

    this.updateDebugInfo();
  }

  updateDebugInfo() {
    const timeLeft = this.comboTimer ? 
      (this.COMBO_TIMEOUT - this.comboTimer.getElapsed()).toFixed(0) : 0;
    
    this.debugText.setText(
      `Combo: ${this.comboCount}\n` +
      `Time Left: ${timeLeft}ms\n` +
      `Status: ${this.comboCount >= this.COMBO_TRIGGER ? 'TRIGGERED!' : 'Active'}`
    );
  }

  update(time, delta) {
    // 更新时间条
    if (this.comboTimer && this.comboTimer.getProgress() < 1) {
      const progress = 1 - this.comboTimer.getProgress();
      
      this.timeBar.clear();
      
      // 背景条
      this.timeBar.fillStyle(0x333333, 0.5);
      this.timeBar.fillRect(this.timeBarX, this.timeBarY, this.timeBarWidth, this.timeBarHeight);
      
      // 进度条（根据剩余时间改变颜色）
      let barColor = 0x00FF00; // 绿色
      if (progress < 0.5) {
        barColor = 0xFFFF00; // 黄色
      }
      if (progress < 0.25) {
        barColor = 0xFF0000; // 红色
      }
      
      this.timeBar.fillStyle(barColor, 1);
      this.timeBar.fillRect(
        this.timeBarX, 
        this.timeBarY, 
        this.timeBarWidth * progress, 
        this.timeBarHeight
      );

      // 更新调试信息
      if (Math.floor(time) % 100 < delta) {
        this.updateDebugInfo();
      }
    } else if (!this.comboTimer) {
      this.timeBar.clear();
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

// 导出可验证状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, ComboScene };
}