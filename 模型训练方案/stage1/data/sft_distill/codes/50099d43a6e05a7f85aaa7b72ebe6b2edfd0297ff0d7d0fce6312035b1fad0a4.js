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

// 状态信号：生成的障碍物总数
let obstacleCount = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('pinkObstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  this.obstacles = this.physics.add.group();

  // 添加定时器，每1秒生成一个障碍物
  this.time.addEvent({
    delay: 1000, // 1秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息
  this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 初始化计数器
  obstacleCount = 0;
}

function spawnObstacle() {
  // 随机生成 x 坐标（在屏幕宽度范围内，留出边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 创建障碍物精灵，位置在顶部
  const obstacle = this.obstacles.create(randomX, -20, 'pinkObstacle');
  
  // 设置向下速度为 360
  obstacle.setVelocityY(360);
  
  // 增加计数器
  obstacleCount++;
  
  // 更新状态显示
  this.statusText.setText('Obstacles: ' + obstacleCount);
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  this.obstacles.children.entries.forEach((obstacle) => {
    if (obstacle.y > 620) {
      obstacle.destroy();
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);