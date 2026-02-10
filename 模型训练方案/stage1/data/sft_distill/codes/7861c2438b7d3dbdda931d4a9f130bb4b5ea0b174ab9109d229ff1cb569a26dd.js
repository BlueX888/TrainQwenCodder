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

let player;
let bullets;
let cursors;
let lastFiredTime = 0;
const fireRate = 200; // 发射间隔（毫秒）
let bulletsFired = 0; // 状态信号：已发射子弹数

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建灰色子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0x808080, 1);
  bulletGraphics.fillCircle(8, 8, 8);
  bulletGraphics.generateTexture('bullet', 16, 16);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(10, 10, 'Use Arrow Keys to Shoot', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 显示发射计数
  this.bulletCountText = this.add.text(10, 30, 'Bullets Fired: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 显示活跃子弹数
  this.activeBulletsText = this.add.text(10, 50, 'Active Bullets: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 检测方向键并发射子弹
  if (time > lastFiredTime + fireRate) {
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.up.isDown) {
      velocityY = -80;
      fireBullet(velocityX, velocityY);
      lastFiredTime = time;
    } else if (cursors.down.isDown) {
      velocityY = 80;
      fireBullet(velocityX, velocityY);
      lastFiredTime = time;
    } else if (cursors.left.isDown) {
      velocityX = -80;
      fireBullet(velocityX, velocityY);
      lastFiredTime = time;
    } else if (cursors.right.isDown) {
      velocityX = 80;
      fireBullet(velocityX, velocityY);
      lastFiredTime = time;
    }
  }

  // 检查子弹是否越界，越界则回收
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        bullets.killAndHide(bullet);
        bullet.body.reset(0, 0);
      }
    }
  });

  // 更新UI
  const activeBullets = bullets.countActive(true);
  this.bulletCountText.setText('Bullets Fired: ' + bulletsFired);
  this.activeBulletsText.setText('Active Bullets: ' + activeBullets);
}

function fireBullet(velocityX, velocityY) {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.setVelocity(velocityX, velocityY);
    
    bulletsFired++;
  }
}

new Phaser.Game(config);