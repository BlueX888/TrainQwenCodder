class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 记录穿越边界次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.scale;

    // 创建绿色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
    
    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 0.5);
    borderGraphics.strokeRect(0, 0, width, height);

    // 初始化状态
    this.updateStatus();
  }

  update(time, delta) {
    const { width, height } = this.scale;

    // 重置速度
    this.player.setVelocity(0);

    // 处理输入
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(160);
    }

    if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.setVelocityY(160);
    }

    // 处理对角线移动，保持速度一致
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(160);
    }

    // 循环地图效果 - 检测边界并从对侧出现
    const playerHalfWidth = this.player.width / 2;
    const playerHalfHeight = this.player.height / 2;

    // 左右边界循环
    if (this.player.x < -playerHalfWidth) {
      this.player.x = width + playerHalfWidth;
      this.wrapCount++;
    } else if (this.player.x > width + playerHalfWidth) {
      this.player.x = -playerHalfWidth;
      this.wrapCount++;
    }

    // 上下边界循环
    if (this.player.y < -playerHalfHeight) {
      this.player.y = height + playerHalfHeight;
      this.wrapCount++;
    } else if (this.player.y > height + playerHalfHeight) {
      this.player.y = -playerHalfHeight;
      this.wrapCount++;
    }

    // 更新状态
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Player Position: (${this.playerX}, ${this.playerY})`,
      `Speed: 160`,
      `Wrap Count: ${this.wrapCount}`,
      `Controls: Arrow Keys or WASD`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);