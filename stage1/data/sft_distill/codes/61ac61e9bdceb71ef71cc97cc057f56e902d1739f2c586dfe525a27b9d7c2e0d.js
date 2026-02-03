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

// 可验证的游戏状态
let gameState = {
  bossHealth: 8,
  gameWon: false,
  bulletsFired: 0
};

let player;
let boss;
let bullets;
let cursors;
let fireKey;
let lastFired = 0;
let bossHealthBar;
let bossHealthBarBg;
let bossHealthText;
let victoryText;

function preload() {
  // 创建玩家纹理（蓝色三角形飞船）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(16, 0);
  playerGraphics.lineTo(0, 32);
  playerGraphics.lineTo(32, 32);
  playerGraphics.closePath();
  playerGraphics.fillPath();
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建Boss纹理（橙色大方块）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xff8800, 1);
  bossGraphics.fillRect(0, 0, 80, 80);
  bossGraphics.lineStyle(3, 0xff4400, 1);
  bossGraphics.strokeRect(0, 0, 80, 80);
  bossGraphics.generateTexture('boss', 80, 80);
  bossGraphics.destroy();

  // 创建子弹纹理（黄色小圆点）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建Boss
  boss = this.physics.add.sprite(400, 150, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setBounce(1, 1);
  boss.setVelocity(100, 80);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Boss血条背景
  bossHealthBarBg = this.add.graphics();
  bossHealthBarBg.fillStyle(0x333333, 1);
  bossHealthBarBg.fillRect(300, 30, 200, 20);

  // Boss血条
  bossHealthBar = this.add.graphics();
  updateHealthBar.call(this);

  // Boss血量文本
  bossHealthText = this.add.text(400, 60, `Boss HP: ${gameState.bossHealth}/8`, {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  bossHealthText.setOrigin(0.5);

  // 胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 碰撞检测：子弹击中Boss
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);

  // 提示文本
  this.add.text(400, 580, 'Arrow Keys: Move | Space: Fire', {
    fontSize: '16px',
    fill: '#888888',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update(time, delta) {
  if (gameState.gameWon) {
    return; // 游戏结束，停止更新
  }

  // 玩家移动
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  // 发射子弹（限制射速：每200ms一发）
  if (fireKey.isDown && time > lastFired + 200) {
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
  // 子弹击中Boss
  bullet.setActive(false);
  bullet.setVisible(false);

  // 扣血
  gameState.bossHealth--;
  
  // 更新血条和文本
  updateHealthBar.call(this);
  bossHealthText.setText(`Boss HP: ${gameState.bossHealth}/8`);

  // Boss受击闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    boss.clearTint();
  });

  // 检查Boss是否被击败
  if (gameState.bossHealth <= 0) {
    winGame.call(this);
  }
}

function updateHealthBar() {
  bossHealthBar.clear();
  
  // 根据血量比例绘制血条
  const healthPercent = gameState.bossHealth / 8;
  const barWidth = 200 * healthPercent;
  
  // 血条颜色随血量变化
  let color = 0x00ff00; // 绿色
  if (healthPercent < 0.5) {
    color = 0xffaa00; // 橙色
  }
  if (healthPercent < 0.25) {
    color = 0xff0000; // 红色
  }
  
  bossHealthBar.fillStyle(color, 1);
  bossHealthBar.fillRect(300, 30, barWidth, 20);
}

function winGame() {
  gameState.gameWon = true;
  
  // 显示胜利文本
  victoryText.setVisible(true);
  
  // Boss爆炸效果（缩放动画）
  this.tweens.add({
    targets: boss,
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    angle: 360,
    duration: 500,
    ease: 'Power2'
  });
  
  // 停止Boss移动
  boss.setVelocity(0, 0);
  
  // 停止所有子弹
  bullets.children.entries.forEach(bullet => {
    bullet.setVelocity(0, 0);
  });
  
  // 输出游戏状态（用于验证）
  console.log('Game State:', gameState);
  console.log('Victory! Boss defeated!');
  console.log(`Total bullets fired: ${gameState.bulletsFired}`);
}

// 启动游戏
const game = new Phaser.Game(config);