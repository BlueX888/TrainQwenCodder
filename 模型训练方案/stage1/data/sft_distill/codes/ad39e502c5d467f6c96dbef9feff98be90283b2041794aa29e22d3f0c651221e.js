class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.isGameOver = false;
    this.score = 0;
    this.survivalTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(width / 2, height / 2 + 60, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 添加空格键重启功能
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta) {
    if (this.isGameOver) {
      // 游戏结束后检测空格键重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
        this.isGameOver = false;
        this.score = 0;
        this.survivalTime = 0;
      }
      return;
    }

    // 玩家移动控制
    const playerSpeed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新生存时间
    this.survivalTime += delta;
    this.score = Math.floor(this.survivalTime / 1000);
    this.scoreText.setText(`Time: ${this.score}s`);

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > this.cameras.main.height + 50) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    const { width } = this.cameras.main;
    
    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, width - 50);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下移动，速度为120
    enemy.setVelocityY(120);
  }

  handleCollision(player, enemy) {
    if (this.isGameOver) return;

    // 游戏结束
    this.isGameOver = true;
    
    // 停止所有物理运动
    this.physics.pause();
    
    // 停止生成敌人
    this.enemyTimer.destroy();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
    
    // 玩家变红
    player.setTint(0xff0000);
    
    console.log(`Game Over! Survival Time: ${this.score}s`);
  }
}

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
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);