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

// 状态变量
let obstacleCount = 0;
let obstacleGroup;
let spawnTimer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 生成灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstacleGroup = this.physics.add.group({
    defaultKey: 'obstacleTexture',
    maxSize: 50 // 限制最大障碍物数量
  });

  // 添加定时器：每3秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 3000, // 3秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacle Spawner', {
    fontSize: '20px',
    color: '#ffffff'
  });

  this.statusText = this.add.text(10, 40, `Spawned: ${obstacleCount}`, {
    fontSize: '16px',
    color: '#00ff00'
  });
}

function spawnObstacle() {
  // 随机 x 坐标（留出边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从组中获取或创建障碍物
  const obstacle = obstacleGroup.get(randomX, -20);
  
  if (obstacle) {
    // 激活物理体
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置下落速度为 160
    obstacle.body.setVelocityY(160);
    
    // 增加计数
    obstacleCount++;
    
    console.log(`Obstacle #${obstacleCount} spawned at x=${randomX}`);
  }
}

function update(time, delta) {
  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText(`Spawned: ${obstacleCount}`);
  }

  // 清理超出屏幕的障碍物
  obstacleGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 650) {
      // 回收到对象池
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.body.setVelocity(0, 0);
    }
  });
}

// 启动游戏
new Phaser.Game(config);