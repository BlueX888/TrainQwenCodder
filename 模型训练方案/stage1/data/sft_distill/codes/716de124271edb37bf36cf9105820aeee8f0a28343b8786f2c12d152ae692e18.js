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

// 状态变量
let obstaclesSpawned = 0;
let obstaclesGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstaclesGroup = this.physics.add.group();

  // 添加定时器：每2秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2000, // 2秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacles Spawned: 0', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('statusText');

  console.log('Game started - obstacles will spawn every 2 seconds');
}

function spawnObstacle() {
  // 随机生成 x 坐标（在屏幕宽度范围内，考虑障碍物宽度）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 创建障碍物精灵（从顶部生成，y = -20 在屏幕外）
  const obstacle = obstaclesGroup.create(randomX, -20, 'obstacle');
  
  // 设置下落速度为 80
  obstacle.setVelocityY(80);
  
  // 增加计数器
  obstaclesSpawned++;
  
  console.log(`Obstacle #${obstaclesSpawned} spawned at x=${randomX}`);
}

function update(time, delta) {
  // 更新状态文本
  const statusText = this.children.getByName('statusText');
  if (statusText) {
    statusText.setText(`Obstacles Spawned: ${obstaclesSpawned}`);
  }

  // 清理离开屏幕的障碍物（优化性能）
  obstaclesGroup.children.entries.forEach(obstacle => {
    if (obstacle.y > 650) {
      obstacle.destroy();
    }
  });
}

// 启动游戏
new Phaser.Game(config);