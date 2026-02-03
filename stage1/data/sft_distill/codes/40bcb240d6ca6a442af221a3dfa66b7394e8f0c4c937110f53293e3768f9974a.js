class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.score = 0;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（白色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 定时生成敌人（每 800ms 生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建得分文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff'
    });

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 得分计时器（每秒增加 10 分）
    this.scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
          this.scoreText.setText('Score: ' + this.score);
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 400;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
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

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    const { width } = this.cameras.main;
    
    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(30, width - 30);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为 300
    enemy.setVelocityY(300);
    enemy.body.setSize(30, 30);
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    
    // 停止物理引擎
    this.physics.pause();
    
    // 停止定时器
    this.enemyTimer.remove();
    this.scoreTimer.remove();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 玩家变红表示碰撞
    this.player.setTint(0xff0000);
    
    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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
  scene: DodgeGame
};

new Phaser.Game(config);