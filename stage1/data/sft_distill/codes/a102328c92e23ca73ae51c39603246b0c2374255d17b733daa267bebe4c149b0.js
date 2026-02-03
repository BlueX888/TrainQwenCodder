class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒 = 2500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.obstacleText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机生成 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，位置在顶部
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 80（向下）
    obstacle.setVelocityY(80);
    
    // 更新计数器
    this.obstacleCount++;
    this.obstacleText.setText('Obstacles: ' + this.obstacleCount);
    
    console.log(`Obstacle spawned at x: ${randomX}, total: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物，避免内存泄漏
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) { // 超出屏幕底部 50 像素
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