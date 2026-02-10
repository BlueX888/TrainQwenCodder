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

// 状态信号：子弹发射计数器
let bulletsFired = 0;
let bulletsActive = 0;

// 子弹对象池
let bulletGroup;

// 键盘输入
let keyW, keyA, keyS, keyD;

// 发射冷却时间
let lastFired = 0;
const fireRate = 200; // 毫秒

function preload() {
  // 使用 Graphics 创建红色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false
  });

  // 设置键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加信息文本
  this.add.text(10, 10, 'Press WASD to fire bullets', {
    fontSize: '16px',
    color: '#ffffff'
  });

  this.statusText = this.add.text(10, 35, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  // 添加中心点标记（玩家位置）
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0x00ff00, 1);
  centerGraphics.fillCircle(400, 300, 10);
}

function update(time, delta) {
  const centerX = 400;
  const centerY = 300;

  // 检测按键并发射子弹
  if (time > lastFired + fireRate) {
    let velocityX = 0;
    let velocityY = 0;
    let shouldFire = false;

    if (keyW.isDown) {
      velocityY = -200;
      shouldFire = true;
    }
    if (keyS.isDown) {
      velocityY = 200;
      shouldFire = true;
    }
    if (keyA.isDown) {
      velocityX = -200;
      shouldFire = true;
    }
    if (keyD.isDown) {
      velocityX = 200;
      shouldFire = true;
    }

    // 发射子弹
    if (shouldFire) {
      fireBullet.call(this, centerX, centerY, velocityX, velocityY);
      lastFired = time;
    }
  }

  // 检查子弹是否离开边界并回收
  bulletGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      const bounds = this.physics.world.bounds;
      if (bullet.x < bounds.x - 20 || 
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 || 
          bullet.y > bounds.y + bounds.height + 20) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        bulletsActive--;
      }
    }
  });

  // 更新状态文本
  this.statusText.setText(
    `Bullets Fired: ${bulletsFired} | Active: ${bulletsActive}`
  );
}

function fireBullet(x, y, velocityX, velocityY) {
  // 从对象池获取子弹
  let bullet = bulletGroup.get(x, y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    
    // 设置速度
    bullet.body.setVelocity(velocityX, velocityY);
    
    // 更新状态计数器
    bulletsFired++;
    bulletsActive++;
  }
}

new Phaser.Game(config);