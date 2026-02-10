// 初始化全局信号对象
window.__signals__ = {
  obstaclesSpawned: 0,
  activeObstacles: 0,
  lastSpawnTime: 0,
  obstaclesList: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = null;
    this.spawnTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 设置定时器：每2秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 2000, // 2秒
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
    // 随机 x 坐标（留出边距）
    const randomX = Phaser.Math.Between(50, this.scale.width - 50);
    
    // 在顶部创建障碍物
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 添加到物理组
    this.obstacles.add(obstacle);

    // 更新信号
    window.__signals__.obstaclesSpawned++;
    window.__signals__.activeObstacles = this.obstacles.getChildren().length;
    window.__signals__.lastSpawnTime = this.time.now;
    window.__signals__.obstaclesList.push({
      id: window.__signals__.obstaclesSpawned,
      x: randomX,
      y: -20,
      spawnTime: this.time.now
    });

    // 输出日志
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      id: window.__signals__.obstaclesSpawned,
      position: { x: randomX, y: -20 },
      velocity: 360,
      timestamp: this.time.now
    }));

    // 当障碍物离开屏幕底部时销毁
    obstacle.setData('spawned', true);
  }

  update(time, delta) {
    // 清理离开屏幕的障碍物
    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.y > this.scale.height + 50) {
        obstacle.destroy();
        window.__signals__.activeObstacles = this.obstacles.getChildren().length;
        
        console.log(JSON.stringify({
          event: 'obstacle_destroyed',
          reason: 'out_of_bounds',
          timestamp: time
        }));
      }
    });

    // 更新调试文本
    this.debugText.setText([
      `Obstacles Spawned: ${window.__signals__.obstaclesSpawned}`,
      `Active Obstacles: ${window.__signals__.activeObstacles}`,
      `Last Spawn: ${window.__signals__.lastSpawnTime}ms`,
      `Timer Progress: ${this.spawnTimer.getProgress().toFixed(2)}`
    ]);
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