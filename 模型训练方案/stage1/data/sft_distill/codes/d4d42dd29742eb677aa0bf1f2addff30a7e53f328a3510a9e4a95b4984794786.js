// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -300; // 跳跃力度
    this.totalJumps = 0; // 总跳跃次数（用于验证）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建可验证信号对象
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isGrounded: true,
      playerY: 0,
      canDoubleJump: true
    };

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 玩家落地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.isGrounded = true;
        console.log(JSON.stringify({
          event: 'landed',
          jumpCount: this.jumpCount,
          totalJumps: this.totalJumps
        }));
      }
    });

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(20, 20, 'Press SPACE to jump (Double Jump enabled)', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(20, 50, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 添加跳跃历史显示
    this.historyText = this.add.text(20, 80, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 检测跳跃输入
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptJump();
    }

    // 更新状态显示
    const isGrounded = this.player.body.touching.down;
    this.statusText.setText(
      `Jump Count: ${this.jumpCount}/${this.maxJumps} | ` +
      `Grounded: ${isGrounded} | ` +
      `Total Jumps: ${this.totalJumps}`
    );

    this.historyText.setText(
      `Velocity Y: ${Math.round(this.player.body.velocity.y)} | ` +
      `Position Y: ${Math.round(this.player.y)}`
    );

    // 更新可验证信号
    window.__signals__.jumpCount = this.jumpCount;
    window.__signals__.totalJumps = this.totalJumps;
    window.__signals__.isGrounded = isGrounded;
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.canDoubleJump = this.jumpCount < this.maxJumps;
  }

  attemptJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.totalJumps++;
      
      // 更新信号
      window.__signals__.isGrounded = false;
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpNumber: this.jumpCount,
        totalJumps: this.totalJumps,
        isDoubleJump: this.jumpCount === 2,
        playerY: Math.round(this.player.y),
        velocityY: this.jumpVelocity
      }));

      // 如果是双跳，添加视觉反馈
      if (this.jumpCount === 2) {
        const circle = this.add.circle(this.player.x, this.player.y, 20, 0xffff00, 0.5);
        this.tweens.add({
          targets: circle,
          alpha: 0,
          scale: 2,
          duration: 300,
          onComplete: () => circle.destroy()
        });
      }
    } else {
      console.log(JSON.stringify({
        event: 'jump_blocked',
        reason: 'max_jumps_reached',
        jumpCount: this.jumpCount
      }));
    }
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
      gravity: { y: 200 }, // 设置重力为200
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 初始化信号对象
window.__signals__ = {
  jumpCount: 0,
  totalJumps: 0,
  isGrounded: true,
  playerY: 0,
  canDoubleJump: true
};