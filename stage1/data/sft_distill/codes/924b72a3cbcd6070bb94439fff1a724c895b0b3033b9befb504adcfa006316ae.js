class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建紫色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每 2.5 秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部生成障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 200（向下）
    obstacle.setVelocityY(200);
    
    // 增加计数
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);