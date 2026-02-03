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

// 状态信号变量
let obstacleCount = 0;
let obstacles;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建青色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建物理组来管理障碍物
  obstacles = this.physics.add.group();

  // 创建定时器事件，每1秒生成一个障碍物
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒 = 1000毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacles spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('statusText');
}

function spawnObstacle() {
  // 随机 x 坐标（确保障碍物完全在屏幕内）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 创建障碍物精灵，从顶部生成
  const obstacle = obstacles.create(randomX, -20, 'obstacleTexture');
  
  // 设置向下速度为 240
  obstacle.setVelocityY(240);
  
  // 增加计数器
  obstacleCount++;
  
  // 更新状态文本
  const statusText = this.children.getByName('statusText');
  if (statusText) {
    statusText.setText('Obstacles spawned: ' + obstacleCount);
  }
  
  console.log(`Obstacle #${obstacleCount} spawned at x: ${randomX}`);
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstacles.children.entries.forEach((obstacle) => {
    if (obstacle.y > 650) {
      obstacle.destroy();
    }
  });
}

// 启动游戏
new Phaser.Game(config);