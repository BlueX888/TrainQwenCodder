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

// 游戏状态变量
let player;
let enemies;
let bullets;
let cursors;
let fireKey;
let lastFired = 0;
let currentWave = 0;
let totalKills = 0;
let isWaveActive = false;
let waveText;
let statusText;
let nextWaveTimer = null;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x808080, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小方块）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillRect(0, 0, 8, 8);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group({
    defaultKey: 'enemy',
    maxSize: 20
  });

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 创建UI文本
  waveText = this.add.text(16, 16, 'Wave: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statusText = this.add.text(16, 50, 'Enemies: 0 | Kills: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 开始第一波
  startNextWave.call(this);
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

  // 发射子弹
  if (fireKey.isDown && time > lastFired + 200) {
    const bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      lastFired = time;
    }
  }

  // 清理超出屏幕的子弹
  bullets.children.each(bullet => {
    if (bullet.active && bullet.y < -10) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 清理超出屏幕的敌人
  enemies.children.each(enemy => {
    if (enemy.active && enemy.y > 610) {
      enemy.setActive(false);
      enemy.setVisible(false);
      enemy.destroy();
    }
  });

  // 更新状态文本
  const activeEnemies = enemies.countActive(true);
  statusText.setText(`Enemies: ${activeEnemies} | Kills: ${totalKills}`);

  // 检查波次是否完成
  if (isWaveActive && activeEnemies === 0) {
    isWaveActive = false;
    // 2秒后开始下一波
    if (!nextWaveTimer) {
      nextWaveTimer = this.time.addEvent({
        delay: 2000,
        callback: startNextWave,
        callbackScope: this,
        loop: false
      });
    }
  }
}

function startNextWave() {
  currentWave++;
  isWaveActive = true;
  nextWaveTimer = null;
  
  waveText.setText(`Wave: ${currentWave}`);
  
  // 生成8个敌人
  spawnWave.call(this, 8);
}

function spawnWave(count) {
  const spacing = 700 / (count + 1);
  
  for (let i = 0; i < count; i++) {
    // 在顶部随机位置生成敌人
    const x = 50 + spacing * (i + 1);
    const y = -30 - (i * 40); // 错开生成时间
    
    const enemy = enemies.get(x, y);
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(80); // 敌人速度80
      enemy.setCollideWorldBounds(false);
    }
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹
  bullet.setActive(false);
  bullet.setVisible(false);
  
  // 销毁敌人
  enemy.setActive(false);
  enemy.setVisible(false);
  enemy.destroy();
  
  // 增加击杀数
  totalKills++;
  
  // 创建简单的爆炸效果
  const explosion = this.add.graphics();
  explosion.fillStyle(0xff0000, 0.8);
  explosion.fillCircle(enemy.x, enemy.y, 15);
  
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

// 启动游戏
const game = new Phaser.Game(config);