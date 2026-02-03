class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
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

    // 创建敌人纹理（橙色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

    // 敌人生成定时器（每 1 秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 分数文本
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

    // 计分定时器（每 100ms 加 1 分）
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

  update(time, delta) {
    if (this.gameOver) {
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

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下速度为 300
    enemy.setVelocityY(300);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 停止物理系统
    this.physics.pause();

    // 停止定时器
    this.enemyTimer.destroy();
    this.scoreTimer.destroy();

    // 玩家变红表示死亡
    this.player.setTint(0xff0000);

    // 输出最终分数到控制台（可验证状态）
    console.log('Game Over! Final Score:', this.score);
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