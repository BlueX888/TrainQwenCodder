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
  logs: []
};

let bulletPool;
let spawnTimer;
let frameCount = 0;
const SPAWN_INTERVAL = 1000; // 每秒生成一次
const BULLETS_PER_SPAWN = 3; // 每次生成3个子弹
const BULLET_SPEED = 200;
const POOL_MAX_SIZE = 10; // 对象池最大容量

function preload() {
  // 创建蓝色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建对象池（使用Physics.Arcade.Group）
  bulletPool = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: POOL_MAX_SIZE,
    runChildUpdate: true,
    createCallback: function(bullet) {
      bullet.setActive(false);
      bullet.setVisible(false);
      logEvent('CREATE', 'Bullet created in pool');
    }
  });

  // 设置定时器，每秒生成3个子弹
  spawnTimer = this.time.addEvent({
    delay: SPAWN_INTERVAL,
    callback: spawnBullets,
    callbackScope: this,
    loop: true
  });

  // 初始日志
  logEvent('INIT', 'Object pool initialized');
  updateSignals();

  // 添加文本显示（仅用于可视化测试）
  const text = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  this.events.on('update', () => {
    text.setText([
      `Active Objects: ${bulletPool.countActive(true)}`,
      `Pool Size: ${bulletPool.getLength()}`,
      `Total Spawned: ${window.__signals__.totalSpawned}`,
      `Total Recycled: ${window.__signals__.totalRecycled}`,
      `Frame: ${frameCount}`
    ]);
  });
}

function spawnBullets() {
  for (let i = 0; i < BULLETS_PER_SPAWN; i++) {
    // 从对象池获取子弹
    let bullet = bulletPool.get();
    
    if (bullet) {
      // 设置子弹位置（随机X位置，从顶部生成）
      const x = Phaser.Math.Between(50, 750);
      const y = 50;
      
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(
        Phaser.Math.Between(-50, 50),
        BULLET_SPEED
      );

      window.__signals__.totalSpawned++;
      logEvent('SPAWN', `Bullet spawned at (${x}, ${y})`);
    } else {
      // 对象池已满，无法生成
      logEvent('POOL_FULL', 'Cannot spawn, pool at max capacity');
    }
  }
  
  updateSignals();
}

function update(time, delta) {
  frameCount++;

  // 检查并回收超出边界的子弹
  bulletPool.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 子弹超出屏幕底部，回收到对象池
      if (bullet.y > 650) {
        recycleBullet(bullet);
      }
    }
  });

  // 每60帧更新一次信号
  if (frameCount % 60 === 0) {
    updateSignals();
  }
}

function recycleBullet(bullet) {
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);
  
  window.__signals__.totalRecycled++;
  logEvent('RECYCLE', `Bullet recycled at (${Math.round(bullet.x)}, ${Math.round(bullet.y)})`);
  updateSignals();
}

function updateSignals() {
  window.__signals__.activeCount = bulletPool.countActive(true);
  window.__signals__.poolSize = bulletPool.getLength();
  
  // 输出到控制台
  console.log(JSON.stringify({
    timestamp: Date.now(),
    activeCount: window.__signals__.activeCount,
    poolSize: window.__signals__.poolSize,
    totalSpawned: window.__signals__.totalSpawned,
    totalRecycled: window.__signals__.totalRecycled,
    efficiency: window.__signals__.totalSpawned > 0 
      ? (window.__signals__.totalRecycled / window.__signals__.totalSpawned * 100).toFixed(2) + '%'
      : '0%'
  }));
}

function logEvent(type, message) {
  const log = {
    frame: frameCount,
    type: type,
    message: message,
    timestamp: Date.now()
  };
  
  window.__signals__.logs.push(log);
  
  // 只保留最近50条日志
  if (window.__signals__.logs.length > 50) {
    window.__signals__.logs.shift();
  }
  
  console.log(`[${type}] ${message}`);
}

// 启动游戏
const game = new Phaser.Game(config);

// 自动停止测试（10秒后）
setTimeout(() => {
  console.log('=== FINAL REPORT ===');
  console.log(JSON.stringify(window.__signals__, null, 2));
  game.destroy(true);
}, 10000);