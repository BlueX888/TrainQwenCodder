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

// 全局状态信号
window.__signals__ = {
  events: [],
  playerHealth: 3,
  bossHealth: 20,
  gameState: 'playing', // playing, win, lose
  score: 0,
  bossAttackCount: 0,
  playerHitCount: 0
};

function logSignal(event, data) {
  window.__signals__.events.push({
    timestamp: Date.now(),
    event: event,
    data: data
  });
  console.log(`[SIGNAL] ${event}:`, data);
}

let player;
let boss;
let playerBullets;
let bossBullets;
let cursors;
let spaceKey;
let bossAttackTimer;
let canShoot = true;
let shootCooldown = 300;
let playerHealthText;
let bossHealthText;
let gameOverText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建Boss纹理
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xff0000, 1);
  bossGraphics.fillRect(0, 0, 64, 64);
  bossGraphics.generateTexture('boss', 64, 64);
  bossGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  const bossBulletGraphics = this.add.graphics();
  bossBulletGraphics.fillStyle(0xff00ff, 1);
  bossBulletGraphics.fillCircle(6, 6, 6);
  bossBulletGraphics.generateTexture('bossBullet', 12, 12);
  bossBulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);
  player.health = 3;

  // 创建Boss
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.health = 20;
  boss.setVelocityX(100); // Boss左右移动

  // 创建子弹组
  playerBullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  bossBullets = this.physics.add.group({
    defaultKey: 'bossBullet',
    maxSize: 50
  });

  // 输入控制
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Boss攻击定时器 - 每1秒发射攻击
  bossAttackTimer = this.time.addEvent({
    delay: 1000,
    callback: bossAttack,
    callbackScope: this,
    loop: true
  });

  // 碰撞检测
  this.physics.add.overlap(playerBullets, boss, hitBoss, null, this);
  this.physics.add.overlap(bossBullets, player, hitPlayer, null, this);

  // UI文本
  playerHealthText = this.add.text(16, 16, 'Player HP: 3', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  bossHealthText = this.add.text(16, 46, 'Boss HP: 20', {
    fontSize: '20px',
    fill: '#ff0000'
  });

  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff'
  });
  gameOverText.setOrigin(0.5);

  logSignal('game_start', {
    playerHealth: player.health,
    bossHealth: boss.health
  });
}

function update(time, delta) {
  if (window.__signals__.gameState !== 'playing') {
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

  // 玩家射击
  if (spaceKey.isDown && canShoot) {
    shootPlayerBullet.call(this);
    canShoot = false;
    this.time.delayedCall(shootCooldown, () => {
      canShoot = true;
    });
  }

  // Boss左右移动
  if (boss.x <= 50 || boss.x >= 750) {
    boss.setVelocityX(-boss.body.velocity.x);
  }

  // 更新UI
  playerHealthText.setText('Player HP: ' + player.health);
  bossHealthText.setText('Boss HP: ' + boss.health);
  window.__signals__.playerHealth = player.health;
  window.__signals__.bossHealth = boss.health;
}

function shootPlayerBullet() {
  const bullet = playerBullets.get(player.x, player.y - 20);
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400);
    
    logSignal('player_shoot', {
      x: player.x,
      y: player.y
    });
  }
}

function bossAttack() {
  if (window.__signals__.gameState !== 'playing') {
    return;
  }

  window.__signals__.bossAttackCount++;

  // Boss发射3个子弹，形成扇形攻击
  const angles = [-30, 0, 30];
  angles.forEach(angle => {
    const bullet = bossBullets.get(boss.x, boss.y + 40);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      const rad = Phaser.Math.DegToRad(90 + angle);
      const speed = 200;
      bullet.setVelocity(
        Math.cos(rad) * speed,
        Math.sin(rad) * speed
      );
    }
  });

  logSignal('boss_attack', {
    attackCount: window.__signals__.bossAttackCount,
    bossX: boss.x,
    bossY: boss.y
  });
}

function hitBoss(bullet, bossSprite) {
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.destroy();

  boss.health--;
  window.__signals__.score += 10;

  logSignal('boss_hit', {
    bossHealth: boss.health,
    score: window.__signals__.score
  });

  // Boss闪烁效果
  this.tweens.add({
    targets: boss,
    alpha: 0.5,
    duration: 100,
    yoyo: true,
    repeat: 1
  });

  if (boss.health <= 0) {
    endGame.call(this, 'win');
  }
}

function hitPlayer(bullet, playerSprite) {
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.destroy();

  player.health--;
  window.__signals__.playerHitCount++;

  logSignal('player_hit', {
    playerHealth: player.health,
    hitCount: window.__signals__.playerHitCount
  });

  // 玩家闪烁效果
  this.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: 100,
    yoyo: true,
    repeat: 2
  });

  if (player.health <= 0) {
    endGame.call(this, 'lose');
  }
}

function endGame(result) {
  window.__signals__.gameState = result;
  
  // 停止所有移动
  player.setVelocity(0, 0);
  boss.setVelocity(0, 0);
  
  // 停止Boss攻击
  if (bossAttackTimer) {
    bossAttackTimer.remove();
  }

  // 清除所有子弹
  playerBullets.clear(true, true);
  bossBullets.clear(true, true);

  // 显示游戏结束文本
  if (result === 'win') {
    gameOverText.setText('YOU WIN!\nScore: ' + window.__signals__.score);
    gameOverText.setFill('#00ff00');
  } else {
    gameOverText.setText('GAME OVER\nScore: ' + window.__signals__.score);
    gameOverText.setFill('#ff0000');
  }

  logSignal('game_end', {
    result: result,
    score: window.__signals__.score,
    playerHealth: player.health,
    bossHealth: boss.health,
    bossAttackCount: window.__signals__.bossAttackCount,
    playerHitCount: window.__signals__.playerHitCount
  });

  console.log('=== GAME OVER ===');
  console.log('Final Signals:', JSON.stringify(window.__signals__, null, 2));
}

new Phaser.Game(config);