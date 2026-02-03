class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 0;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.baseEnemySpeed = 360;
    this.baseEnemyCount = 3;
    this.isWaveActive = false;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
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

    // 设置碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

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

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
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

  createTextures() {
    // 玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 12);
    bulletGraphics.generateTexture('bullet', 4, 12);
    bulletGraphics.destroy();
  }

  startNextWave() {
    this.wave++;
    this.isWaveActive = true;
    
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;
    this.enemiesRemaining = enemyCount;

    this.statusText.setText(`Wave ${this.wave} Starting!`);
    
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
      this.spawnWave(enemyCount, enemySpeed);
    });

    this.updateUI();
  }

  spawnWave(count, speed) {
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(speed);
      });
    }
  }

  spawnEnemy(speed) {
    // 使用伪随机生成位置
    const x = this.seededRandom() * 760 + 20;
    const enemy = this.enemies.create(x, -32, 'enemy');
    enemy.setVelocityY(speed);
    enemy.speed = speed;
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.killCount++;
    this.enemiesRemaining--;

    this.updateUI();

    // 检查是否清空当前波次
    if (this.enemiesRemaining === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete!');
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  playerHit(player, enemy) {
    // 玩家被击中，游戏重置
    enemy.destroy();
    this.resetGame();
  }

  resetGame() {
    this.statusText.setText('Game Over! Restarting...');
    this.physics.pause();
    
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-600);
    }
  }

  seededRandom() {
    // 简单的伪随机数生成器
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  update(time, delta) {
    if (!this.physics.world.isPaused) {
      // 玩家移动
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-400);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(400);
      } else {
        this.player.setVelocityX(0);
      }

      // 射击
      if (this.spaceKey.isDown && time > this.lastFired + 200) {
        this.fireBullet();
        this.lastFired = time;
      }

      // 清理超出屏幕的子弹
      this.bullets.children.entries.forEach(bullet => {
        if (bullet.active && bullet.y < -20) {
          bullet.destroy();
        }
      });

      // 清理超出屏幕的敌人（视为逃脱）
      this.enemies.children.entries.forEach(enemy => {
        if (enemy.active && enemy.y > 620) {
          enemy.destroy();
          this.enemiesRemaining--;
          this.updateUI();

          // 检查波次完成
          if (this.enemiesRemaining === 0 && this.isWaveActive) {
            this.isWaveActive = false;
            this.statusText.setText('Wave Complete!');
            this.time.delayedCall(2000, () => {
              this.startNextWave();
            });
          }
        }
      });

      // 敌人追踪玩家（简单AI）
      this.enemies.children.entries.forEach(enemy => {
        if (enemy.active) {
          const dx = this.player.x - enemy.x;
          enemy.setVelocityX(dx * 0.5);
          enemy.setVelocityY(enemy.speed);
        }
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
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