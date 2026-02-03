class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.survivalTime = 0;
    this.baseEnemySpeed = 80;
    this.currentEnemySpeed = 80;
    this.speedIncreaseRate = 5; // 每秒增加5像素速度
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
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
    this.speedText = this.add.text(16, 50, 'Speed: 80', {
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

    // 定时生成敌人（每1.5秒）
    this.enemyTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 速度递增定时器（每秒更新）
    this.speedTimer = this.time.addEvent({
      delay: 1000,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });

    // 记录开始时间
    this.startTime = this.time.now;

    // 重启按键
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isGameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
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
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(this.currentEnemySpeed);
      enemy.body.setAllowGravity(false);
    }
  }

  increaseSpeed() {
    if (this.isGameOver) {
      return;
    }

    // 每秒增加速度
    this.currentEnemySpeed += this.speedIncreaseRate;
    this.speedText.setText(`Speed: ${Math.round(this.currentEnemySpeed)}`);

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityY(this.currentEnemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有定时器
    this.enemyTimer.remove();
    this.speedTimer.remove();

    // 停止玩家和所有敌人
    this.player.setVelocity(0);
    this.enemies.setVelocityY(0);

    // 显示游戏结束信息
    this.gameOverText.setText('GAME OVER!');
    this.gameOverText.setVisible(true);

    this.restartText.setText(
      `Survived: ${this.survivalTime.toFixed(1)}s\nPress SPACE to Restart`
    );
    this.restartText.setVisible(true);

    // 玩家变暗
    this.player.setTint(0x888888);
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
  scene: DodgeGame
};

new Phaser.Game(config);