class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemyCount = 5;
    this.baseEnemySpeed = 80;
    this.enemiesRemaining = 0;
    this.isSpawning = false;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 敌人纹理 - 红色圆形
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 子弹纹理 - 黄色小圆
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI文本
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

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
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

  startNextWave() {
    if (this.isSpawning) return;

    this.currentWave++;
    this.isSpawning = true;

    // 计算本波敌人数量和速度
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    this.enemiesRemaining = enemyCount;

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });

    // 更新UI
    this.updateUI();

    // 生成敌人
    this.spawnEnemies(enemyCount, enemySpeed);
  }

  spawnEnemies(count, speed) {
    let spawned = 0;
    const spawnInterval = 500; // 每0.5秒生成一个敌人

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawned < count) {
          this.spawnEnemy(speed);
          spawned++;
        } else {
          spawnTimer.remove();
          this.isSpawning = false;
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    // 随机从顶部生成
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -30, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      
      // 设置敌人移动
      const angle = Phaser.Math.Between(-30, 30); // 向下偏移角度
      this.physics.velocityFromAngle(90 + angle, speed, enemy.body.velocity);
      
      // 存储速度用于后续
      enemy.setData('speed', speed);
    }
  }

  bulletHitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.destroy();
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否清空本波
    if (this.enemiesRemaining <= 0 && !this.isSpawning) {
      this.onWaveComplete();
    }
  }

  playerHitEnemy(player, enemy) {
    // 玩家碰撞敌人也算击杀
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否清空本波
    if (this.enemiesRemaining <= 0 && !this.isSpawning) {
      this.onWaveComplete();
    }
  }

  onWaveComplete() {
    this.statusText.setText(`Wave ${this.currentWave} Complete!`);
    
    // 3秒后开始下一波
    this.time.delayedCall(3000, () => {
      this.startNextWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  fireBullet() {
    const now = this.time.now;
    if (now - this.lastFireTime < 200) return; // 射击冷却

    this.lastFireTime = now;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-400);
    }
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

    // 清理超出屏幕的敌人和子弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 650) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();

        if (this.enemiesRemaining <= 0 && !this.isSpawning) {
          this.onWaveComplete();
        }
      }
    });

    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
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

const game = new Phaser.Game(config);

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    killCount: scene.killCount,
    enemiesRemaining: scene.enemiesRemaining,
    isSpawning: scene.isSpawning,
    enemyCount: scene.enemies.countActive(true),
    bulletCount: scene.bullets.countActive(true)
  };
};