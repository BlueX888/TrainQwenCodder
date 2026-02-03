class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 已生成的障碍物总数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture('obstacle', 30, 30);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 每 0.5 秒生成一个障碍物
    this.timerEvent = this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      lastSpawnTime: 0
    };

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now()
    }));
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(15, 785); // 留出边距（30/2 = 15）
    
    const obstacle = this.obstacles.create(randomX, -15, 'obstacle');
    obstacle.setVelocityY(80); // 设置向下速度为 80
    
    // 更新统计
    this.obstacleCount++;
    
    // 更新验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.activeObstacles = this.obstacles.getChildren().length;
    window.__signals__.lastSpawnTime = Date.now();

    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -15 },
      velocity: 80,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部 50 像素
        obstacle.destroy();
        
        // 更新活跃障碍物数量
        window.__signals__.activeObstacles = this.obstacles.getChildren().length;
        
        console.log(JSON.stringify({
          event: 'obstacle_destroyed',
          reason: 'out_of_bounds',
          activeCount: window.__signals__.activeObstacles,
          timestamp: Date.now()
        }));
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

const game = new Phaser.Game(config);