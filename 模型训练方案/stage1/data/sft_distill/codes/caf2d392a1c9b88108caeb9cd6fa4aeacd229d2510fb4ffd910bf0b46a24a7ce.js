class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesRemaining = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 120;
    this.isWaveActive = false;
    
    // 随机种子（可配置）
    this.seed = 12345;
    this.rng = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(0, 20, -15, -20, 15, -20);
    enemyGraphics.generateTexture('enemy', 30, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;

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

    this.enemyCountText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.checkWaveComplete();
      }
    });

    // 更新UI
    this.updateUI();

    // 检查波次完成
    if (this.isWaveActive && this.enemiesRemaining <= 0) {
      this.checkWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.enemiesInWave = this.baseEnemyCount + (this.currentWave - 1);
    this.enemiesRemaining = this.enemiesInWave;
    this.isWaveActive = true;

    // 显示波次开始信息
    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });

    // 生成敌人
    this.spawnWave();
  }

  spawnWave() {
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 5;
    const spawnDelay = 500;

    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    const x = this.rng.between(30, 770);
    const enemy = this.enemies.get(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.setCollideWorldBounds(false);
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining--;
    
    // 粒子效果
    this.createExplosion(enemy.x, enemy.y);
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesRemaining--;
    
    // 游戏结束
    this.gameOver();
  }

  createExplosion(x, y) {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff6600, 1);
      graphics.fillCircle(x, y, 3);
      
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 100;
      
      this.tweens.add({
        targets: graphics,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 300,
        onComplete: () => graphics.destroy()
      });
    }
  }

  checkWaveComplete() {
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      
      this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 3...`);
      this.statusText.setAlpha(1);
      
      let countdown = 3;
      const countdownTimer = this.time.addEvent({
        delay: 1000,
        repeat: 2,
        callback: () => {
          countdown--;
          if (countdown > 0) {
            this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in ${countdown}...`);
          }
        }
      });
      
      this.time.delayedCall(3000, () => {
        this.startNextWave();
      });
    }
  }

  gameOver() {
    this.isWaveActive = false;
    this.player.setActive(false);
    this.player.setVisible(false);
    
    this.statusText.setText(`GAME OVER!\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.statusText.setAlpha(1);
    this.statusText.setFontSize('36px');
    
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.setVelocity(0);
      }
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
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