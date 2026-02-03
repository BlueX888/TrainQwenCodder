class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.score = 0;
    this.gameOver = false;
    this.survivalTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色矩形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示存活时间文本
    this.timeText = this.add.text(16, 48, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER\nClick to Restart', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 点击重启
    this.input.on('pointerdown', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });

    // 计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText('Time: ' + this.survivalTime + 's');

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 620) {
        enemy.destroy();
        // 成功躲避一个敌人，增加分数
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度（向下120）
    enemy.setVelocityY(120);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    
    // 停止物理引擎
    this.physics.pause();
    
    // 停止敌人生成
    this.enemyTimer.remove();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    console.log('Game Over! Final Score:', this.score, 'Survival Time:', this.survivalTime);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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