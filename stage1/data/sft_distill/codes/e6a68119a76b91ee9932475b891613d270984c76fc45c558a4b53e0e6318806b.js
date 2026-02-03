class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 10;
    this.enemySpeed = 80;
    this.waveDelay = 2000;
    this.isWaveActive = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      wave: 0,
      enemiesKilled: 0,
      enemiesAlive: 0,
      isWaveActive: false,
      logs: []
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加碰撞检测（简化：点击敌人销毁）
    this.input.on('pointerdown', (pointer) => {
      this.enemies.getChildren().forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(
          pointer.x, pointer.y,
          enemy.x, enemy.y
        );
        if (distance < 16) {
          this.killEnemy(enemy);
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
    this.statusText = this.add.text(16, 96, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    
    this.logSignal(`Starting wave ${this.currentWave}`);
    
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText('Wave Active!');
    
    this.spawnWave();
    
    this.updateSignals();
  }

  spawnWave() {
    const spawnPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 50 },
      { x: 400, y: 550 },
      { x: 50, y: 300 },
      { x: 750, y: 300 },
      { x: 200, y: 200 },
      { x: 600, y: 400 }
    ];

    for (let i = 0; i < this.enemiesPerWave; i++) {
      const pos = spawnPositions[i % spawnPositions.length];
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      
      // 计算朝向玩家的速度向量
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * this.enemySpeed,
        Math.sin(angle) * this.enemySpeed
      );

      // 标记敌人所属波次
      enemy.waveNumber = this.currentWave;
    }

    this.updateEnemyCount();
    this.logSignal(`Spawned ${this.enemiesPerWave} enemies in wave ${this.currentWave}`);
  }

  killEnemy(enemy) {
    this.totalEnemiesKilled++;
    this.logSignal(`Enemy killed. Total: ${this.totalEnemiesKilled}`);
    
    enemy.destroy();
    this.updateEnemyCount();
    
    // 检查波次是否完成
    if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
      this.onWaveComplete();
    }
    
    this.updateSignals();
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.statusText.setText('Wave Complete! Next wave in 2s...');
    
    this.logSignal(`Wave ${this.currentWave} completed`);
    
    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: () => {
        this.startNextWave();
      },
      callbackScope: this
    });
    
    this.updateSignals();
  }

  updateEnemyCount() {
    const alive = this.enemies.countActive(true);
    const total = this.enemiesPerWave;
    this.enemyCountText.setText(`Enemies: ${alive}/${total}`);
  }

  logSignal(message) {
    const log = {
      timestamp: Date.now(),
      message: message
    };
    window.__signals__.logs.push(log);
    console.log(`[SIGNAL] ${message}`);
  }

  updateSignals() {
    window.__signals__.wave = this.currentWave;
    window.__signals__.enemiesKilled = this.totalEnemiesKilled;
    window.__signals__.enemiesAlive = this.enemies.countActive(true);
    window.__signals__.isWaveActive = this.isWaveActive;
  }

  update(time, delta) {
    // 更新敌人朝向玩家移动（每秒重新计算一次方向）
    if (!this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }

    if (time - this.lastUpdateTime > 1000) {
      this.enemies.getChildren().forEach(enemy => {
        if (enemy.active) {
          const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
          );
          
          enemy.setVelocity(
            Math.cos(angle) * this.enemySpeed,
            Math.sin(angle) * this.enemySpeed
          );
        }
      });
      this.lastUpdateTime = time;
    }

    // 简单的玩家控制（可选）
    const cursors = this.input.keyboard.createCursorKeys();
    const speed = 200;

    if (cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

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
  scene: GameScene
};

const game = new Phaser.Game(config);