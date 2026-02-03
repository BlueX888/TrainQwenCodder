class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.animationComplete = false; // 状态信号：动画是否完成
    this.activeObjects = 15; // 状态信号：活动物体数量
    this.shakeIntensity = 10; // 状态信号：抖动强度
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景文字提示
    this.add.text(400, 50, '15个物体同步抖动动画', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态文本显示
    this.statusText = this.add.text(400, 550, '状态: 抖动中...', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 存储所有物体
    this.objects = [];

    // 创建15个物体，排列成3行5列的网格
    const rows = 3;
    const cols = 5;
    const startX = 200;
    const startY = 150;
    const spacingX = 100;
    const spacingY = 100;

    for (let i = 0; i < 15; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // 使用Graphics绘制圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x3498db, 1);
      graphics.fillCircle(0, 0, 25);
      graphics.setPosition(x, y);

      // 添加物体编号文字
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      text.setPosition(x, y);

      // 将graphics和text作为一个容器存储
      this.objects.push({
        graphics: graphics,
        text: text,
        originalX: x,
        originalY: y
      });
    }

    // 为所有物体创建同步的抖动动画
    this.createShakeAnimation();

    // 添加重启按钮（动画完成后可用）
    this.restartButton = this.add.text(400, 500, '点击重启动画', {
      fontSize: '16px',
      color: '#888888',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.restartButton.setAlpha(0.5);
    this.restartButton.on('pointerdown', () => {
      if (this.animationComplete) {
        this.restartAnimation();
      }
    });
  }

  createShakeAnimation() {
    this.animationComplete = false;
    this.statusText.setText('状态: 抖动中...');
    this.statusText.setColor('#00ff00');
    this.restartButton.setAlpha(0.5);

    // 为每个物体创建抖动动画
    this.objects.forEach((obj, index) => {
      // X方向抖动
      this.tweens.add({
        targets: [obj.graphics, obj.text],
        x: obj.originalX + Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
        duration: 50,
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Linear'
      });

      // Y方向抖动
      this.tweens.add({
        targets: [obj.graphics, obj.text],
        y: obj.originalY + Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity),
        duration: 50,
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Linear'
      });
    });

    // 2.5秒后停止所有动画
    this.time.delayedCall(2500, () => {
      this.stopShakeAnimation();
    });
  }

  stopShakeAnimation() {
    // 停止所有tweens
    this.tweens.killAll();

    // 将所有物体恢复到原始位置
    this.objects.forEach(obj => {
      obj.graphics.setPosition(obj.originalX, obj.originalY);
      obj.text.setPosition(obj.originalX, obj.originalY);
    });

    // 更新状态
    this.animationComplete = true;
    this.statusText.setText('状态: 动画已完成');
    this.statusText.setColor('#ffff00');
    this.restartButton.setAlpha(1);

    // 添加完成提示闪烁效果
    this.tweens.add({
      targets: this.statusText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: 3
    });
  }

  restartAnimation() {
    // 重置状态
    this.animationComplete = false;
    this.activeObjects = 15;

    // 停止现有动画
    this.tweens.killAll();

    // 重新开始抖动动画
    this.createShakeAnimation();
  }

  update(time, delta) {
    // 可以在这里添加实时状态更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: ShakeScene
};

new Phaser.Game(config);