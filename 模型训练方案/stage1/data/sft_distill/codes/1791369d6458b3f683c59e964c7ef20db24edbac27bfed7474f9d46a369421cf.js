class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpPower = -300; // 跳跃力度
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 当玩家接触地面时，重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, 'Press SPACE to jump (max 2 jumps)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 检查是否还有跳跃次数
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpPower);
        this.jumpCount++;
        this.updateStatusText();
      }
    }

    // 检测着地状态（用于显示）
    if (this.player.body.touching.down && this.jumpCount !== 0) {
      this.jumpCount = 0;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const status = this.player.body.touching.down ? 'On Ground' : 'In Air';
    this.statusText.setText(
      `Status: ${status}\n` +
      `Jumps Used: ${this.jumpCount}/${this.maxJumps}\n` +
      `Remaining Jumps: ${remainingJumps}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 }, // 设置重力为800
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);