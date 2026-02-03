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

// 游戏状态变量
let player;
let boss;
let bullets;
let cursors;
let spaceKey;
let lastFired = 0;
let bossHealth = 8;
let healthText;
let victoryText;
let gameOver = false;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillTriangle(0, -20, -15, 10, 15, 10);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建Boss纹理
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xffffff, 1);
  bossGraphics.fillRect(-40, -30, 80, 60);
  bossGraphics.fillStyle(0xff0000, 1);
  bossGraphics.fillCircle(-20, -10, 8);
  bossGraphics.fillCircle(20, -10, 8);
  bossGraphics.generateTexture('boss', 80, 60);
  bossGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(0, 0, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setImmovable(true);
  
  // Boss左右移动
  boss.setVelocityX(150);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 碰撞检测：子弹击中Boss
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 创建UI文本
  healthText = this.add.text(16, 16, 'Boss HP: 8', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  victoryText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 玩家移动
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  // 玩家射击
  if (spaceKey.isDown && time > lastFired + 200) {
    fireBullet.call(this);
    lastFired = time;
  }

  // Boss边界反弹
  if (boss.x <= 40 || boss.x >= 760) {
    boss.setVelocityX(-boss.body.velocity.x);
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -10) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
}

function fireBullet() {
  // 从对象池获取或创建子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-240);
  }
}

function hitBoss(bullet, boss) {
  // 销毁子弹
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);

  // Boss扣血
  bossHealth--;
  healthText.setText('Boss HP: ' + bossHealth);

  // Boss受击闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    boss.clearTint();
  });

  // 检查Boss是否被击败
  if (bossHealth <= 0) {
    gameOver = true;
    boss.setVisible(false);
    boss.setActive(false);
    
    victoryText.setText('VICTORY!');
    victoryText.setVisible(true);

    // 停止玩家移动
    player.setVelocity(0, 0);
    
    // 清除所有子弹
    bullets.clear(true, true);
  }
}

// 启动游戏
const game = new Phaser.Game(config);