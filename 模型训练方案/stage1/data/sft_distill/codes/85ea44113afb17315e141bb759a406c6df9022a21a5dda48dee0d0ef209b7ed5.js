// 完整的 Phaser3 射击游戏代码
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
  },
  backgroundColor: '#2d2d2d'
};

// 全局状态信号
window.__signals__ = {
  killCount: 0,
  bulletsShot: 0,
  enemiesSpawned: 0,
  gameReady: false
};

let player;
let enemies;
let bullets;
let killCountText;
let killCount = 0;
let cursors;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 创建敌人组
  enemies = this.physics.add.group({
    defaultKey: 'enemy'
  });

  // 生成初始敌人
  spawnEnemies.call(this, 8);

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    shootBullet.call(this, pointer);
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示击杀数
  killCountText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加说明文字
  this.add.text(16, 50, 'Click to shoot enemies!', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  // 标记游戏准备完成
  window.__signals__.gameReady = true;
  console.log(JSON.stringify({
    event: 'gameReady',
    enemiesSpawned: window.__signals__.enemiesSpawned,
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

  // 移除超出边界的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
      bullet.destroy();
    }
  });

  // 敌人随机移动
  enemies.children.entries.forEach((enemy) => {
    if (enemy.active) {
      // 简单的随机移动
      if (Math.random() < 0.02) {
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(-50, 50)
        );
      }
    }
  });
}

// 生成敌人
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 300);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    
    window.__signals__.enemiesSpawned++;
  }

  console.log(JSON.stringify({
    event: 'enemiesSpawned',
    count: count,
    total: window.__signals__.enemiesSpawned,
    timestamp: Date.now()
  }));
}

// 发射子弹
function shootBullet(pointer) {
  const bullet = bullets.get(player.x, player.y, 'bullet');
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算子弹方向（从玩家指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );
    
    // 设置子弹速度（速度为 200）
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    
    bullet.setVelocity(velocityX, velocityY);
    
    window.__signals__.bulletsShot++;
    
    console.log(JSON.stringify({
      event: 'bulletShot',
      position: { x: player.x, y: player.y },
      target: { x: pointer.x, y: pointer.y },
      totalShots: window.__signals__.bulletsShot,
      timestamp: Date.now()
    }));
  }
}

// 子弹击中敌人
function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.destroy();
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  window.__signals__.killCount = killCount;
  
  // 更新显示
  killCountText.setText('Kills: ' + killCount);
  
  // 输出日志
  console.log(JSON.stringify({
    event: 'enemyKilled',
    killCount: killCount,
    remainingEnemies: enemies.countActive(true),
    timestamp: Date.now()
  }));
  
  // 如果所有敌人被消灭，生成新一波
  if (enemies.countActive(true) === 0) {
    console.log(JSON.stringify({
      event: 'waveCleared',
      killCount: killCount,
      timestamp: Date.now()
    }));
    
    // 延迟生成新敌人
    this.time.delayedCall(1000, () => {
      spawnEnemies.call(this, 8);
    });
  }
}

// 启动游戏
new Phaser.Game(config);