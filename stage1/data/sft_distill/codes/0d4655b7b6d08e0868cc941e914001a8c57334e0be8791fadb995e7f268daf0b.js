class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证状态：障碍物生成计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建绿色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器：每4秒生成一个障碍物
    this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物计数（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 随机 x 位置（留出边距，避免障碍物被裁切）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 200
    obstacle.setVelocityY(200);
    
    // 增加计数
    this.obstacleCount++;
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);
    
    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物，释放内存
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部50像素
        obstacle.destroy();
      }
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用重力，通过速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);