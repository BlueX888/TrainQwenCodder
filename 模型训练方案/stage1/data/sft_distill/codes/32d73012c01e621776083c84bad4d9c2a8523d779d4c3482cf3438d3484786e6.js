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
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('obstacle', 32, 32);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      spawnEvents: []
    };

    // 添加文本显示（可选，用于调试）
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机X坐标（在屏幕宽度范围内，留出边距）
    const randomX = Phaser.Math.Between(32, 768);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -32, 'obstacle');
    
    // 设置向下速度为80
    obstacle.setVelocityY(80);
    
    // 更新计数
    this.obstacleCount++;
    this.activeObstacles = this.obstacles.countActive(true);
    
    // 记录生成事件到信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.activeObstacles = this.activeObstacles;
    window.__signals__.spawnEvents.push({
      time: this.time.now,
      x: randomX,
      count: this.obstacleCount
    });

    // 输出日志JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      x: randomX,
      totalSpawned: this.obstacleCount,
      active: this.activeObstacles,
      timestamp: this.time.now
    }));
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 632) { // 屏幕高度600 + 障碍物半径32
        obstacle.destroy();
        this.activeObstacles = this.obstacles.countActive(true);
        window.__signals__.activeObstacles = this.activeObstacles;
        
        console.log(JSON.stringify({
          event: 'obstacle_removed',
          active: this.activeObstacles,
          timestamp: this.time.now
        }));
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`,
      `Time: ${Math.floor(this.time.now / 1000)}s`
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