class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isGameOver = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
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

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 定时生成敌人（每1秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 显示分数文本
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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta) {
    if (this.isGameOver) {
      // 游戏结束后按空格重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.restartGame();
      }
      return;
    }

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 检查敌人是否超出屏幕底部
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 620) {
        // 敌人超出屏幕，增加分数并销毁
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度为 300
    enemy.setVelocityY(300);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    // 碰到敌人，游戏结束
    this.isGameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 停止敌人生成
    this.enemyTimer.remove();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  restartGame() {
    // 重置游戏状态
    this.score = 0;
    this.isGameOver = false;
    
    // 重启场景
    this.scene.restart();
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
  scene: GameScene
};

new Phaser.Game(config);