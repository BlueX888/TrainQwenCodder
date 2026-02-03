class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 300;
    this.waveInProgress = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
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

    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    if (this.waveInProgress) return;

    this.currentWave++;
    this.waveInProgress = true;

    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 20;
    this.enemiesRemaining = enemyCount;

    this.updateUI();

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    const { width } = this.cameras.main;
    const spawnDelay = 500; // 每个敌人生成间隔

    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(width, enemySpeed);
      });
    }
  }

  spawnEnemy(worldWidth, speed) {
    // 使用固定随机模式：基于波次和索引计算位置
    const x = Phaser.Math.Between(50, worldWidth - 50);
    const enemy = this.enemies.get(x, -30, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      
      // 添加轻微的水平移动
      const horizontalSpeed = Phaser.Math.Between(-50, 50);
      enemy.setVelocityX(horizontalSpeed);
    }
  }

  hitPlayer(player, enemy) {
    this.destroyEnemy(enemy);
  }

  destroyEnemy(enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);
    
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查波次是否完成
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.waveInProgress = false;
      this.onWaveComplete();
    }
  }

  onWaveComplete() {
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2s...`);
    
    // 2秒后开始下一波
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
      this.startNextWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  update(time, delta) {
    const { height } = this.cameras.main;

    // 玩家移动
    const playerSpeed = 400;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 检查敌人是否超出屏幕底部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > height + 30) {
        this.destroyEnemy(enemy);
      }
    });
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);