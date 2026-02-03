const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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

let bulletGroup;
let cursors;
let fireRate = 200; // 发射间隔（毫秒）
let nextFireTime = 0;
let bulletsFired = 0; // 可验证状态：已发射子弹数
let activeBullets = 0; // 可验证状态：当前活跃子弹数

function preload() {
  // 使用 Graphics 创建青色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 显示说明
  this.add.text(10, 550, '使用方向键发射青色子弹', {
    fontSize: '14px',
    fill: '#00ffff'
  });

  console.log('游戏初始化完成 - 使用方向键发射子弹');
}

function update(time, delta) {
  const currentTime = time;

  // 检测方向键并发射子弹
  if (currentTime > nextFireTime) {
    let velocityX = 0;
    let velocityY = 0;
    let shouldFire = false;

    if (cursors.left.isDown) {
      velocityX = -200;
      shouldFire = true;
    } else if (cursors.right.isDown) {
      velocityX = 200;
      shouldFire = true;
    }

    if (cursors.up.isDown) {
      velocityY = -200;
      shouldFire = true;
    } else if (cursors.down.isDown) {
      velocityY = 200;
      shouldFire = true;
    }

    // 如果同时按下两个方向键，归一化速度向量
    if (velocityX !== 0 && velocityY !== 0) {
      const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / magnitude) * 200;
      velocityY = (velocityY / magnitude) * 200;
    }

    if (shouldFire) {
      fireBullet(velocityX, velocityY);
      nextFireTime = currentTime + fireRate;
    }
  }

  // 检查子弹是否离开边界，离开则回收
  bulletGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        recycleBullet(bullet);
      }
    }
  });

  // 更新状态显示
  activeBullets = bulletGroup.countActive(true);
  this.statusText.setText(
    `已发射: ${bulletsFired} | 活跃子弹: ${activeBullets} | 池中可用: ${bulletGroup.maxSize - bulletGroup.getLength()}`
  );
}

function fireBullet(velocityX, velocityY) {
  // 从对象池获取子弹
  const bullet = bulletGroup.get(400, 300);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    
    // 设置子弹速度
    bullet.setVelocity(velocityX, velocityY);
    
    // 增加发射计数
    bulletsFired++;
    
    console.log(`发射子弹 #${bulletsFired} - 速度: (${velocityX}, ${velocityY})`);
  } else {
    console.log('对象池已满，无法发射子弹');
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.enable = false;
  bullet.setVelocity(0, 0);
  
  console.log(`回收子弹 - 剩余活跃: ${bulletGroup.countActive(true)}`);
}

new Phaser.Game(config);