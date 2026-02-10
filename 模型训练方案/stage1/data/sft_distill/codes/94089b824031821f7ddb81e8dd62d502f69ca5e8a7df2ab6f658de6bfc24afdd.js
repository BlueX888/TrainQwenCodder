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

let player;
let bullets;
let enemies;
let killCount = 0;
let killText;
let cursors;

// 初始化全局信号对象
window.__signals__ = {
  killCount: 0,
  gameActive: true,
  bulletsCreated: 0,
  enemiesCreated: 0
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（三角形飞船）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(16, 0);
  playerGraphics.lineTo(0, 32);
  playerGraphics.lineTo(32, 32);
  playerGraphics.closePath();
  playerGraphics.fillPath();
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建子弹纹理（小圆点）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建敌人纹理（红色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 创建敌人组
  enemies = this.physics.add.group();

  // 初始生成一些敌人
  for (let i = 0; i < 5; i++) {
    createEnemy.call(this);
  }

  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      shootBullet.call(this);
    }
  });

  // 键盘控制玩家移动
  cursors = this.input.keyboard.createCursorKeys();

  // 碰撞检测：子弹与敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 显示击杀数
  killText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  });

  // 定时生成新敌人
  this.time.addEvent({
    delay: 2000,
    callback: createEnemy,
    callbackScope: this,
    loop: true
  });

  console.log(JSON.stringify({
    event: 'game_started',
    timestamp: Date.now()
  }));
}

function update() {
  // 玩家移动控制
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

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active && bullet.y < -10) {
      bullet.destroy();
    }
  });

  // 清理超出屏幕的敌人
  enemies.children.entries.forEach((enemy) => {
    if (enemy.active && enemy.y > 610) {
      enemy.destroy();
    }
  });

  // 更新全局信号
  window.__signals__.gameActive = true;
}

function shootBullet() {
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.velocity.y = -300; // 子弹速度 300
    
    window.__signals__.bulletsCreated++;
    
    console.log(JSON.stringify({
      event: 'bullet_fired',
      position: { x: player.x, y: player.y },
      timestamp: Date.now()
    }));
  }
}

function createEnemy() {
  const x = Phaser.Math.Between(50, 750);
  const enemy = enemies.create(x, -30, 'enemy');
  enemy.setVelocityY(Phaser.Math.Between(50, 150));
  
  window.__signals__.enemiesCreated++;
  
  console.log(JSON.stringify({
    event: 'enemy_created',
    position: { x: x, y: -30 },
    timestamp: Date.now()
  }));
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.destroy();
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  killText.setText('Kills: ' + killCount);
  
  // 更新全局信号
  window.__signals__.killCount = killCount;
  
  console.log(JSON.stringify({
    event: 'enemy_killed',
    killCount: killCount,
    timestamp: Date.now()
  }));
  
  // 可选：添加击杀特效
  const explosion = this.add.graphics();
  explosion.fillStyle(0xffa500, 1);
  explosion.fillCircle(enemy.x, enemy.y, 20);
  
  this.tweens.add({
    targets: explosion,
    alpha: 0,
    scale: 2,
    duration: 300,
    onComplete: () => {
      explosion.destroy();
    }
  });
}

const game = new Phaser.Game(config);