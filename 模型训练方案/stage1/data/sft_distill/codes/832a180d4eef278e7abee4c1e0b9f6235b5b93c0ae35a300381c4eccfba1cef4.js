class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
    this.baseEnemySpeed = 240;
    this.currentEnemySpeed = 240;
    this.speedIncreaseRate = 20; // 每秒增加的速度
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 速度显示文本
    this.speedText = this.add.text(16, 50, 'Speed: 240', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(400, 360, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 定时生成敌人（每秒一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 游戏开始时间
    this.startTime = this.time.now;

    // 重启键
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update(time, delta) {
    if (this.isGameOver) {
      // 检测重启
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.restartGame();
      }
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 根据时间增加敌人速度
    this.currentEnemySpeed = this.baseEnemySpeed + (this.survivalTime * this.speedIncreaseRate);
    this.speedText.setText(`Speed: ${Math.floor(this.currentEnemySpeed)}`);

    // 玩家移动控制
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 更新所有敌人的速度
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        // 保持方向，更新速度
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        this.physics.velocityFromRotation(
          angle,
          this.currentEnemySpeed,
          enemy.body.velocity
        );
      }
    });

    // 清理超出边界的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (
        enemy.x < -50 ||
        enemy.x > 850 ||
        enemy.y < -50 ||
        enemy.y > 650
      ) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    // 随机从屏幕边缘生成敌人
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上
        x = Phaser.Math.Between(0, 800);
        y = -30;
        break;
      case 1: // 右
        x = 830;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下
        x = Phaser.Math.Between(0, 800);
        y = 630;
        break;
      case 3: // 左
        x = -30;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');

    // 计算朝向玩家的角度
    const angle = Phaser.Math.Angle.Between(
      x,
      y,
      this.player.x,
      this.player.y
    );

    // 设置敌人速度（使用当前速度）
    this.physics.velocityFromRotation(angle, this.currentEnemySpeed, enemy.body.velocity);
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) return;

    this.isGameOver = true;

    // 停止游戏
    this.physics.pause();
    this.enemyTimer.remove();

    // 玩家变色
    player.setTint(0xff0000);

    // 显示游戏结束信息
    this.gameOverText.setText(`GAME OVER\nSurvival Time: ${this.survivalTime.toFixed(1)}s`);
    this.gameOverText.setVisible(true);

    this.restartText.setText('Press R to Restart');
    this.restartText.setVisible(true);
  }

  restartGame() {
    this.scene.restart();
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