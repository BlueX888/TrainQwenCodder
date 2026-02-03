class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: [],
      lastSpawnTime: 0
    };

    // 使用 Graphics 生成橙色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建障碍物组
    this.obstacles = this.physics.add.group();

    // 创建定时器，每3秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示障碍物数量
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 立即生成第一个障碍物（可选，根据需求）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距，避免障碍物超出屏幕）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 240
    obstacle.setVelocityY(240);
    
    // 增加计数
    this.obstacleCount++;
    
    // 更新信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocity: 240,
      spawnTime: this.time.now
    });
    window.__signals__.lastSpawnTime = this.time.now;

    // 更新显示文本
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    // 输出日志（JSON 格式）
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: 240,
      timestamp: this.time.now
    }));
  }

  update(time, delta) {
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
      gravity: { y: 0 }, // 无重力，使用速度控制下落
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);