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
    // 使用 Graphics 生成红色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 100
    });

    // 初始化 signals 对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      spawnEvents: []
    };

    // 创建定时器，每3秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    
    // 从顶部生成障碍物
    const obstacle = this.obstaclesGroup.get(randomX, -20);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.setVelocityY(360); // 设置下落速度
      
      // 更新计数
      this.obstacleCount++;
      this.activeObstacles = this.obstaclesGroup.countActive(true);
      
      // 记录到 signals
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.activeObstacles = this.activeObstacles;
      window.__signals__.spawnEvents.push({
        time: this.time.now,
        x: randomX,
        count: this.obstacleCount
      });

      // 控制台输出 JSON 日志
      console.log(JSON.stringify({
        event: 'obstacle_spawned',
        time: this.time.now,
        position: { x: randomX, y: -20 },
        velocity: { x: 0, y: 360 },
        totalCount: this.obstacleCount,
        activeCount: this.activeObstacles
      }));
    }
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstaclesGroup.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > this.scale.height + 50) {
        this.obstaclesGroup.killAndHide(obstacle);
        obstacle.setVelocity(0, 0);
        this.activeObstacles = this.obstaclesGroup.countActive(true);
        window.__signals__.activeObstacles = this.activeObstacles;
        
        console.log(JSON.stringify({
          event: 'obstacle_removed',
          time: this.time.now,
          activeCount: this.activeObstacles
        }));
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`,
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);