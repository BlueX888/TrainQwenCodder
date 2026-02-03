class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacleGroup = this.physics.add.group();

    // 每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      obstacles: []
    };

    // 添加文本显示（用于可视化验证）
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建物理精灵
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度
    obstacle.setVelocityY(80);
    
    // 添加到组
    this.obstacleGroup.add(obstacle);
    
    // 更新计数
    this.obstacleCount++;
    
    // 记录障碍物信息
    const obstacleData = {
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 80,
      spawnTime: this.time.now
    };
    
    this.obstacles.push(obstacleData);
    
    // 更新信号
    this.updateSignals();
    
    // 控制台输出（用于验证）
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: 80,
      timestamp: this.time.now
    }));
  }

  update() {
    // 移除超出屏幕底部的障碍物
    this.obstacleGroup.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });

    // 更新信号
    this.updateSignals();
    
    // 更新调试文本
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.obstacleGroup.getLength()}`,
      `Time: ${Math.floor(this.time.now / 1000)}s`
    ]);
  }

  updateSignals() {
    const activeObstacles = this.obstacleGroup.children.entries.map((obs, index) => ({
      index: index,
      x: Math.round(obs.x),
      y: Math.round(obs.y),
      velocityY: obs.body.velocity.y
    }));

    window.__signals__ = {
      obstacleCount: this.obstacleCount,
      activeObstacles: this.obstacleGroup.getLength(),
      obstacles: activeObstacles,
      lastUpdate: this.time.now
    };
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