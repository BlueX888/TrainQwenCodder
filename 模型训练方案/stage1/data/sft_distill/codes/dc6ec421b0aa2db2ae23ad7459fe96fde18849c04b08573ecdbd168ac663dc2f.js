class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建红色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacleGroup = this.physics.add.group();

    // 每 3 秒生成一个障碍物
    this.timerEvent = this.time.addEvent({
      delay: 3000,           // 3 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 初始化验证信号
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: [],
      timerActive: true,
      timerDelay: 3000
    };

    console.log(JSON.stringify({
      type: 'init',
      message: 'Obstacle spawner initialized',
      timerDelay: 3000,
      targetSpeed: 360
    }));
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(40, this.scale.width - 40);
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 添加到组
    this.obstacleGroup.add(obstacle);
    this.obstacles.push(obstacle);
    this.obstacleCount++;

    // 更新验证信号
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.obstacles.push({
      id: this.obstacleCount,
      x: randomX,
      y: -20,
      velocityY: 360,
      spawnTime: this.time.now
    });

    // 输出日志用于验证
    console.log(JSON.stringify({
      type: 'spawn',
      obstacleId: this.obstacleCount,
      position: { x: randomX, y: -20 },
      velocity: { x: 0, y: 360 },
      totalCount: this.obstacleCount,
      timestamp: this.time.now
    }));
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacleGroup.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
        console.log(JSON.stringify({
          type: 'cleanup',
          position: { x: obstacle.x, y: obstacle.y },
          timestamp: time
        }));
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
      gravity: { y: 0 },  // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);