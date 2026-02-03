const config = {
  type: Phaser.AUTO,
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
  obstaclesActive: 0,
  obstaclesDestroyed: 0,
  lastSpawnTime: 0,
  lastSpawnX: 0
};

let obstacles;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstacles = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50
  });

  // 创建定时器，每 2 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2000, // 2 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);

  // 显示信息文本
  this.add.text(10, 10, '白色障碍物每 2 秒生成', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, '速度: 300 px/s', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 动态显示统计信息
  this.statsText = this.add.text(10, 60, '', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function spawnObstacle() {
  // 随机 x 位置（留出障碍物宽度的边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从顶部生成障碍物
  const obstacle = obstacles.get(randomX, -20);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度 300
    obstacle.setVelocityY(300);
    
    // 更新信号
    window.__signals__.obstaclesSpawned++;
    window.__signals__.lastSpawnTime = Date.now();
    window.__signals__.lastSpawnX = randomX;
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: window.__signals__.obstaclesSpawned,
      position: { x: randomX, y: -20 },
      velocity: 300,
      timestamp: window.__signals__.lastSpawnTime
    }));
  }
}

function update(time, delta) {
  // 更新活跃障碍物数量
  window.__signals__.obstaclesActive = obstacles.countActive(true);
  
  // 清理超出屏幕的障碍物
  obstacles.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 620) {
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
      
      window.__signals__.obstaclesDestroyed++;
      
      console.log(JSON.stringify({
        event: 'obstacle_destroyed',
        count: window.__signals__.obstaclesDestroyed,
        reason: 'out_of_bounds',
        timestamp: Date.now()
      }));
    }
  });
  
  // 更新统计文本
  if (this.statsText) {
    this.statsText.setText([
      `已生成: ${window.__signals__.obstaclesSpawned}`,
      `活跃中: ${window.__signals__.obstaclesActive}`,
      `已清理: ${window.__signals__.obstaclesDestroyed}`
    ]);
  }
}

new Phaser.Game(config);