// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  wave: 1,
  kills: 0,
  enemiesInWave: 3,
  enemiesAlive: 0,
  gameOver: false,
  playerHealth: 3,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;
    this.kills = 0;
    this.enemiesInWave = 3;
    this.enemiesSpawned = 0;
    this.playerHealth = 3;
    this.gameOver = false;
    this.spawnTimer = null;
    this.nextWaveTimer = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
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

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 80, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.updateUI();
    this.startWave();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击（200ms冷却）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shoot();
      this.lastFired = time;
    }

    // 清理出界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < -10 || bullet.y > 610)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理出界的敌人（算作逃脱）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.checkWaveComplete();
      }
    });

    // 检查波次是否完成
    if (this.enemiesSpawned >= this.enemiesInWave && 
        this.enemies.countActive(true) === 0 && 
        !this.nextWaveTimer) {
      this.prepareNextWave();
    }

    // 更新信号
    this.updateSignals();
  }

  startWave() {
    this.enemiesSpawned = 0;
    this.enemiesInWave = 3 + (this.wave - 1);
    const enemySpeed = 120 + (this.wave - 1) * 10;

    this.statusText.setText(`Wave ${this.wave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    this.logEvent('wave_start', { wave: this.wave, enemyCount: this.enemiesInWave, speed: enemySpeed });

    // 每隔1秒生成一个敌人
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.enemiesSpawned < this.enemiesInWave) {
          this.spawnEnemy(enemySpeed);
          this.enemiesSpawned++;
        } else {
          this.spawnTimer.remove();
        }
      },
      loop: true
    });

    this.updateUI();
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(speed);
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.kills++;
    this.logEvent('enemy_killed', { kills: this.kills, wave: this.wave });
    this.updateUI();
    this.checkWaveComplete();
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.playerHealth--;
    this.logEvent('player_hit', { health: this.playerHealth });
    
    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    this.updateUI();

    if (this.playerHealth <= 0) {
      this.endGame();
    }
  }

  checkWaveComplete() {
    // 在 update 中处理
  }

  prepareNextWave() {
    this.statusText.setText('Wave Complete! Next wave in 3s...');
    this.logEvent('wave_complete', { wave: this.wave, kills: this.kills });

    this.nextWaveTimer = this.time.delayedCall(3000, () => {
      this.wave++;
      this.nextWaveTimer = null;
      this.startWave();
    });
  }

  endGame() {
    this.gameOver = true;
    this.statusText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);
    
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    if (this.nextWaveTimer) {
      this.nextWaveTimer.remove();
    }

    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    this.player.setTint(0x888888);

    this.logEvent('game_over', { wave: this.wave, kills: this.kills });
    this.updateSignals();
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave} (${this.enemiesSpawned}/${this.enemiesInWave})`);
    this.killsText.setText(`Kills: ${this.kills}`);
    this.healthText.setText(`Health: ${this.playerHealth}`);
  }

  updateSignals() {
    window.__signals__.wave = this.wave;
    window.__signals__.kills = this.kills;
    window.__signals__.enemiesInWave = this.enemiesInWave;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.playerHealth = this.playerHealth;
  }

  logEvent(type, data) {
    const log = {
      timestamp: Date.now(),
      type: type,
      data: data
    };
    window.__signals__.logs.push(log);
    console.log('[GameLog]', JSON.stringify(log));
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
  scene: GameScene
};

new Phaser.Game(config);