class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.gameOver = false;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色矩形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
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

    // 敌人生成定时器
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

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#fff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 空格键重启
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta) {
    if (this.gameOver) {
      // 游戏结束后按空格重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
        this.gameOver = false;
        this.score = 0;
      }
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新敌人位置并清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.y += 300 * (delta / 1000); // 以300像素/秒的速度下落

      if (enemy.y > 650) {
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在随机X位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(0); // 不使用物理引擎的速度，手动更新
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止敌人生成
    this.enemyTimer.remove();

    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.enemies.children.entries.forEach(e => {
      e.body.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 玩家变红表示碰撞
    this.player.setTint(0xff0000);
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