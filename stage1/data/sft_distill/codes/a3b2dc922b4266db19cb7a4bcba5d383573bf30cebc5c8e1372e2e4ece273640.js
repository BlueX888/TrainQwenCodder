class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -160; // 跳跃力度
    this.statusText = null;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x2ecc71, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理（棕色）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      this.onPlayerLanded();
    });
    this.physics.add.collider(this.player, this.platforms, () => {
      this.onPlayerLanded();
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件（使用justDown避免长按连续触发）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.jump();
    });

    // 创建状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    const instructionText = this.add.text(400, 50, '按空格键跳跃（可双跳）\n使用方向键左右移动', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center'
    });
    instructionText.setOrigin(0.5, 0);

    // 初始化状态
    this.updateStatus();
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新状态显示
    this.updateStatus();

    // 检测是否在地面或平台上（用于重置跳跃次数）
    if (this.player.body.touching.down || this.player.body.blocked.down) {
      if (this.jumpCount > 0) {
        this.jumpCount = 0;
        this.updateStatus();
      }
    }
  }

  jump() {
    // 检查是否还能跳跃
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.updateStatus();
      
      // 视觉反馈：跳跃时改变颜色
      if (this.jumpCount === 1) {
        this.player.setTint(0x3498db); // 第一次跳跃：蓝色
      } else if (this.jumpCount === 2) {
        this.player.setTint(0xe74c3c); // 第二次跳跃：红色
      }
    }
  }

  onPlayerLanded() {
    // 落地时重置跳跃次数和颜色
    if (this.jumpCount > 0) {
      this.jumpCount = 0;
      this.player.clearTint();
      this.updateStatus();
    }
  }

  updateStatus() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const isGrounded = this.player.body.touching.down || this.player.body.blocked.down;
    
    this.statusText.setText([
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}`,
      `已使用跳跃: ${this.jumpCount}`,
      `是否着地: ${isGrounded ? '是' : '否'}`,
      `玩家Y坐标: ${Math.floor(this.player.y)}`,
      `垂直速度: ${Math.floor(this.player.body.velocity.y)}`
    ]);
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
new Phaser.Game(config);