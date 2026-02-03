class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.score = 0;
    this.gameOver = false;
    this.survivalTime = 0;
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

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 定时生成敌人（每1-2秒随机生成）
    this.enemyTimer = this.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
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

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
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
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 计时器
    this.timeEvent = this.time.addEvent({
      delay: 100,
      callback: this.updateTime,
      callbackScope: this,
      loop: true
    });
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 随机X位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -40, 'enemy');
    
    // 设置敌人速度为240向下
    enemy.setVelocityY(240);
    enemy.body.setSize(40, 40);

    // 敌人离开屏幕后销毁并增加分数
    enemy.setData('scored', false);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    // 游戏结束
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText.setVisible(true);
    
    // 停止生成敌人
    this.enemyTimer.remove();
    this.timeEvent.remove();
  }

  updateTime() {
    if (!this.gameOver) {
      this.survivalTime += 0.1;
      this.score = Math.floor(this.survivalTime * 10);
      this.scoreText.setText(`Time: ${this.survivalTime.toFixed(1)}s | Score: ${this.score}`);
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      // 检测重启
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
        this.score = 0;
        this.gameOver = false;
        this.survivalTime = 0;
      }
      return;
    }

    // 玩家移动
    const speed = 300;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理离开屏幕的敌人并增加分数
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        if (!enemy.getData('scored')) {
          enemy.setData('scored', true);
          this.score += 10;
        }
        enemy.destroy();
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);