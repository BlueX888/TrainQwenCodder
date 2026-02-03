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

// 状态变量
let obstacleCount = 0;
let obstaclesGroup;
let spawnTimer;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建黄色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 40, 40); // 40x40 像素的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstaclesGroup = this.physics.add.group({
    velocityY: 240, // 设置默认下落速度
    allowGravity: false
  });

  // 创建状态显示文本
  statusText = this.add.text(10, 10, 'Obstacles spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);

  // 设置定时器，每 4 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 4000, // 4 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 在顶部随机 x 坐标生成障碍物
  const randomX = Phaser.Math.Between(20, 780); // 避免贴边
  
  // 创建障碍物精灵
  const obstacle = obstaclesGroup.create(randomX, -20, 'obstacle');
  obstacle.setVelocityY(240); // 设置下落速度
  
  // 更新计数器
  obstacleCount++;
  statusText.setText(`Obstacles spawned: ${obstacleCount}`);
  
  console.log(`Obstacle #${obstacleCount} spawned at x: ${randomX}`);
}

function update(time, delta) {
  // 清理离开屏幕的障碍物
  obstaclesGroup.children.entries.forEach((obstacle) => {
    if (obstacle.y > 650) { // 超出屏幕底部
      obstacle.destroy();
    }
  });
}

// 启动游戏
new Phaser.Game(config);