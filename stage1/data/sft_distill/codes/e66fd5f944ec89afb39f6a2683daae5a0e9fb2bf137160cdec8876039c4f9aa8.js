class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isOnGround = false; // 可验证的状态信号：是否在地面
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块 32x32）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（棕色矩形 800x50）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理（灰色矩形 200x30）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面和平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(600, 250, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞时更新状态
      if (this.player.body.touching.down) {
        this.isOnGround = true;
      }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 550, 'Controls: Arrow Keys / WASD to move, Space / Up / W to jump', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 检查是否在地面上（通过物理体接触检测）
    const wasOnGround = this.isOnGround;
    this.isOnGround = this.player.body.touching.down;

    // 左右移动（速度 300）
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(300);
    } else {
      // 停止时减速
      this.player.setVelocityX(0);
    }

    // 跳跃（仅在地面时可跳）
    const jumpPressed = this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown;
    
    if (jumpPressed && this.isOnGround) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
    }

    // 更新状态显示
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `On Ground: ${this.isOnGround}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 重力设置为 500
      debug: false // 设置为 true 可以看到物理边界
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
const game = new Phaser.Game(config);