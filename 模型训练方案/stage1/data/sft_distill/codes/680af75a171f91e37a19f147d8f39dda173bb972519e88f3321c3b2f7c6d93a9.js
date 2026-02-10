class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.activeObstacles = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 每 2 秒生成一个障碍物
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 初始化 signals
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      lastSpawnTime: 0,
      events: []
    };

    console.log(JSON.stringify({
      type: 'init',
      message: 'Obstacle spawner initialized',
      timestamp: Date.now()
    }));
  }

  spawnObstacle() {
    // 随机 X 坐标（障碍物宽度 40，确保完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物（从顶部稍微上方开始，Y = -20）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度 300
    obstacle.setVelocityY(300);
    
    // 更新计数
    this.obstacleCount++;
    this.activeObstacles++;

    // 更新 signals
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.activeObstacles = this.activeObstacles;
    window.__signals__.lastSpawnTime = Date.now();
    window.__signals__.events.push({
      type: 'spawn',
      x: randomX,
      count: this.obstacleCount,
      timestamp: Date.now()
    });

    // 输出日志
    console.log(JSON.stringify({
      type: 'obstacle_spawned',
      x: randomX,
      y: -20,
      velocityY: 300,
      totalSpawned: this.obstacleCount,
      activeCount: this.activeObstacles,
      timestamp: Date.now()
    }));
  }

  update() {
    // 检查并销毁离开屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 620) {
        this.activeObstacles--;
        
        // 更新 signals
        window.__signals__.activeObstacles = this.activeObstacles;
        window.__signals__.events.push({
          type: 'destroy',
          y: obstacle.y,
          activeCount: this.activeObstacles,
          timestamp: Date.now()
        });

        // 输出日志
        console.log(JSON.stringify({
          type: 'obstacle_destroyed',
          y: obstacle.y,
          activeCount: this.activeObstacles,
          timestamp: Date.now()
        }));

        obstacle.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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