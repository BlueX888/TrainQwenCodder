// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -360;
    this.totalJumps = 0;
    this.isGrounded = false;
  }

  preload() {
    // 创建角色纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 落地时重置跳跃计数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.isGrounded = true;
        this.updateSignals();
      }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(20, 20, '按 空格键 或 ↑ 进行双跳', {
      fontSize: '20px',
      fill: '#000'
    });

    this.jumpInfoText = this.add.text(20, 50, '', {
      fontSize: '18px',
      fill: '#333'
    });

    // 初始化signals
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isGrounded: false,
      canJump: true,
      playerY: this.player.y,
      playerVelocityY: 0
    };

    this.updateSignals();
  }

  update() {
    // 检测是否在地面
    this.isGrounded = this.player.body.touching.down;

    // 跳跃输入检测
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                        Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (jumpPressed && this.jumpCount < this.maxJumps) {
      this.performJump();
    }

    // 更新信息显示
    this.jumpInfoText.setText([
      `当前跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `总跳跃次数: ${this.totalJumps}`,
      `是否在地面: ${this.isGrounded ? '是' : '否'}`,
      `玩家高度: ${Math.round(this.player.y)}`,
      `垂直速度: ${Math.round(this.player.body.velocity.y)}`
    ]);

    // 更新signals
    this.updateSignals();
  }

  performJump() {
    this.player.setVelocityY(this.jumpVelocity);
    this.jumpCount++;
    this.totalJumps++;
    
    // 输出跳跃日志
    console.log(JSON.stringify({
      event: 'jump',
      jumpNumber: this.jumpCount,
      totalJumps: this.totalJumps,
      timestamp: Date.now(),
      playerY: Math.round(this.player.y),
      isDoubleJump: this.jumpCount === 2
    }));

    this.updateSignals();
  }

  updateSignals() {
    window.__signals__ = {
      jumpCount: this.jumpCount,
      totalJumps: this.totalJumps,
      isGrounded: this.isGrounded,
      canJump: this.jumpCount < this.maxJumps,
      playerY: Math.round(this.player.y),
      playerVelocityY: Math.round(this.player.body.velocity.y),
      maxJumps: this.maxJumps
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: DoubleJumpScene,
  backgroundColor: '#87CEEB'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log(JSON.stringify({
  event: 'gameStart',
  config: {
    gravity: 500,
    jumpVelocity: -360,
    maxJumps: 2
  },
  timestamp: Date.now()
}));