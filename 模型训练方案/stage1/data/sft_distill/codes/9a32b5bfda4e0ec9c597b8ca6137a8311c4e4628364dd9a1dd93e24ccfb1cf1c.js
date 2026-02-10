// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpForce = -240;
    this.signals = [];
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setDisplaySize(800, 50);
    this.ground.refreshBody();

    // 创建平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      this.onPlayerLanded();
    });
    this.physics.add.collider(this.player, this.platforms, () => {
      this.onPlayerLanded();
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.attemptJump();
    });

    // 显示信息文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化全局信号
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isGrounded: false,
      jumps: []
    };

    this.updateInfoText();
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

    // 检测是否在地面
    const isGrounded = this.player.body.touching.down;
    window.__signals__.isGrounded = isGrounded;

    this.updateInfoText();
  }

  attemptJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpForce);
      this.jumpCount++;

      // 记录跳跃信息
      const jumpInfo = {
        timestamp: Date.now(),
        jumpNumber: this.jumpCount,
        position: { x: this.player.x, y: this.player.y },
        isDoubleJump: this.jumpCount === 2
      };

      this.signals.push(jumpInfo);
      window.__signals__.totalJumps++;
      window.__signals__.jumpCount = this.jumpCount;
      window.__signals__.jumps.push(jumpInfo);

      // 输出日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpCount: this.jumpCount,
        totalJumps: window.__signals__.totalJumps,
        isDoubleJump: this.jumpCount === 2,
        position: { x: Math.floor(this.player.x), y: Math.floor(this.player.y) }
      }));

      this.updateInfoText();
    }
  }

  onPlayerLanded() {
    // 只有当玩家真正落地时才重置跳跃计数
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      window.__signals__.jumpCount = 0;

      console.log(JSON.stringify({
        event: 'landed',
        totalJumps: window.__signals__.totalJumps
      }));

      this.updateInfoText();
    }
  }

  updateInfoText() {
    const isGrounded = this.player.body.touching.down;
    this.infoText.setText([
      `Jump Count: ${this.jumpCount}/${this.maxJumps}`,
      `Total Jumps: ${window.__signals__.totalJumps}`,
      `Grounded: ${isGrounded ? 'Yes' : 'No'}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Controls:',
      'SPACE - Jump (max 2 times)',
      'LEFT/RIGHT - Move'
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
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
const game = new Phaser.Game(config);