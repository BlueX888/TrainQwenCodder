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

// 游戏状态变量（可验证）
let currentWave = 1;
let enemiesInWave = 3;
let enemiesAlive = 0;
let waveState = 'playing'; // 'playing', 'waiting', 'spawning'
let nextWaveTimer = null;

let player;
let enemies;
let bullets;
let cursors;
let fireKey;
let lastFired = 0;
let fireRate = 250;

let waveText;
let statusText;
let enemyCountText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色三角形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(16, 0);
  playerGraphics.lineTo(0, 32);
  playerGraphics.lineTo(32, 32);
  playerGraphics.closePath();
  playerGraphics.fill();
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });

  // 输入设置
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // UI文本
  waveText = this.add.text(16, 16, `Wave: ${currentWave}`, {
    fontSize: '24px',
    fill: '#ffffff'
  });

  enemyCountText = this.add.text(16, 48, `Enemies: ${enemiesAlive}/${enemiesInWave}`, {
    fontSize: '20px',
    fill: '#ffffff'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '32px',
    fill: '#ffff00'
  }).setOrigin(0.5);

  // 开始第一波
  spawnWave.call(this);
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

  // 射击
  if (fireKey.isDown && time > lastFired) {
    fireBullet.call(this);
    lastFired = time + fireRate;
  }

  // 更新敌人边界反弹
  enemies.children.entries.forEach(enemy => {
    if (enemy.x <= 16 || enemy.x >= 784) {
      enemy.velocityX *= -1;
      enemy.setVelocityX(enemy.velocityX);
    }
    if (enemy.y <= 16 || enemy.y >= 300) {
      enemy.velocityY *= -1;
      enemy.setVelocityY(enemy.velocityY);
    }
  });

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && (bullet.y < 0 || bullet.y > 600)) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 更新UI
  enemyCountText.setText(`Enemies: ${enemiesAlive}/${enemiesInWave}`);
}

function fireBullet() {
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400);
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.setActive(false);
  bullet.setVisible(false);
  
  enemy.destroy();
  enemiesAlive--;

  // 检查是否消灭所有敌人
  if (enemiesAlive === 0 && waveState === 'playing') {
    waveState = 'waiting';
    statusText.setText('Wave Complete!\nNext wave in 2 seconds...');
    
    // 2秒后进入下一波
    nextWaveTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        currentWave++;
        statusText.setText('');
        waveState = 'spawning';
        spawnWave.call(this);
      },
      callbackScope: this
    });
  }
}

function spawnWave() {
  waveState = 'playing';
  enemiesAlive = enemiesInWave;
  
  // 更新波次显示
  waveText.setText(`Wave: ${currentWave}`);
  
  // 生成3个敌人
  for (let i = 0; i < enemiesInWave; i++) {
    // 随机位置（上半部分区域）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 250);
    
    const enemy = enemies.create(x, y, 'enemy');
    
    // 随机移动方向，速度固定为80
    const angle = Phaser.Math.Between(0, 360);
    const speed = 80;
    
    enemy.velocityX = Math.cos(angle * Math.PI / 180) * speed;
    enemy.velocityY = Math.sin(angle * Math.PI / 180) * speed;
    
    enemy.setVelocity(enemy.velocityX, enemy.velocityY);
    enemy.setCollideWorldBounds(false);
  }
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentWave: () => currentWave,
    getEnemiesAlive: () => enemiesAlive,
    getWaveState: () => waveState
  };
}