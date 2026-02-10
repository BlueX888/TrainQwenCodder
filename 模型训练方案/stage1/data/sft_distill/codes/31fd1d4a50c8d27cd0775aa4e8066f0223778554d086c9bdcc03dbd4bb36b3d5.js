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
let lastFired = 0;
let bossHealth = 8;
let maxBossHealth = 8;
let healthText;
let healthBar;
let healthBarBg;
let gameOver = false;
let victoryText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建Boss纹理（黄色圆形）
  const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bossGraphics.fillStyle(0xf1c40f, 1);
  bossGraphics.fillCircle(50, 50, 50);
  bossGraphics.lineStyle(4, 0xe67e22, 1);
  bossGraphics.strokeCircle(50, 50, 50);
  bossGraphics.generateTexture('boss', 100, 100);
  bossGraphics.destroy();

  // 创建子弹纹理（红色小圆）
  const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bulletGraphics.fillStyle(0xe74c3c, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setVelocity(150, 0);
  boss.setBounce(1, 1);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建血量显示
  healthText = this.add.text(16, 16, `Boss HP: ${bossHealth}/${maxBossHealth}`, {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  });

  // 创建血量条背景
  healthBarBg = this.add.graphics();
  healthBarBg.fillStyle(0x555555, 1);
  healthBarBg.fillRect(300, 50, 200, 20);

  // 创建血量条
  healthBar = this.add.graphics();
  updateHealthBar.call(this);

  // 碰撞检测：子弹击中Boss
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 提示文字
  this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
    fontSize: '18px',
    fill: '#aaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
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

  // 发射子弹（每300ms一次）
  if (spaceKey.isDown && time > lastFired + 300) {
    fireBullet.call(this);
    lastFired = time;
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
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-80); // 子弹速度80
  }
}

function hitBoss(bullet, boss) {
  // 子弹消失
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);

  // Boss扣血
  bossHealth--;
  healthText.setText(`Boss HP: ${bossHealth}/${maxBossHealth}`);
  updateHealthBar.call(this);

  // Boss受击闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    if (boss.active) {
      boss.clearTint();
    }
  });

  // 检查Boss是否被击败
  if (bossHealth <= 0) {
    boss.setActive(false);
    boss.setVisible(false);
    showVictory.call(this);
  }
}

function updateHealthBar() {
  healthBar.clear();
  const healthPercent = bossHealth / maxBossHealth;
  const barWidth = 200 * healthPercent;
  
  // 根据血量变色
  let color = 0x2ecc71; // 绿色
  if (healthPercent < 0.5) {
    color = 0xf39c12; // 橙色
  }
  if (healthPercent < 0.25) {
    color = 0xe74c3c; // 红色
  }
  
  healthBar.fillStyle(color, 1);
  healthBar.fillRect(300, 50, barWidth, 20);
}

function showVictory() {
  gameOver = true;
  
  // 停止所有子弹
  bullets.children.entries.forEach(bullet => {
    bullet.setActive(false);
    bullet.setVisible(false);
  });

  // 显示胜利文字
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '72px',
    fill: '#f1c40f',
    fontFamily: 'Arial',
    fontStyle: 'bold',
    stroke: '#000',
    strokeThickness: 6
  }).setOrigin(0.5);

  // 胜利文字闪烁效果
  this.tweens.add({
    targets: victoryText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1
  });

  // 显示重新开始提示
  this.add.text(400, 400, 'Refresh to play again', {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

const game = new Phaser.Game(config);