class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.positionText = null;
    this.wrapCount = 0; // 用于验证循环次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不碰撞边界，允许移出
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建状态显示文本
    this.positionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界指示线
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0x00ff00, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);

    // 添加说明文本
    this.add.text(10, 550, 'Use Arrow Keys or WASD to move', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(240);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-240);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(240);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(240);
    }

    // 循环地图效果 - 边界检测与传送
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;

    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = 800 + playerWidth / 2;
      this.wrapCount++;
    } else if (this.player.x > 800 + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.wrapCount++;
    }

    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = 600 + playerHeight / 2;
      this.wrapCount++;
    } else if (this.player.y > 600 + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.wrapCount++;
    }

    // 更新状态显示
    this.positionText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: ${Math.round(this.player.body.velocity.length())}`
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