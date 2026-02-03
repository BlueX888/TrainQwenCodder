// 完整的 Phaser3 Boss战游戏
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

// 全局信号对象
window.__signals__ = {
  bossHealth: 15,
  bulletsFired: 0,
  bulletsHit: 0,
  gameWon: false,
  events: []
};

let player;
let boss;
let bullets;
let cursors;
let spaceKey;
let lastFired = 0;
let bossHealth = 15;
let healthText;
let gameOver = false;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色矩形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 30);
  playerGraphics.generateTexture('player', 40, 30);
  playerGraphics.destroy();

  // 创建Boss纹理（蓝色圆形）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0x0066ff, 1);
  bossGraphics.fillCircle(50, 50, 50);
  bossGraphics.generateTexture('boss', 100, 100);
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
  boss = this.physics.add.sprite(400, 100, 'boss');
  boss.setCollideWorldBounds(true);
  boss.setVelocityX(100); // Boss左右移动

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

  // 显示血量文本
  healthText = this.add.text(16, 16, `Boss Health: ${bossHealth}`, {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 添加说明文本
  this.add.text(16, 50, 'Arrow Keys: Move | Space: Shoot', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });

  // 记录游戏开始
  window.__signals__.events.push({
    type: 'game_start',
    time: Date.now()
  });
}

function update(time, delta) {
  if (gameOver) return;

  // 玩家移动控制
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

  // 发射子弹（冷却时间300ms）
  if (spaceKey.isDown && time > lastFired + 300) {
    fireBullet.call(this);
    lastFired = time;
  }

  // Boss左右移动边界反弹
  if (boss.x <= 50 || boss.x >= 750) {
    boss.setVelocityX(-boss.body.velocity.x);
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -10) {
      bullets.killAndHide(bullet);
    }
  });
}

function fireBullet() {
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-200); // 子弹速度200
    
    window.__signals__.bulletsFired++;
    window.__signals__.events.push({
      type: 'bullet_fired',
      time: Date.now(),
      position: { x: player.x, y: player.y }
    });
  }
}

function hitBoss(bullet, boss) {
  // 销毁子弹
  bullets.killAndHide(bullet);
  bullet.setActive(false);

  // 扣除血量
  bossHealth--;
  window.__signals__.bossHealth = bossHealth;
  window.__signals__.bulletsHit++;
  
  // 更新血量显示
  healthText.setText(`Boss Health: ${bossHealth}`);

  // Boss受伤闪烁效果
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    boss.clearTint();
  });

  // 记录命中事件
  window.__signals__.events.push({
    type: 'boss_hit',
    time: Date.now(),
    remainingHealth: bossHealth
  });

  // 检查是否胜利
  if (bossHealth <= 0) {
    victory.call(this);
  }
}

function victory() {
  gameOver = true;
  window.__signals__.gameWon = true;

  // 停止Boss移动
  boss.setVelocity(0, 0);
  boss.setTint(0x666666);

  // 停止玩家移动
  player.setVelocity(0, 0);

  // 清除所有子弹
  bullets.clear(true, true);

  // 显示胜利文本
  const victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);

  const statsText = this.add.text(400, 380, 
    `Bullets Fired: ${window.__signals__.bulletsFired}\n` +
    `Bullets Hit: ${window.__signals__.bulletsHit}\n` +
    `Accuracy: ${((window.__signals__.bulletsHit / window.__signals__.bulletsFired) * 100).toFixed(1)}%`,
    {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }
  );
  statsText.setOrigin(0.5);

  // 记录胜利事件
  window.__signals__.events.push({
    type: 'victory',
    time: Date.now(),
    stats: {
      bulletsFired: window.__signals__.bulletsFired,
      bulletsHit: window.__signals__.bulletsHit
    }
  });

  console.log('Game Won! Final signals:', JSON.stringify(window.__signals__, null, 2));
}

// 启动游戏
new Phaser.Game(config);