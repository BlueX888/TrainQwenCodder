class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.survivalTime = 0; // 生存时间（秒）
    this.enemySpeed = 200; // 敌人初始速度
    this.gameOver = false;
    this.startTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    this.startTime = this.time.now;
    this.gameOver = false;
    this.survivalTime = 0;
    this.enemySpeed = 200;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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
    this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
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

    // 生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 速度提示文本
    this.speedText = this.add.text(16, 50, 'Speed: 200', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.restartText = this.add.text(width / 2, height / 2 + 60, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 每1秒生成一个敌人
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 点击重启
    this.input.on('pointerdown', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const { width } = this.cameras.main;
    const x = Phaser.Math.Between(20, width - 20);
    
    // 从敌人组获取或创建敌人
    const enemy = this.enemies.get(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      
      // 敌人速度随时间递增（每秒增加10）
      const speedIncrease = Math.floor(this.survivalTime) * 10;
      const currentSpeed = this.enemySpeed + speedIncrease;
      
      enemy.setVelocityY(currentSpeed);
      
      // 更新速度显示
      this.speedText.setText(`Speed: ${currentSpeed}`);
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    
    // 停止物理引擎
    this.physics.pause();
    
    // 停止敌人生成
    this.enemyTimer.remove();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
    
    console.log('Game Over! Survival Time:', this.survivalTime.toFixed(2), 'seconds');
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const speed = 300;
    
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
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > this.cameras.main.height + 50) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.setVelocity(0);
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
  scene: DodgeGame
};

new Phaser.Game(config);