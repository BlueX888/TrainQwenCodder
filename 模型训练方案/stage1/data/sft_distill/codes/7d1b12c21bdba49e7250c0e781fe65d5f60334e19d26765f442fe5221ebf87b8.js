class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.totalJumps = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isOnGround: true,
      playerY: 0,
      gameReady: true
    };

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 角色落地，重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.isOnGround = true;
        window.__signals__.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.handleJump();
    });

    // 添加文本提示
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加操作说明
    this.add.text(16, 60, 'Press SPACE to jump (max 2 jumps)', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    console.log('Game initialized - Press SPACE to double jump');
  }

  handleJump() {
    // 检查是否还有跳跃次数
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(-360);
      this.jumpCount++;
      this.totalJumps++;

      // 更新信号
      window.__signals__.jumpCount = this.jumpCount;
      window.__signals__.totalJumps = this.totalJumps;
      window.__signals__.isOnGround = false;

      // 输出日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpCount: this.jumpCount,
        totalJumps: this.totalJumps,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 更新角色位置信号
    window.__signals__.playerY = Math.round(this.player.y);

    // 检测是否在地面上
    const isGrounded = this.player.body.touching.down;
    
    // 更新信息文本
    this.infoText.setText([
      `Jump Count: ${this.jumpCount}/${this.maxJumps}`,
      `Total Jumps: ${this.totalJumps}`,
      `On Ground: ${isGrounded}`,
      `Player Y: ${Math.round(this.player.y)}`
    ]);

    // 左右移动控制（可选）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);