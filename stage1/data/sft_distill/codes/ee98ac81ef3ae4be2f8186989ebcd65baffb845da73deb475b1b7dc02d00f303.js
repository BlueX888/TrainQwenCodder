class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    // 状态信号变量
    this.comboCount = 0;
    this.maxComboAchieved = 0;
    this.totalClicks = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 2500; // 2.5秒
    this.COMBO_THRESHOLD = 15; // 连击15次触发特效
  }

  preload() {
    // 创建橙色纹理用于粒子
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('orangeParticle', 16, 16);
    graphics.destroy();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x222222);

    // 标题
    this.add.text(width / 2, 50, 'Orange Combo Challenge', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FF8800',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建橙色可点击区域
    this.clickArea = this.add.graphics();
    this.clickArea.fillStyle(0xFF8800, 1);
    this.clickArea.fillRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 16);
    this.clickArea.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 150, height / 2 - 100, 300, 200),
      Phaser.Geom.Rectangle.Contains
    );

    // 点击区域提示文字
    this.add.text(width / 2, height / 2 - 50, 'CLICK HERE!', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Combo计数显示
    this.comboText = this.add.text(width / 2, height / 2 + 20, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 计时器进度条背景
    this.timerBarBg = this.add.rectangle(width / 2, height / 2 + 80, 280, 20, 0x444444);
    
    // 计时器进度条
    this.timerBar = this.add.rectangle(width / 2, height / 2 + 80, 280, 20, 0x00FF00);

    // 状态信息显示
    this.statusText = this.add.text(width / 2, height - 100, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 统计信息
    this.statsText = this.add.text(20, height - 60, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    });

    // 特效文字（初始隐藏）
    this.specialText = this.add.text(width / 2, height / 2 - 150, '★ COMBO MASTER! ★', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#FF8800',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    // 创建粒子发射器
    this.particles = this.add.particles('orangeParticle');
    this.emitter = this.particles.createEmitter({
      x: width / 2,
      y: height / 2,
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 300,
      quantity: 3,
      on: false
    });

    // 点击事件监听
    this.clickArea.on('pointerdown', this.onClickArea, this);

    // 鼠标悬停效果
    this.clickArea.on('pointerover', () => {
      this.clickArea.clear();
      this.clickArea.fillStyle(0xFFAA33, 1);
      this.clickArea.fillRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 16);
    });

    this.clickArea.on('pointerout', () => {
      this.clickArea.clear();
      this.clickArea.fillStyle(0xFF8800, 1);
      this.clickArea.fillRoundedRect(width / 2 - 150, height / 2 - 100, 300, 200, 16);
    });

    this.updateStats();
  }

  onClickArea(pointer) {
    // 增加combo计数
    this.comboCount++;
    this.totalClicks++;

    // 更新最大combo记录
    if (this.comboCount > this.maxComboAchieved) {
      this.maxComboAchieved = this.comboCount;
    }

    // 更新显示
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    
    // 添加点击动画效果
    this.tweens.add({
      targets: this.comboText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // 在点击位置发射粒子
    this.emitter.setPosition(pointer.x, pointer.y);
    this.emitter.explode(5);

    // 检查是否达到15连击
    if (this.comboCount === this.COMBO_THRESHOLD) {
      this.triggerSpecialEffect();
    }

    // 重置或创建计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }

    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 重置计时器进度条
    this.timerBar.setScale(1, 1);
    this.timerBar.setFillStyle(0x00FF00);

    this.updateStats();
  }

  resetCombo() {
    if (this.comboCount > 0) {
      this.statusText.setText('COMBO BROKEN!').setColor('#FF0000');
      
      // 文字闪烁效果
      this.tweens.add({
        targets: this.statusText,
        alpha: 0,
        duration: 200,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.statusText.setText('');
        }
      });
    }

    this.comboCount = 0;
    this.comboText.setText('COMBO: 0');
    this.comboTimer = null;
    this.timerBar.setScale(0, 1);
    
    this.updateStats();
  }

  triggerSpecialEffect() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 显示特效文字
    this.specialText.setVisible(true).setAlpha(0).setScale(0.5);
    
    this.tweens.add({
      targets: this.specialText,
      alpha: 1,
      scale: 1.5,
      duration: 500,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        this.specialText.setVisible(false);
      }
    });

    // 大量粒子爆发
    this.emitter.setPosition(width / 2, height / 2);
    this.emitter.explode(50);

    // 屏幕震动效果
    this.cameras.main.shake(500, 0.01);

    // 状态提示
    this.statusText.setText('★ 15 COMBO ACHIEVED! ★').setColor('#FFD700');
    
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  updateStats() {
    this.statsText.setText(
      `Total Clicks: ${this.totalClicks} | Max Combo: ${this.maxComboAchieved} | Current: ${this.comboCount}`
    );
  }

  update(time, delta) {
    // 更新计时器进度条
    if (this.comboTimer && this.comboCount > 0) {
      const elapsed = this.comboTimer.getElapsed();
      const progress = 1 - (elapsed / this.COMBO_TIMEOUT);
      
      this.timerBar.setScale(Math.max(0, progress), 1);
      
      // 根据剩余时间改变颜色
      if (progress < 0.3) {
        this.timerBar.setFillStyle(0xFF0000);
      } else if (progress < 0.6) {
        this.timerBar.setFillStyle(0xFFFF00);
      } else {
        this.timerBar.setFillStyle(0x00FF00);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ComboScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);