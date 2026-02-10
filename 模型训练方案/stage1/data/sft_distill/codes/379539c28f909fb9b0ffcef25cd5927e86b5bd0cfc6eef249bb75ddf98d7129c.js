class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 可验证状态信号
    this.currentWave = 1;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.baseEnemyCount = 12;
    this.baseEnemySpeed = 240;
    this.isSpawning = false;
    this.seed = 12345; // 固定随机种子
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
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 46, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 76, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
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
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
    }
  }

  startWave() {
    if (this.isSpawning) return;
    
    this.isSpawning = true;
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    
    this.enemiesRemaining = enemyCount;

    // 使用固定种子的伪随机数生成器
    let spawnDelay = 0;
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
      spawnDelay += 500; // 每0.5秒生成一个敌人
    }

    this.time.delayedCall(spawnDelay + 100, () => {
      this.isSpawning = false;
    });
  }

  spawnEnemy(speed) {
    // 使用种子生成伪随机位置
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const randomX = 50 + (this.seed / 233280) * 700;

    const enemy = this.enemies.create(randomX, -30, 'enemy');
    enemy.setVelocityY(speed);
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining--;
    
    this.checkWaveComplete();
  }

  playerHit(player, enemy) {
    enemy.destroy();
    this.enemiesRemaining--;
    
    // 玩家受击效果（闪烁）
    this.player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this.player.clearTint();
    });
    
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    if (this.enemiesRemaining <= 0 && !this.isSpawning) {
      // 当前波次完成，延迟2秒开始下一波
      this.time.delayedCall(2000, () => {
        this.currentWave++;
        this.startWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
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