class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesAlive = 0;
    this.baseEnemySpeed = 240;
    this.waveDelay = 2000;
  }

  preload() {
    // 使用 Graphics 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(16, 32, 0, 0, 32, 0);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 12);
    bulletGraphics.generateTexture('bullet', 4, 12);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      enemiesInWave: 0,
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

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

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200;

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.enemiesInWave = 3 + (this.currentWave - 1);
    this.enemiesAlive = this.enemiesInWave;

    // 更新UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    // 显示波次提示
    this.statusText.setText(`Wave ${this.currentWave} - ${this.enemiesInWave} Enemies!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.enemiesInWave = this.enemiesInWave;
    window.__signals__.enemiesAlive = this.enemiesAlive;
    window.__signals__.events.push({
      type: 'wave_start',
      wave: this.currentWave,
      enemies: this.enemiesInWave,
      time: this.time.now
    });

    // 生成敌人
    this.spawnWaveEnemies();
  }

  spawnWaveEnemies() {
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 20;
    const spawnDelay = 500;

    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -32, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setVelocityY(speed);
      
      // 使用确定性的左右摆动
      const swayAmplitude = 50;
      const swayFrequency = 2000;
      
      this.tweens.add({
        targets: enemy,
        x: x + swayAmplitude,
        duration: swayFrequency / 2,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 更新击杀数
    this.killCount++;
    this.enemiesAlive--;
    this.killText.setText(`Kills: ${this.killCount}`);

    // 更新信号
    window.__signals__.kills = this.killCount;
    window.__signals__.enemiesAlive = this.enemiesAlive;
    window.__signals__.events.push({
      type: 'enemy_killed',
      wave: this.currentWave,
      totalKills: this.killCount,
      enemiesLeft: this.enemiesAlive,
      time: this.time.now
    });

    // 检查是否波次完成
    if (this.enemiesAlive <= 0) {
      this.waveComplete();
    }
  }

  playerHit(player, enemy) {
    // 敌人碰到玩家后消失
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;
    
    this.enemiesAlive--;
    window.__signals__.enemiesAlive = this.enemiesAlive;
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    window.__signals__.events.push({
      type: 'player_hit',
      wave: this.currentWave,
      time: this.time.now
    });

    if (this.enemiesAlive <= 0) {
      this.waveComplete();
    }
  }

  waveComplete() {
    this.statusText.setText(`Wave ${this.currentWave} Complete!`);
    this.statusText.setAlpha(1);
    
    window.__signals__.events.push({
      type: 'wave_complete',
      wave: this.currentWave,
      totalKills: this.killCount,
      time: this.time.now
    });

    // 延迟后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.startNextWave();
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-400);
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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.enable = false;
        this.enemiesAlive--;
        window.__signals__.enemiesAlive = this.enemiesAlive;
        
        if (this.enemiesAlive <= 0) {
          this.waveComplete();
        }
      }
    });
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);