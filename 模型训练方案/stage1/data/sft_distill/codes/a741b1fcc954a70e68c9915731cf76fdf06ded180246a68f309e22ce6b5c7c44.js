// 完整的 Phaser3 代码 - 下落障碍物生成系统
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

// 全局状态变量（用于验证）
let obstacleCount = 0;
let obstacleGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置计数器
  obstacleCount = 0;

  // 使用 Graphics 创建灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组用于管理障碍物
  obstacleGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 限制最大数量，避免内存溢出
  });

  // 创建定时器，每1.5秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本显示当前障碍物数量（用于验证）
  this.obstacleText = this.add.text(16, 16, 'Obstacles: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 添加提示文本
  this.add.text(400, 300, 'Obstacles falling from top\nSpeed: 80 px/s\nSpawn: every 1.5s', {
    fontSize: '18px',
    fill: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

function spawnObstacle() {
  // 从顶部随机位置生成障碍物
  const randomX = Phaser.Math.Between(50, 750); // 随机X坐标（留边距）
  const obstacle = obstacleGroup.create(randomX, -20, 'obstacle');

  if (obstacle) {
    // 设置垂直速度为80（向下）
    obstacle.setVelocityY(80);

    // 增加计数器
    obstacleCount++;

    // 设置障碍物在超出屏幕底部时自动销毁
    obstacle.checkWorldBounds = true;
    obstacle.outOfBoundsKill = true;

    console.log(`Obstacle #${obstacleCount} spawned at x=${randomX}`);
  }
}

function update(time, delta) {
  // 更新显示文本
  if (this.obstacleText) {
    const activeObstacles = obstacleGroup.getChildren().filter(obj => obj.active).length;
    this.obstacleText.setText(`Obstacles Spawned: ${obstacleCount}\nActive: ${activeObstacles}`);
  }

  // 清理超出屏幕的障碍物
  obstacleGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 650) {
      obstacle.destroy();
    }
  });
}

// 启动游戏
const game = new Phaser.Game(config);