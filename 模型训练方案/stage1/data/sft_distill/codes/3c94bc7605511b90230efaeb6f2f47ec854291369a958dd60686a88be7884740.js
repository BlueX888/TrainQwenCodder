class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.timeText = null;
    this.gameOver = false;
    this.enemySpeed = 360;
    this.speedIncrement = 20; // 每秒增加的速度
    this.enemySpawnTimer = null;
    this.speedIncreaseTimer = null;
    this.startTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      survivalTime: 0,
      enemySpeed: 360,
      gameOver: false,
      enemiesSpawned: 0,
      score: 0
    };

    this.startTime = this.time.now;
    this.gameOver = false;
    this.enemySpeed = 360;

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 显示生存时间
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示速度信息
    this.speedText = this.add.text(16, 50, 'Enemy Speed: 360', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 敌人生成定时器（每 0.8 秒生成一个）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 速度递增定时器（每秒增加速度）
    this.speedIncreaseTimer = this.time.addEvent({
      delay: 1000,
      callback: this.increaseEnemySpeed,
      callbackScope: this,
      loop: true
    });

    // 游戏说明
    this.add.text(400, 300, 'Use Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0.8);

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      initialSpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 更新信号
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(1));
    window.__signals__.enemySpeed = this.enemySpeed;
    window.__signals__.score = Math.floor(this.survivalTime * 10);

    // 玩家移动
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机 X 位置
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(this.enemySpeed);
      window.__signals__.enemiesSpawned++;

      console.log(JSON.stringify({
        event: 'enemy_spawn',
        position: { x, y: -30 },
        speed: this.enemySpeed,
        timestamp: Date.now()
      }));
    }
  }

  increaseEnemySpeed() {
    if (this.gameOver) {
      return;
    }

    this.enemySpeed += this.speedIncrement;
    this.speedText.setText(`Enemy Speed: ${this.enemySpeed}`);

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityY(this.enemySpeed);
    });

    console.log(JSON.stringify({
      event: 'speed_increase',
      newSpeed: this.enemySpeed,
      survivalTime: this.survivalTime.toFixed(1),
      timestamp: Date.now()
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 停止所有定时器
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.remove();
    }
    if (this.speedIncreaseTimer) {
      this.speedIncreaseTimer.remove();
    }

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    this.player.setTint(0xff0000);

    // 显示游戏结束文本
    const finalTime = this.survivalTime.toFixed(1);
    const finalScore = Math.floor(this.survivalTime * 10);
    
    this.add.text(400, 300, `GAME OVER!\n\nSurvival Time: ${finalTime}s\nScore: ${finalScore}\n\nRefresh to Restart`, {
      fontSize: '32px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: parseFloat(finalTime),
      finalSpeed: this.enemySpeed,
      score: finalScore,
      enemiesSpawned: window.__signals__.enemiesSpawned,
      timestamp: Date.now()
    }));
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
  scene: DodgeGameScene
};

new Phaser.Game(config);