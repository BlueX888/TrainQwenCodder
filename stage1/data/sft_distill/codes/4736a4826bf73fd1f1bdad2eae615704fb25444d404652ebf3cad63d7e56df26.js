// 无尽模式波次游戏
class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证）
    this.currentWave = 1;
    this.killCount = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 120;
    this.enemiesInCurrentWave = 0;
    this.enemiesAlive = 0;
    this.isWaveActive = false;
    this.playerHealth = 100;
    this.gameOver = false;
    
    // 固定随机种子（确定性）
    this.seed = 12345;
  }

  // 简单的伪随机数生成器（确定性）
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建敌人纹理
    this.createEnemyTexture();
    
    // 创建子弹纹理
    this.createBulletTexture();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'playerTex');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 30
    });
    
    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );
    
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.enemyHitPlayer,
      null,
      this
    );
    
    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootDelay = 200;
    
    // UI 文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.killText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.healthText = this.add.text(16, 84, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // 开始第一波
    this.startWave();
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(16, 0, 0, 32, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('enemyTex', 32, 32);
    graphics.destroy();
  }

  createBulletTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 4, 10);
    graphics.generateTexture('bulletTex', 4, 10);
    graphics.destroy();
  }

  startWave() {
    if (this.gameOver) return;
    
    this.isWaveActive = true;
    this.enemiesInCurrentWave = this.baseEnemyCount + (this.currentWave - 1);
    this.enemiesAlive = this.enemiesInCurrentWave;
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setVisible(true);
    
    this.time.delayedCall(1500, () => {
      this.statusText.setVisible(false);
    });
    
    // 分批生成敌人
    const spawnInterval = 500;
    for (let i = 0; i < this.enemiesInCurrentWave; i++) {
      this.time.delayedCall(i * spawnInterval, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    if (this.gameOver) return;
    
    // 随机生成位置（屏幕上方）
    const x = this.seededRandom() * 760 + 20;
    const y = -30;
    
    const enemy = this.enemies.create(x, y, 'enemyTex');
    enemy.setCollideWorldBounds(false);
    
    // 速度随波次递增
    const speed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    enemy.setVelocityY(speed);
    
    // 添加左右摆动
    const sideSpeed = (this.seededRandom() - 0.5) * 100;
    enemy.setVelocityX(sideSpeed);
  }

  shoot() {
    if (!this.canShoot || this.gameOver) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.destroy();
    
    this.killCount++;
    this.enemiesAlive--;
    
    // 检查波次是否完成
    if (this.enemiesAlive <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  enemyHitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesAlive--;
    
    this.playerHealth -= 10;
    
    // 玩家受伤效果
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });
    
    if (this.playerHealth <= 0) {
      this.endGame();
    }
    
    // 检查波次是否完成
    if (this.enemiesAlive <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    
    this.statusText.setText(`Wave ${this.currentWave} Complete!`);
    this.statusText.setVisible(true);
    
    // 3秒后开始下一波
    this.time.delayedCall(3000, () => {
      this.statusText.setVisible(false);
      this.currentWave++;
      this.startWave();
    });
  }

  endGame() {
    this.gameOver = true;
    this.physics.pause();
    
    this.statusText.setText(`Game Over!\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.statusText.setVisible(true);
    this.statusText.setFontSize('28px');
  }

  update(time, delta) {
    if (this.gameOver) return;
    
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
      if (enemy.y > 610) {
        enemy.destroy();
        this.enemiesAlive--;
        
        // 敌人逃脱扣血
        this.playerHealth -= 5;
        if (this.playerHealth <= 0) {
          this.endGame();
        }
        
        // 检查波次是否完成
        if (this.enemiesAlive <= 0 && this.isWaveActive) {
          this.completeWave();
        }
      }
    });
    
    // 更新 UI
    this.waveText.setText(`Wave: ${this.currentWave} (${this.enemiesAlive}/${this.enemiesInCurrentWave})`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.healthText.setText(`Health: ${this.playerHealth}`);
  }
}

// 游戏配置
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
  scene: EndlessWaveScene
};

// 启动游戏
const game = new Phaser.Game(config);