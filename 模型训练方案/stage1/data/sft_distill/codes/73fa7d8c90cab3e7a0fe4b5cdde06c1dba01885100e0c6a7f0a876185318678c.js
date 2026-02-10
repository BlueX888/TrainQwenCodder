class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.isSpawningWave = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
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
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化可验证信号
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      playerAlive: true,
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
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
    this.startNextWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

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
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + 200;
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查波次是否完成
    if (!this.isSpawningWave && this.enemies.countActive(true) === 0 && this.enemiesInWave > 0) {
      this.completeWave();
    }

    // 更新信号
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 记录击杀事件
    window.__signals__.kills = this.killCount;
    window.__signals__.events.push({
      type: 'enemy_killed',
      wave: this.currentWave,
      totalKills: this.killCount,
      time: this.time.now
    });
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    player.setActive(false);
    player.setVisible(false);

    this.statusText.setText('GAME OVER\nWave: ' + this.currentWave + '\nKills: ' + this.killCount);
    
    window.__signals__.playerAlive = false;
    window.__signals__.events.push({
      type: 'game_over',
      wave: this.currentWave,
      kills: this.killCount,
      time: this.time.now
    });

    this.physics.pause();
  }

  startNextWave() {
    this.isSpawningWave = true;
    this.currentWave++;
    
    // 计算波次参数
    const enemyCount = 3 + (this.currentWave - 1);
    const enemySpeed = 120 + (this.currentWave - 1) * 10;
    
    this.enemiesInWave = enemyCount;
    this.waveText.setText('Wave: ' + this.currentWave);

    // 显示波次开始提示
    this.statusText.setText('Wave ' + this.currentWave + ' Starting...');
    
    // 记录波次开始事件
    window.__signals__.wave = this.currentWave;
    window.__signals__.events.push({
      type: 'wave_start',
      wave: this.currentWave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      time: this.time.now
    });

    // 延迟生成敌人
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
      this.spawnEnemies(enemyCount, enemySpeed);
      this.isSpawningWave = false;
    });
  }

  spawnEnemies(count, speed) {
    const spacing = 700 / (count + 1);
    
    for (let i = 0; i < count; i++) {
      const x = 50 + spacing * (i + 1);
      const y = -50 - i * 80; // 错开生成位置
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        speed
      );

      // 让敌人在屏幕内反弹
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  completeWave() {
    window.__signals__.events.push({
      type: 'wave_complete',
      wave: this.currentWave,
      time: this.time.now
    });

    // 短暂延迟后开始下一波
    this.time.delayedCall(1500, () => {
      this.startNextWave();
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

const game = new Phaser.Game(config);