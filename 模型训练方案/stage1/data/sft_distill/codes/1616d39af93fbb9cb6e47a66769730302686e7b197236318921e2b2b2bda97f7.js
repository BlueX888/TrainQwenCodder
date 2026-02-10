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
  obstaclesSpawned: 0,
  activeObstacles: 0,
  spawnEvents: []
};

let obstacles;
let spawnTimer;

function preload() {
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF69B4, 1); // 粉色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('pinkObstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建障碍物组
  obstacles = this.physics.add.group();

  // 创建定时器，每 4 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 4000, // 4 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 立即生成第一个障碍物（可选）
  spawnObstacle.call(this);

  console.log('Game started - obstacles will spawn every 4 seconds');
}

function spawnObstacle() {
  // 随机 x 位置（考虑障碍物宽度，避免超出边界）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 在顶部创建障碍物
  const obstacle = obstacles.create(randomX, -20, 'pinkObstacle');
  
  // 设置速度为 120（向下）
  obstacle.setVelocityY(120);
  
  // 更新信号
  window.__signals__.obstaclesSpawned++;
  window.__signals__.activeObstacles = obstacles.getChildren().length;
  window.__signals__.spawnEvents.push({
    timestamp: Date.now(),
    x: randomX,
    count: window.__signals__.obstaclesSpawned
  });

  console.log(JSON.stringify({
    event: 'obstacle_spawned',
    position: { x: randomX, y: -20 },
    velocity: 120,
    totalSpawned: window.__signals__.obstaclesSpawned,
    activeCount: window.__signals__.activeObstacles
  }));
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstacles.getChildren().forEach(obstacle => {
    if (obstacle.y > 620) {
      obstacle.destroy();
      window.__signals__.activeObstacles = obstacles.getChildren().length;
      
      console.log(JSON.stringify({
        event: 'obstacle_destroyed',
        reason: 'out_of_bounds',
        activeCount: window.__signals__.activeObstacles
      }));
    }
  });
}

// 启动游戏
new Phaser.Game(config);