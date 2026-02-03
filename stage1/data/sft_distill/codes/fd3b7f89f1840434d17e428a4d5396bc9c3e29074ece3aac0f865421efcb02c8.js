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
    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 使用 Graphics 生成红色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacleGroup = this.physics.add.group();

    // 创建定时器：每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒 = 3000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示生成数量
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（在屏幕宽度范围内，留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建物理精灵（从顶部生成，y = -20 使其从屏幕外进入）
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置下落速度为 360
    obstacle.setVelocityY(360);
    
    // 添加到组中
    this.obstacleGroup.add(obstacle);
    
    // 更新计数
    this.obstacleCount++;
    this.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 360,
      timestamp: Date.now()
    });

    // 更新验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles = this.obstacles;

    // 更新显示文本
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    // 输出日志便于验证
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      x: randomX,
      velocityY: 360,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacleGroup.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
      }
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用重力，直接设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);