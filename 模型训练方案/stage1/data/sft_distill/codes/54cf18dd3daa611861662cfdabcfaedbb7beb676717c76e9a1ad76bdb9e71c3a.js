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
let cursors;
let bullets;
let lastFired = 0;
let fireRate = 200; // 发射间隔（毫秒）
let bulletsFired = 0; // 可验证状态：已发射子弹数
let statsText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建子弹纹理（紫色圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0x9933ff, 1);
  bulletGraphics.fillCircle(8, 8, 8);
  bulletGraphics.generateTexture('bullet', 16, 16);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建子弹对象池（使用Physics.Arcade.Group）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 创建状态文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 添加说明文本
  this.add.text(10, 550, 'Use Arrow Keys to shoot bullets', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });

  updateStatsText();
}

function update(time, delta) {
  const speed = 200;

  // 玩家移动
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }

  // 发射子弹（带发射间隔限制）
  if (time > lastFired + fireRate) {
    if (cursors.left.isDown) {
      fireBullet(-1, 0, time);
    } else if (cursors.right.isDown) {
      fireBullet(1, 0, time);
    } else if (cursors.up.isDown) {
      fireBullet(0, -1, time);
    } else if (cursors.down.isDown) {
      fireBullet(0, 1, time);
    }
  }

  // 检查子弹是否离开边界，回收到对象池
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        bullets.killAndHide(bullet);
        bullet.body.stop();
      }
    }
  });
}

function fireBullet(dirX, dirY, time) {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（240像素/秒）
    bullet.body.velocity.x = dirX * 240;
    bullet.body.velocity.y = dirY * 240;
    
    lastFired = time;
    bulletsFired++;
    updateStatsText();
  }
}

function updateStatsText() {
  const activeBullets = bullets.countActive(true);
  const poolSize = bullets.getLength();
  
  statsText.setText([
    `Bullets Fired: ${bulletsFired}`,
    `Active Bullets: ${activeBullets}`,
    `Pool Size: ${poolSize}`
  ]);
}

new Phaser.Game(config);