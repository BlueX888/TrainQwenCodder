class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.isMoving = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理精灵玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    
    // 设置拖拽阻力，使玩家停止输入时能停下
    this.player.setDrag(800);
    this.player.setMaxVelocity(200);

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xFFFFFF, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置加速度
    this.player.setAcceleration(0);

    // 检测键盘输入并设置加速度
    const acceleration = 800;
    this.isMoving = false;

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setAccelerationX(-acceleration);
      this.isMoving = true;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setAccelerationX(acceleration);
      this.isMoving = true;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setAccelerationY(-acceleration);
      this.isMoving = true;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setAccelerationY(acceleration);
      this.isMoving = true;
    }

    // 实现边界循环效果（wrap）
    // 当玩家移出边界时，从对侧出现
    this.physics.world.wrap(this.player, 16);

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    const velocityX = Math.round(this.player.body.velocity.x);
    const velocityY = Math.round(this.player.body.velocity.y);
    const speed = Math.round(Math.sqrt(velocityX * velocityX + velocityY * velocityY));

    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Velocity: (${velocityX}, ${velocityY})`,
      `Speed: ${speed}/200`,
      `Moving: ${this.isMoving ? 'Yes' : 'No'}`,
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