// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 1;
    this.enemiesPerWave = 12;
    this.enemySpeed = 360;
    this.enemiesAlive = 0;
    this.isWaveActive = false;
    this.waveDelay = 2000; // 2秒延迟
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      wave: 1,
      enemiesAlive: 0,
      enemiesKilled: 0,
      totalEnemiesSpawned: 0,
      isWaveActive: false,
      logs: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/12', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 96, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesAlive = 0;
    
    this.statusText.setText('Wave Starting!');
    this.log(`Wave ${this.currentWave} starting`);

    // 延迟生成敌人，避免一次性全部出现
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.isWaveActive = true;
  }

  spawnEnemy() {
    // 随机X位置，从顶部生成
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -32, 'enemy');
    
    if (enemy) {
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        this.enemySpeed
      );
      
      this.enemiesAlive++;
      window.__signals__.enemiesAlive = this.enemiesAlive;
      window.__signals__.totalEnemiesSpawned++;
      
      this.updateEnemyCount();
      this.log(`Enemy spawned at (${x}, -32), total alive: ${this.enemiesAlive}`);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    this.enemiesAlive--;
    window.__signals__.enemiesAlive = this.enemiesAlive;
    window.__signals__.enemiesKilled++;
    
    this.updateEnemyCount();
    this.log(`Enemy killed, remaining: ${this.enemiesAlive}`);

    // 检查是否所有敌人被消灭
    if (this.enemiesAlive === 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    window.__signals__.isWaveActive = false;
    
    this.statusText.setText(`Wave ${this.currentWave} Complete! Next wave in 2s...`);
    this.log(`Wave ${this.currentWave} completed`);

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.waveText.setText(`Wave: ${this.currentWave}`);
      this.startWave();
    });
  }

  updateEnemyCount() {
    this.enemyCountText.setText(
      `Enemies: ${this.enemiesAlive}/${this.enemiesPerWave}`
    );
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  log(message) {
    const logEntry = {
      time: this.time.now,
      wave: this.currentWave,
      message: message
    };
    window.__signals__.logs.push(logEntry);
    console.log(`[${this.time.now}] Wave ${this.currentWave}: ${message}`);
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

    // 射击（限制射速）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理出界的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
        this.enemiesAlive--;
        window.__signals__.enemiesAlive = this.enemiesAlive;
        this.updateEnemyCount();
        this.log('Enemy escaped off screen');
        
        // 检查波次完成
        if (this.enemiesAlive === 0 && this.isWaveActive) {
          this.completeWave();
        }
      }
    });
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