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
  }
};

// 全局信号对象，用于验证
window.__signals__ = {
  obstaclesSpawned: 0,
  obstaclePositions: [],
  lastSpawnTime: 0
};

let obstacles;
let spawnTimer;

function preload() {
  // 使用 Graphics 生成橙色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8800, 1); // 橙色
  graphics.fillRect(0, 0, 40, 40); // 40x40 方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理组来管理障碍物
  obstacles = this.physics.add.group();

  // 添加定时器，每3秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 3000, // 3秒 = 3000毫秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本显示生成数量
  const infoText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  // 更新信息文本
  this.events.on('update', () => {
    infoText.setText([
      `Obstacles Spawned: ${window.__signals__.obstaclesSpawned}`,
      `Active Obstacles: ${obstacles.getChildren().length}`,
      `Last Spawn: ${window.__signals__.lastSpawnTime}ms`
    ]);
  });

  // 立即生成第一个障碍物
  spawnObstacle.call(this);
}

function spawnObstacle() {
  // 在顶部随机 x 位置生成障碍物
  const randomX = Phaser.Math.Between(20, 780); // 留出边距
  const obstacle = obstacles.create(randomX, -20, 'obstacle');
  
  // 设置向下速度为 240
  obstacle.setVelocityY(240);
  
  // 更新信号
  window.__signals__.obstaclesSpawned++;
  window.__signals__.obstaclePositions.push({
    x: randomX,
    y: -20,
    timestamp: this.time.now
  });
  window.__signals__.lastSpawnTime = this.time.now;
  
  // 输出日志用于验证
  console.log(JSON.stringify({
    event: 'obstacle_spawned',
    count: window.__signals__.obstaclesSpawned,
    position: { x: randomX, y: -20 },
    velocity: { x: 0, y: 240 },
    timestamp: this.time.now
  }));
}

function update(time, delta) {
  // 清理超出屏幕底部的障碍物
  obstacles.getChildren().forEach(obstacle => {
    if (obstacle.y > 650) { // 超出屏幕底部
      obstacle.destroy();
      
      // 输出清理日志
      console.log(JSON.stringify({
        event: 'obstacle_destroyed',
        reason: 'out_of_bounds',
        timestamp: time
      }));
    }
  });
}

// 启动游戏
new Phaser.Game(config);