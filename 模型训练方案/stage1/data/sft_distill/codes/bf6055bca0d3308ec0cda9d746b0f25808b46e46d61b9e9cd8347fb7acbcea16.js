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

// 状态信号：记录生成的障碍物数量
let obstacleCount = 0;
let obstaclesGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建物理组来管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacleTexture',
    maxSize: 50 // 最多同时存在 50 个障碍物
  });

  // 创建定时器，每 2.5 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2500, // 2.5 秒 = 2500 毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 显示状态信息
  this.add.text(10, 10, 'Obstacles Spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('countText');

  // 添加说明文字
  this.add.text(10, 40, 'Gray obstacles spawn every 2.5s', {
    fontSize: '16px',
    fill: '#cccccc'
  });
}

function spawnObstacle() {
  // 随机生成 x 坐标（留出边距，避免障碍物被切掉）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从对象池获取或创建新的障碍物
  const obstacle = obstaclesGroup.get(randomX, -20);
  
  if (obstacle) {
    // 激活物理体
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下的速度为 80
    obstacle.setVelocityY(80);
    
    // 增加计数器
    obstacleCount++;
    
    // 更新显示文本
    const countText = this.scene.scenes[0].children.getByName('countText');
    if (countText) {
      countText.setText('Obstacles Spawned: ' + obstacleCount);
    }
    
    console.log(`Obstacle #${obstacleCount} spawned at x: ${randomX}`);
  }
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstaclesGroup.children.entries.forEach((obstacle) => {
    if (obstacle.active && obstacle.y > 620) {
      // 回收到对象池
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
      console.log('Obstacle removed (off screen)');
    }
  });
}

// 启动游戏
const game = new Phaser.Game(config);