class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -240; // 跳跃力度
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 玩家着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.add.text(16, 50, '按空格键跳跃（最多2次）\n左右方向键移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加一些额外的平台用于测试
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();

    this.platform1 = this.physics.add.staticSprite(300, 400, 'platform');
    this.platform2 = this.physics.add.staticSprite(600, 300, 'platform');

    this.physics.add.collider(this.player, this.platform1, () => {
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });
    this.physics.add.collider(this.player, this.platform2, () => {
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });
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
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
      }
    }

    // 更新状态显示
    const remainingJumps = this.maxJumps - this.jumpCount;
    const isOnGround = this.player.body.touching.down;
    this.statusText.setText(
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}\n` +
      `当前状态: ${isOnGround ? '着地' : '空中'}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);