class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.gameOver = false;
    this.score = 0;
    this.enemySpeed = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每 1.5 秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

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
      fill: '#fff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER\nClick to Restart', {
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
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const { width } = this.cameras.main;
    const x = Phaser.Math.Between(30, width - 30);
    
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
    enemy.body.setSize(30, 30);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();
    this.enemyTimer.remove();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动
    const playerSpeed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > this.cameras.main.height + 50) {
        enemy.destroy();
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
  scene: DodgeGameScene
};

new Phaser.Game(config);