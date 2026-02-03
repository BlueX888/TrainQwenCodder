class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 用于验证循环次数的状态信号
  }

  preload() {
    // 程序化生成紫色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建紫色玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
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
    this.debugText.setDepth(100);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    const speed = 300;

    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 循环地图效果 - 边界检测与传送
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左右边界循环
    if (this.player.x < -halfWidth) {
      this.player.x = this.cameras.main.width + halfWidth;
      this.wrapCount++;
    } else if (this.player.x > this.cameras.main.width + halfWidth) {
      this.player.x = -halfWidth;
      this.wrapCount++;
    }

    // 上下边界循环
    if (this.player.y < -halfHeight) {
      this.player.y = this.cameras.main.height + halfHeight;
      this.wrapCount++;
    } else if (this.player.y > this.cameras.main.height + halfHeight) {
      this.player.y = -halfHeight;
      this.wrapCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新调试信息
    this.debugText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: ${speed}`,
      `Wrap Count: ${this.wrapCount}`,
      `Use Arrow Keys or WASD to move`
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