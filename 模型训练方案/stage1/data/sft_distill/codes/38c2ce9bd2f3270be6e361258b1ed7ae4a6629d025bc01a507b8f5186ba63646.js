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
    // 使用 Graphics 生成橙色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF6600, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建障碍物组用于管理
    this.obstacles = this.physics.add.group();

    // 设置定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建物理精灵
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度为 200
    obstacle.setVelocityY(200);
    
    // 添加到组
    this.obstacles.add(obstacle);
    
    // 更新计数器
    this.obstacleCount++;
    this.activeObstacles++;

    // 当障碍物离开屏幕底部时销毁
    obstacle.setData('spawned', true);
  }

  update() {
    // 更新状态文本
    this.statusText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`
    ]);

    // 清理超出屏幕的障碍物
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > 620) { // 超出屏幕底部
        this.activeObstacles--;
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