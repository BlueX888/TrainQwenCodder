class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 状态信号：记录总移动距离
    this.moveSpeed = 360; // 移动速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建12个青色圆形对象
    const positions = [
      { x: 100, y: 100 }, { x: 250, y: 100 }, { x: 400, y: 100 }, { x: 550, y: 100 },
      { x: 100, y: 250 }, { x: 250, y: 250 }, { x: 400, y: 250 }, { x: 550, y: 250 },
      { x: 100, y: 400 }, { x: 250, y: 400 }, { x: 400, y: 400 }, { x: 550, y: 400 }
    ];

    for (let i = 0; i < 12; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ffff, 1); // 青色
      graphics.fillCircle(0, 0, 20); // 半径20的圆形
      graphics.x = positions[i].x;
      graphics.y = positions[i].y;
      this.objects.push(graphics);
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();
  }

  update(time, delta) {
    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }

    // 如果有移动输入
    if (velocityX !== 0 || velocityY !== 0) {
      // 归一化向量以保持恒定速度
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX /= length;
      velocityY /= length;

      // 计算实际移动距离（速度 * 时间）
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * this.moveSpeed * deltaSeconds;
      const moveY = velocityY * this.moveSpeed * deltaSeconds;

      // 同步移动所有对象
      for (let obj of this.objects) {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测（可选，防止移出屏幕）
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      }

      // 更新总移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      this.updateInfoText();
    }
  }

  updateInfoText() {
    this.infoText.setText([
      '使用方向键控制所有对象',
      `移动速度: ${this.moveSpeed}`,
      `总移动距离: ${Math.floor(this.totalDistance)}`,
      `对象数量: ${this.objects.length}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);