class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 80;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesRemaining: 0,
      playerAlive: true,
      waveLog: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 200; // 射击间隔

    // 创建UI文本
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

    this.enemyCountText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 更新敌人移动（追踪玩家）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 检查波次是否完成
    if (this.enemiesRemaining === 0 && this.enemies.countActive(true) === 0 && !this.waitingForNextWave) {
      this.onWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 5;
    
    this.enemiesRemaining = enemyCount;
    this.waitingForNextWave = false;

    // 更新UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    this.statusText.setText(`Wave ${this.currentWave} Start!`);

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.waveLog.push({
      wave: this.currentWave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      timestamp: Date.now()
    });

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_start',
      wave: this.currentWave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed
    }));

    // 隐藏状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    this.spawnEnemies(enemyCount, enemySpeed);
  }

  spawnEnemies(count, speed) {
    const spawnDelay = 500; // 每个敌人生成间隔

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        const side = Phaser.Math.Between(0, 3); // 0=上, 1=右, 2=下, 3=左
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
          enemy.setData('speed', speed);
          enemy.body.enable = true;
        }
      });
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
        }
      });
    }
  }

  bulletHitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 更新击杀数
    this.killCount++;
    this.enemiesRemaining--;
    
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);

    // 更新信号
    window.__signals__.kills = this.killCount;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;

    // 日志输出
    console.log(JSON.stringify({
      event: 'enemy_killed',
      wave: this.currentWave,
      totalKills: this.killCount,
      remaining: this.enemiesRemaining
    }));
  }

  enemyHitPlayer(player, enemy) {
    // 游戏结束
    player.setActive(false);
    player.setVisible(false);
    
    this.statusText.setText(`Game Over!\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.statusText.setFontSize('48px');

    // 更新信号
    window.__signals__.playerAlive = false;

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_over',
      wave: this.currentWave,
      kills: this.killCount,
      finalScore: this.killCount
    }));

    // 停止游戏逻辑
    this.physics.pause();
  }

  onWaveComplete() {
    this.waitingForNextWave = true;
    
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 3 seconds...`);

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_complete',
      wave: this.currentWave,
      totalKills: this.killCount
    }));

    // 3秒后开始下一波
    this.time.delayedCall(3000, () => {
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

new Phaser.Game(config);