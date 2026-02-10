class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.speed = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(20, 20, 20); // 半径20的圆形
    graphics.generateTexture('yellowCircle', 40, 40);
    graphics.destroy();

    // 创建5个黄色对象，分布在不同位置
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 600, y: 200 },
      { x: 300, y: 400 },
      { x: 500, y: 400 }
    ];

    for (let i = 0; i < 5; i++) {
      const obj = this.add.image(positions[i].x, positions[i].y, 'yellowCircle');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      isMoving = true;
    }

    // 同步移动所有对象
    if (isMoving) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 更新所有对象位置
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length}\n` +
      `Speed: ${this.speed}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}px\n` +
      `Use Arrow Keys to Move`
    );
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