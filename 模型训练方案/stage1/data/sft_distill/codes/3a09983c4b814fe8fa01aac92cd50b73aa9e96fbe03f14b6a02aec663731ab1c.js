class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.combo = 0;
    this.lastClickTime = 0;
    this.comboTimer = null;
    this.COMBO_TIMEOUT = 4000; // 4秒超时
    this.COMBO_THRESHOLD = 8; // 8连击触发特效
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
    clickArea.fillStyle(0x34495e, 1);
    clickArea.fillRoundedRect(width / 2 - 200, height / 2 - 100, 400, 200, 16);
    
    // 添加点击提示文本
    this.add.text(width / 2, height / 2, 'CLICK HERE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#7f8c8d',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建 Combo 显示文本
    this.comboText = this.add.text(width / 2, 100, 'COMBO: 0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建倒计时进度条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x34495e, 1);
    this.timerBarBg.fillRect(width / 2 - 150, 160, 300, 10);

    // 创建倒计时进度条
    this.timerBar = this.add.graphics();

    // 创建特效层（用于8连击特效）
    this.effectLayer = this.add.graphics();

    // 添加状态显示（用于验证）
    this.statusText = this.add.text(10, 10, this.getStatusText(), {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 初始化计时器（不启动）
    this.comboTimer = this.time.addEvent({
      delay: this.COMBO_TIMEOUT,
      callback: this.resetCombo,
      callbackScope: this,
      paused: true
    });
  }

  onPointerDown(pointer) {
    // 增加 combo
    this.combo++;
    this.lastClickTime = this.time.now;

    // 更新显示
    this.updateComboDisplay();

    // 重置并启动计时器
    if (this.comboTimer) {
      this.comboTimer.reset({
        delay: this.COMBO_TIMEOUT,
        callback: this.resetCombo,
        callbackScope: this,
        paused: false
      });
    }

    // 检查是否达到8连击
    if (this.combo === this.COMBO_THRESHOLD) {
      this.triggerComboEffect();
    }

    // 点击反馈动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 更新状态文本
    this.statusText.setText(this.getStatusText());
  }

  resetCombo() {
    this.combo = 0;
    this.updateComboDisplay();
    
    // 停止计时器
    if (this.comboTimer) {
      this.comboTimer.paused = true;
    }

    // 重置进度条
    this.timerBar.clear();

    // 更新状态文本
    this.statusText.setText(this.getStatusText());
  }

  updateComboDisplay() {
    this.comboText.setText(`COMBO: ${this.combo}`);
    
    // 根据 combo 数量改变颜色
    if (this.combo >= this.COMBO_THRESHOLD) {
      this.comboText.setColor('#f39c12'); // 金色
    } else if (this.combo >= 5) {
      this.comboText.setColor('#e74c3c'); // 红色
    } else if (this.combo >= 3) {
      this.comboText.setColor('#3498db'); // 蓝色
    } else {
      this.comboText.setColor('#ecf0f1'); // 灰白色
    }
  }

  triggerComboEffect() {
    const { width, height } = this.cameras.main;

    // 创建闪光特效
    this.effectLayer.clear();
    this.effectLayer.fillStyle(0xf39c12, 0.5);
    
    // 绘制多个扩散圆环
    for (let i = 0; i < 3; i++) {
      const circle = this.add.graphics();
      circle.lineStyle(8, 0xf39c12, 1);
      circle.strokeCircle(width / 2, height / 2, 50);
      
      this.tweens.add({
        targets: circle,
        scaleX: 5,
        scaleY: 5,
        alpha: 0,
        duration: 1000,
        delay: i * 150,
        ease: 'Power2',
        onComplete: () => circle.destroy()
      });
    }

    // 屏幕闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.6);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // 显示特效文本
    const effectText = this.add.text(width / 2, height / 2 - 80, '8 COMBO!', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: effectText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: effectText,
          alpha: 0,
          y: height / 2 - 150,
          duration: 500,
          ease: 'Power2',
          onComplete: () => effectText.destroy()
        });
      }
    });

    // 震动效果
    this.cameras.main.shake(300, 0.005);
  }

  update(time, delta) {
    // 更新倒计时进度条
    if (this.comboTimer && !this.comboTimer.paused) {
      const elapsed = this.comboTimer.getElapsed();
      const progress = 1 - (elapsed / this.COMBO_TIMEOUT);
      
      this.timerBar.clear();
      if (progress > 0) {
        // 根据剩余时间改变颜色
        let color = 0x2ecc71; // 绿色
        if (progress < 0.3) {
          color = 0xe74c3c; // 红色
        } else if (progress < 0.6) {
          color = 0xf39c12; // 橙色
        }
        
        this.timerBar.fillStyle(color, 1);
        this.timerBar.fillRect(
          this.cameras.main.width / 2 - 150,
          160,
          300 * progress,
          10
        );
      }
    }
  }

  getStatusText() {
    return `Status: Combo=${this.combo} | LastClick=${this.lastClickTime} | Active=${!this.comboTimer.paused}`;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: ComboScene
};

new Phaser.Game(config);