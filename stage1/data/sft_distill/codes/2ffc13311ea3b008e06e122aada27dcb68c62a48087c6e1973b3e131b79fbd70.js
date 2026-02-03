class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.captureCount = 0; // 状态信号：被捕获次数
    this.escapeTime = 0; // 状态信号：逃脱时间
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 300 * 1.2; // 360

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemySpeed = 300;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCapture, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(16, 560, 'Use Arrow Keys or WASD to move | Player Speed: 360 | Enemy Speed: 300', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新逃脱时间
    this.escapeTime += delta;

    // 重置玩家速度
    this.player.setVelocity(0);

    // 处理玩家输入（方向键）
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 更新状态文本
    this.updateStatusText();
  }

  handleCapture(player, enemy) {
    // 被捕获
    this.captureCount++;
    this.escapeTime = 0;

    // 重置位置
    this.player.setPosition(400, 300);
    this.enemy.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 停止敌人移动片刻
    this.enemy.setVelocity(0);
    this.time.delayedCall(500, () => {
      // 延迟后继续追踪
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const escapeSeconds = (this.escapeTime / 1000).toFixed(1);
    this.statusText.setText(
      `Captured: ${this.captureCount} | Escape Time: ${escapeSeconds}s`
    );
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