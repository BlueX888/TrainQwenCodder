// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpForce = -300;
    this.totalJumps = 0;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    // 创建平台纹理（棕色平台）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
  }

  create() {
    // 初始化可验证信号
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isGrounded: true,
      playerY: 0,
      events: []
    };

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建额外平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      this.onLanded();
    });
    this.physics.add.collider(this.player, this.platforms, () => {
      this.onLanded();
    });

    // 设置键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加UI文本显示
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(400, 50, '按空格键跳跃（最多2次）\n方向键左右移动', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateInfoText();
  }

  onLanded() {
    // 只有当角色真正着地时才重置跳跃次数
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      window.__signals__.isGrounded = true;
      window.__signals__.events.push({
        type: 'landed',
        time: this.time.now,
        position: { x: this.player.x, y: this.player.y }
      });
      this.updateInfoText();
    }
  }

  update(time, delta) {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        this.performJump();
      }
    }

    // 更新信号数据
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.jumpCount = this.jumpCount;
    window.__signals__.totalJumps = this.totalJumps;
    window.__signals__.isGrounded = this.player.body.touching.down;

    this.updateInfoText();
  }

  performJump() {
    this.player.setVelocityY(this.jumpForce);
    this.jumpCount++;
    this.totalJumps++;

    // 记录跳跃事件
    window.__signals__.events.push({
      type: 'jump',
      jumpNumber: this.jumpCount,
      totalJumps: this.totalJumps,
      time: this.time.now,
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
    });

    // 输出日志JSON
    console.log(JSON.stringify({
      event: 'jump',
      jumpCount: this.jumpCount,
      totalJumps: this.totalJumps,
      maxJumps: this.maxJumps,
      timestamp: this.time.now
    }));

    this.updateInfoText();
  }

  updateInfoText() {
    const jumpsRemaining = this.maxJumps - this.jumpCount;
    const grounded = this.player.body.touching.down ? '是' : '否';
    
    this.infoText.setText([
      `当前跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `剩余跳跃次数: ${jumpsRemaining}`,
      `总跳跃次数: ${this.totalJumps}`,
      `是否着地: ${grounded}`,
      `玩家Y坐标: ${Math.round(this.player.y)}`
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 创建游戏实例
const game = new Phaser.Game(config);