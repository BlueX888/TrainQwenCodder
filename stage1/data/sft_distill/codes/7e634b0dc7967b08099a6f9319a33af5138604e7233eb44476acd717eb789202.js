class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.score = 0;
    this.gameOver = false;
    this.enemySpeed = 360;
    this.playerSpeed = 300;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每0.8秒）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
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
      fill: '#fff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 空格键重启
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update(time, delta) {
    if (this.gameOver) {
      // 游戏结束后，按空格重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
        this.score = 0;
        this.gameOver = false;
      }
      return;
    }

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新分数（每秒增加10分）
    this.score += delta / 100;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 随机 x 位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(this.enemySpeed);
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    this.enemyTimer.remove();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 玩家变红
    player.setTint(0xff0000);
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