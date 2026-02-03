// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 15;
    this.enemySpeed = 80;
    this.remainingEnemies = 0;
    this.isWaveActive = false;
    this.waveDelayTimer = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      wave: 0,
      remainingEnemies: 0,
      totalEnemiesKilled: 0,
      isWaveActive: false,
      isWaitingForNextWave: false
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测：子弹与敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, 'Enemies: 0', {
      fontSize: '20px',
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

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
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
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -20) {
        bullet.destroy();
      }
    });

    // 移除超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
        this.remainingEnemies--;
        this.updateUI();
        this.checkWaveComplete();
      }
    });
  }

  startNextWave() {
    this.currentWave++;
    this.remainingEnemies = this.enemiesPerWave;
    this.isWaveActive = true;

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.remainingEnemies = this.remainingEnemies;
    window.__signals__.isWaveActive = true;
    window.__signals__.isWaitingForNextWave = false;

    // 显示波次开始信息
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    this.spawnEnemies();

    this.updateUI();

    // 日志输出
    console.log(JSON.stringify({
      event: 'wave_start',
      wave: this.currentWave,
      enemies: this.enemiesPerWave,
      timestamp: Date.now()
    }));
  }

  spawnEnemies() {
    // 使用固定随机种子确保可重现性
    const seed = this.currentWave * 1000;
    
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用简单的伪随机算法
      const randomX = ((seed + i * 137) % 740) + 30;
      const randomY = -((i * 50) % 300) - 30;

      const enemy = this.enemies.create(randomX, randomY, 'enemy');
      enemy.setVelocityY(this.enemySpeed);
      
      // 添加轻微的水平移动
      const horizontalSpeed = ((seed + i * 97) % 40) - 20;
      enemy.setVelocityX(horizontalSpeed);
    }
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      this.canShoot = false;

      // 射击冷却
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 减少剩余敌人数
    this.remainingEnemies--;
    window.__signals__.remainingEnemies = this.remainingEnemies;
    window.__signals__.totalEnemiesKilled++;

    this.updateUI();

    // 日志输出
    console.log(JSON.stringify({
      event: 'enemy_killed',
      wave: this.currentWave,
      remaining: this.remainingEnemies,
      timestamp: Date.now()
    }));

    // 检查波次是否完成
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    if (this.remainingEnemies <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      window.__signals__.isWaveActive = false;
      window.__signals__.isWaitingForNextWave = true;

      // 显示波次完成信息
      this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2 seconds...`);

      // 日志输出
      console.log(JSON.stringify({
        event: 'wave_complete',
        wave: this.currentWave,
        timestamp: Date.now()
      }));

      // 2秒后开始下一波
      if (this.waveDelayTimer) {
        this.waveDelayTimer.remove();
      }

      this.waveDelayTimer = this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
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
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);