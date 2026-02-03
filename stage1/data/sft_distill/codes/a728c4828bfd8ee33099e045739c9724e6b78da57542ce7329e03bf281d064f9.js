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
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacleGroup = this.physics.add.group();

    // 创建定时器，每3秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 3000,           // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 初始化 signals 用于验证
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: [],
      lastSpawnTime: 0
    };

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateDebugText();
  }

  spawnObstacle() {
    // 在顶部随机 x 坐标生成障碍物
    const randomX = Phaser.Math.Between(20, 780);
    const obstacle = this.obstacleGroup.create(randomX, -20, 'obstacle');
    
    // 设置物理属性
    obstacle.setVelocityY(240); // 下落速度 240
    obstacle.body.setAllowGravity(false); // 不受重力影响，保持匀速下落
    
    // 更新计数
    this.obstacleCount++;
    this.obstacles.push({
      id: this.obstacleCount,
      spawnX: randomX,
      spawnTime: this.time.now
    });

    // 更新 signals
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles = [...this.obstacles];
    window.__signals__.lastSpawnTime = this.time.now;

    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: 240,
      timestamp: this.time.now
    }));

    this.updateDebugText();
  }

  updateDebugText() {
    this.debugText.setText([
      `Obstacles Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.obstacleGroup.getChildren().length}`,
      `Next Spawn: ${((this.obstacleTimer.getRemaining() / 1000).toFixed(1))}s`
    ]);
  }

  update(time, delta) {
    // 更新调试文本
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateDebugText();
    }

    // 清理超出屏幕的障碍物
    this.obstacleGroup.getChildren().forEach(obstacle => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
        console.log(JSON.stringify({
          event: 'obstacle_destroyed',
          reason: 'out_of_bounds',
          timestamp: time
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);