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

// 全局状态变量
let player;
let boss;
let bullets;
let cursors;
let spaceKey;
let bossHealth = 12;
let healthText;
let victoryText;
let gameWon = false;
let lastFireTime = 0;
const FIRE_RATE = 300; // 发射间隔（毫秒）

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建Boss纹理（粉色大方块）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xff69b4, 1);
  bossGraphics.fillRect(0, 0, 100, 80);
  bossGraphics.generateTexture('boss', 100, 80);
  bossGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();
}

function create() {
  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.body.setImmovable(true);
  
  // Boss左右移动
  boss.setVelocityX(150);

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 设置碰撞检测
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 创建UI文本
  healthText = this.add.text(16, 16, `Boss血量: ${bossHealth}`, {
    fontSize: '24px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  });

  victoryText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#00ff00',
    backgroundColor: '#000',
    padding: { x: 20, y: 10 }
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 添加说明文本
  this.add.text(16, 560, '← → 移动  空格 发射', {
    fontSize: '18px',
    fill: '#fff'
  });
}

function update(time, delta) {
  if (gameWon) {
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

  // 玩家发射子弹
  if (spaceKey.isDown && time > lastFireTime + FIRE_RATE) {
    fireBullet.call(this);
    lastFireTime = time;
  }

  // Boss左右移动边界反弹
  if (boss.x <= 50 || boss.x >= 750) {
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
    bullet.body.enable = true;
    bullet.setVelocityY(-300);
  }
}

function hitBoss(bullet, boss) {
  // 子弹命中Boss
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.enable = false;

  // Boss扣血
  bossHealth--;
  healthText.setText(`Boss血量: ${bossHealth}`);

  // Boss闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    boss.clearTint();
  });

  // 检查是否胜利
  if (bossHealth <= 0) {
    gameWon = true;
    boss.setVisible(false);
    boss.body.enable = false;
    
    victoryText.setText('胜利！');
    victoryText.setVisible(true);
    
    // 停止所有子弹
    bullets.children.entries.forEach(b => {
      if (b.active) {
        b.setVelocity(0);
      }
    });
    
    player.setVelocity(0);
    
    console.log('游戏胜利！Boss被击败！');
  }
}

const game = new Phaser.Game(config);