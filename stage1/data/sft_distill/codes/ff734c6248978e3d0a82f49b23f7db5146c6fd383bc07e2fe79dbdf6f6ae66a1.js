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
let obstacleCount = 0;
let obstacleTimer = null;
let obstacles = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置状态变量
  obstacleCount = 0;
  
  // 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
  
  // 创建障碍物组
  obstacles = this.physics.add.group();
  
  // 创建定时器，每 1.5 秒生成一个障碍物
  obstacleTimer = this.time.addEvent({
    delay: 1500, // 1.5 秒 = 1500 毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });
  
  // 显示状态信息
  this.add.text(10, 10, 'Obstacle Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('countText');
}

function spawnObstacle() {
  // 随机 x 坐标（确保障碍物完全在屏幕内）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 在顶部生成障碍物
  const obstacle = obstacles.create(randomX, -20, 'obstacle');
  
  // 设置向下的速度
  obstacle.body.setVelocityY(80);
  
  // 增加计数
  obstacleCount++;
  
  // 更新显示
  const countText = this.scene.scene.children.getByName('countText');
  if (countText) {
    countText.setText('Obstacle Count: ' + obstacleCount);
  }
}

function update(time, delta) {
  // 清理超出屏幕的障碍物
  obstacles.children.entries.forEach((obstacle) => {
    if (obstacle.y > 650) {
      obstacle.destroy();
    }
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);