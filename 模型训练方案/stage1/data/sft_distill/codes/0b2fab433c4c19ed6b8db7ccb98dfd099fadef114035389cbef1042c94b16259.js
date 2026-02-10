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

// 可验证的状态信号
let obstacleCount = 0;
let obstaclesGroup;
let spawnTimer;

function preload() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组用于管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 限制最大数量，避免内存溢出
  });

  // 创建定时器，每 1000ms 生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 1000,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息（用于验证）
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 添加提示文本
  this.add.text(400, 300, '白色障碍物每秒从顶部生成\n速度: 160 px/s', {
    fontSize: '24px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

function spawnObstacle() {
  // 随机 x 坐标（留出边距，避免障碍物被裁切）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从物理组获取或创建障碍物
  const obstacle = obstaclesGroup.get(randomX, -50);
  
  if (obstacle) {
    // 激活并设置物理属性
    obstacle.setActive(true);
    obstacle.setVisible(true);
    obstacle.setVelocityY(160); // 设置下落速度
    
    // 增加计数器
    obstacleCount++;
  }
}

function update() {
  // 更新状态文本
  if (this.statusText) {
    this.statusText.setText(
      `生成障碍物数量: ${obstacleCount}\n` +
      `活跃障碍物: ${obstaclesGroup.countActive(true)}`
    );
  }

  // 清理超出屏幕的障碍物
  obstaclesGroup.children.entries.forEach((obstacle) => {
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