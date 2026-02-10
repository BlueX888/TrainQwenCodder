// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('pinkObstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacleGroup = this.physics.add.group();

    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: [],
      lastSpawnTime: 0,
      gameWidth: this.scale.width,
      gameHeight: this.scale.height
    };

    // 每4秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 4000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // 随机X坐标（留出边距，避免障碍物部分超出屏幕）
    const randomX = Phaser.Math.Between(20, gameWidth - 20);
    
    // 在顶部生成障碍物
    const obstacle = this.obstacleGroup.create(randomX, -20, 'pinkObstacle');
    obstacle.setVelocityY(120); // 设置向下速度为120
    
    // 记录障碍物信息
    this.obstacleCount++;
    const obstacleInfo = {
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 120,
      spawnTime: this.time.now
    };
    this.obstacles.push(obstacleInfo);

    // 更新信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles = [...this.obstacles];
    window.__signals__.lastSpawnTime = this.time.now;

    // 输出日志JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      data: obstacleInfo,
      totalCount: this.obstacleCount
    }));
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstacleGroup.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        obstacle.destroy();
      }
    });

    // 更新显示信息
    const activeObstacles = this.obstacleGroup.children.entries.length;
    this.infoText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${activeObstacles}`,
      `Next Spawn In: ${Math.ceil((4000 - this.spawnTimer.elapsed) / 1000)}s`
    ]);

    // 更新信号中的活跃障碍物数量
    window.__signals__.activeObstacles = activeObstacles;
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);