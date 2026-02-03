// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -300;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      jumpCount: 0,
      isGrounded: true,
      totalJumps: 0,
      position: { x: 0, y: 0 }
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
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 角色着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.jumpCount = 0;
        window.__signals__.isGrounded = true;
      }
    });

    // 监听空格键跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加指示文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 60, 'Press SPACE to jump (max 2 jumps)', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      maxJumps: this.maxJumps
    }));
  }

  update(time, delta) {
    // 检测跳跃输入（使用 JustDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleJump();
    }

    // 更新信号
    window.__signals__.position = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.isGrounded = this.player.body.touching.down;

    // 更新显示信息
    this.infoText.setText([
      `Jump Count: ${this.jumpCount}/${this.maxJumps}`,
      `Total Jumps: ${window.__signals__.totalJumps}`,
      `Grounded: ${window.__signals__.isGrounded}`,
      `Position: (${window.__signals__.position.x}, ${window.__signals__.position.y})`
    ]);
  }

  handleJump() {
    // 双跳逻辑：只要跳跃次数小于最大次数就允许跳跃
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      window.__signals__.jumpCount = this.jumpCount;
      window.__signals__.totalJumps++;
      window.__signals__.isGrounded = false;

      // 输出跳跃日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpNumber: this.jumpCount,
        totalJumps: window.__signals__.totalJumps,
        timestamp: Date.now(),
        position: window.__signals__.position
      }));
    } else {
      console.log(JSON.stringify({
        event: 'jump_failed',
        reason: 'max_jumps_reached',
        timestamp: Date.now()
      }));
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
new Phaser.Game(config);