class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 创建紫色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50 // 限制最大数量，避免内存溢出
    });

    // 创建定时器，每 0.5 秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界
    
    // 从物理组获取或创建障碍物
    const obstacle = this.obstacles.get(randomX, -20);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置向下速度为 160
      obstacle.setVelocityY(160);
      
      // 启用物理体
      obstacle.body.enable = true;
      
      // 更新计数
      this.obstacleCount++;
      this.countText.setText(`Obstacles: ${this.obstacleCount}`);
    }
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > 650) {
        // 回收到对象池
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.body.enable = false;
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
      gravity: { y: 0 }, // 不使用重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);