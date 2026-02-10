class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
    this.activeObstacles = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('pinkObstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      spawnEvents: []
    };

    // 每4秒生成一个障碍物
    this.time.addEvent({
      delay: 4000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 立即生成第一个障碍物（可选）
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成
    const randomX = Phaser.Math.Between(50, 750);
    const obstacle = this.obstacles.create(randomX, -20, 'pinkObstacle');
    
    // 设置向下速度为 120
    obstacle.setVelocityY(120);
    
    // 增加计数
    this.obstacleCount++;
    this.activeObstacles++;

    // 记录到信号对象
    window.__signals__.obstacleCount = this.obstacleCount;
    window.__signals__.activeObstacles = this.activeObstacles;
    window.__signals__.spawnEvents.push({
      timestamp: Date.now(),
      position: { x: randomX, y: -20 },
      velocity: 120
    });

    // 控制台输出 JSON 日志
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: this.obstacleCount,
      active: this.activeObstacles,
      x: randomX,
      velocity: 120
    }));
  }

  update() {
    // 检查并移除超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) {
        this.activeObstacles--;
        window.__signals__.activeObstacles = this.activeObstacles;
        
        console.log(JSON.stringify({
          event: 'obstacle_removed',
          active: this.activeObstacles,
          y: obstacle.y
        }));
        
        obstacle.destroy();
      }
    });

    // 更新调试信息
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);