// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
    this.isWaveActive = false;
    this.waveDelay = 2000; // 2秒延迟
    this.enemySpeed = 360;
    this.enemiesPerWave = 12;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      currentWave: 0,
      enemiesKilled: 0,
      enemiesRemaining: 0,
      totalEnemiesSpawned: 0,
      isWaveActive: false,
      logs: []
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加碰撞检测（玩家与敌人）
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 添加点击事件消灭敌人
    this.input.on('pointerdown', (pointer) => {
      this.enemies.getChildren().forEach(enemy => {
        const bounds = enemy.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          this.destroyEnemy(enemy);
        }
      });
    });

    // 创建波次显示文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建敌人计数文本
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建状态文本
    this.statusText = this.add.text(16, 96, 'Starting...', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 启动第一波
    this.time.delayedCall(1000, () => {
      this.startNextWave();
    });

    this.logSignal('Game started');
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
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

    // 更新敌人移动方向（追踪玩家）
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      }
    });

    // 检查波次完成
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.onWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.totalEnemies = this.enemiesPerWave;

    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText('Wave Active!');
    this.statusText.setColor('#00ff00');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.spawnEnemy(i);
    }

    this.updateEnemyCount();
    this.updateSignals();
    this.logSignal(`Wave ${this.currentWave} started with ${this.enemiesPerWave} enemies`);
  }

  spawnEnemy(index) {
    // 在屏幕边缘随机位置生成敌人
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上
        x = Phaser.Math.Between(50, 750);
        y = 50;
        break;
      case 1: // 右
        x = 750;
        y = Phaser.Math.Between(50, 550);
        break;
      case 2: // 下
        x = Phaser.Math.Between(50, 750);
        y = 550;
        break;
      case 3: // 左
        x = 50;
        y = Phaser.Math.Between(50, 550);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
    enemy.enemyId = `wave${this.currentWave}_enemy${index}`;
  }

  hitEnemy(player, enemy) {
    // 碰撞时不销毁，只有点击才销毁
  }

  destroyEnemy(enemy) {
    if (!enemy.active) return;

    this.enemiesKilled++;
    enemy.destroy();
    
    this.updateEnemyCount();
    this.updateSignals();
    this.logSignal(`Enemy destroyed: ${enemy.enemyId}, Total killed: ${this.enemiesKilled}`);
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.statusText.setText('Wave Complete! Next in 2s...');
    this.statusText.setColor('#ffff00');

    this.updateSignals();
    this.logSignal(`Wave ${this.currentWave} completed`);

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.startNextWave();
    });
  }

  updateEnemyCount() {
    const remaining = this.enemies.countActive(true);
    const killed = this.totalEnemies - remaining;
    this.enemyCountText.setText(`Enemies: ${killed}/${this.totalEnemies}`);
  }

  updateSignals() {
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.enemiesKilled = this.enemiesKilled;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
    window.__signals__.totalEnemiesSpawned = this.currentWave * this.enemiesPerWave;
    window.__signals__.isWaveActive = this.isWaveActive;
  }

  logSignal(message) {
    const log = {
      timestamp: Date.now(),
      wave: this.currentWave,
      message: message
    };
    window.__signals__.logs.push(log);
    console.log('[SIGNAL]', JSON.stringify(log));
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

// 导出验证接口
window.__getGameState__ = function() {
  return {
    currentWave: window.__signals__.currentWave,
    enemiesKilled: window.__signals__.enemiesKilled,
    enemiesRemaining: window.__signals__.enemiesRemaining,
    totalSpawned: window.__signals__.totalEnemiesSpawned,
    isWaveActive: window.__signals__.isWaveActive,
    recentLogs: window.__signals__.logs.slice(-10)
  };
};