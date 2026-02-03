class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
    this.enemyTimer = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色矩形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 定时生成敌人（每0.8秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress SPACE to Restart', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启键
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
        // 成功躲避一个敌人，增加分数
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人下落速度为120
    enemy.setVelocityY(120);
    enemy.body.setSize(30, 30);
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    
    // 停止物理引擎
    this.physics.pause();
    
    // 改变玩家颜色为红色表示死亡
    player.setTint(0xff0000);
    
    // 停止生成敌人
    if (this.enemyTimer) {
      this.enemyTimer.remove();
    }
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
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