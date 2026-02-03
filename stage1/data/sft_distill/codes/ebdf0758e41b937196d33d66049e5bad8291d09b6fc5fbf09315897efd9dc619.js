class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.survivalTime = 0;
    this.baseEnemySpeed = 240;
    this.currentEnemySpeed = 240;
    this.isGameOver = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 键盘控制
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
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
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
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(400, 360, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 定时生成敌人（每0.8秒）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 计时器（每秒更新）
    this.survivalTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });

    // 速度递增计时器（每2秒增加速度）
    this.speedIncreaseTimer = this.time.addEvent({
      delay: 2000,
      callback: this.increaseEnemySpeed,
      callbackScope: this,
      loop: true
    });

    // 空格键重启
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isGameOver) {
        this.scene.restart();
      }
    });
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) {
      return;
    }

    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.get(x, -30, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(this.currentEnemySpeed);
    }
  }

  updateSurvivalTime() {
    if (this.isGameOver) {
      return;
    }

    this.survivalTime++;
    this.timeText.setText('Time: ' + this.survivalTime + 's');
  }

  increaseEnemySpeed() {
    if (this.isGameOver) {
      return;
    }

    // 每2秒增加20的速度
    this.currentEnemySpeed += 20;
    this.speedText.setText('Speed: ' + Math.floor(this.currentEnemySpeed));

    // 更新现有敌人的速度
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.setVelocityY(this.currentEnemySpeed);
      }
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有计时器
    this.enemySpawnTimer.remove();
    this.survivalTimer.remove();
    this.speedIncreaseTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setTint(0xff0000);

    // 停止所有敌人
    this.enemies.getChildren().forEach((e) => {
      e.setVelocity(0, 0);
    });

    // 显示游戏结束信息
    this.gameOverText.setText('GAME OVER!');
    this.gameOverText.setVisible(true);

    this.restartText.setText(
      'Survived: ' + this.survivalTime + 's\nPress SPACE to restart'
    );
    this.restartText.setVisible(true);

    // 输出可验证的状态信号
    console.log('Game Over - Final Stats:');
    console.log('Survival Time:', this.survivalTime);
    console.log('Final Enemy Speed:', this.currentEnemySpeed);
    console.log('Speed Increase:', this.currentEnemySpeed - this.baseEnemySpeed);
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