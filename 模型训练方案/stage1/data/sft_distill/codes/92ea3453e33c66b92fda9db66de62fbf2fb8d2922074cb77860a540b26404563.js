class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 0;
    this.kills = 0;
    this.baseEnemySpeed = 200;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色三角形
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(32, 32);
    playerGraphics.lineTo(0, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理 - 红色圆形
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理 - 黄色小圆
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
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 游戏状态
    this.gameOver = false;

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    if (this.gameOver) return;

    this.wave++;
    this.isWaveActive = true;
    
    const enemyCount = 5 + (this.wave - 1);
    this.enemiesRemaining = enemyCount;
    
    // 计算当前波次敌人速度
    const currentSpeed = this.baseEnemySpeed + (this.wave - 1) * 20;

    this.updateUI();

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.wave} Start!`);
    this.statusText.setAlpha(1);
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(currentSpeed);
      });
    }
  }

  spawnEnemy(speed) {
    if (this.gameOver) return;

    // 随机从顶部生成
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -32, 'enemy');
    
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      speed
    );
    
    enemy.setCollideWorldBounds(false);
    enemy.enemySpeed = speed;
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    this.kills++;
    this.enemiesRemaining--;
    
    this.updateUI();

    // 检查波次是否完成
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  playerHitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.isWaveActive = false;

    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });

    // 显示游戏结束
    this.statusText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);
    this.statusText.setAlpha(1);
    this.statusText.setFontSize('28px');

    // 重启提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(400, 400, 'Press SPACE to Restart', {
        fontSize: '20px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    });
  }

  completeWave() {
    this.isWaveActive = false;

    this.statusText.setText(`Wave ${this.wave} Complete!`);
    this.statusText.setAlpha(1);
    this.statusText.setFontSize('32px');

    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 3秒后开始下一波
    this.time.delayedCall(3000, () => {
      this.startNextWave();
    });
  }

  shoot() {
    if (!this.canShoot || this.gameOver) return;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.killsText.setText(`Kills: ${this.kills}`);
    this.enemiesText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  update(time, delta) {
    if (this.gameOver) return;

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

    // 射击
    if (this.spaceKey.isDown) {
      this.shoot();
    }

    // 清理越界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理越界的敌人（逃脱）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();
        
        // 检查波次是否完成
        if (this.enemiesRemaining <= 0 && this.isWaveActive) {
          this.completeWave();
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
  scene: GameScene
};

new Phaser.Game(config);