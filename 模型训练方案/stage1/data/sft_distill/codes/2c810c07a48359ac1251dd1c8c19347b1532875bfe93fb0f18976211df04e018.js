// 完整的 Phaser3 代码
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

// 全局信号对象，用于验证
window.__signals__ = {
  obstaclesSpawned: 0,
  spawnEvents: [],
  activeObstacles: 0
};

let obstaclesGroup;
let spawnTimer;

function preload() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组来管理障碍物
  obstaclesGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 限制最大数量
  });

  // 添加定时器，每 2.5 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2500, // 2.5 秒 = 2500 毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // 添加文本显示生成数量
  this.add.text(10, 10, 'Obstacles Spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('counterText');

  // 立即生成第一个障碍物
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 随机 X 坐标（留出障碍物宽度的边距）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从顶部生成障碍物
  const obstacle = obstaclesGroup.get(randomX, -20);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置垂直速度为 120
    obstacle.setVelocityY(120);
    
    // 更新信号
    window.__signals__.obstaclesSpawned++;
    window.__signals__.activeObstacles = obstaclesGroup.countActive(true);
    window.__signals__.spawnEvents.push({
      time: Date.now(),
      x: randomX,
      y: -20,
      velocity: 120
    });
    
    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: window.__signals__.obstaclesSpawned,
      position: { x: randomX, y: -20 },
      velocity: 120,
      activeCount: window.__signals__.activeObstacles
    }));
    
    // 更新显示文本
    const counterText = this.children.getByName('counterText');
    if (counterText) {
      counterText.setText(`Obstacles Spawned: ${window.__signals__.obstaclesSpawned}`);
    }
  }
}

function update() {
  // 清理超出屏幕的障碍物
  obstaclesGroup.children.entries.forEach((obstacle) => {
    if (obstacle.active && obstacle.y > 650) {
      obstaclesGroup.killAndHide(obstacle);
      obstacle.setVelocity(0, 0);
      window.__signals__.activeObstacles = obstaclesGroup.countActive(true);
    }
  });
}

// 启动游戏
new Phaser.Game(config);