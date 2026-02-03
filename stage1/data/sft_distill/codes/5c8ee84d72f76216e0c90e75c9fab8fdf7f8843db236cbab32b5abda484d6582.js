class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 15;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesKilled = 0;
    this.totalEnemiesSpawned = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      currentWave: 0,
      enemiesKilled: 0,
      totalEnemiesSpawned: 0,
      activeEnemies: 0,
      isWaveActive: false,
      waveHistory: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200;

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '36px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -20) {
        bullet.destroy();
      }
    });

    // 更新敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
        this.checkWaveComplete();
      }
    });

    // 更新UI
    this.updateUI();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.enemiesKilled = 0;
    this.totalEnemiesSpawned = 0;

    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    
    // 记录波次开始
    window.__signals__.waveHistory.push({
      wave: this.currentWave,
      startTime: Date.now(),
      enemiesSpawned: this.enemiesPerWave
    });

    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
      this.spawnWave();
    });

    this.updateSignals();
  }

  spawnWave() {
    const spawnInterval = 300; // 每300ms生成一个敌人
    
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * spawnInterval, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    // 使用确定性随机（基于波次和生成序号）
    const seed = this.currentWave * 1000 + this.totalEnemiesSpawned;
    const x = 50 + (seed % 700); // 在50-750之间生成
    const y = -30;

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
    
    this.totalEnemiesSpawned++;
    this.updateSignals();

    console.log(JSON.stringify({
      event: 'enemy_spawned',
      wave: this.currentWave,
      enemyId: this.totalEnemiesSpawned,
      position: { x, y },
      timestamp: Date.now()
    }));
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.enemiesKilled++;

    console.log(JSON.stringify({
      event: 'enemy_killed',
      wave: this.currentWave,
      enemiesKilled: this.enemiesKilled,
      remaining: this.enemies.countActive(true),
      timestamp: Date.now()
    }));

    this.updateSignals();
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    const activeEnemies = this.enemies.countActive(true);
    
    if (this.isWaveActive && 
        this.totalEnemiesSpawned === this.enemiesPerWave && 
        activeEnemies === 0) {
      
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete!\nNext wave in 2 seconds...');

      // 记录波次完成
      const lastWave = window.__signals__.waveHistory[window.__signals__.waveHistory.length - 1];
      if (lastWave) {
        lastWave.endTime = Date.now();
        lastWave.duration = lastWave.endTime - lastWave.startTime;
        lastWave.enemiesKilled = this.enemiesKilled;
      }

      console.log(JSON.stringify({
        event: 'wave_complete',
        wave: this.currentWave,
        enemiesKilled: this.enemiesKilled,
        duration: lastWave ? lastWave.duration : 0,
        timestamp: Date.now()
      }));

      this.updateSignals();

      // 2秒后开始下一波
      this.time.delayedCall(this.waveDelay, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    const activeEnemies = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}/${this.enemiesPerWave}`);
  }

  updateSignals() {
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.enemiesKilled = this.enemiesKilled;
    window.__signals__.totalEnemiesSpawned = this.totalEnemiesSpawned;
    window.__signals__.activeEnemies = this.enemies.countActive(true);
    window.__signals__.isWaveActive = this.isWaveActive;
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

const game = new Phaser.Game(config);