// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 1;
    this.enemiesPerWave = 10;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesRemaining = 0;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化signals对象
    window.__signals__ = {
      currentWave: this.currentWave,
      enemiesRemaining: this.enemiesRemaining,
      totalEnemiesKilled: this.totalEnemiesKilled,
      isWaveActive: this.isWaveActive,
      logs: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.killEnemy,
      null,
      this
    );

    // 创建UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 300, '使用方向键移动玩家\n碰撞敌人消灭它们', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 开始第一波
    this.startWave();

    this.logSignal('游戏开始', { wave: this.currentWave });
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesRemaining = this.enemiesPerWave;
    
    this.instructionText.setVisible(false);
    
    this.logSignal('波次开始', {
      wave: this.currentWave,
      enemies: this.enemiesPerWave
    });

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
    this.updateSignals();
  }

  spawnEnemy() {
    // 随机X位置（使用固定种子保证可重现）
    const seed = this.currentWave * 1000 + this.enemies.getChildren().length;
    const randomX = 50 + ((seed * 9301 + 49297) % 233280) / 233280 * 700;
    
    const enemy = this.enemies.create(randomX, -32, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
    
    // 敌人离开屏幕底部时销毁
    enemy.setData('checkBounds', true);
  }

  killEnemy(player, enemy) {
    enemy.destroy();
    this.enemiesRemaining--;
    this.totalEnemiesKilled++;

    this.logSignal('敌人被消灭', {
      wave: this.currentWave,
      remaining: this.enemiesRemaining,
      totalKilled: this.totalEnemiesKilled
    });

    this.updateUI();
    this.updateSignals();

    // 检查是否完成当前波次
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;

    this.logSignal('波次完成', {
      wave: this.currentWave,
      totalKilled: this.totalEnemiesKilled
    });

    this.statusText.setText('波次完成！2秒后进入下一波...');
    this.statusText.setStyle({ fill: '#00ff00' });

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.statusText.setStyle({ fill: '#ffff00' });
      this.startWave();
    });

    this.updateSignals();
  }

  updateUI() {
    this.waveText.setText(`波次: ${this.currentWave}`);
    
    if (this.isWaveActive) {
      this.statusText.setText(
        `剩余敌人: ${this.enemiesRemaining}/${this.enemiesPerWave} | 总消灭: ${this.totalEnemiesKilled}`
      );
    }
  }

  updateSignals() {
    window.__signals__.currentWave = this.currentWave;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.totalEnemiesKilled = this.totalEnemiesKilled;
    window.__signals__.isWaveActive = this.isWaveActive;
  }

  logSignal(event, data) {
    const logEntry = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    
    window.__signals__.logs.push(logEntry);
    console.log('[WAVE_SYSTEM]', JSON.stringify(logEntry));
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 632 && enemy.getData('checkBounds')) {
        enemy.destroy();
        this.enemiesRemaining--;
        
        this.logSignal('敌人逃脱', {
          wave: this.currentWave,
          remaining: this.enemiesRemaining
        });

        this.updateUI();
        this.updateSignals();

        // 检查波次完成
        if (this.enemiesRemaining <= 0 && this.isWaveActive) {
          this.completeWave();
        }
      }
    });
  }
}

// Phaser游戏配置
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

const game = new Phaser.Game(config);