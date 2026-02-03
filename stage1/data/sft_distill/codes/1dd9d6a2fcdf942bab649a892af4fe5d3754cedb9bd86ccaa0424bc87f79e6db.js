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

// 全局信号对象，用于验证
window.__signals__ = {
  totalBulletsFired: 0,
  activeBullets: 0,
  bulletsRecycled: 0,
  clickCount: 0
};

let bulletGroup;
let cursors;
let infoText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建白色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(4, 4, 4); // 圆形子弹，半径4
  graphics.generateTexture('bullet', 8, 8);
  graphics.destroy();

  // 创建子弹对象池（使用物理组）
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标左键点击
  this.input.on('pointerdown', function(pointer) {
    if (pointer.leftButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
      window.__signals__.clickCount++;
    }
  }, this);

  // 创建信息显示文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click to Fire Bullets', {
    fontSize: '24px',
    fill: '#888888'
  }).setOrigin(0.5);

  console.log(JSON.stringify({
    event: 'game_started',
    timestamp: Date.now(),
    poolMaxSize: 50
  }));
}

function update(time, delta) {
  // 更新活跃子弹计数
  let activeBulletCount = 0;

  // 检查所有子弹是否离开边界
  bulletGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      activeBulletCount++;

      // 检查是否离开屏幕边界
      if (bullet.x < -10 || bullet.x > 810 || 
          bullet.y < -10 || bullet.y > 610) {
        recycleBullet(bullet);
      }
    }
  });

  window.__signals__.activeBullets = activeBulletCount;

  // 更新信息显示
  infoText.setText([
    `Total Fired: ${window.__signals__.totalBulletsFired}`,
    `Active: ${window.__signals__.activeBullets}`,
    `Recycled: ${window.__signals__.bulletsRecycled}`,
    `Clicks: ${window.__signals__.clickCount}`,
    `Pool Size: ${bulletGroup.getLength()}`
  ]);
}

function fireBullet(x, y) {
  // 从对象池获取子弹
  let bullet = bulletGroup.get(x, y);

  if (bullet) {
    // 激活并显示子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射）
    bullet.body.setVelocity(0, -80);
    
    // 更新统计
    window.__signals__.totalBulletsFired++;

    console.log(JSON.stringify({
      event: 'bullet_fired',
      position: { x: x, y: y },
      velocity: { x: 0, y: -80 },
      timestamp: Date.now(),
      totalFired: window.__signals__.totalBulletsFired
    }));
  } else {
    // 对象池已满
    console.log(JSON.stringify({
      event: 'pool_full',
      timestamp: Date.now(),
      poolSize: bulletGroup.getLength()
    }));
  }
}

function recycleBullet(bullet) {
  // 停止子弹运动
  bullet.body.setVelocity(0, 0);
  
  // 回收到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  
  // 更新统计
  window.__signals__.bulletsRecycled++;

  console.log(JSON.stringify({
    event: 'bullet_recycled',
    position: { x: bullet.x, y: bullet.y },
    timestamp: Date.now(),
    totalRecycled: window.__signals__.bulletsRecycled
  }));
}

// 启动游戏
new Phaser.Game(config);