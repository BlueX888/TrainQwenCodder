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
  scene: { preload, create, update }
};

let obstacleGroup;
let obstacleCount = 0; // 状态信号：记录生成的障碍物数量
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacleTexture', 40, 40);
  graphics.destroy();

  // 创建物理组来管理障碍物
  obstacleGroup = this.physics.add.group();

  // 添加定时器事件，每1秒生成一个障碍物
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒 = 1000毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 显示状态信息（用于验证）
  this.add.text(10, 10, 'Obstacle Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('countText');
}

function spawnObstacle() {
  // 随机生成 x 坐标（在屏幕宽度范围内，留出障碍物宽度边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 创建障碍物精灵，初始位置在顶部上方
  const obstacle = obstacleGroup.create(randomX, -20, 'obstacleTexture');
  
  // 设置下落速度为 240
  obstacle.setVelocityY(240);
  
  // 更新计数器
  obstacleCount++;
  
  // 更新显示文本
  const countText = this.scene.scenes[0].children.getByName('countText');
  if (countText) {
    countText.setText('Obstacle Count: ' + obstacleCount);
  }
  
  // 当障碍物离开屏幕底部时销毁，避免内存泄漏
  obstacle.setData('created', true);
}

function update(time, delta) {
  // 清理离开屏幕的障碍物
  obstacleGroup.children.entries.forEach((obstacle) => {
    if (obstacle.y > 620) { // 超出屏幕底部
      obstacle.destroy();
    }
  });
}

new Phaser.Game(config);