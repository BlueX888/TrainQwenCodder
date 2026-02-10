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
let bossHealth = 8;
let bossMaxHealth = 8;
let healthText;
let healthBar;
let healthBarBg;
let victoryText;
let gameOver = false;
let lastFired = 0;
let bossDirection = 1;

function preload() {
  // 使用 Graphics 创建纹理，不需要外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 30);
  playerGraphics.generateTexture('player', 40, 30);
  playerGraphics.destroy();

  // 创建Boss纹理
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xff8800, 1);
  bossGraphics.fillRect(0, 0, 120, 80);
  bossGraphics.generateTexture('boss', 120, 80);
  bossGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillRect(0, 0, 8, 20);
  bulletGraphics.generateTexture('bullet', 8, 20);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 520, 'player');
  player.setCollideWorldBounds(true);

  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setVelocityX(150);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 创建输入控制
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建Boss血量条背景
  healthBarBg = this.add.graphics();
  healthBarBg.fillStyle(0x666666, 1);
  healthBarBg.fillRect(290, 20, 220, 30);

  // 创建Boss血量条
  healthBar = this.add.graphics();
  updateHealthBar.call(this);

  // 创建血量文本
  healthText = this.add.text(400, 35, `Boss HP: ${bossHealth}/${bossMaxHealth}`, {
    fontSize: '20px',
    fill: '#ffffff',
    fontStyle: 'bold'
  });
  healthText.setOrigin(0.5);

  // 创建碰撞检测
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 添加提示文本
  this.add.text(400, 570, 'Arrow Keys: Move | Space: Shoot', {
    fontSize: '16px',
    fill: '#888888'
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

  // 发射子弹（冷却时间250ms）
  if (spaceKey.isDown && time > lastFired + 250) {
    fireBullet.call(this);
    lastFired = time;
  }

  // Boss左右移动
  if (boss.x <= 60) {
    boss.setVelocityX(150);
    bossDirection = 1;
  } else if (boss.x >= 740) {
    boss.setVelocityX(-150);
    bossDirection = -1;
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -20) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
}

function fireBullet() {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-360); // 子弹速度360
  }
}

function hitBoss(bullet, boss) {
  // 销毁子弹
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);

  // Boss扣血
  bossHealth--;
  
  // 更新血量显示
  healthText.setText(`Boss HP: ${bossHealth}/${bossMaxHealth}`);
  updateHealthBar.call(this);

  // Boss闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    if (boss.active) {
      boss.clearTint();
    }
  });

  // 检查是否击败Boss
  if (bossHealth <= 0) {
    winGame.call(this);
  }
}

function updateHealthBar() {
  healthBar.clear();
  
  // 根据血量比例显示不同颜色
  let color;
  const healthRatio = bossHealth / bossMaxHealth;
  if (healthRatio > 0.6) {
    color = 0x00ff00; // 绿色
  } else if (healthRatio > 0.3) {
    color = 0xffaa00; // 橙色
  } else {
    color = 0xff0000; // 红色
  }
  
  healthBar.fillStyle(color, 1);
  const barWidth = 220 * (bossHealth / bossMaxHealth);
  healthBar.fillRect(290, 20, barWidth, 30);
}

function winGame() {
  gameOver = true;
  
  // Boss爆炸效果
  boss.setVelocity(0, 0);
  
  // 创建爆炸粒子效果
  for (let i = 0; i < 20; i++) {
    const particle = this.add.graphics();
    particle.fillStyle(0xff8800, 1);
    particle.fillCircle(0, 0, 5);
    particle.x = boss.x;
    particle.y = boss.y;
    
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 100 + Math.random() * 100;
    
    this.tweens.add({
      targets: particle,
      x: boss.x + Math.cos(angle) * speed,
      y: boss.y + Math.sin(angle) * speed,
      alpha: 0,
      duration: 1000,
      onComplete: () => particle.destroy()
    });
  }
  
  boss.destroy();
  
  // 显示胜利文本
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#ffff00',
    fontStyle: 'bold',
    stroke: '#ff0000',
    strokeThickness: 6
  });
  victoryText.setOrigin(0.5);
  
  // 胜利文本闪烁动画
  this.tweens.add({
    targets: victoryText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 500,
    yoyo: true,
    repeat: -1
  });
  
  // 停止所有子弹
  bullets.children.entries.forEach(bullet => {
    bullet.setVelocity(0, 0);
  });
  
  // 显示重玩提示
  this.add.text(400, 400, 'Refresh to play again', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  console.log('Game Over - Victory! Boss defeated with 0 health remaining.');
}

const game = new Phaser.Game(config);