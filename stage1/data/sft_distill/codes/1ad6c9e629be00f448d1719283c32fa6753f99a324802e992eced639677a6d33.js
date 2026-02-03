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

function preload() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组来管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacleTexture',
    maxSize: 50
  });

  // 创建定时器，每3秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 3000,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacles Spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('statusText');

  // 立即生成第一个障碍物
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从对象池获取或创建新的障碍物
  const obstacle = obstaclesGroup.get(randomX, -50, 'obstacleTexture');
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 增加计数
    obstacleCount++;
    
    // 更新状态文本
    const statusText = this.children.getByName('statusText');
    if (statusText) {
      statusText.setText('Obstacles Spawned: ' + obstacleCount);
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

// 启动游戏
new Phaser.Game(config);