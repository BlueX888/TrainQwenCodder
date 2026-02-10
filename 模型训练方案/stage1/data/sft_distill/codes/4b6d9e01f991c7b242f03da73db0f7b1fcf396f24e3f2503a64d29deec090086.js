// 完整的 Phaser3 代码
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
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  obstaclesSpawned: 0,
  activeObstacles: 0,
  spawnEvents: []
};

let obstaclesGroup;
let spawnTimer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建物理组用于管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacleTexture',
    maxSize: 50
  });

  // 创建定时器，每2秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2000,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 添加调试文本显示信息
  this.debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  console.log('[GAME_START]', JSON.stringify({
    timestamp: Date.now(),
    sceneWidth: config.width,
    sceneHeight: config.height,
    spawnInterval: 2000
  }));
}

function spawnObstacle() {
  // 在顶部随机 x 坐标生成障碍物
  const randomX = Phaser.Math.Between(20, config.width - 20);
  const obstacle = obstaclesGroup.get(randomX, -20);

  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    obstacle.body.setVelocityY(300);

    // 更新信号
    window.__signals__.obstaclesSpawned++;
    window.__signals__.activeObstacles = obstaclesGroup.countActive(true);
    window.__signals__.spawnEvents.push({
      timestamp: Date.now(),
      position: { x: randomX, y: -20 },
      velocity: 300
    });

    // 输出日志
    console.log('[OBSTACLE_SPAWNED]', JSON.stringify({
      id: window.__signals__.obstaclesSpawned,
      x: randomX,
      y: -20,
      velocity: 300,
      totalSpawned: window.__signals__.obstaclesSpawned,
      activeCount: window.__signals__.activeObstacles
    }));
  }
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstaclesGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > config.height + 50) {
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.body.setVelocity(0, 0);

      window.__signals__.activeObstacles = obstaclesGroup.countActive(true);

      console.log('[OBSTACLE_REMOVED]', JSON.stringify({
        y: obstacle.y,
        activeCount: window.__signals__.activeObstacles
      }));
    }
  });

  // 更新调试文本
  if (this.debugText) {
    this.debugText.setText([
      `Total Spawned: ${window.__signals__.obstaclesSpawned}`,
      `Active Obstacles: ${window.__signals__.activeObstacles}`,
      `Timer Progress: ${spawnTimer.getProgress().toFixed(2)}`
    ]);
  }
}

// 启动游戏
new Phaser.Game(config);