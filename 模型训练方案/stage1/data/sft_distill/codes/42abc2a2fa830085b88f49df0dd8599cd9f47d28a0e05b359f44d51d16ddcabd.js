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

// 全局状态变量（用于验证）
let gameState = {
  bossHealth: 15,
  gameWon: false,
  bulletsFired: 0,
  bulletsHit: 0
};

let player;
let boss;
let bullets;
let cursors;
let spaceKey;
let lastFired = 0;
let bossDirection = 1;
let healthText;
let victoryText;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 创建玩家纹理（蓝色矩形）
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 40, 30);
  graphics.generateTexture('player', 40, 30);
  graphics.clear();
  
  // 创建Boss纹理（红色大矩形）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('boss', 120, 80);
  graphics.clear();
  
  // 创建子弹纹理（黄色小矩形）
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 6, 15);
  graphics.generateTexture('bullet', 6, 15);
  graphics.destroy();
  
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setVelocityX(150);
  
  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });
  
  // 设置碰撞检测
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);
  
  // 输入控制
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // UI文本
  healthText = this.add.text(16, 16, 'Boss HP: 15/15', {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  });
  
  // 血量条背景
  const healthBarBg = this.add.graphics();
  healthBarBg.fillStyle(0x333333, 1);
  healthBarBg.fillRect(290, 50, 220, 20);
  
  // 血量条
  this.healthBar = this.add.graphics();
  updateHealthBar.call(this);
  
  // 胜利文字（初始隐藏）
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);
  
  // 添加说明文字
  this.add.text(16, 560, 'Arrow Keys: Move | Space: Shoot', {
    fontSize: '18px',
    fill: '#888',
    fontFamily: 'Arial'
  });
}

function update(time, delta) {
  if (gameState.gameWon) {
    return; // 游戏胜利后停止更新
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
    gameState.bulletsFired++;
  }
}

function hitBoss(bullet, boss) {
  // 子弹命中Boss
  bullet.setActive(false);
  bullet.setVisible(false);
  
  // 扣血
  gameState.bossHealth--;
  gameState.bulletsHit++;
  
  // 更新UI
  healthText.setText(`Boss HP: ${gameState.bossHealth}/15`);
  updateHealthBar.call(this);
  
  // Boss闪烁效果
  boss.setTint(0xffffff);
  this.time.delayedCall(100, () => {
    if (boss.active) {
      boss.clearTint();
    }
  });
  
  // 检查是否胜利
  if (gameState.bossHealth <= 0) {
    winGame.call(this);
  }
}

function updateHealthBar() {
  this.healthBar.clear();
  const healthPercent = gameState.bossHealth / 15;
  const barWidth = 220 * healthPercent;
  
  // 根据血量显示不同颜色
  let color = 0x00ff00; // 绿色
  if (healthPercent < 0.3) {
    color = 0xff0000; // 红色
  } else if (healthPercent < 0.6) {
    color = 0xffaa00; // 橙色
  }
  
  this.healthBar.fillStyle(color, 1);
  this.healthBar.fillRect(290, 50, barWidth, 20);
}

function winGame() {
  gameState.gameWon = true;
  
  // 停止Boss移动
  boss.setVelocity(0, 0);
  
  // Boss爆炸效果（缩放并淡出）
  this.tweens.add({
    targets: boss,
    scaleX: 2,
    scaleY: 2,
    alpha: 0,
    duration: 500,
    onComplete: () => {
      boss.destroy();
    }
  });
  
  // 显示胜利文字
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
    bullet.setVelocity(0, 0);
  });
  
  // 输出统计信息
  console.log('=== GAME WON ===');
  console.log(`Bullets Fired: ${gameState.bulletsFired}`);
  console.log(`Bullets Hit: ${gameState.bulletsHit}`);
  console.log(`Accuracy: ${((gameState.bulletsHit / gameState.bulletsFired) * 100).toFixed(1)}%`);
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, game };
}