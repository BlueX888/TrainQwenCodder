// 无尽模式波次游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.baseEnemySpeed = 240;
    this.enemiesPerWave = 3;
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
    this.signals = [];
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
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesRemaining: 0,
      playerAlive: true,
      events: []
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
      maxSize: 30
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 80, 'Enemies: 0', {
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }

    // 敌人移动逻辑（追踪玩家）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesRemaining === 0) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete!\nNext wave in 2s...');
      this.logSignal('wave_complete', { wave: this.wave, kills: this.kills });
      
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  startNextWave() {
    this.wave++;
    this.isWaveActive = true;
    
    // 计算本波敌人数量和速度
    const enemyCount = this.enemiesPerWave + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;
    
    this.enemiesRemaining = enemyCount;
    
    // 更新UI
    this.waveText.setText(`Wave: ${this.wave}`);
    this.enemiesText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 更新信号
    window.__signals__.wave = this.wave;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    
    this.logSignal('wave_start', {
      wave: this.wave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed
    });

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    // 随机从屏幕边缘生成
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上
        x = Phaser.Math.Between(0, 800);
        y = -32;
        break;
      case 1: // 右
        x = 832;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下
        x = Phaser.Math.Between(0, 800);
        y = 632;
        break;
      case 3: // 左
        x = -32;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemies.get(x, y, 'enemy');
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setData('speed', speed);
      enemy.body.setSize(28, 28);
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-500);
      
      // 子弹出界销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
        }
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

    // 更新统计
    this.kills++;
    this.enemiesRemaining--;

    this.killsText.setText(`Kills: ${this.kills}`);
    this.enemiesText.setText(`Enemies: ${this.enemiesRemaining}`);

    // 更新信号
    window.__signals__.kills = this.kills;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;

    this.logSignal('enemy_killed', {
      wave: this.wave,
      kills: this.kills,
      remaining: this.enemiesRemaining
    });
  }

  hitPlayer(player, enemy) {
    // 游戏结束
    player.setActive(false);
    player.setVisible(false);

    this.isWaveActive = false;
    this.statusText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);

    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      if (e.active) {
        e.body.setVelocity(0);
      }
    });

    // 更新信号
    window.__signals__.playerAlive = false;
    this.logSignal('game_over', {
      wave: this.wave,
      kills: this.kills,
      finalScore: this.kills * 10 + this.wave * 100
    });

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  logSignal(event, data) {
    const signal = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    window.__signals__.events.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
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

// 输出初始信号
console.log('[GAME_START]', JSON.stringify({
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height,
    baseEnemySpeed: 240,
    enemiesPerWave: 3
  }
}));