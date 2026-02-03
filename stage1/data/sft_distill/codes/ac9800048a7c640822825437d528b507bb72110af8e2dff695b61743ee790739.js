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

// 游戏状态信号
window.__signals__ = {
  bulletsShot: 0,
  activeBullets: 0,
  totalRecycled: 0
};

let bullets;
let worldBounds;

function preload() {
  // 创建粉色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(8, 8, 8); // 半径8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 保存世界边界
  worldBounds = this.physics.world.bounds;

  // 创建子弹对象池（物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 初始化时设置子弹为不活跃
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      shootBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 添加提示文本
  this.add.text(10, 10, 'Click left mouse button to shoot pink bullets', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 显示统计信息
  this.statsText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });
}

function shootBullet(targetX, targetY) {
  // 从对象池获取或创建子弹
  const bullet = bullets.get(400, 300);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置速度（速度240）
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    bullet.setVelocity(velocityX, velocityY);
    
    // 更新统计
    window.__signals__.bulletsShot++;
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'bullet_shot',
      position: { x: 400, y: 300 },
      target: { x: targetX, y: targetY },
      velocity: { x: velocityX, y: velocityY },
      totalShot: window.__signals__.bulletsShot
    }));
  }
}

function update(time, delta) {
  // 检查所有活跃的子弹
  let activeCount = 0;
  
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      activeCount++;
      
      // 检查子弹是否离开边界
      const bounds = worldBounds;
      const outOfBounds = 
        bullet.x < bounds.x - 20 || 
        bullet.x > bounds.x + bounds.width + 20 ||
        bullet.y < bounds.y - 20 || 
        bullet.y > bounds.y + bounds.height + 20;
      
      if (outOfBounds) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
        
        window.__signals__.totalRecycled++;
        
        console.log(JSON.stringify({
          event: 'bullet_recycled',
          position: { x: bullet.x, y: bullet.y },
          totalRecycled: window.__signals__.totalRecycled
        }));
      }
    }
  });
  
  // 更新活跃子弹数
  window.__signals__.activeBullets = activeCount;
  
  // 更新统计文本
  if (this.statsText) {
    this.statsText.setText([
      `Bullets Shot: ${window.__signals__.bulletsShot}`,
      `Active Bullets: ${window.__signals__.activeBullets}`,
      `Recycled: ${window.__signals__.totalRecycled}`
    ]);
  }
}

const game = new Phaser.Game(config);