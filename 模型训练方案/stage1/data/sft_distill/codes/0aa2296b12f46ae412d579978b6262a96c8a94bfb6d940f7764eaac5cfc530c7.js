class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const x = Phaser.Math.Between(20, 780);
    const obstacle = this.obstacles.create(x, -20, 'obstacle');
    
    // 设置向下速度 120
    obstacle.setVelocityY(120);

    // 更新计数器
    this.obstacleCount++;
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: x,
      y: -20,
      velocityY: 120,
      timestamp: Date.now()
    });

    // 输出日志用于验证
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: x, y: -20 },
      velocity: 120
    }));
  }

  update() {
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