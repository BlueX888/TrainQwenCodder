class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.crossedBoundaryCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 圆形玩家
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵并启用物理
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加调试文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xffffff, 0.3);
    boundaryGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    const speed = 300;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 循环地图效果 - 边界检测
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左右边界
    if (this.player.x < -playerWidth / 2) {
      this.player.x = 800 + playerWidth / 2;
      this.crossedBoundaryCount++;
    } else if (this.player.x > 800 + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossedBoundaryCount++;
    }

    // 上下边界
    if (this.player.y < -playerHeight / 2) {
      this.player.y = 600 + playerHeight / 2;
      this.crossedBoundaryCount++;
    } else if (this.player.y > 600 + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossedBoundaryCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: ${speed}`,
      `Boundary Crossed: ${this.crossedBoundaryCount}`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
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

const game = new Phaser.Game(config);