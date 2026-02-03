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
let boss;
let bullets;
let cursors;
let spaceKey;
let canShoot = true;
let shootDelay = 300; // 射击冷却时间（毫秒）
let bossHealth = 8;
let maxBossHealth = 8;
let healthText;
let healthBar;
let healthBarBg;
let victoryText;
let gameOver = false;

function preload() {
  // 使用 Graphics 创建纹理，不需要外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0066ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建Boss纹理（白色方块）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xffffff, 1);
  bossGraphics.fillRect(0, 0, 80, 80);
  bossGraphics.generateTexture('boss', 80, 80);
  bossGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建Boss
  boss = this.physics.add.sprite(400, 150, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setImmovable(true);
  
  // Boss左右移动
  boss.setVelocityX(100);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 子弹与Boss碰撞检测
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 创建血量条背景
  healthBarBg = this.add.graphics();
  healthBarBg.fillStyle(0x666666, 1);
  healthBarBg.fillRect(300, 50, 200, 20);

  // 创建血量条
  healthBar = this.add.graphics();
  updateHealthBar();

  // 创建血量文本
  healthText = this.add.text(400, 30, `Boss HP: ${bossHealth}/${maxBossHealth}`, {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  healthText.setOrigin(0.5, 0.5);

  // 创建控制提示
  this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 0.5);

  // 创建胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5, 0.5);
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

  if (cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.setVelocityY(300);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (Phaser.Input.Keyboard.JustDown(spaceKey) && canShoot) {
    shootBullet(this);
    canShoot = false;
    this.time.delayedCall(shootDelay, () => {
      canShoot = true;
    });
  }

  // Boss边界反弹
  if (boss.x <= 40 || boss.x >= 760) {
    boss.setVelocityX(-boss.body.velocity.x);
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -10) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
}

function shootBullet(scene) {
  // 从对象池获取或创建子弹
  const bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.velocity.y = -240; // 子弹速度 240
  }
}

function hitBoss(bullet, boss) {
  // 销毁子弹
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.stop();

  // Boss扣血
  bossHealth--;
  
  // 更新血量显示
  healthText.setText(`Boss HP: ${bossHealth}/${maxBossHealth}`);
  updateHealthBar();

  // Boss闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    boss.clearTint();
  });

  // 检查胜利条件
  if (bossHealth <= 0) {
    victory(this);
  }
}

function updateHealthBar() {
  healthBar.clear();
  const healthPercent = bossHealth / maxBossHealth;
  const barWidth = 200 * healthPercent;
  
  // 根据血量改变颜色
  let color = 0x00ff00; // 绿色
  if (healthPercent < 0.3) {
    color = 0xff0000; // 红色
  } else if (healthPercent < 0.6) {
    color = 0xffaa00; // 橙色
  }
  
  healthBar.fillStyle(color, 1);
  healthBar.fillRect(300, 50, barWidth, 20);
}

function victory(scene) {
  gameOver = true;
  
  // 停止Boss移动
  boss.setVelocity(0, 0);
  
  // 停止所有子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
  
  // 显示胜利文本
  victoryText.setVisible(true);
  
  // 胜利文本缩放动画
  scene.tweens.add({
    targets: victoryText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 500,
    yoyo: true,
    repeat: -1
  });
  
  // Boss淡出效果
  scene.tweens.add({
    targets: boss,
    alpha: 0,
    duration: 1000
  });
  
  console.log('Victory! Boss defeated!');
}

const game = new Phaser.Game(config);