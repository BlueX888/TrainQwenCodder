// Phaser3 游戏：每 2.5 秒生成青色下落障碍物
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 记录生成的障碍物数量
    this.obstacles = null; // 障碍物组
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 添加文本显示障碍物数量
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const x = Phaser.Math.Between(20, 780); // 游戏宽度 800，留出边距
    const y = -20; // 从顶部上方开始

    // 创建物理精灵
    const obstacle = this.obstacles.create(x, y, 'obstacle');
    obstacle.setVelocityY(160); // 设置下落速度为 160

    // 更新计数
    this.obstacleCount++;
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    // 更新验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: x,
      y: y,
      velocityY: 160,
      timestamp: Date.now()
    });

    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      position: { x, y },
      velocity: 160,
      time: this.time.now
    }));
  }

  update() {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
        obstacle.destroy();
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);