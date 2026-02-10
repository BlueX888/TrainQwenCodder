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

// 初始化验证信号
window.__signals__ = {
  obstaclesCreated: 0,
  obstaclePositions: [],
  lastSpawnTime: 0
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建障碍物组
  this.obstacles = this.physics.add.group();

  // 创建定时器，每 2 秒生成一个障碍物
  this.obstacleTimer = this.time.addEvent({
    delay: 2000, // 2 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);

  // 添加文本显示信息（用于调试）
  this.debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function spawnObstacle() {
  // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 在顶部生成障碍物
  const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
  
  // 设置向下速度 360
  obstacle.body.setVelocityY(360);
  
  // 添加到障碍物组
  this.obstacles.add(obstacle);
  
  // 记录到验证信号
  window.__signals__.obstaclesCreated++;
  window.__signals__.obstaclePositions.push({
    x: randomX,
    y: -20,
    time: this.time.now
  });
  window.__signals__.lastSpawnTime = this.time.now;
  
  // 输出日志 JSON
  console.log(JSON.stringify({
    event: 'obstacle_spawned',
    count: window.__signals__.obstaclesCreated,
    position: { x: randomX, y: -20 },
    velocity: 360,
    timestamp: this.time.now
  }));
  
  // 当障碍物移出屏幕底部时销毁
  obstacle.setData('checkBounds', true);
}

function update(time, delta) {
  // 更新调试文本
  if (this.debugText) {
    this.debugText.setText([
      `Obstacles Created: ${window.__signals__.obstaclesCreated}`,
      `Active Obstacles: ${this.obstacles.getChildren().length}`,
      `Last Spawn: ${window.__signals__.lastSpawnTime}ms`
    ]);
  }
  
  // 检查并销毁超出屏幕的障碍物
  this.obstacles.getChildren().forEach(obstacle => {
    if (obstacle.y > 620) { // 超出屏幕底部
      obstacle.destroy();
      console.log(JSON.stringify({
        event: 'obstacle_destroyed',
        reason: 'out_of_bounds',
        timestamp: time
      }));
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);