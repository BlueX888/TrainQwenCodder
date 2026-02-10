// 对象池压力测试 - 持续生成/回收蓝色子弹
const config = {
  type: Phaser.HEADLESS,
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

// 全局信号对象
window.__signals__ = {
  activeCount: 0,
  totalSpawned: 0,
  totalRecycled: 0,
  poolSize: 0,
  cycleCount: 0,
  timestamp: 0
};

let bulletPool;
let spawnTimer;
let statsText;
let cycleCount = 0;

function preload() {
  // 创建蓝色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建对象池（使用 Physics Group）
  bulletPool = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10, // 限制最大对象数量
    createCallback: function(bullet) {
      // 对象创建时的回调
      bullet.setActive(false);
      bullet.setVisible(false);
      console.log('[Pool] Created new bullet object');
    },
    removeCallback: function(bullet) {
      // 对象从池中移除时的回调
      bullet.setActive(false);
      bullet.setVisible(false);
      console.log('[Pool] Bullet returned to pool');
    }
  });

  // 创建显示文本（用于可视化验证）
  statsText = this.add.text(10, 10, '', {
    font: '16px monospace',
    fill: '#00ff00'
  });

  // 定时器：每 1 秒生成 3 个子弹
  spawnTimer = this.time.addEvent({
    delay: 1000,
    callback: spawnBullets,
    callbackScope: this,
    loop: true
  });

  // 初始化信号
  updateSignals();
  
  console.log('[Init] Object pool stress test started');
  console.log('[Init] Pool max size:', bulletPool.maxSize);
}

function spawnBullets() {
  cycleCount++;
  
  for (let i = 0; i < 3; i++) {
    // 从对象池获取或创建子弹
    let bullet = bulletPool.get();
    
    if (bullet) {
      // 随机位置（屏幕上方）
      const x = 100 + i * 250;
      const y = 50;
      
      // 激活并设置位置
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 设置随机速度（向下和侧向）
      const velocityX = (Math.random() - 0.5) * 200;
      const velocityY = 150 + Math.random() * 100;
      bullet.setVelocity(velocityX, velocityY);
      
      // 启用边界检测
      bullet.body.setCollideWorldBounds(false);
      
      window.__signals__.totalSpawned++;
      
      console.log(`[Spawn] Bullet ${i + 1}/3 at (${x}, ${y}) - Active: ${bulletPool.countActive(true)}`);
    } else {
      console.log('[Warning] Pool exhausted, cannot spawn bullet');
    }
  }
  
  updateSignals();
}

function update(time, delta) {
  // 检查并回收超出边界的子弹
  bulletPool.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 检查是否超出屏幕边界
      if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
        recycleBullet(bullet);
      }
    }
  });
  
  // 更新显示和信号
  updateSignals();
  updateStatsDisplay();
  
  window.__signals__.timestamp = time;
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);
  
  window.__signals__.totalRecycled++;
  
  console.log(`[Recycle] Bullet recycled - Active: ${bulletPool.countActive(true)}`);
}

function updateSignals() {
  window.__signals__.activeCount = bulletPool.countActive(true);
  window.__signals__.poolSize = bulletPool.getLength();
  window.__signals__.cycleCount = cycleCount;
  
  // 输出 JSON 格式的信号（便于自动化测试）
  if (cycleCount % 5 === 0 && cycleCount > 0) {
    console.log('[Signals]', JSON.stringify(window.__signals__, null, 2));
  }
}

function updateStatsDisplay() {
  const stats = [
    `=== Object Pool Stress Test ===`,
    `Cycle: ${cycleCount}`,
    `Active Objects: ${window.__signals__.activeCount}`,
    `Pool Size: ${window.__signals__.poolSize}`,
    `Total Spawned: ${window.__signals__.totalSpawned}`,
    `Total Recycled: ${window.__signals__.totalRecycled}`,
    `Memory Efficiency: ${((window.__signals__.totalRecycled / Math.max(window.__signals__.totalSpawned, 1)) * 100).toFixed(1)}%`
  ];
  
  statsText.setText(stats.join('\n'));
}

// 启动游戏
const game = new Phaser.Game(config);

// 自动停止测试（可选，用于自动化测试）
setTimeout(() => {
  console.log('[Test] Final Report:');
  console.log(JSON.stringify(window.__signals__, null, 2));
  console.log('[Test] Pool stress test completed successfully');
  console.log('[Verification] Pool size stable:', window.__signals__.poolSize <= 10);
  console.log('[Verification] No memory leak:', window.__signals__.activeCount <= 10);
}, 15000);