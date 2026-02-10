class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.killCount = 0;
    this.enemiesPerWave = 15;
    this.baseEnemySpeed = 80;
    this.isSpawning = false;
    this.playerSpeed = 200;
    this.enemyGroup = null;
    this.player = null;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（绿色正方形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      wave: 0,
      killCount: 0,
      enemiesAlive: 0,
      playerAlive: true,
      gameTime: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemyGroup = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 玩家与敌人碰撞
    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      this.hitPlayer,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.killText = this.add.text(16, 50, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyText = this.add.text(16, 84, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    if (this.isSpawning) return;

    this.wave++;
    this.isSpawning = true;

    // 计算本波敌人数量和速度
    const enemyCount = this.enemiesPerWave + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 5;

    // 显示波次提示
    this.statusText.setText(`Wave ${this.wave}\n${enemyCount} Enemies`);
    this.statusText.setVisible(true);

    // 2秒后开始生成敌人
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
      this.spawnWave(enemyCount, enemySpeed);
    });

    // 更新 UI
    this.waveText.setText(`Wave: ${this.wave}`);
    
    // 更新信号
    window.__signals__.wave = this.wave;

    // 输出日志
    console.log(JSON.stringify({
      type: 'WAVE_START',
      wave: this.wave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      time: this.time.now
    }));
  }

  spawnWave(count, speed) {
    const spawnDelay = 500; // 每个敌人生成间隔

    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(speed);
        
        // 最后一个敌人生成后，标记生成完成
        if (i === count - 1) {
          this.isSpawning = false;
        }
      });
    }
  }

  spawnEnemy(speed) {
    // 随机从屏幕边缘生成
    const edge = Phaser.Math.Between(0, 3);
    let x, y;

    switch (edge) {
      case 0: // 上
        x = Phaser.Math.Between(0, 800);
        y = -20;
        break;
      case 1: // 右
        x = 820;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下
        x = Phaser.Math.Between(0, 800);
        y = 620;
        break;
      case 3: // 左
        x = -20;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemyGroup.get(x, y, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setData('speed', speed);
      
      // 更新敌人计数
      this.updateEnemyCount();
    }
  }

  hitPlayer(player, enemy) {
    // 敌人被击杀
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.stop();

    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);
    
    // 更新信号
    window.__signals__.killCount = this.killCount;
    
    // 输出日志
    console.log(JSON.stringify({
      type: 'ENEMY_KILLED',
      killCount: this.killCount,
      wave: this.wave,
      time: this.time.now
    }));

    this.updateEnemyCount();

    // 检查是否所有敌人都被消灭
    if (this.enemyGroup.countActive(true) === 0 && !this.isSpawning) {
      this.time.delayedCall(1000, () => {
        this.startNextWave();
      });
    }
  }

  updateEnemyCount() {
    const activeEnemies = this.enemyGroup.countActive(true);
    this.enemyText.setText(`Enemies: ${activeEnemies}`);
    window.__signals__.enemiesAlive = activeEnemies;
  }

  update(time, delta) {
    if (!this.player.active) return;

    // 更新游戏时间信号
    window.__signals__.gameTime = Math.floor(time / 1000);

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) {
        const speed = enemy.getData('speed');
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        enemy.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
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

const game = new Phaser.Game(config);

// 输出初始信号
console.log(JSON.stringify({
  type: 'GAME_START',
  config: {
    width: config.width,
    height: config.height,
    initialEnemiesPerWave: 15,
    baseEnemySpeed: 80
  },
  time: Date.now()
}));