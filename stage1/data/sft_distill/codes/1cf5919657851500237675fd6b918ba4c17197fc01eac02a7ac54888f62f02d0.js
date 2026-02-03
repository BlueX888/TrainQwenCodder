class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录玩家穿越边界次数
    this.currentX = 0;  // 状态信号：当前X坐标
    this.currentY = 0;  // 状态信号：当前Y坐标
  }

  preload() {
    // 使用 Graphics 创建粉色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许穿越
    
    // 设置玩家速度为 360
    this.moveSpeed = 360;
    
    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建 WASD 键作为备选
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 绘制边界参考线
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xFFFFFF, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.moveSpeed);
    }
    
    // 循环边界检测
    const playerRadius = 20; // 玩家半径
    
    // 左右边界循环
    if (this.player.x < -playerRadius) {
      this.player.x = 800 + playerRadius;
      this.wrapCount++;
    } else if (this.player.x > 800 + playerRadius) {
      this.player.x = -playerRadius;
      this.wrapCount++;
    }
    
    // 上下边界循环
    if (this.player.y < -playerRadius) {
      this.player.y = 600 + playerRadius;
      this.wrapCount++;
    } else if (this.player.y > 600 + playerRadius) {
      this.player.y = -playerRadius;
      this.wrapCount++;
    }
    
    // 更新状态信号
    this.currentX = Math.round(this.player.x);
    this.currentY = Math.round(this.player.y);
    
    // 更新调试信息
    this.debugText.setText([
      `Position: (${this.currentX}, ${this.currentY})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: ${this.moveSpeed}`,
      '',
      'Controls: Arrow Keys or WASD'
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