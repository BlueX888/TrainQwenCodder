class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.distanceToEnemy = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(400, 550, '使用方向键或WASD移动 | 躲避粉色敌人', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

    // 玩家移动逻辑（速度 160 * 1.2 = 192）
    const playerSpeed = 192;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 160）
    const enemySpeed = 160;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算玩家与敌人的距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新状态文本
    this.statusText.setText([
      `生存时间: ${(this.survivalTime / 1000).toFixed(1)}s`,
      `与敌人距离: ${Math.floor(this.distanceToEnemy)}`,
      `玩家速度: 192 | 敌人速度: 160`
    ]);
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有移动
    player.setVelocity(0);
    enemy.setVelocity(0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, '游戏结束！', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    const finalTimeText = this.add.text(400, 360, `生存时间: ${(this.survivalTime / 1000).toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 410, '刷新页面重新开始', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 更新状态文本
    this.statusText.setText([
      `游戏结束！`,
      `最终生存时间: ${(this.survivalTime / 1000).toFixed(1)}s`,
      `玩家速度: 192 | 敌人速度: 160`
    ]);
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