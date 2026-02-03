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

// 全局状态信号
window.__signals__ = {
  bulletsShot: 0,
  activeBullets: 0,
  poolSize: 20
};

let bulletGroup;
let lastFireTime = 0;
const fireRate = 200; // 发射间隔（毫秒）

function preload() {
  // 使用 Graphics 创建蓝色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: window.__signals__.poolSize,
    runChildUpdate: false
  });

  // 预创建子弹到对象池
  for (let i = 0; i < window.__signals__.poolSize; i++) {
    const bullet = bulletGroup.create(0, 0, 'bullet');
    bullet.setActive(false);
    bullet.setVisible(false);
  }

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    const currentTime = this.time.now;
    
    // 检查发射间隔
    if (currentTime - lastFireTime < fireRate) {
      return;
    }
    
    fireBullet.call(this, pointer.x, pointer.y);
    lastFireTime = currentTime;
  });

  // 添加提示文本
  this.add.text(10, 10, 'Click to shoot blue bullets', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示统计信息
  const statsText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  // 更新统计信息
  this.time.addEvent({
    delay: 100,
    callback: () => {
      statsText.setText([
        `Bullets Shot: ${window.__signals__.bulletsShot}`,
        `Active Bullets: ${window.__signals__.activeBullets}`,
        `Pool Size: ${window.__signals__.poolSize}`
      ]);
    },
    loop: true
  });

  console.log(JSON.stringify({
    event: 'game_started',
    signals: window.__signals__
  }));
}

function fireBullet(targetX, targetY) {
  // 从对象池获取子弹
  const bullet = bulletGroup.get(400, 300, 'bullet');
  
  if (!bullet) {
    console.log(JSON.stringify({
      event: 'bullet_pool_exhausted',
      signals: window.__signals__
    }));
    return;
  }

  // 激活子弹
  bullet.setActive(true);
  bullet.setVisible(true);

  // 计算发射方向
  const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
  
  // 设置速度
  const velocityX = Math.cos(angle) * 160;
  const velocityY = Math.sin(angle) * 160;
  bullet.setVelocity(velocityX, velocityY);

  // 更新统计
  window.__signals__.bulletsShot++;
  window.__signals__.activeBullets = bulletGroup.countActive(true);

  console.log(JSON.stringify({
    event: 'bullet_fired',
    position: { x: 400, y: 300 },
    target: { x: targetX, y: targetY },
    velocity: { x: velocityX, y: velocityY },
    signals: window.__signals__
  }));
}

function update(time, delta) {
  // 检查子弹是否超出边界
  bulletGroup.children.entries.forEach((bullet) => {
    if (!bullet.active) return;

    const bounds = {
      left: -50,
      right: 850,
      top: -50,
      bottom: 650
    };

    // 超出边界则回收
    if (bullet.x < bounds.left || bullet.x > bounds.right ||
        bullet.y < bounds.top || bullet.y > bounds.bottom) {
      
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setVelocity(0, 0);
      
      window.__signals__.activeBullets = bulletGroup.countActive(true);
      
      console.log(JSON.stringify({
        event: 'bullet_recycled',
        position: { x: bullet.x, y: bullet.y },
        signals: window.__signals__
      }));
    }
  });
}

const game = new Phaser.Game(config);