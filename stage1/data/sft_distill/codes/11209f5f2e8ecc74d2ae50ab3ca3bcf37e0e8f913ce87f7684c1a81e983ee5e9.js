class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.survivalTime = 0;
    this.gameOver = false;
    this.baseEnemySpeed = 160;
    this.speedMultiplier = 1.0;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 定时生成敌人（每0.8秒一个）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 每秒增加速度系数
    this.speedTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.speedMultiplier += 0.1;
      },
      callbackScope: this,
      loop: true
    });

    // 显示生存时间
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
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

    // 重置游戏状态
    this.survivalTime = 0;
    this.gameOver = false;
    this.speedMultiplier = 1.0;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta / 1000;
    this.timeText.setText('Time: ' + this.survivalTime.toFixed(1) + 's');

    // 玩家移动控制
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
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -20, 'enemy');
    
    // 设置敌人速度（基础速度 * 速度系数）
    const currentSpeed = this.baseEnemySpeed * this.speedMultiplier;
    enemy.setVelocityY(currentSpeed);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;

    // 停止所有定时器
    this.enemyTimer.remove();
    this.speedTimer.remove();

    // 停止所有物理对象
    this.physics.pause();

    // 显示游戏结束信息
    this.gameOverText.setText(
      'GAME OVER\n' +
      'Survival Time: ' + this.survivalTime.toFixed(1) + 's\n' +
      'Final Speed: ' + (this.baseEnemySpeed * this.speedMultiplier).toFixed(0)
    );
    this.gameOverText.setVisible(true);

    // 玩家变红
    this.player.setTint(0xff0000);
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

const game = new Phaser.Game(config);