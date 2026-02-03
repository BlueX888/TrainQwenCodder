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
  },
  backgroundColor: '#2d2d2d'
};

// 全局状态变量（可验证的信号）
let obstacleCount = 0;
let activeObstacles = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建白色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  this.obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50
  });

  // 添加定时器，每3秒生成一个障碍物
  this.spawnTimer = this.time.addEvent({
    delay: 3000,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加边界检测，移除超出屏幕的障碍物
  this.physics.world.on('worldbounds', (body) => {
    if (body.gameObject && body.gameObject.texture.key === 'obstacle') {
      body.gameObject.destroy();
      activeObstacles--;
    }
  });
}

function spawnObstacle() {
  // 随机 x 坐标（确保障碍物完全在屏幕内）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从对象池获取或创建新的障碍物
  const obstacle = this.obstaclesGroup.get(randomX, -20);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    obstacle.body.setVelocityY(360);
    obstacle.body.onWorldBounds = true;
    
    // 更新计数器
    obstacleCount++;
    activeObstacles++;
    
    console.log(`障碍物生成 #${obstacleCount} at x=${randomX}, 当前活跃: ${activeObstacles}`);
  }
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  this.obstaclesGroup.children.entries.forEach((obstacle) => {
    if (obstacle.active && obstacle.y > 620) {
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.body.setVelocity(0, 0);
      activeObstacles--;
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `总生成障碍物: ${obstacleCount}`,
    `当前活跃障碍物: ${activeObstacles}`,
    `定时器进度: ${Math.floor(this.spawnTimer.getProgress() * 100)}%`,
    `下次生成倒计时: ${Math.ceil(this.spawnTimer.getRemaining() / 1000)}s`
  ]);
}

new Phaser.Game(config);