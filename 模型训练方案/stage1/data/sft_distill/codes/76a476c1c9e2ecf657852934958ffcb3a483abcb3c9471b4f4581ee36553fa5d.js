class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 创建青色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 添加文本显示生成数量
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 X 坐标（留出障碍物宽度的边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物精灵，从顶部生成
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置垂直速度为 160
    obstacle.setVelocityY(160);
    
    // 增加计数
    this.obstacleCount++;
    
    // 更新显示文本
    this.countText.setText('Obstacles: ' + this.obstacleCount);
    
    // 更新验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 160,
      timestamp: Date.now()
    });

    // 输出日志便于验证
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: 160,
      time: this.time.now
    }));
  }

  update() {
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);