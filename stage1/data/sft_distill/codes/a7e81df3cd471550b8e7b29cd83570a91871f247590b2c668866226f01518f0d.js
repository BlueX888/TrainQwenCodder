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

let boss;
let bullets;
let bossHealth = 8;
let maxBossHealth = 8;
let healthText;
let healthBar;
let healthBarBg;
let victoryText;
let gameOver = false;

function preload() {
  // 创建Boss纹理（黄色方块）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xFFFF00, 1);
  bossGraphics.fillRect(0, 0, 80, 80);
  bossGraphics.generateTexture('boss', 80, 80);
  bossGraphics.destroy();

  // 创建子弹纹理（红色圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xFF0000, 1);
  bulletGraphics.fillCircle(8, 8, 8);
  bulletGraphics.generateTexture('bullet', 16, 16);
  bulletGraphics.destroy();

  // 创建玩家纹理（蓝色三角形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000FF, 1);
  playerGraphics.fillTriangle(20, 0, 0, 40, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();
}

function create() {
  // 创建Boss
  boss = this.physics.add.sprite(400, 150, 'boss');
  boss.setCollideWorldBounds(true);
  
  // Boss简单移动模式（左右移动）
  this.tweens.add({
    targets: boss,
    x: 600,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 创建玩家（底部中央）
  const player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 点击发射子弹
  this.input.on('pointerdown', (pointer) => {
    if (!gameOver) {
      shootBullet.call(this, player, pointer);
    }
  });

  // 碰撞检测：子弹击中Boss
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 创建UI
  healthText = this.add.text(16, 16, `Boss HP: ${bossHealth}/${maxBossHealth}`, {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  });

  // 血量条背景
  healthBarBg = this.add.graphics();
  healthBarBg.fillStyle(0x666666, 1);
  healthBarBg.fillRect(300, 50, 200, 20);

  // 血量条
  healthBar = this.add.graphics();
  updateHealthBar();

  // 胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#FFD700',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 提示文本
  this.add.text(400, 580, 'Click to shoot bullets at the Boss!', {
    fontSize: '18px',
    fill: '#aaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -50) {
      bullet.destroy();
    }
  });
}

function shootBullet(player, pointer) {
  // 从玩家位置发射子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算子弹方向（朝向点击位置）
    const angle = Phaser.Math.Angle.Between(
      player.x, 
      player.y, 
      pointer.x, 
      pointer.y
    );
    
    // 设置子弹速度（速度80）
    this.physics.velocityFromRotation(angle, 400, bullet.body.velocity);
    
    // 如果只想垂直向上发射，使用以下代码替代上面两行：
    // bullet.body.setVelocityY(-400);
  }
}

function hitBoss(bullet, boss) {
  if (gameOver) return;

  // 销毁子弹
  bullet.destroy();

  // Boss扣血
  bossHealth--;
  
  // 更新UI
  healthText.setText(`Boss HP: ${bossHealth}/${maxBossHealth}`);
  updateHealthBar();

  // Boss受击闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    if (boss.active) {
      boss.clearTint();
    }
  });

  // 检查Boss是否死亡
  if (bossHealth <= 0) {
    defeatBoss.call(this);
  }
}

function updateHealthBar() {
  healthBar.clear();
  
  // 根据血量百分比绘制血量条
  const healthPercent = bossHealth / maxBossHealth;
  const barWidth = 200 * healthPercent;
  
  // 血量颜色：绿->黄->红
  let color;
  if (healthPercent > 0.5) {
    color = 0x00FF00;
  } else if (healthPercent > 0.25) {
    color = 0xFFFF00;
  } else {
    color = 0xFF0000;
  }
  
  healthBar.fillStyle(color, 1);
  healthBar.fillRect(300, 50, barWidth, 20);
}

function defeatBoss() {
  gameOver = true;
  
  // Boss爆炸效果
  boss.setTint(0xffffff);
  
  this.tweens.add({
    targets: boss,
    alpha: 0,
    scale: 2,
    duration: 500,
    onComplete: () => {
      boss.destroy();
    }
  });

  // 显示胜利文本
  victoryText.setVisible(true);
  victoryText.setScale(0);
  
  this.tweens.add({
    targets: victoryText,
    scale: 1,
    duration: 500,
    ease: 'Back.easeOut'
  });

  // 停止所有子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      bullet.body.setVelocity(0, 0);
    }
  });

  // 更新血量显示
  healthText.setText(`Boss HP: 0/${maxBossHealth}`);
  healthBar.clear();
}

const game = new Phaser.Game(config);