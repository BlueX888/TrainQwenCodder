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

// 全局信号对象
window.__signals__ = {
  bulletsCreated: 0,
  bulletsFired: 0,
  bulletsRecycled: 0,
  activeBullets: 0,
  lastFirePosition: { x: 0, y: 0 }
};

let bulletPool;
let cursors;

function preload() {
  // 使用 Graphics 生成灰色子弹纹理
  const graphics = this.add.graphics();
  
  // 绘制灰色圆形子弹
  graphics.fillStyle(0x808080, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
  
  console.log('[PRELOAD] Bullet texture generated');
}

function create() {
  // 创建子弹对象池（Physics Group）
  bulletPool = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    createCallback: function(bullet) {
      bullet.setActive(false);
      bullet.setVisible(false);
      window.__signals__.bulletsCreated++;
      console.log(`[POOL] Bullet created, total: ${window.__signals__.bulletsCreated}`);
    }
  });

  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      fireBullet(pointer.x, pointer.y);
    }
  });

  // 添加提示文本
  this.add.text(10, 10, 'Right Click to Fire Bullets', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 添加统计信息文本
  this.statsText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  console.log('[CREATE] Game initialized, waiting for right click');
}

function fireBullet(x, y) {
  // 从对象池获取或创建子弹
  let bullet = bulletPool.get(x, y);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向右发射）
    bullet.setVelocity(120, 0);
    
    // 更新信号
    window.__signals__.bulletsFired++;
    window.__signals__.lastFirePosition = { x, y };
    window.__signals__.activeBullets = bulletPool.countActive(true);
    
    console.log(JSON.stringify({
      event: 'BULLET_FIRED',
      position: { x, y },
      totalFired: window.__signals__.bulletsFired,
      activeBullets: window.__signals__.activeBullets
    }));
  } else {
    console.log('[WARNING] Bullet pool exhausted');
  }
}

function update(time, delta) {
  // 检查所有活跃的子弹
  bulletPool.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检测子弹是否离开边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
        
        // 更新信号
        window.__signals__.bulletsRecycled++;
        window.__signals__.activeBullets = bulletPool.countActive(true);
        
        console.log(JSON.stringify({
          event: 'BULLET_RECYCLED',
          totalRecycled: window.__signals__.bulletsRecycled,
          activeBullets: window.__signals__.activeBullets
        }));
      }
    }
  });

  // 更新统计信息显示
  if (this.statsText) {
    this.statsText.setText([
      `Bullets Fired: ${window.__signals__.bulletsFired}`,
      `Active Bullets: ${window.__signals__.activeBullets}`,
      `Bullets Recycled: ${window.__signals__.bulletsRecycled}`,
      `Pool Size: ${window.__signals__.bulletsCreated}`
    ]);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

console.log('[INIT] Game started, signals available at window.__signals__');