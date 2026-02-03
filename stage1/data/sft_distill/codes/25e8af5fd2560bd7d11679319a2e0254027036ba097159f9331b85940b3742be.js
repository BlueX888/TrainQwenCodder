class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.moveSpeed = 240;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 圆形，半径16
    graphics.generateTexture('pinkObject', 32, 32);
    graphics.destroy();

    // 创建10个粉色对象，随机分布
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'pinkObject');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
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
      velocityX = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      isMoving = true;
    }

    // 同步控制所有对象移动
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动距离统计
    if (isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Objects: ${this.objects.length}`,
      `Speed: ${this.moveSpeed}`,
      `Total Distance: ${this.totalDistance.toFixed(2)}`,
      `Use Arrow Keys to Move`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);