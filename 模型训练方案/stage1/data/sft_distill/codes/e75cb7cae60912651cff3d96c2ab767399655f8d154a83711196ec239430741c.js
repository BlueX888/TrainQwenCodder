class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 120 * 1.2; // 144

    // 创建敌人精灵（随机边缘位置）
    const spawnX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const spawnY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy');
    this.enemySpeed = 120;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.gameOver, null, this);

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示提示文本
    this.add.text(400, 550, 'Use Arrow Keys or WASD to move. Avoid the green enemy!', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示速度信息
    this.add.text(16, 50, `Player Speed: ${this.playerSpeed}\nEnemy Speed: ${this.enemySpeed}`, {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Survival Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      moveX = 1;
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      moveY = -1;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      moveY = 1;
    }

    // 归一化对角线移动速度
    if (moveX !== 0 && moveY !== 0) {
      const normalizedSpeed = this.playerSpeed / Math.sqrt(2);
      this.player.setVelocity(moveX * normalizedSpeed, moveY * normalizedSpeed);
    } else if (moveX !== 0 || moveY !== 0) {
      this.player.setVelocity(moveX * this.playerSpeed, moveY * this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
  }

  gameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    const finalTimeText = this.add.text(400, 370, `You survived for ${this.survivalTime.toFixed(1)} seconds`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log(`Game Over! Survival Time: ${this.survivalTime.toFixed(1)}s`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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