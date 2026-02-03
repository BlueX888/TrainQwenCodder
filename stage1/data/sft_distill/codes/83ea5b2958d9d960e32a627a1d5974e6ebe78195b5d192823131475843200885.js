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

// 可验证的状态变量
let bulletsFired = 0;
let activeBullets = 0;

// 键盘输入对象
let keyW, keyA, keyS, keyD;

// 子弹组（对象池）
let bullets;

// 发射冷却时间
let lastFireTime = 0;
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
  // 创建子弹对象池（物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false
  });

  // 设置子弹组的边界检测和回收
  bullets.children.iterate((bullet) => {
    if (bullet) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 添加键盘输入监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 创建玩家位置标记（屏幕中心）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(392, 292, 16, 16);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加说明文字
  this.add.text(10, 550, 'Press WASD to fire bullets in different directions', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  console.log('Game initialized. Press WASD to fire bullets.');
}

function update(time, delta) {
  // 更新状态文本
  activeBullets = bullets.countActive(true);
  this.statusText.setText(
    `Bullets Fired: ${bulletsFired}\n` +
    `Active Bullets: ${activeBullets}\n` +
    `Pooled Bullets: ${bullets.getLength()}`
  );

  // 检查冷却时间
  if (time - lastFireTime < fireRate) {
    return;
  }

  // 发射位置（屏幕中心）
  const fireX = 400;
  const fireY = 300;

  // 检测按键并发射子弹
  if (keyW.isDown) {
    fireBullet.call(this, fireX, fireY, 0, -160); // 向上
    lastFireTime = time;
  } else if (keyS.isDown) {
    fireBullet.call(this, fireX, fireY, 0, 160); // 向下
    lastFireTime = time;
  } else if (keyA.isDown) {
    fireBullet.call(this, fireX, fireY, -160, 0); // 向左
    lastFireTime = time;
  } else if (keyD.isDown) {
    fireBullet.call(this, fireX, fireY, 160, 0); // 向右
    lastFireTime = time;
  }

  // 检查并回收离开边界的子弹
  bullets.children.each((bullet) => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        recycleBullet(bullet);
      }
    }
  });
}

function fireBullet(x, y, velocityX, velocityY) {
  // 从对象池获取子弹
  let bullet = bullets.get(x, y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.setVelocity(velocityX, velocityY);
    
    bulletsFired++;
    console.log(`Bullet fired: #${bulletsFired}, Direction: (${velocityX}, ${velocityY})`);
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.enable = false;
  bullet.setVelocity(0, 0);
  console.log('Bullet recycled');
}

// 启动游戏
new Phaser.Game(config);