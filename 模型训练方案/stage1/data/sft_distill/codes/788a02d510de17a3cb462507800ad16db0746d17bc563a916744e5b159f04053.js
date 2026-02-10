class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 验证信号：记录生成的障碍物数量
  }

  preload() {
    // 使用 Graphics 创建蓝色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的正方形
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每3秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');

    // 设置障碍物向下移动的速度
    obstacle.setVelocityY(200);

    // 增加计数器
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);

    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update() {
    // 移除超出屏幕底部的障碍物以节省性能
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        obstacle.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用重力，直接设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);