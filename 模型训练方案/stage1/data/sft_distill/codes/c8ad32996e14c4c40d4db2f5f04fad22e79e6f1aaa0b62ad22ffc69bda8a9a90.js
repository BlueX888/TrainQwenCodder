// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isOnGround: false,
      playerY: 0,
      events: []
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（棕色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 触地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.isOnGround = true;
        window.__signals__.jumpCount = this.jumpCount;
        
        this.logEvent('landed', {
          jumpCount: this.jumpCount,
          y: this.player.y
        });
      }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文字提示
    this.add.text(16, 16, '按空格键跳跃 (最多2次)', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.jumpText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    console.log('[双跳系统] 初始化完成');
    this.logEvent('init', { maxJumps: this.maxJumps, jumpVelocity: this.jumpVelocity });
  }

  update(time, delta) {
    // 更新玩家位置信息
    window.__signals__.playerY = Math.round(this.player.y);

    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.tryJump();
    }

    // 更新显示文本
    const onGround = this.player.body.touching.down;
    const jumpsLeft = this.maxJumps - this.jumpCount;
    
    this.jumpText.setText([
      `跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `剩余跳跃: ${jumpsLeft}`,
      `状态: ${onGround ? '在地面' : '在空中'}`,
      `总跳跃数: ${window.__signals__.totalJumps}`
    ]);

    // 检测是否在地面上
    window.__signals__.isOnGround = onGround;
  }

  tryJump() {
    // 检查是否还能跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      window.__signals__.totalJumps++;
      window.__signals__.jumpCount = this.jumpCount;

      const jumpType = this.jumpCount === 1 ? '第一跳' : '第二跳';
      console.log(`[跳跃] ${jumpType} - 当前跳跃次数: ${this.jumpCount}`);

      this.logEvent('jump', {
        jumpNumber: this.jumpCount,
        jumpType: jumpType,
        velocity: this.jumpVelocity,
        y: this.player.y
      });

      // 在空中时标记不在地面
      if (this.jumpCount > 0) {
        window.__signals__.isOnGround = false;
      }
    } else {
      console.log('[跳跃] 已达到最大跳跃次数，需要落地');
      this.logEvent('jumpFailed', {
        reason: 'max_jumps_reached',
        jumpCount: this.jumpCount
      });
    }
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      time: Date.now(),
      data: data
    };
    window.__signals__.events.push(event);
    console.log(`[Event] ${JSON.stringify(event)}`);
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始 signals
console.log('[Signals] 初始化:', JSON.stringify(window.__signals__, null, 2));