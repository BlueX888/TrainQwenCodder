class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 跳跃计数器（可验证状态）
    this.maxJumps = 2; // 最大跳跃次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建玩家精灵（带物理属性）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 580, 'ground');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 玩家接触地面时重置跳跃计数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 60, 'Press SPACE to jump (Max 2 jumps)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatus();
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 检查是否还有跳跃次数
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(-360); // 跳跃力度360
        this.jumpCount++;
        this.updateStatus();
      }
    }

    // 当玩家接触地面时重置跳跃计数
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.updateStatus();
    }
  }

  updateStatus() {
    // 更新状态文本显示
    const remainingJumps = this.maxJumps - this.jumpCount;
    const onGround = this.player.body.touching.down;
    this.statusText.setText(
      `Jumps Used: ${this.jumpCount}/${this.maxJumps} | ` +
      `Remaining: ${remainingJumps} | ` +
      `On Ground: ${onGround}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 }, // 重力设置为400
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);