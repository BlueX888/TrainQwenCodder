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

// 全局状态变量
let bulletPool;
let spawnTimer;
let statsText;
let totalSpawned = 0;
let totalRecycled = 0;
let activeCount = 0;

function preload() {
  // 创建灰色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(8, 8, 8); // 圆形子弹
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建对象池（使用物理组）
  bulletPool = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10, // 最大对象数量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 子弹创建时的回调
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 创建统计信息文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });

  // 设置定时器，每300ms生成一个子弹
  spawnTimer = this.time.addEvent({
    delay: 300,
    callback: spawnBullet,
    callbackScope: this,
    loop: true
  });

  // 显示说明文本
  this.add.text(10, 100, '对象池压力测试\n持续生成/回收灰色子弹\n最大对象数: 10', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function spawnBullet() {
  // 从对象池获取子弹
  let bullet = bulletPool.get();

  if (bullet) {
    // 随机生成位置（屏幕左侧）
    const x = 50;
    const y = Phaser.Math.Between(50, 550);
    
    // 激活并设置子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setPosition(x, y);
    
    // 设置速度（向右移动）
    bullet.body.setVelocity(200, 0);
    
    // 记录生成数量
    totalSpawned++;
    
    // 设置子弹数据，用于追踪
    bullet.setData('spawned', true);
  } else {
    // 对象池已满，无法获取新对象
    console.log('对象池已满，无法生成新子弹');
  }
  
  updateStats();
}

function update() {
  // 检查并回收超出屏幕的子弹
  bulletPool.children.entries.forEach(bullet => {
    if (bullet.active && bullet.x > 850) {
      // 回收子弹到对象池
      recycleBullet(bullet);
    }
  });
  
  // 更新活动对象数量
  activeCount = bulletPool.countActive(true);
  updateStats();
}

function recycleBullet(bullet) {
  // 停止子弹移动
  bullet.body.setVelocity(0, 0);
  
  // 禁用子弹
  bullet.setActive(false);
  bullet.setVisible(false);
  
  // 重置位置到屏幕外
  bullet.setPosition(-100, -100);
  
  // 记录回收数量
  totalRecycled++;
}

function updateStats() {
  const poolSize = bulletPool.getLength();
  const activeObjects = bulletPool.countActive(true);
  const inactiveObjects = bulletPool.countActive(false);
  
  statsText.setText([
    '=== 对象池状态 ===',
    `对象池大小: ${poolSize} / 10`,
    `活动对象: ${activeObjects}`,
    `非活动对象: ${inactiveObjects}`,
    `总生成数: ${totalSpawned}`,
    `总回收数: ${totalRecycled}`,
    `净增长: ${totalSpawned - totalRecycled}`
  ]);
}

// 启动游戏
new Phaser.Game(config);