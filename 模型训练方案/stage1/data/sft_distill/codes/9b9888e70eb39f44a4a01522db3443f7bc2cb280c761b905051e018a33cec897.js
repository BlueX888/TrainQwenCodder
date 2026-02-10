class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.wrapCount = 0; // 记录循环次数
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 使用 Graphics 创建绿色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（使用 Arcade 物理系统）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界参考线
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xff0000, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(80);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-80);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(80);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(80);
    }

    // 循环地图效果：检测边界并从对侧出现
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;

    // 左右边界循环
    if (this.player.x > this.scale.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.wrapCount++;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = this.scale.width + playerWidth / 2;
      this.wrapCount++;
    }

    // 上下边界循环
    if (this.player.y > this.scale.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.wrapCount++;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = this.scale.height + playerHeight / 2;
      this.wrapCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新调试信息
    this.debugText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 80`,
      '',
      'Controls: Arrow Keys or WASD'
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