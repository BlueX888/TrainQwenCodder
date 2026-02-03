class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    this.totalEnemiesPerWave = 12;
    this.enemySpeed = 240;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.waveText = null;
    this.enemyCountText = null;
    this.enemies = null;
    this.player = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 添加玩家控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加点击事件消灭敌人
    this.input.on('pointerdown', (pointer) => {
      this.checkEnemyClick(pointer.x, pointer.y);
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动控制
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

    // 检查敌人是否超出屏幕底部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        this.destroyEnemy(enemy);
      }
    });

    // 更新敌人计数
    this.updateEnemyCount();

    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesRemaining === 0) {
      this.onWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.enemiesRemaining = this.totalEnemiesPerWave;

    // 更新波次文本
    this.waveText.setText(`Wave: ${this.currentWave}`);

    // 生成敌人
    this.spawnEnemies();
  }

  spawnEnemies() {
    const spacing = 60; // 敌人之间的间隔
    const startDelay = 200; // 每个敌人生成的延迟

    for (let i = 0; i < this.totalEnemiesPerWave; i++) {
      this.time.delayedCall(i * startDelay, () => {
        // 随机X位置，但确保不超出边界
        const x = Phaser.Math.Between(30, 770);
        const y = -30; // 从屏幕顶部上方开始

        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocityY(this.enemySpeed);
        enemy.setBounce(0);
        enemy.setCollideWorldBounds(false);
        
        // 为敌人添加标识
        enemy.setData('isAlive', true);
      });
    }
  }

  checkEnemyClick(x, y) {
    // 检查点击位置是否击中敌人
    this.enemies.children.entries.forEach(enemy => {
      if (!enemy.getData('isAlive')) return;

      const bounds = enemy.getBounds();
      if (bounds.contains(x, y)) {
        this.destroyEnemy(enemy);
      }
    });
  }

  destroyEnemy(enemy) {
    if (!enemy.getData('isAlive')) return;

    enemy.setData('isAlive', false);
    
    // 创建简单的爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xffff00, 1);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });

    enemy.destroy();
    this.enemiesRemaining--;
  }

  updateEnemyCount() {
    const aliveCount = this.enemies.children.entries.filter(
      e => e.getData('isAlive')
    ).length;
    this.enemyCountText.setText(`Enemies: ${aliveCount}`);
  }

  onWaveComplete() {
    this.isWaveActive = false;

    // 显示波次完成提示
    const completeText = this.add.text(400, 300, `Wave ${this.currentWave} Complete!`, {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);

    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 1500,
      delay: 500,
      onComplete: () => {
        completeText.destroy();
      }
    });

    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.startNextWave();
    });
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

// 创建游戏实例
const game = new Phaser.Game(config);