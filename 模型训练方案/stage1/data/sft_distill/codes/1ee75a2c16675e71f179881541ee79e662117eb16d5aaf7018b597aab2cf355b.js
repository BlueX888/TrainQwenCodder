class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    
    // 可验证的状态信号
    this.currentWave = 1;
    this.enemiesKilled = 0;
    this.totalEnemiesSpawned = 0;
    this.isWaveActive = false;
    this.isWaitingForNextWave = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（红色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(16, 84, 'WASD/方向键移动，空格射击', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 开始第一波
    this.startWave();
  }

  update(time, delta) {
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
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
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
        enemy.destroy();
      }
    });

    // 检查波次完成
    if (this.isWaveActive && !this.isWaitingForNextWave) {
      const activeEnemies = this.enemies.countActive(true);
      if (activeEnemies === 0 && this.totalEnemiesSpawned === 15) {
        this.onWaveComplete();
      }
    }

    // 更新UI
    this.updateUI();
  }

  startWave() {
    this.isWaveActive = true;
    this.isWaitingForNextWave = false;
    this.totalEnemiesSpawned = 0;
    this.enemiesKilled = 0;

    // 生成15个敌人
    const enemiesPerWave = 15;
    const spawnDelay = 300; // 每个敌人生成间隔300ms

    for (let i = 0; i < enemiesPerWave; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    // 随机X位置
    const x = Phaser.Math.Between(50, 750);
    const y = -32;

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocityY(200); // 敌人速度200
    this.totalEnemiesSpawned++;
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.enemiesKilled++;
  }

  onWaveComplete() {
    this.isWaitingForNextWave = true;
    this.isWaveActive = false;

    // 等待2秒后进入下一波
    this.time.delayedCall(2000, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`波次: ${this.currentWave}`);
    
    const activeEnemies = this.enemies.countActive(true);
    const status = this.isWaitingForNextWave 
      ? '等待下一波...' 
      : `敌人: ${activeEnemies}/15 | 击杀: ${this.enemiesKilled}`;
    
    this.statusText.setText(status);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态用于验证
game.getWaveInfo = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemiesKilled: scene.enemiesKilled,
    totalEnemiesSpawned: scene.totalEnemiesSpawned,
    isWaveActive: scene.isWaveActive,
    isWaitingForNextWave: scene.isWaitingForNextWave,
    activeEnemies: scene.enemies.countActive(true)
  };
};