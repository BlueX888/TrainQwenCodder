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

// 可验证的状态变量
let obstacleCount = 0;
let obstacleGroup;
let spawnTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();

  // 创建物理组管理障碍物
  obstacleGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 限制最大数量避免内存问题
  });

  // 创建定时器，每 2.5 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2500, // 2.5 秒 = 2500 毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 添加显示文本用于验证状态
  this.obstacleText = this.add.text(10, 10, 'Obstacles: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  console.log('游戏开始：障碍物将每 2.5 秒生成一次');
}

function spawnObstacle() {
  // 随机 X 坐标（考虑障碍物宽度，避免超出边界）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从对象池获取或创建新障碍物
  const obstacle = obstacleGroup.get(randomX, -20);
  
  if (obstacle) {
    // 激活障碍物
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度为 80
    obstacle.setVelocityY(80);
    
    // 增加计数器
    obstacleCount++;
    
    console.log(`生成障碍物 #${obstacleCount} at X: ${randomX}`);
  }
}

function update(time, delta) {
  // 更新显示文本
  if (this.obstacleText) {
    this.obstacleText.setText(`Obstacles: ${obstacleCount}`);
  }

  // 清理超出屏幕底部的障碍物
  obstacleGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 620) {
      // 回收到对象池
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.setVelocity(0, 0);
      console.log(`障碍物已离开屏幕，回收到对象池`);
    }
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);