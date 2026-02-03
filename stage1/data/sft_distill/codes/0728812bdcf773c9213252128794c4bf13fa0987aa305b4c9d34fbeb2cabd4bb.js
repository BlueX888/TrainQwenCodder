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
  totalBulletsFired: 0,
  activeBullets: 0,
  bulletPool: {
    size: 0,
    active: 0,
    inactive: 0
  }
};

let player;
let bulletGroup;
let keys;
const BULLET_SPEED = 120;

function preload() {
  // 创建玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建粉色子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xff69b4, 1); // 粉色
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false
  });

  // 设置键盘输入
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加按键事件监听
  keys.W.on('down', () => shootBullet(this, 0, -1)); // 向上
  keys.A.on('down', () => shootBullet(this, -1, 0)); // 向左
  keys.S.on('down', () => shootBullet(this, 0, 1));  // 向下
  keys.D.on('down', () => shootBullet(this, 1, 0));  // 向右

  // 添加UI文本显示
  this.add.text(10, 10, 'Press WASD to shoot pink bullets', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.statsText = this.add.text(10, 40, '', {
    fontSize: '14px',
    fill: '#ffff00'
  });

  console.log('Game initialized', JSON.stringify(window.__signals__));
}

function shootBullet(scene, dirX, dirY) {
  // 从对象池获取或创建子弹
  let bullet = bulletGroup.get(player.x, player.y, 'bullet');
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度
    bullet.body.velocity.x = dirX * BULLET_SPEED;
    bullet.body.velocity.y = dirY * BULLET_SPEED;
    
    // 更新信号
    window.__signals__.totalBulletsFired++;
    updateSignals();
    
    console.log('Bullet fired', JSON.stringify({
      direction: { x: dirX, y: dirY },
      position: { x: bullet.x, y: bullet.y },
      totalFired: window.__signals__.totalBulletsFired
    }));
  }
}

function update() {
  // 更新活跃子弹计数
  let activeBulletCount = 0;
  
  // 检查所有子弹
  bulletGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      activeBulletCount++;
      
      // 检查是否离开边界
      if (bullet.x < -10 || bullet.x > 810 || 
          bullet.y < -10 || bullet.y > 610) {
        // 回收子弹到对象池
        bulletGroup.killAndHide(bullet);
        bullet.body.velocity.set(0, 0);
      }
    }
  });

  // 更新信号
  window.__signals__.activeBullets = activeBulletCount;
  window.__signals__.bulletPool.size = bulletGroup.getLength();
  window.__signals__.bulletPool.active = bulletGroup.countActive(true);
  window.__signals__.bulletPool.inactive = bulletGroup.countActive(false);

  // 更新UI显示
  if (this.statsText) {
    this.statsText.setText([
      `Total Bullets Fired: ${window.__signals__.totalBulletsFired}`,
      `Active Bullets: ${window.__signals__.activeBullets}`,
      `Pool Size: ${window.__signals__.bulletPool.size}`,
      `Pool Active: ${window.__signals__.bulletPool.active}`,
      `Pool Inactive: ${window.__signals__.bulletPool.inactive}`
    ]);
  }
}

function updateSignals() {
  window.__signals__.bulletPool.size = bulletGroup.getLength();
  window.__signals__.bulletPool.active = bulletGroup.countActive(true);
  window.__signals__.bulletPool.inactive = bulletGroup.countActive(false);
}

// 启动游戏
new Phaser.Game(config);