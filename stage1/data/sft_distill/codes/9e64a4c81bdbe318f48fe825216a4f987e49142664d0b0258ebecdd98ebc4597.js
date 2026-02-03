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
  activeObstacles: 0,
  spawnEvents: []
};

let obstacleGroup;
let spawnTimer;

function preload() {
  // 使用 Graphics 创建灰色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('obstacle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建障碍物物理组
  obstacleGroup = this.physics.add.group({
    defaultKey: 'obstacle',
    maxSize: 50 // 最大障碍物数量
  });

  // 创建定时器，每 2 秒生成一个障碍物
  spawnTimer = this.time.addEvent({
    delay: 2000, // 2 秒
    callback: spawnObstacle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 添加文本显示生成数量
  this.add.text(10, 10, 'Obstacles Spawned: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  }).setName('spawnText');

  console.log('Game started - obstacles will spawn every 2 seconds');
}

function spawnObstacle() {
  // 随机 x 坐标（确保障碍物完全在屏幕内）
  const randomX = Phaser.Math.Between(20, 780);
  
  // 从顶部生成障碍物
  const obstacle = obstacleGroup.get(randomX, -20);
  
  if (obstacle) {
    obstacle.setActive(true);
    obstacle.setVisible(true);
    
    // 设置向下速度为 360
    obstacle.body.setVelocityY(360);
    
    // 更新信号数据
    window.__signals__.obstaclesSpawned++;
    window.__signals__.activeObstacles = obstacleGroup.countActive(true);
    window.__signals__.spawnEvents.push({
      time: Date.now(),
      x: randomX,
      y: -20,
      velocity: 360
    });
    
    // 更新显示文本
    const spawnText = this.children.getByName('spawnText');
    if (spawnText) {
      spawnText.setText(`Obstacles Spawned: ${window.__signals__.obstaclesSpawned}`);
    }
    
    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'obstacle_spawned',
      count: window.__signals__.obstaclesSpawned,
      position: { x: randomX, y: -20 },
      velocity: 360,
      timestamp: Date.now()
    }));
  }
}

function update(time, delta) {
  // 清理离开屏幕的障碍物
  obstacleGroup.children.entries.forEach(obstacle => {
    if (obstacle.active && obstacle.y > 620) {
      obstacle.setActive(false);
      obstacle.setVisible(false);
      obstacle.body.setVelocity(0, 0);
      
      // 更新活跃障碍物数量
      window.__signals__.activeObstacles = obstacleGroup.countActive(true);
      
      console.log(JSON.stringify({
        event: 'obstacle_removed',
        activeCount: window.__signals__.activeObstacles,
        timestamp: Date.now()
      }));
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);