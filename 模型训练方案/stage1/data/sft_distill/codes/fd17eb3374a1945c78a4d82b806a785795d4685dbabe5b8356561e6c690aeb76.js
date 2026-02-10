// 完整的 Phaser3 代码
const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
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

// 全局信号对象，用于验证
window.__signals__ = {
  obstaclesCreated: 0,
  obstaclePositions: [],
  lastSpawnTime: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建青色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建障碍物组
  this.obstacles = this.physics.add.group();

  // 创建定时器，每 2 秒生成一个障碍物
  this.obstacleTimer = this.time.addEvent({
    delay: 2000, // 2秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);

  console.log('Game initialized. Obstacles will spawn every 2 seconds.');
}

function spawnObstacle() {
  // 随机 x 坐标（留出障碍物宽度的边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 在顶部生成障碍物
  const obstacle = this.physics.add.sprite(randomX, -20, 'obstacleTexture');
  
  // 设置下落速度为 360
  obstacle.setVelocityY(360);
  
  // 添加到障碍物组
  this.obstacles.add(obstacle);

  // 更新信号
  window.__signals__.obstaclesCreated++;
  window.__signals__.obstaclePositions.push({
    x: randomX,
    y: -20,
    time: this.time.now
  });
  window.__signals__.lastSpawnTime = this.time.now;

  // 输出日志
  console.log(JSON.stringify({
    event: 'obstacle_spawned',
    count: window.__signals__.obstaclesCreated,
    position: { x: randomX, y: -20 },
    velocity: 360,
    timestamp: this.time.now
  }));
}

function update(time, delta) {
  // 清理超出屏幕的障碍物
  this.obstacles.children.entries.forEach(obstacle => {
    if (obstacle.y > 650) { // 超出屏幕底部
      obstacle.destroy();
      console.log(JSON.stringify({
        event: 'obstacle_destroyed',
        reason: 'out_of_bounds',
        timestamp: time
      }));
    }
  });
}

// 启动游戏
new Phaser.Game(config);