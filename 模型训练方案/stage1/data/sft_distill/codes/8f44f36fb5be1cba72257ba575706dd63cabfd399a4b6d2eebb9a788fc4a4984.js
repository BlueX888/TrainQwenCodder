class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesAlive = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 160;
    this.isSpawning = false;
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
    enemyGraphics.fillTriangle(0, 15, -12, -12, 12, -12);
    enemyGraphics.generateTexture('enemy', 24, 27);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
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
    this.lastFireTime = 0;
    this.fireDelay = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.enemiesText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    if (this.isSpawning) return;
    
    this.currentWave++;
    this.isSpawning = true;
    
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    
    this.updateUI();
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 分批生成敌人
    let spawnedCount = 0;
    const spawnInterval = 300;
    
    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < enemyCount) {
          this.spawnEnemy(enemySpeed);
          spawnedCount++;
        } else {
          spawnTimer.remove();
          this.isSpawning = false;
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(speed);
      this.enemiesAlive++;
      this.updateUI();
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    this.killCount++;
    this.enemiesAlive--;
    this.updateUI();

    // 创建爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff6600, 1);
    explosion.fillCircle(enemy.x, enemy.y, 15);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });

    // 检查是否清空当前波
    if (this.enemiesAlive === 0 && !this.isSpawning) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesAlive--;
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    this.updateUI();

    if (this.enemiesAlive === 0 && !this.isSpawning) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  fireBullet() {
    const currentTime = this.time.now;
    
    if (currentTime - this.lastFireTime < this.fireDelay) {
      return;
    }
    
    this.lastFireTime = currentTime;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemiesText.setText(`Enemies: ${this.enemiesAlive}`);
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

    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
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
        this.enemiesAlive--;
        this.updateUI();
        
        if (this.enemiesAlive === 0 && !this.isSpawning) {
          this.time.delayedCall(2000, () => {
            this.startNextWave();
          });
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