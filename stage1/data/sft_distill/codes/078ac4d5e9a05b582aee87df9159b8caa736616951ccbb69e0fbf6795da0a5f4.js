class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40); // 40x40 像素的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50 // 限制最大数量，避免内存泄漏
    });

    // 创建定时器，每 0.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 从顶部随机 X 坐标生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边距
    
    // 创建障碍物
    const obstacle = this.obstacles.get(randomX, -20);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置垂直速度为 160（向下）
      obstacle.setVelocityY(160);
      
      // 增加计数
      this.obstacleCount++;
      this.countText.setText('Obstacles: ' + this.obstacleCount);
    }
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > 650) {
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
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
      gravity: { y: 0 }, // 不使用全局重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);