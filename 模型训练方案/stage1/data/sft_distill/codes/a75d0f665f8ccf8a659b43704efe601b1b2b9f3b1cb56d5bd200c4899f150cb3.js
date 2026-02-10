class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.survivalTime = 0; // 生存时间（秒）
    this.enemySpeed = 200; // 敌人初始速度
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 重置游戏状态
    this.survivalTime = 0;
    this.enemySpeed = 200;
    this.isGameOver = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示速度文本
    this.speedText = this.add.text(16, 50, 'Speed: 200', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.restartText = this.add.text(400, 360, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 每1秒生成一个敌人
    this.enemySpawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 每秒更新生存时间和敌人速度
    this.survivalTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 空格键重启
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    // 随机X位置
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度（向下移动）
    enemy.setVelocityY(this.enemySpeed);
  }

  updateSurvivalTime() {
    if (this.isGameOver) return;

    this.survivalTime++;
    this.timeText.setText('Time: ' + this.survivalTime + 's');

    // 每秒增加敌人速度20
    this.enemySpeed += 20;
    this.speedText.setText('Speed: ' + this.enemySpeed);
  }

  handleCollision(player, enemy) {
    if (this.isGameOver) return;

    this.isGameOver = true;

    // 停止所有定时器
    this.enemySpawnTimer.remove();
    this.survivalTimer.remove();

    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家
    this.player.setVelocity(0, 0);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 高亮碰撞的玩家
    this.player.setTint(0xff0000);
  }

  update() {
    if (this.isGameOver) {
      // 检测空格键重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.scene.restart();
      }
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 650) {
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