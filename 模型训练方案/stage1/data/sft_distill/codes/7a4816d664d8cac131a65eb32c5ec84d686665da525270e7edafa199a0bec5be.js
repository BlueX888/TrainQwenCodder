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
  bulletsShot: 0,
  activeBullets: 0,
  bulletPool: {
    total: 0,
    active: 0,
    inactive: 0
  }
};

let bullets;
const BULLET_SPEED = 80;
const BULLET_SIZE = 8;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(BULLET_SIZE / 2, BULLET_SIZE / 2, BULLET_SIZE / 2);
  graphics.generateTexture('bullet', BULLET_SIZE, BULLET_SIZE);
  graphics.destroy();

  // 创建子弹对象池
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      shootBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 添加提示文字
  this.add.text(10, 10, 'Click to shoot bullets', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示统计信息
  this.statsText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  console.log('[GAME_INIT]', JSON.stringify({
    timestamp: Date.now(),
    scene: 'created',
    bulletPoolSize: bullets.maxSize
  }));
}

function shootBullet(targetX, targetY) {
  // 从对象池获取子弹
  const bullet = bullets.get(400, 300);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    const velocityX = Math.cos(angle) * BULLET_SPEED;
    const velocityY = Math.sin(angle) * BULLET_SPEED;
    
    bullet.setVelocity(velocityX, velocityY);
    
    // 更新信号
    window.__signals__.bulletsShot++;
    
    console.log('[BULLET_SHOT]', JSON.stringify({
      timestamp: Date.now(),
      bulletId: bullet.body ? bullet.body.id : 'unknown',
      position: { x: 400, y: 300 },
      target: { x: targetX, y: targetY },
      velocity: { x: velocityX.toFixed(2), y: velocityY.toFixed(2) },
      totalShot: window.__signals__.bulletsShot
    }));
  }
}

function update(time, delta) {
  // 检查子弹是否离开边界
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      const bounds = {
        left: -50,
        right: 850,
        top: -50,
        bottom: 650
      };
      
      if (bullet.x < bounds.left || bullet.x > bounds.right ||
          bullet.y < bounds.top || bullet.y > bounds.bottom) {
        
        console.log('[BULLET_RECYCLED]', JSON.stringify({
          timestamp: Date.now(),
          bulletId: bullet.body ? bullet.body.id : 'unknown',
          position: { x: bullet.x.toFixed(2), y: bullet.y.toFixed(2) },
          outOfBounds: true
        }));
        
        // 回收到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    }
  });
  
  // 更新统计信息
  const activeBullets = bullets.countActive(true);
  window.__signals__.activeBullets = activeBullets;
  window.__signals__.bulletPool.total = bullets.getLength();
  window.__signals__.bulletPool.active = activeBullets;
  window.__signals__.bulletPool.inactive = bullets.countActive(false);
  
  // 更新显示文字
  if (this.statsText) {
    this.statsText.setText([
      `Bullets Shot: ${window.__signals__.bulletsShot}`,
      `Active Bullets: ${activeBullets}`,
      `Pool Total: ${window.__signals__.bulletPool.total}`,
      `Pool Active: ${window.__signals__.bulletPool.active}`,
      `Pool Inactive: ${window.__signals__.bulletPool.inactive}`
    ]);
  }
}

// 启动游戏
const game = new Phaser.Game(config);