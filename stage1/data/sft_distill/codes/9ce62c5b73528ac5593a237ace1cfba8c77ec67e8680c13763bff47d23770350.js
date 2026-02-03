class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isGameOver = false;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.gameOver, null, this);

    // 显示分数
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

    // 分数计时器（每秒加1分）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isGameOver) {
          this.score++;
          this.scoreText.setText('Score: ' + this.score);
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) {
      return;
    }

    // 随机 X 位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度为 300
    enemy.setVelocityY(300);
  }

  gameOver(player, enemy) {
    // 游戏结束
    this.isGameOver = true;

    // 停止所有定时器
    this.enemyTimer.remove();
    this.scoreTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 停止所有敌人
    this.enemies.children.entries.forEach((enemy) => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 玩家变红表示碰撞
    this.player.setTint(0xff0000);

    console.log('Game Over! Final Score:', this.score);
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