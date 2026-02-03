class ComboScene extends Phaser.Scene {
  constructor() {
    super('ComboScene');
    this.comboCount = 0; // 可验证的状态信号
    this.comboTimer = null;
    this.comboText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建提示文本
    const hintText = this.add.text(400, 100, '点击屏幕进行连击！', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);

    // 创建Combo计数器文本（黄色）
    this.comboText = this.add.text(400, 300, 'COMBO: 0', {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.comboText.setOrigin(0.5);

    // 创建计时器提示文本
    this.timerText = this.add.text(400, 380, '1秒内点击保持连击', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    this.timerText.setOrigin(0.5);

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 创建用于特效的Graphics对象池
    this.effectGraphics = this.add.graphics();
  }

  handleClick(pointer) {
    // 增加combo计数
    this.comboCount++;
    this.updateComboDisplay();

    // 清除之前的计时器
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 创建新的1秒计时器
    this.comboTimer = this.time.addEvent({
      delay: 1000,
      callback: this.resetCombo,
      callbackScope: this
    });

    // 检查是否达到3连击
    if (this.comboCount === 3) {
      this.triggerComboEffect(pointer.x, pointer.y);
    }

    // Combo文本缩放动画
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  resetCombo() {
    // 重置combo计数
    this.comboCount = 0;
    this.updateComboDisplay();

    // 清除计时器引用
    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = null;
    }

    // 文本淡出效果
    this.tweens.add({
      targets: this.comboText,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });
  }

  updateComboDisplay() {
    // 更新显示文本
    this.comboText.setText(`COMBO: ${this.comboCount}`);
    
    // 根据combo数量改变颜色强度
    if (this.comboCount >= 3) {
      this.comboText.setColor('#ffff00'); // 亮黄色
    } else if (this.comboCount >= 2) {
      this.comboText.setColor('#ffdd00'); // 橙黄色
    } else {
      this.comboText.setColor('#ffff00'); // 标准黄色
    }
  }

  triggerComboEffect(x, y) {
    // 清除之前的特效
    this.effectGraphics.clear();

    // 创建多个黄色圆形扩散特效
    for (let i = 0; i < 3; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(0xffff00, 0.8);
      circle.fillCircle(0, 0, 20);
      circle.setPosition(x, y);

      // 扩散动画
      this.tweens.add({
        targets: circle,
        scaleX: 5 + i * 2,
        scaleY: 5 + i * 2,
        alpha: 0,
        duration: 800 + i * 200,
        ease: 'Quad.easeOut',
        onComplete: () => {
          circle.destroy();
        }
      });
    }

    // 创建星星爆炸效果
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00, 1);
      particle.fillRect(-5, -5, 10, 10);
      particle.setPosition(x, y);

      const targetX = x + Math.cos(angle) * 150;
      const targetY = y + Math.sin(angle) * 150;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 屏幕震动效果
    this.cameras.main.shake(200, 0.005);

    // 显示特效文本
    const effectText = this.add.text(x, y - 100, '3 COMBO!', {
      fontSize: '36px',
      color: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#ff8800',
      strokeThickness: 4
    });
    effectText.setOrigin(0.5);

    this.tweens.add({
      targets: effectText,
      y: y - 150,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        effectText.destroy();
      }
    });
  }

  update(time, delta) {
    // 更新计时器提示
    if (this.comboTimer && this.comboCount > 0) {
      const remaining = this.comboTimer.getRemaining();
      const progress = remaining / 1000;
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(2)}秒`);
      
      // 根据剩余时间改变颜色
      if (progress < 0.3) {
        this.timerText.setColor('#ff0000');
      } else if (progress < 0.6) {
        this.timerText.setColor('#ffaa00');
      } else {
        this.timerText.setColor('#aaaaaa');
      }
    } else {
      this.timerText.setText('1秒内点击保持连击');
      this.timerText.setColor('#aaaaaa');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ComboScene
};

new Phaser.Game(config);