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

// 状态信号变量
let obstacleCount = 0;
let obstaclesGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组来管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 限制最大数量
  });

  // 创建定时器，每3秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 3000, // 3秒 = 3000毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本显示障碍物数量（用于验证）
  this.obstacleText = this.add.text(16, 16, 'Obstacles: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 立即生成第一个障碍物（可选）
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 在顶部随机 x 位置生成障碍物
  const randomX = Phaser.Math.Between(40, 760); // 留出边界空间
  const obstacle = obstaclesGroup.get(randomX, -40);

  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度为 160
    obstacle.setVelocityY(160);
    
    // 更新计数
    obstacleCount++;
    
    // 更新显示文本
    if (this.obstacleText) {
      this.obstacleText.setText('Obstacles: ' + obstacleCount);
    }
  }
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstaclesGroup.children.entries.forEach((obstacle) => {
    if (obstacle.active && obstacle.y > 650) {
      // 回收到对象池
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
    }
  });
}

const game = new Phaser.Game(config);