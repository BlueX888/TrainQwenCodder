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

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // 创建点击区域提示
    const clickArea = this.add.graphics();
    clickArea.lineStyle(3, 0x95a5a6, 1);
    clickArea.strokeRect(width / 2 - 200, height / 2 - 150, 400, 300);
    
    const hintText = this.add.text(width / 2, height / 2 - 180, 'Click anywhere to build combo!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    }).setOrigin(0.5);

    // 创建 combo 显示文本
    this.comboText = this.add.text(width / 2, height / 2 - 50, 'COMBO: 0', {
      fontSize: '64px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // 创建状态提示文本
    this.statusText = this.add.text(width / 2, height / 2 + 50, 'Click fast within 1 second!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // 创建计时器进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x34495e, 1);
    this.timerBarBg.fillRect(width / 2 - 150, height / 2 + 100, 300, 20);

    // 创建计时器进度条
    this.timerBar = this.add.graphics();

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建粒子容器（用于特效）
    this.particleContainer = this.add.container(0, 0);

    // 创建点击反馈圆圈池
    this.clickFeedbacks = [];
  }

  onPointerDown(pointer) {
    // 增加 combo
    this.combo++;
    this.updateComboDisplay();

    // 创建点击反馈效果
    this.createClickFeedback(pointer.x, pointer.y);

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 检查是否达到 15 连击
    if (this.combo === 15 && !this.maxComboReached) {
      this.maxComboReached = true;
      this.triggerComboEffect();
    }

    // 如果超过 15，允许再次触发
    if (this.combo > 15) {
      this.maxComboReached = false;
    }
  }

  updateComboDisplay() {
    // 更新文本
    this.comboText.setText(`COMBO: ${this.combo}`);

    // 根据 combo 数量改变颜色
    let color = '#ecf0f1';
    if (this.combo >= 15) {
      color = '#f39c12'; // 金色
    } else if (this.combo >= 10) {
      color = '#e74c3c'; // 红色
    } else if (this.combo >= 5) {
      color = '#3498db'; // 蓝色
    }
    this.comboText.setColor(color);

    // 添加缩放动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 更新状态文本
    if (this.combo >= 15) {
      this.statusText.setText('AMAZING COMBO!!!');
      this.statusText.setColor('#f39c12');
    } else if (this.combo >= 10) {
      this.statusText.setText('Keep going!');
      this.statusText.setColor('#e74c3c');
    } else {
      this.statusText.setText('Click fast within 1 second!');
      this.statusText.setColor('#bdc3c7');
    }
  }

  resetCombo() {
    this.combo = 0;
    this.maxComboReached = false;
    this.updateComboDisplay();
    
    // 重置状态文本
    this.statusText.setText('Combo broken! Try again!');
    this.statusText.setColor('#95a5a6');

    // 闪烁效果
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = null;
    }
  }

  createClickFeedback(x, y) {
    const circle = this.add.graphics();
    circle.lineStyle(3, 0x3498db, 1);
    circle.strokeCircle(0, 0, 20);
    circle.setPosition(x, y);

    // 扩散动画
    this.tweens.add({
      targets: circle,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        circle.destroy();
      }
    });
  }

  triggerComboEffect() {
    const { width, height } = this.cameras.main;

    // 屏幕闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xf39c12, 0.6);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 创建粒子爆炸效果
    const particleCount = 50;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 200 + Math.random() * 200;
      
      const particle = this.add.graphics();
      particle.fillStyle(0xf39c12, 1);
      particle.fillCircle(0, 0, 5 + Math.random() * 5);
      particle.setPosition(centerX, centerY);

      const targetX = centerX + Math.cos(angle) * speed;
      const targetY = centerY + Math.sin(angle) * speed;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 文字特效
    const effectText = this.add.text(centerX, centerY - 100, '15 COMBO!', {
      fontSize: '72px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      y: centerY - 150,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: effectText,
      alpha: 0,
      delay: 1000,
      duration: 500,
      onComplete: () => {
        effectText.destroy();
      }
    });
  }

  update(time, delta) {
    // 更新计时器进度条
    this.timerBar.clear();
    
    if (this.comboTimer && this.combo > 0) {
      const progress = 1 - (this.comboTimer.getProgress());
      const barWidth = 300 * progress;
      
      let barColor = 0x2ecc71; // 绿色
      if (progress < 0.3) {
        barColor = 0xe74c3c; // 红色
      } else if (progress < 0.6) {
        barColor = 0xf39c12; // 橙色
      }
      
      this.timerBar.fillStyle(barColor, 1);
      this.timerBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 100,
        barWidth,
        20
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: ComboScene
};

const game = new Phaser.Game(config);