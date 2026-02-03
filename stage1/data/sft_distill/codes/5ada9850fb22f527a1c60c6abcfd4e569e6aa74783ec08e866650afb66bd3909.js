class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      lastSpawnTime: 0,
      obstacles: []
    };

    // 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('blueObstacle', 32, 32);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器：每 0.5 秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 500, // 0.5 秒 = 500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    console.log('Game started - obstacles will spawn every 0.5 seconds');
  }

  spawnObstacle() {
    // 随机 x 坐标（在游戏宽度范围内）
    const randomX = Phaser.Math.Between(16, this.scale.width - 16);
    
    // 在顶部生成障碍物
    const obstacle = this.obstacles.create(randomX, -16, 'blueObstacle');
    
    if (obstacle) {
      // 设置向下速度为 80
      obstacle.setVelocityY(80);
      
      // 更新计数
      this.obstacleCount++;
      
      // 更新信号
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.activeObstacles = this.obstacles.countActive(true);
      window.__signals__.lastSpawnTime = this.time.now;
      window.__signals__.obstacles.push({
        id: this.obstacleCount,
        x: randomX,
        y: -16,
        spawnTime: this.time.now
      });

      console.log(JSON.stringify({
        event: 'obstacle_spawned',
        id: this.obstacleCount,
        x: randomX,
        time: this.time.now
      }));
    }
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > this.scale.height + 50) {
        obstacle.destroy();
      }
    });

    // 更新活跃障碍物数量
    window.__signals__.activeObstacles = this.obstacles.countActive(true);

    // 更新调试信息
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.obstacles.countActive(true)}`,
      `Timer Progress: ${this.spawnTimer.getProgress().toFixed(2)}`
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);