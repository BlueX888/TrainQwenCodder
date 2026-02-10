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
  // 使用 Graphics 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50
  });

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
    fill: '#ffffff'
  });

  this.statusText = this.add.text(10, 40, 'Spawned: 0', {
    fontSize: '18px',
    fill: '#00ffff'
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 随机 x 坐标（留出边距避免超出屏幕）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从顶部生成障碍物
  const obstacle = obstaclesGroup.get(randomX, -20);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度 200
    obstacle.setVelocityY(200);
    
    // 增加计数器
    obstacleCount++;
    
    // 更新状态显示
    if (this.statusText) {
      this.statusText.setText('Spawned: ' + obstacleCount);
    }
    
    console.log(`Obstacle #${obstacleCount} spawned at x: ${randomX}`);
  }
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstaclesGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 620) {
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
      console.log('Obstacle removed (out of bounds)');
    }
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);