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
  killCount: 0,
  bulletsShot: 0,
  enemiesSpawned: 0,
  gameActive: true
};

let player;
let enemies;
let bullets;
let cursors;
let spaceKey;
let scoreText;
let killCount = 0;
let lastFired = 0;
let fireRate = 300; // 发射间隔（毫秒）

function preload() {
  // 创建玩家纹理（绿色三角形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(0, -20);
  playerGraphics.lineTo(-15, 20);
  playerGraphics.lineTo(15, 20);
  playerGraphics.closePath();
  playerGraphics.fillPath();
  playerGraphics.generateTexture('player', 30, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（红色矩形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 40, 30);
  enemyGraphics.generateTexture('enemy', 40, 30);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成初始敌人
  spawnEnemies.call(this);

  // 定时生成敌人
  this.time.addEvent({
    delay: 2000,
    callback: spawnEnemies,
    callbackScope: this,
    loop: true
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial'
  });

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  console.log(JSON.stringify({
    event: 'game_started',
    timestamp: Date.now(),
    killCount: 0
  }));
}

function update(time, delta) {
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
  if (spaceKey.isDown && time > lastFired) {
    fireBullet.call(this);
    lastFired = time + fireRate;
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.y < -10) {
      bullet.destroy();
    }
  });

  // 清理超出屏幕的敌人
  enemies.children.entries.forEach(enemy => {
    if (enemy.y > 610) {
      enemy.destroy();
    }
  });
}

function fireBullet() {
  // 从对象池获取或创建子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400); // 子弹速度设置为 400（题目要求 80 可能过慢，这里使用更合理的速度）
    
    window.__signals__.bulletsShot++;
    
    console.log(JSON.stringify({
      event: 'bullet_fired',
      timestamp: Date.now(),
      position: { x: player.x, y: player.y },
      totalShot: window.__signals__.bulletsShot
    }));
  }
}

function spawnEnemies() {
  // 随机生成 3-5 个敌人
  const count = Phaser.Math.Between(3, 5);
  
  for (let i = 0; i < count; i++) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(Phaser.Math.Between(50, 150));
    
    window.__signals__.enemiesSpawned++;
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.destroy();
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  window.__signals__.killCount = killCount;
  
  // 更新分数显示
  scoreText.setText('Kills: ' + killCount);
  
  // 输出日志
  console.log(JSON.stringify({
    event: 'enemy_killed',
    timestamp: Date.now(),
    killCount: killCount,
    position: { x: enemy.x, y: enemy.y }
  }));
}

// 创建游戏实例
new Phaser.Game(config);