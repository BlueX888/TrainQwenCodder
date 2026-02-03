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

// 状态变量
let killCount = 0;
let explosionCount = 0;
let player;
let enemies;
let bullets;
let particleEmitter;
let cursors;
let spaceKey;
let lastFired = 0;
let statusText;

function preload() {
  // 创建青色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00FFFF, 1); // 青色
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00FF00, 1); // 绿色
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xFFFF00, 1); // 黄色
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建粒子纹理（红色小方块）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xFF0000, 1); // 红色
  particleGraphics.fillRect(0, 0, 4, 4);
  particleGraphics.generateTexture('particle', 4, 4);
  particleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 生成3个青色敌人
  for (let i = 0; i < 3; i++) {
    const enemy = enemies.create(150 + i * 250, 100, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(20, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10
  });

  // 创建粒子发射器（初始状态关闭）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 4000, // 持续4秒
    gravityY: 50,
    quantity: 20, // 每次爆炸20个粒子
    frequency: -1, // 手动触发
    emitting: false
  });

  // 碰撞检测：子弹击中敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  updateStatusText();

  // 提示文本
  this.add.text(16, 550, '方向键移动 | 空格发射子弹击杀青色敌人', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 玩家移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (spaceKey.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-300);
      lastFired = time + 200; // 发射间隔200ms
    }
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < 0) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  updateStatusText();
}

function hitEnemy(bullet, enemy) {
  // 子弹消失
  bullet.setActive(false);
  bullet.setVisible(false);

  // 触发粒子爆炸效果
  particleEmitter.setPosition(enemy.x, enemy.y);
  particleEmitter.explode(20); // 发射20个粒子

  // 敌人消失
  enemy.destroy();

  // 更新状态
  killCount++;
  explosionCount++;

  // 如果所有敌人都被消灭，重新生成
  if (enemies.countActive() === 0) {
    setTimeout(() => {
      respawnEnemies(this.scene.scene);
    }, 2000);
  }
}

function respawnEnemies(scene) {
  for (let i = 0; i < 3; i++) {
    const enemy = enemies.create(150 + i * 250, 100, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(20, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }
}

function updateStatusText() {
  statusText.setText([
    `击杀数: ${killCount}`,
    `粒子爆炸次数: ${explosionCount}`,
    `剩余敌人: ${enemies.countActive()}`
  ]);
}

new Phaser.Game(config);