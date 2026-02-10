class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 创建障碍物组
    this.obstacles = this.physics.add.group();

    // 每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();

    // 添加文本显示生成数量
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵（从顶部生成）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度 120
    obstacle.setVelocityY(120);
    
    // 更新计数
    this.obstacleCount++;
    
    // 更新信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 120,
      timestamp: Date.now()
    });

    // 输出日志（JSON 格式）
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: 120,
      time: this.time.now
    }));
  }

  update() {
    // 更新显示文本
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);