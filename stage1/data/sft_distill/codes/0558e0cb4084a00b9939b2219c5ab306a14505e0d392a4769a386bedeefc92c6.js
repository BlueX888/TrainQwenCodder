class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证的状态信号）
    this.currentWave = 1;
    this.killCount = 0;
    this.playerHealth = 3;
    this.baseEnemySpeed = 300;
    this.enemiesPerWave = 8;
    this.enemiesLeftInWave = 0;
    this.isGameOver = false;
    
    // 随机种子（确保行为可复现）
    this.randomSeed = 12345;
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
    // 初始化随机数生成器
    Phaser.Math.RND.sow([this.randomSeed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.currentWave}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, `Kills: ${this.killCount}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 80, `Health: ${this.playerHealth}`, {
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
    this.startWave();
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 移除超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.destroy();
        this.enemiesLeftInWave--;
        this.checkWaveComplete();
      }
    });

    // 检查波次是否完成
    if (this.enemiesLeftInWave === 0 && this.enemies.countActive() === 0) {
      this.checkWaveComplete();
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  startWave() {
    // 计算当前波次的敌人数量和速度
    const enemyCount = this.enemiesPerWave + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 20;
    
    this.enemiesLeftInWave = enemyCount;

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 生成敌人（分批生成，避免一次性全部出现）
    let spawnedCount = 0;
    const spawnInterval = 500; // 每0.5秒生成一个

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < enemyCount) {
          this.spawnEnemy(enemySpeed);
          spawnedCount++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const y = -30;
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocityY(speed);
    
    // 添加轻微的水平移动
    const horizontalSpeed = Phaser.Math.Between(-50, 50);
    enemy.setVelocityX(horizontalSpeed);
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();
    
    this.killCount++;
    this.enemiesLeftInWave--;
    
    this.killText.setText(`Kills: ${this.killCount}`);
    
    // 创建击中特效
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff8800, 1);
    explosion.fillCircle(enemy.x, enemy.y, 15);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }

  enemyHitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesLeftInWave--;
    
    this.playerHealth--;
    this.healthText.setText(`Health: ${this.playerHealth}`);
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  checkWaveComplete() {
    if (this.enemiesLeftInWave === 0 && this.enemies.countActive() === 0 && !this.isGameOver) {
      // 当前波次完成，准备下一波
      this.currentWave++;
      this.waveText.setText(`Wave: ${this.currentWave}`);
      
      // 延迟2秒开始下一波
      this.time.delayedCall(2000, () => {
        if (!this.isGameOver) {
          this.startWave();
        }
      });
    }
  }

  gameOver() {
    this.isGameOver = true;
    
    this.statusText.setText(`GAME OVER\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.statusText.setAlpha(1);
    this.statusText.setFontSize('36px');
    
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.setVelocity(0);
      }
    });
    
    // 隐藏玩家
    this.player.setVisible(false);
    
    // 输出最终状态到控制台（用于验证）
    console.log('=== GAME OVER ===');
    console.log('Final Wave:', this.currentWave);
    console.log('Total Kills:', this.killCount);
    console.log('Final Health:', this.playerHealth);
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