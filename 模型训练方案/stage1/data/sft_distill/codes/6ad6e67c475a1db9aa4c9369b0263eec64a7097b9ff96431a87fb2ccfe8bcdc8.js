// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -800; // 跳跃力度 80 * 10 = 800 (Phaser 使用像素/秒)
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      jumpCount: 0,
      maxJumps: 2,
      playerY: 0,
      isGrounded: false,
      totalJumps: 0,
      logs: []
    };

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x228B22, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169E1, 1);
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

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 角色着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.isGrounded = true;
        this.logAction('landed');
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加说明文字
    this.add.text(20, 20, '按空格键跳跃（可双跳）', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.jumpText = this.add.text(20, 50, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    this.statsText = this.add.text(20, 80, '', {
      fontSize: '16px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 更新 signals
    window.__signals__.jumpCount = this.jumpCount;
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.isGrounded = this.player.body.touching.down;

    // 检测跳跃输入
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptJump();
    }

    // 更新显示文字
    this.jumpText.setText(`当前跳跃次数: ${this.jumpCount}/${this.maxJumps}`);
    this.statsText.setText(
      `总跳跃次数: ${window.__signals__.totalJumps}\n` +
      `角色高度: ${Math.round(this.player.y)}\n` +
      `着地状态: ${window.__signals__.isGrounded ? '是' : '否'}`
    );
  }

  attemptJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      window.__signals__.totalJumps++;
      window.__signals__.isGrounded = false;

      // 记录跳跃动作
      this.logAction('jump', {
        jumpNumber: this.jumpCount,
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
      });

      // 视觉反馈
      this.cameras.main.shake(50, 0.002);
    } else {
      this.logAction('jump_failed', { reason: 'max_jumps_reached' });
    }
  }

  logAction(action, data = {}) {
    const logEntry = {
      timestamp: Date.now(),
      action: action,
      jumpCount: this.jumpCount,
      playerY: Math.round(this.player.y),
      ...data
    };
    
    window.__signals__.logs.push(logEntry);
    console.log(JSON.stringify(logEntry));
    
    // 保持日志数组不超过 50 条
    if (window.__signals__.logs.length > 50) {
      window.__signals__.logs.shift();
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
      gravity: { y: 800 }, // 重力设置为 800
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 创建游戏实例
new Phaser.Game(config);