class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.survivalTime = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 空格键重启
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 定时生成敌人（每1秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 计分定时器（每100ms增加10分）
    this.scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 10;
          this.survivalTime += 0.1;
          this.scoreText.setText('Score: ' + this.score);
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      // 游戏结束后检测重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.restartGame();
      }
      return;
    }

    // 玩家移动控制
    const moveSpeed = 300;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度为 120
    enemy.setVelocityY(120);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    // 游戏结束
    this.gameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 停止定时器
    this.enemyTimer.destroy();
    this.scoreTimer.destroy();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  restartGame() {
    // 重置游戏状态
    this.score = 0;
    this.gameOver = false;
    this.survivalTime = 0;
    
    // 重启场景
    this.scene.restart();
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
  scene: GameScene
};

new Phaser.Game(config);