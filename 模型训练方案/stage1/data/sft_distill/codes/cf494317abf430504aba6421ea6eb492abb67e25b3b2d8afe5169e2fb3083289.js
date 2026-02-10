class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemySpeed = 160;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家与敌人
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

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

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 初始化信号系统
    window.__signals__ = {
      wave: 0,
      kills: 0,
      remaining: 0,
      enemySpeed: this.baseEnemySpeed,
      waveLog: []
    };

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;

    // 计算本波敌人数量和速度
    const enemyCount = 10 + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    this.enemiesRemaining = enemyCount;

    // 显示波次提示
    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    this.statusText.setAlpha(1);

    // 2 秒后淡出提示
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 生成敌人
    this.spawnEnemies(enemyCount, enemySpeed);

    // 更新 UI
    this.updateUI();

    // 记录波次日志
    window.__signals__.waveLog.push({
      wave: this.currentWave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      timestamp: Date.now()
    });

    console.log(`[WAVE ${this.currentWave}] Spawning ${enemyCount} enemies at speed ${enemySpeed}`);
  }

  spawnEnemies(count, speed) {
    const spawnDelay = 200; // 每个敌人生成间隔（毫秒）

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        // 随机生成位置（顶部随机 x 坐标）
        const x = Phaser.Math.Between(50, 750);
        const y = -32;

        const enemy = this.enemies.get(x, y, 'enemy');
        if (enemy) {
          enemy.setActive(true);
          enemy.setVisible(true);
          enemy.body.enable = true;

          // 设置速度（向下移动）
          enemy.setVelocityY(speed);

          // 添加随机左右移动
          enemy.setVelocityX(Phaser.Math.Between(-50, 50));
        }
      });
    }
  }

  hitEnemy(player, enemy) {
    // 敌人被击杀
    this.killEnemy(enemy);
  }

  killEnemy(enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    this.killCount++;
    this.enemiesRemaining--;

    this.updateUI();

    // 检查波次是否结束
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.endWave();
    }
  }

  endWave() {
    this.isWaveActive = false;

    // 显示波次完成提示
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2s...`);
    this.statusText.setAlpha(1);

    console.log(`[WAVE ${this.currentWave}] Complete! Total kills: ${this.killCount}`);

    // 2 秒后开始下一波
    this.time.delayedCall(2000, () => {
      this.startNextWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);

    // 更新信号
    window.__signals__.wave = this.currentWave;
    window.__signals__.kills = this.killCount;
    window.__signals__.remaining = this.enemiesRemaining;
    window.__signals__.enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
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

    // 检查敌人是否离开屏幕（底部）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 650) {
        this.killEnemy(enemy);
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
  scene: EndlessWaveScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log('[GAME START] Endless Wave Mode initialized');
console.log('Controls: Arrow Keys to move');
console.log('Objective: Survive waves of enemies');