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
  backgroundColor: '#1a1a2e'
};

// 验证状态变量
let obstacleCount = 0;
let obstaclesGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建紫色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50
  });

  // 重置计数器
  obstacleCount = 0;

  // 添加定时器，每 2.5 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2500, // 2.5 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacle Spawner', {
    fontSize: '24px',
    color: '#ffffff'
  });

  this.statusText = this.add.text(10, 40, '', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnObstacle() {
  // 随机生成 x 坐标（考虑障碍物宽度，避免超出边界）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从对象池获取或创建新障碍物
  const obstacle = obstaclesGroup.get(randomX, -40);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置垂直速度为 200
    obstacle.setVelocityY(200);
    
    // 增加计数器
    obstacleCount++;
    
    console.log(`Obstacle #${obstacleCount} spawned at x: ${randomX}`);
  }
}

function update(time, delta) {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText(
      `Obstacles Spawned: ${obstacleCount}\n` +
      `Active Obstacles: ${obstaclesGroup.countActive(true)}`
    );
  }

  // 清理超出屏幕的障碍物
  obstaclesGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 650) {
      // 回收到对象池
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
    }
  });
}

// 启动游戏
new Phaser.Game(config);