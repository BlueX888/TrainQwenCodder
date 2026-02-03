class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.activeObstacles = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      logs: []
    };

    // 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture('obstacle', 30, 30);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50
    });

    // 每 0.5 秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  spawnObstacle() {
    // 随机 x 位置（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(15, this.scale.width - 15);
    
    // 创建障碍物
    const obstacle = this.obstaclesGroup.get(randomX, -30);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.setVelocityY(80);
      
      // 更新计数
      this.obstacleCount++;
      this.activeObstacles = this.obstaclesGroup.countActive(true);
      
      // 记录日志
      const log = {
        timestamp: Date.now(),
        action: 'spawn',
        obstacleId: this.obstacleCount,
        position: { x: randomX, y: -30 },
        velocity: 80
      };
      
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.activeObstacles = this.activeObstacles;
      window.__signals__.logs.push(log);
      
      console.log(JSON.stringify(log));
    }
  }

  update() {
    // 检查并移除超出屏幕的障碍物
    this.obstaclesGroup.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > this.scale.height + 50) {
        // 记录销毁日志
        const log = {
          timestamp: Date.now(),
          action: 'destroy',
          position: { x: obstacle.x, y: obstacle.y },
          reason: 'out_of_bounds'
        };
        
        console.log(JSON.stringify(log));
        window.__signals__.logs.push(log);
        
        // 销毁障碍物
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
        
        // 更新活跃数量
        this.activeObstacles = this.obstaclesGroup.countActive(true);
        window.__signals__.activeObstacles = this.activeObstacles;
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`,
      `Timer Progress: ${this.spawnTimer.getProgress().toFixed(2)}`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);