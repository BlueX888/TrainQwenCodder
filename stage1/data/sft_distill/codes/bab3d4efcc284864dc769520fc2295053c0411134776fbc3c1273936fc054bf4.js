class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态验证：已生成障碍物数量
    this.activeObstacles = 0; // 状态验证：当前活跃障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 在顶部随机位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界空间
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 80
    obstacle.setVelocityY(80);
    
    // 更新计数器
    this.obstacleCount++;
    this.activeObstacles = this.obstacles.getChildren().length;
    
    console.log(`障碍物生成 #${this.obstacleCount} at x=${randomX}`);
  }

  update() {
    // 移除超出屏幕底部的障碍物
    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
      }
    });

    // 更新活跃障碍物数量
    this.activeObstacles = this.obstacles.getChildren().length;

    // 更新调试信息
    this.debugText.setText(
      `总生成: ${this.obstacleCount}\n` +
      `当前活跃: ${this.activeObstacles}`
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);