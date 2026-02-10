class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    
    // 可验证的状态信号
    this.currentWave = 1;
    this.enemiesKilled = 0;
    this.totalEnemiesSpawned = 0;
    this.isWaveActive = false;
    this.isWaitingForNextWave = false;
  }

  preload() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 15);
    playerGraphics.lineTo(15, 15);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#00ff00'
    });

    this.infoText = this.add.text(16, 80, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 射击冷却
    this.canShoot = true;
    this.shootDelay = 200;

    // 开始第一波
    this.startWave();
  }

  update(time, delta) {
    // 更新UI
    this.updateUI();

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, 160);
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && !this.isWaitingForNextWave) {
      const aliveEnemies = this.enemies.countActive(true);
      if (aliveEnemies === 0) {
        this.onWaveComplete();
      }
    }
  }

  startWave() {
    this.isWaveActive = true;
    this.isWaitingForNextWave = false;

    // 生成8个敌人
    const enemiesPerWave = 8;
    for (let i = 0; i < enemiesPerWave; i++) {
      this.spawnEnemy(i, enemiesPerWave);
    }

    this.totalEnemiesSpawned += enemiesPerWave;
  }

  spawnEnemy(index, total) {
    // 在顶部区域均匀分布敌人
    const spacing = 700 / (total + 1);
    const x = 50 + spacing * (index + 1);
    const y = 50;

    let enemy;
    const inactiveEnemy = this.enemies.getFirstDead(false);
    
    if (inactiveEnemy) {
      enemy = inactiveEnemy;
      enemy.setPosition(x, y);
      enemy.setActive(true);
      enemy.setVisible(true);
    } else {
      enemy = this.enemies.create(x, y, 'enemy');
    }

    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
  }

  shoot() {
    this.canShoot = false;

    let bullet;
    const inactiveBullet = this.bullets.getFirstDead(false);
    
    if (inactiveBullet) {
      bullet = inactiveBullet;
      bullet.setPosition(this.player.x, this.player.y - 20);
      bullet.setActive(true);
      bullet.setVisible(true);
    } else {
      bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    }

    bullet.setVelocityY(-400);

    // 子弹超出屏幕后回收
    this.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 射击冷却
    this.time.delayedCall(this.shootDelay, () => {
      this.canShoot = true;
    });
  }

  hitEnemy(bullet, enemy) {
    // 回收子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.setActive(false);
    enemy.setVisible(false);

    // 更新统计
    this.enemiesKilled++;
  }

  onWaveComplete() {
    this.isWaitingForNextWave = true;
    
    // 2秒后开始下一波
    this.time.delayedCall(2000, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    const aliveEnemies = this.enemies.countActive(true);
    this.statusText.setText(`Enemies: ${aliveEnemies}/8 | Killed: ${this.enemiesKilled}`);

    if (this.isWaitingForNextWave) {
      this.infoText.setText('Wave Complete! Next wave in 2 seconds...');
    } else {
      this.infoText.setText('Use Arrow Keys to move, SPACE to shoot');
    }
  }
}

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
  scene: WaveSpawnerScene
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemiesKilled: scene.enemiesKilled,
    totalEnemiesSpawned: scene.totalEnemiesSpawned,
    isWaveActive: scene.isWaveActive,
    isWaitingForNextWave: scene.isWaitingForNextWave,
    aliveEnemies: scene.enemies.countActive(true)
  };
};