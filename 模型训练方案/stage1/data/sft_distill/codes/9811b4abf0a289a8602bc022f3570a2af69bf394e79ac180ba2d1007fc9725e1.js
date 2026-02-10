class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.moveSpeed = 160;
  }

  preload() {
    // 使用 Graphics 生成灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个灰色对象，分布在不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 },
      { x: 300, y: 150 },
      { x: 500, y: 450 }
    ];

    for (let i = 0; i < 5; i++) {
      const obj = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'grayBox'
      );
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
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

    // 检测方向键输入
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

    // 同步控制所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新总移动距离（基于速度和时间）
    if (isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}`
    );
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