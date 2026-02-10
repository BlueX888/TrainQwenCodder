class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -800; // 跳跃力度 80 * 10 = 800 (适配重力比例)
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      isGrounded: true,
      position: { x: 0, y: 0 },
      events: []
    };

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 着陆时重置跳跃计数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        window.__signals__.jumpCount = 0;
        window.__signals__.isGrounded = true;
        this.logEvent('landed');
      }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(20, 20, 'Press SPACE to jump (Double Jump enabled)', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.jumpText = this.add.text(20, 50, 'Jumps Available: 2/2', {
      fontSize: '16px',
      fill: '#00ff00'
    });

    this.statsText = this.add.text(20, 80, 'Total Jumps: 0', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.logEvent('game_started');
  }

  update() {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptJump();
    }

    // 更新跳跃文本
    const jumpsLeft = this.maxJumps - this.jumpCount;
    this.jumpText.setText(`Jumps Available: ${jumpsLeft}/${this.maxJumps}`);
    this.statsText.setText(`Total Jumps: ${window.__signals__.totalJumps}`);

    // 更新位置信息
    window.__signals__.position = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 检测是否在地面
    window.__signals__.isGrounded = this.player.body.touching.down;
  }

  attemptJump() {
    // 检查是否还有跳跃次数
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      
      // 更新 signals
      window.__signals__.jumpCount = this.jumpCount;
      window.__signals__.totalJumps++;
      window.__signals__.isGrounded = false;

      // 记录跳跃事件
      const jumpType = this.jumpCount === 1 ? 'first_jump' : 'double_jump';
      this.logEvent(jumpType);

      console.log(`Jump ${this.jumpCount}/${this.maxJumps} executed`);
    } else {
      this.logEvent('jump_failed_no_jumps');
      console.log('No jumps available');
    }
  }

  logEvent(eventName) {
    const event = {
      type: eventName,
      timestamp: Date.now(),
      jumpCount: this.jumpCount,
      totalJumps: window.__signals__.totalJumps,
      position: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      }
    };
    
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

new Phaser.Game(config);