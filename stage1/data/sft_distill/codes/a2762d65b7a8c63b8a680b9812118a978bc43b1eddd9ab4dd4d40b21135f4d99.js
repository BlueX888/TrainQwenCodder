class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.totalJumps = 0;
    this.landingCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      jumpCount: 0,
      totalJumps: 0,
      landingCount: 0,
      isGrounded: true,
      canDoubleJump: true
    };

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 580, 'ground');

    // 创建角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置物理碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 角色落地时重置跳跃次数
      if (this.player.body.touching.down) {
        if (this.jumpCount > 0) {
          this.landingCount++;
          console.log(JSON.stringify({
            event: 'landing',
            landingCount: this.landingCount,
            previousJumps: this.jumpCount
          }));
        }
        this.jumpCount = 0;
        window.__signals__.jumpCount = 0;
        window.__signals__.isGrounded = true;
      }
    });

    // 监听空格键
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(20, 20, 'Press SPACE to jump (Double Jump Available)', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.jumpText = this.add.text(20, 50, 'Jumps Used: 0/2', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.totalJumpText = this.add.text(20, 80, 'Total Jumps: 0', {
      fontSize: '16px',
      fill: '#00ffff'
    });

    this.landingText = this.add.text(20, 110, 'Landings: 0', {
      fontSize: '16px',
      fill: '#ff00ff'
    });

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.attemptJump();
    });

    console.log(JSON.stringify({
      event: 'game_start',
      maxJumps: this.maxJumps,
      jumpVelocity: 240,
      gravity: 200
    }));
  }

  attemptJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-240);
      this.jumpCount++;
      this.totalJumps++;
      
      // 更新信号
      window.__signals__.jumpCount = this.jumpCount;
      window.__signals__.totalJumps = this.totalJumps;
      window.__signals__.isGrounded = false;
      window.__signals__.canDoubleJump = this.jumpCount < this.maxJumps;

      // 输出日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpNumber: this.jumpCount,
        totalJumps: this.totalJumps,
        isDoubleJump: this.jumpCount === 2,
        remainingJumps: this.maxJumps - this.jumpCount
      }));

      // 更新显示
      this.updateDisplay();
    } else {
      console.log(JSON.stringify({
        event: 'jump_failed',
        reason: 'max_jumps_reached',
        currentJumps: this.jumpCount
      }));
    }
  }

  updateDisplay() {
    this.jumpText.setText(`Jumps Used: ${this.jumpCount}/${this.maxJumps}`);
    this.totalJumpText.setText(`Total Jumps: ${this.totalJumps}`);
    this.landingText.setText(`Landings: ${this.landingCount}`);
    window.__signals__.landingCount = this.landingCount;
  }

  update(time, delta) {
    // 检测是否在地面上
    const isGrounded = this.player.body.touching.down;
    
    // 更新地面状态
    if (isGrounded && window.__signals__.isGrounded === false) {
      window.__signals__.isGrounded = true;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

const game = new Phaser.Game(config);