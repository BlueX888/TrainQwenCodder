class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 12;
    this.enemySpeed = 240;
    this.isWaveActive = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 创建粉色敌人纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('enemy', 40, 40);
    graphics.destroy();

    // 创建玩家纹理（用于点击目标）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
  }

  create() {
    // 创建敌人物理组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: this.enemiesPerWave
    });

    // 创建UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.statsText = this.add.text(16, 110, '', {
      fontSize: '16px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 点击敌人消灭
    this.input.on('pointerdown', (pointer) => {
      const enemiesAtPointer = this.enemies.getChildren().filter(enemy => {
        const bounds = enemy.getBounds();
        return bounds.contains(pointer.x, pointer.y);
      });

      if (enemiesAtPointer.length > 0) {
        const enemy = enemiesAtPointer[0];
        enemy.destroy();
        this.totalEnemiesKilled++;
        this.updateUI();
      }
    });

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    
    this.statusText.setText('Wave Starting!');

    // 生成12个敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 随机X位置，从顶部生成
      const x = Phaser.Math.Between(50, 750);
      const y = -50 - (i * 30); // 错开生成位置避免重叠
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocityY(this.enemySpeed);
      enemy.setInteractive();
      
      // 设置边界，超出屏幕底部销毁
      enemy.setCollideWorldBounds(false);
    }

    this.updateUI();
  }

  update(time, delta) {
    // 移除超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });

    // 检查是否所有敌人都被消灭
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.isWaveActive = false;
      this.onWaveComplete();
    }

    this.updateUI();
  }

  onWaveComplete() {
    this.statusText.setText('Wave Complete! Next wave in 2 seconds...');

    // 2秒后开始下一波
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.startNextWave();
      },
      callbackScope: this
    });
  }

  updateUI() {
    const activeEnemies = this.enemies.countActive(true);
    
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}/${this.enemiesPerWave}`);
    this.statsText.setText(`Total Killed: ${this.totalEnemiesKilled}`);

    if (this.isWaveActive && activeEnemies === 0) {
      this.statusText.setText('');
    }
  }

  // 可验证的状态信号
  getGameState() {
    return {
      currentWave: this.currentWave,
      activeEnemies: this.enemies.countActive(true),
      totalKilled: this.totalEnemiesKilled,
      isWaveActive: this.isWaveActive
    };
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
  scene: WaveSpawnerScene
};

const game = new Phaser.Game(config);

// 用于测试的状态访问
window.getGameState = function() {
  const scene = game.scene.getScene('WaveSpawnerScene');
  return scene ? scene.getGameState() : null;
};