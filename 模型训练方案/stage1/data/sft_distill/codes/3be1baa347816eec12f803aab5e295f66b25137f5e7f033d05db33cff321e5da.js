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
    // 初始化 signals
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      lastSpawnTime: 0
    };

    // 创建青色障碍物纹理（32x32 方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('obstacleTexture', 32, 32);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 50 // 限制最大数量
    });

    // 设置定时器：每 2 秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 2000, // 2 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 随机 x 位置（留出边界）
    const randomX = Phaser.Math.Between(50, this.scale.width - 50);
    
    // 从顶部生成障碍物
    const obstacle = this.obstaclesGroup.get(randomX, -32);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置向下速度 360
      obstacle.setVelocityY(360);
      
      // 启用边界检测
      obstacle.setCollideWorldBounds(false);
      
      // 更新计数
      this.obstacleCount++;
      this.activeObstacles++;
      
      // 更新 signals
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.activeObstacles = this.activeObstacles;
      window.__signals__.lastSpawnTime = this.time.now;
      
      // 输出日志
      console.log(JSON.stringify({
        type: 'obstacle_spawned',
        x: randomX,
        totalCount: this.obstacleCount,
        activeCount: this.activeObstacles,
        timestamp: this.time.now
      }));
    }
  }

  update(time, delta) {
    // 清理超出屏幕的障碍物
    this.obstaclesGroup.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > this.scale.height + 50) {
        // 障碍物超出屏幕底部
        obstacle.setActive(false);
        obstacle.setVisible(false);
        this.activeObstacles--;
        
        // 更新 signals
        window.__signals__.activeObstacles = this.activeObstacles;
        
        console.log(JSON.stringify({
          type: 'obstacle_removed',
          activeCount: this.activeObstacles,
          timestamp: time
        }));
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active: ${this.activeObstacles}`,
      `Time: ${Math.floor(time / 1000)}s`
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

const game = new Phaser.Game(config);