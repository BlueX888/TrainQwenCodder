class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1); // 白色
    graphics.fillRect(0, 0, 32, 32); // 32x32 的方块
    graphics.generateTexture('obstacle', 32, 32);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 100 // 限制最大数量，防止内存泄漏
    });

    // 创建定时器，每1秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 1000, // 1秒 = 1000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 坐标生成障碍物
    const randomX = Phaser.Math.Between(16, this.scale.width - 16);
    const obstacle = this.obstacles.create(randomX, -16, 'obstacle');

    if (obstacle) {
      // 设置向下速度为 160
      obstacle.setVelocityY(160);
      
      // 增加计数器
      this.obstacleCount++;
      this.countText.setText('Obstacles: ' + this.obstacleCount);
    }
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        this.obstacles.killAndHide(obstacle);
        obstacle.body.enable = false;
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);