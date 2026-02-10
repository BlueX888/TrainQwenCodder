class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
    this.activeObstacles = 0; // 当前活跃障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每 0.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物，从顶部生成（y = -20，略微在屏幕外）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 160
    obstacle.setVelocityY(160);
    
    // 更新计数器
    this.obstacleCount++;
    this.activeObstacles++;

    // 当障碍物离开屏幕底部时销毁
    obstacle.setData('checkBounds', true);
  }

  update() {
    // 检查并移除超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
        this.activeObstacles--;
        obstacle.destroy();
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`
    ]);
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
      gravity: { y: 0 }, // 不使用重力，通过速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);