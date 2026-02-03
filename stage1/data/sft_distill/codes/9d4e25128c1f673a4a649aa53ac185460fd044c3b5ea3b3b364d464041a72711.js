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

// 全局信号对象，用于验证状态
window.__signals__ = {
  bulletsShot: 0,
  activeBullets: 0,
  recycledBullets: 0
};

let bulletGroup;
let playerX = 400;
let playerY = 300;

function preload() {
  // 使用 Graphics 生成灰色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(5, 5, 5); // 圆形子弹，半径5
  graphics.generateTexture('bullet', 10, 10);
  graphics.destroy();
}

function create() {
  // 创建玩家位置指示器（用于显示发射点）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(playerX - 15, playerY - 15, 30, 30);
  
  // 添加提示文本
  this.add.text(10, 10, 'Click to shoot bullets', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 添加状态显示文本
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '16px',
    color: '#ffff00'
  });
  
  // 创建子弹对象池（Physics Group）
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });
  
  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      shootBullet.call(this, pointer);
    }
  });
  
  console.log('[GAME] Game created, bullet pool initialized');
}

function shootBullet(pointer) {
  // 从对象池获取子弹
  const bullet = bulletGroup.get(playerX, playerY);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算从玩家位置到鼠标位置的方向向量
    const angle = Phaser.Math.Angle.Between(
      playerX,
      playerY,
      pointer.x,
      pointer.y
    );
    
    // 设置子弹速度（速度80）
    const speed = 80;
    bullet.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    
    // 更新信号
    window.__signals__.bulletsShot++;
    window.__signals__.activeBullets = bulletGroup.countActive(true);
    
    console.log(JSON.stringify({
      event: 'bullet_shot',
      position: { x: playerX, y: playerY },
      target: { x: pointer.x, y: pointer.y },
      angle: angle,
      totalShot: window.__signals__.bulletsShot
    }));
  }
}

function update(time, delta) {
  // 获取所有活跃的子弹
  const activeBullets = bulletGroup.getChildren().filter(bullet => bullet.active);
  
  // 检查每个子弹是否离开边界
  activeBullets.forEach(bullet => {
    const bounds = this.physics.world.bounds;
    
    // 检测子弹是否离开游戏边界
    if (bullet.x < bounds.x - 10 || 
        bullet.x > bounds.x + bounds.width + 10 ||
        bullet.y < bounds.y - 10 || 
        bullet.y > bounds.y + bounds.height + 10) {
      
      // 回收子弹到对象池
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.setVelocity(0, 0);
      
      // 更新信号
      window.__signals__.recycledBullets++;
      window.__signals__.activeBullets = bulletGroup.countActive(true);
      
      console.log(JSON.stringify({
        event: 'bullet_recycled',
        position: { x: Math.round(bullet.x), y: Math.round(bullet.y) },
        totalRecycled: window.__signals__.recycledBullets
      }));
    }
  });
  
  // 更新状态显示
  this.statusText.setText(
    `Bullets Shot: ${window.__signals__.bulletsShot} | ` +
    `Active: ${window.__signals__.activeBullets} | ` +
    `Recycled: ${window.__signals__.recycledBullets}`
  );
}

// 启动游戏
new Phaser.Game(config);