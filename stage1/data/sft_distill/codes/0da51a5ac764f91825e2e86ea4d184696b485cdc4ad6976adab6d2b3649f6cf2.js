class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 20;
    this.enemySpeed = 240;
    this.isWaveTransition = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化signals用于验证
    window.__signals__ = {
      currentWave: 0,
      enemiesAlive: 0,
      totalKilled: 0,
      isTransition: false,
      events: []
    };

    // 创建绿色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

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

    // 添加碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 创建波次显示文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建敌人计数文本
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建提示文本
    this.infoText = this.add.text(400, 300, '', {
      fontSize: '28px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 射击冷却
    this.lastFired = 0;
    this.fireRate = 200;

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveTransition = false;
    
    // 更新signals
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.isTransition = false;
    window.__signals__.events.push({
      type: 'WAVE_START',
      wave: this.currentWave,
      timestamp: Date.now()
    });

    // 更新文本
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.infoText.setText('');

    // 生成敌人
    this.spawnWave();

    console.log(`[WAVE_START] Wave ${this.currentWave} started with ${this.enemiesPerWave} enemies`);
  }

  spawnWave() {
    // 使用固定种子的随机数生成器
    const seed = this.currentWave * 1000;
    let rng = seed;
    
    const pseudoRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 随机生成位置（屏幕上方）
      const x = 50 + pseudoRandom() * 700;
      const y = -50 - pseudoRandom() * 200;

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (pseudoRandom() - 0.5) * this.enemySpeed,
        this.enemySpeed
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新敌人计数
    this.updateEnemyCount();
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    this.totalEnemiesKilled++;

    // 更新signals
    window.__signals__.totalKilled = this.totalEnemiesKilled;
    window.__signals__.events.push({
      type: 'ENEMY_KILLED',
      wave: this.currentWave,
      totalKilled: this.totalEnemiesKilled,
      timestamp: Date.now()
    });

    // 更新敌人计数
    this.updateEnemyCount();

    console.log(`[ENEMY_KILLED] Total killed: ${this.totalEnemiesKilled}, Remaining: ${this.enemies.countActive(true)}`);
  }

  updateEnemyCount() {
    const count = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${count}`);
    window.__signals__.enemiesAlive = count;
  }

  shoot() {
    const time = this.time.now;

    if (time > this.lastFired + this.fireRate) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 30);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);
        this.lastFired = time;
      }
    }
  }

  checkWaveComplete() {
    // 如果所有敌人被消灭且不在过渡期
    if (this.enemies.countActive(true) === 0 && !this.isWaveTransition) {
      this.isWaveTransition = true;
      window.__signals__.isTransition = true;

      // 显示提示文本
      this.infoText.setText('Wave Complete! Next wave in 2 seconds...');

      // 记录事件
      window.__signals__.events.push({
        type: 'WAVE_COMPLETE',
        wave: this.currentWave,
        timestamp: Date.now()
      });

      console.log(`[WAVE_COMPLETE] Wave ${this.currentWave} completed. Waiting 2 seconds...`);

      // 2秒后开始下一波
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.startNextWave();
        },
        callbackScope: this
      });
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
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 检查波次是否完成
    this.checkWaveComplete();
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

const game = new Phaser.Game(config);

// 添加全局访问点用于测试
window.__game__ = game;

// 输出验证信息
console.log('[GAME_INIT] Wave system initialized');
console.log('[CONFIG] Enemies per wave: 20, Speed: 240, Wave delay: 2000ms');