class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
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

    // 初始化障碍物组
    this.obstacles = this.physics.add.group();

    // 设置定时器，每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 初始化可验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（在游戏宽度范围内，留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，从顶部生成
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置垂直速度为80（向下）
    obstacle.setVelocityY(80);
    
    // 添加到障碍物组
    this.obstacles.add(obstacle);
    
    // 更新计数
    this.obstacleCount++;
    
    // 更新可验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 80,
      timestamp: Date.now()
    });

    // 输出日志
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      x: randomX,
      velocityY: 80
    }));
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Obstacles Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.obstacles.children.size}`
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