class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
    this.obstacles = null; // 障碍物组
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建青色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40); // 40x40 方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器：每 2 秒生成一个障碍物
    this.time.addEvent({
      delay: 2000, // 2 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatus();
  }

  spawnObstacle() {
    // 随机 x 坐标（留出障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵（从顶部生成，y = -20 确保从屏幕外进入）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度
    obstacle.setVelocityY(120);
    
    // 增加计数
    this.obstacleCount++;
    this.updateStatus();

    // 当障碍物离开屏幕底部时销毁（优化性能）
    obstacle.setData('checkBounds', true);
  }

  update() {
    // 清理离开屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
      }
    });

    this.updateStatus();
  }

  updateStatus() {
    // 更新状态显示
    const activeCount = this.obstacles.getLength();
    this.statusText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${activeCount}`,
      `Time: ${Math.floor(this.time.now / 1000)}s`
    ]);
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);