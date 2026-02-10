class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.distance = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 240 * 1.2; // 288

    // 创建敌人（从屏幕边缘随机位置生成）
    const spawnX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const spawnY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy');
    this.enemySpeed = 240;

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.hitEnemy, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys or WASD to move. Avoid the orange enemy!', {
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

    // 玩家移动控制
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      moveX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      moveY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      moveY = 1;
    }

    // 归一化对角线移动
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    this.player.setVelocity(moveX * this.playerSpeed, moveY * this.playerSpeed);

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      )
    );

    // 更新状态文本
    this.statusText.setText([
      `Survival Time: ${this.survivalTime}s`,
      `Distance to Enemy: ${this.distance}px`,
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Game Over: ${this.gameOver}`
    ]);
  }

  hitEnemy(player, enemy) {
    if (!this.gameOver) {
      this.gameOver = true;
      
      // 停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      // 改变颜色表示碰撞
      this.player.setTint(0xff0000);

      // 显示游戏结束信息
      const gameOverText = this.add.text(400, 300, [
        'GAME OVER!',
        `You survived for ${this.survivalTime} seconds`,
        '',
        'Press SPACE to restart'
      ], {
        fontSize: '32px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 15 },
        align: 'center'
      }).setOrigin(0.5);

      // 添加重启功能
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    }
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