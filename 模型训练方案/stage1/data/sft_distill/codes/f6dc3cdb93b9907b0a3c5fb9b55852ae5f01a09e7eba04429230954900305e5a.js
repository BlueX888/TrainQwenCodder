// 无尽波次游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.waveActive = false;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.waveText = null;
    this.killText = null;
    this.statusText = null;
  }

  preload() {
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
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      enemiesSpawned: 0,
      waveActive: false,
      logs: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => {
      this.shootBullet();
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy,
      null,
      this
    );

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
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
    this.time.delayedCall(1000, () => {
      this.startNextWave();
    });

    this.logSignal('Game started');
  }

  startNextWave() {
    this.currentWave++;
    this.enemiesInWave = 3 + (this.currentWave - 1);
    this.enemiesSpawned = 0;
    this.waveActive = true;

    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    
    this.logSignal(`Wave ${this.currentWave} started with ${this.enemiesInWave} enemies`);

    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
      this.spawnWaveEnemies();
    });

    this.updateSignals();
  }

  spawnWaveEnemies() {
    const enemySpeed = 120 + (this.currentWave - 1) * 10;
    const spawnInterval = 800;

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (this.enemiesSpawned < this.enemiesInWave) {
          this.spawnEnemy(enemySpeed);
          this.enemiesSpawned++;
        } else {
          spawnTimer.destroy();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -32, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.setSize(28, 28);
      enemy.setVelocityY(speed);
      
      this.logSignal(`Enemy spawned at (${x}, -32) with speed ${speed}`);
      this.updateSignals();
    }
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      bullet.body.setSize(8, 8);
    }
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.stop();

    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);
    
    this.logSignal(`Enemy killed at (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`);

    this.checkWaveComplete();
    this.updateSignals();
  }

  playerHitEnemy(player, enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.stop();

    this.logSignal('Player hit by enemy - enemy removed');
    this.checkWaveComplete();
    this.updateSignals();
  }

  checkWaveComplete() {
    const activeEnemies = this.enemies.getChildren().filter(e => e.active).length;
    
    if (this.waveActive && this.enemiesSpawned >= this.enemiesInWave && activeEnemies === 0) {
      this.waveActive = false;
      this.statusText.setText('Wave Complete!');
      
      this.logSignal(`Wave ${this.currentWave} completed`);
      
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.getChildren().forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        this.checkWaveComplete();
      }
    });

    // 定期更新信号
    if (Math.floor(time / 1000) % 2 === 0 && time % 1000 < delta) {
      this.updateSignals();
    }
  }

  updateSignals() {
    const activeEnemies = this.enemies.getChildren().filter(e => e.active).length;
    
    window.__signals__.wave = this.currentWave;
    window.__signals__.kills = this.killCount;
    window.__signals__.enemiesAlive = activeEnemies;
    window.__signals__.enemiesSpawned = this.enemiesSpawned;
    window.__signals__.waveActive = this.waveActive;
  }

  logSignal(message) {
    const log = {
      time: Date.now(),
      message: message,
      wave: this.currentWave,
      kills: this.killCount
    };
    
    window.__signals__.logs.push(log);
    console.log(`[Wave ${this.currentWave}] ${message}`);
    
    // 保持日志数组在合理大小
    if (window.__signals__.logs.length > 100) {
      window.__signals__.logs.shift();
    }
  }
}

// 游戏配置
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
  scene: EndlessWaveScene
};

// 启动游戏
const game = new Phaser.Game(config);