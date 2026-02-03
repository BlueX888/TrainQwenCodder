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

// 状态信号变量
let activeCount = 0;        // 当前活动对象数量
let totalSpawned = 0;       // 总生成次数
let recycledCount = 0;      // 回收次数
let poolSize = 5;           // 对象池大小

let bulletPool;             // 子弹对象池
let spawnTimer;             // 生成定时器
let statusText;             // 状态文本

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建绿色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建对象池（最大 5 个对象）
  bulletPool = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: poolSize,
    runChildUpdate: true
  });

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });

  // 设置定时器，每 500ms 生成一个子弹
  spawnTimer = this.time.addEvent({
    delay: 500,
    callback: spawnBullet,
    callbackScope: this,
    loop: true
  });

  // 初始更新状态
  updateStatus();

  console.log('=== 对象池压力测试开始 ===');
  console.log(`对象池大小: ${poolSize}`);
}

function spawnBullet() {
  // 尝试从对象池获取或创建子弹
  let bullet = bulletPool.get();

  if (bullet) {
    // 随机生成位置（屏幕左侧）
    const randomY = Phaser.Math.Between(50, 550);
    
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setPosition(50, randomY);
    bullet.setVelocity(200, 0); // 向右移动
    
    totalSpawned++;
    activeCount = bulletPool.countActive(true);
    
    console.log(`[生成] 第 ${totalSpawned} 次 | 活动对象: ${activeCount}/${poolSize}`);
    updateStatus();
  } else {
    console.log(`[警告] 对象池已满，无法生成新子弹`);
  }
}

function update() {
  // 检查并回收超出屏幕的子弹
  bulletPool.children.entries.forEach(bullet => {
    if (bullet.active && bullet.x > 850) {
      recycleBullet(bullet);
    }
  });
}

function recycleBullet(bullet) {
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);
  
  recycledCount++;
  activeCount = bulletPool.countActive(true);
  
  console.log(`[回收] 总回收: ${recycledCount} 次 | 活动对象: ${activeCount}/${poolSize}`);
  updateStatus();
}

function updateStatus() {
  const status = [
    `=== 对象池状态 ===`,
    `池大小: ${poolSize}`,
    `活动对象: ${activeCount}`,
    `总生成: ${totalSpawned}`,
    `总回收: ${recycledCount}`,
    `复用率: ${totalSpawned > 0 ? ((recycledCount / totalSpawned) * 100).toFixed(1) : 0}%`
  ].join('\n');
  
  if (statusText) {
    statusText.setText(status);
  }
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态变量供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getActiveCount: () => activeCount,
    getTotalSpawned: () => totalSpawned,
    getRecycledCount: () => recycledCount,
    getPoolSize: () => poolSize
  };
}