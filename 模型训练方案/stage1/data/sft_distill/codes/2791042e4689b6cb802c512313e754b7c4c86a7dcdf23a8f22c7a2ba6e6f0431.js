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
let enemies;
let bullets;
let cursors;
let scoreText;
let killCount = 0;
let lastFireTime = 0;
const fireDelay = 250; // 发射间隔，避免连续发射

// 暴露信号用于验证
window.__signals__ = {
  killCount: 0,
  bulletsFired: 0,
  enemiesActive: 0
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 生成初始敌人
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    // 确保敌人不在玩家附近生成
    if (Phaser.Math.Distance.Between(x, y, player.x, player.y) > 100) {
      const enemy = enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 更新信号
  updateSignals();

  console.log(JSON.stringify({
    event: 'game_started',
    playerPosition: { x: player.x, y: player.y },
    enemyCount: enemies.getChildren().length
  }));
}

function update(time, delta) {
  // 玩家移动
  const speed = 200;
  player.setVelocity(0);

  // 检测方向键并发射子弹
  const currentTime = time;
  
  if (cursors.left.isDown) {
    if (currentTime - lastFireTime > fireDelay) {
      fireBullet(this, -1, 0);
      lastFireTime = currentTime;
    }
  }
  
  if (cursors.right.isDown) {
    if (currentTime - lastFireTime > fireDelay) {
      fireBullet(this, 1, 0);
      lastFireTime = currentTime;
    }
  }
  
  if (cursors.up.isDown) {
    if (currentTime - lastFireTime > fireDelay) {
      fireBullet(this, 0, -1);
      lastFireTime = currentTime;
    }
  }
  
  if (cursors.down.isDown) {
    if (currentTime - lastFireTime > fireDelay) {
      fireBullet(this, 0, 1);
      lastFireTime = currentTime;
    }
  }

  // 清理超出边界的子弹
  bullets.getChildren().forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
        bullet.destroy();
      }
    }
  });

  // 更新信号
  updateSignals();
}

function fireBullet(scene, dirX, dirY) {
  const bullet = bullets.get(player.x, player.y, 'bullet');
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    
    // 设置子弹速度为 160
    bullet.setVelocity(dirX * 160, dirY * 160);
    
    window.__signals__.bulletsFired++;
    
    console.log(JSON.stringify({
      event: 'bullet_fired',
      direction: { x: dirX, y: dirY },
      position: { x: bullet.x, y: bullet.y },
      totalBullets: window.__signals__.bulletsFired
    }));
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.destroy();
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  scoreText.setText('Kills: ' + killCount);
  
  // 更新信号
  window.__signals__.killCount = killCount;
  updateSignals();
  
  console.log(JSON.stringify({
    event: 'enemy_killed',
    killCount: killCount,
    enemyPosition: { x: enemy.x, y: enemy.y },
    remainingEnemies: enemies.getChildren().length
  }));
  
  // 如果所有敌人都被击杀，生成新一波
  if (enemies.getChildren().length === 0) {
    console.log(JSON.stringify({
      event: 'wave_completed',
      totalKills: killCount
    }));
    
    // 生成新一波敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      if (Phaser.Math.Distance.Between(x, y, player.x, player.y) > 100) {
        const newEnemy = enemies.create(x, y, 'enemy');
        newEnemy.setVelocity(
          Phaser.Math.Between(-70, 70),
          Phaser.Math.Between(-70, 70)
        );
        newEnemy.setBounce(1);
        newEnemy.setCollideWorldBounds(true);
      }
    }
  }
}

function updateSignals() {
  window.__signals__.enemiesActive = enemies.getChildren().length;
}

// 启动游戏
new Phaser.Game(config);