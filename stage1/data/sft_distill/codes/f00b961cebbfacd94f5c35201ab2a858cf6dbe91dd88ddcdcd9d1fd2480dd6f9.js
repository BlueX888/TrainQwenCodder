class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.isGameOver = false;
    this.gameOverText = null;
    this.enemyTimer = null;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 得分文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 重启键
    this.input.keyboard.on('keydown-R', () => {
      if (this.isGameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
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

    // 清理超出屏幕的敌人并增加分数
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 620) {
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) {
      return;
    }

    // 随机X位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为240
    enemy.setVelocityY(240);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.isGameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 停止生成敌人
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }
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