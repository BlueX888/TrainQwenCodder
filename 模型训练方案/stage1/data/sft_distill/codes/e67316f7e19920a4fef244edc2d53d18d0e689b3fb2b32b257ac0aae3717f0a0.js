class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 状态信号：穿越边界次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 不阻挡世界边界，允许移出
    
    // 设置移动速度
    this.moveSpeed = 240;

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xffff00, 0.5);
    boundaryGraphics.strokeRect(0, 0, 800, 600);

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = this.moveSpeed / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 循环边界检测
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const worldWidth = this.cameras.main.width;
    const worldHeight = this.cameras.main.height;

    let crossed = false;

    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = worldWidth + playerWidth / 2;
      crossed = true;
    } else if (this.player.x > worldWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      crossed = true;
    }

    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = worldHeight + playerHeight / 2;
      crossed = true;
    } else if (this.player.y > worldHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      crossed = true;
    }

    // 记录穿越次数
    if (crossed) {
      this.crossBorderCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      'Controls: Arrow Keys or WASD',
      `Speed: ${this.moveSpeed}`,
      `Border Crosses: ${this.crossBorderCount}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);