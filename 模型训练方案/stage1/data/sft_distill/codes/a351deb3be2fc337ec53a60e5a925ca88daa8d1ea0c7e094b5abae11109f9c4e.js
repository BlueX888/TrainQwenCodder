class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -800; // 跳跃力度80 * 10 = 800
    this.signals = {
      totalJumps: 0,
      doubleJumpsUsed: 0,
      isGrounded: true,
      currentJumpCount: 0
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建角色纹理（绿色方块）
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

    // 创建角色（物理精灵）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建地面（静态物理组）
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 575, 'ground');

    // 添加碰撞检测
    this.physics.add.collider(this.player, platforms, () => {
      // 角色触地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.signals.isGrounded = true;
        this.signals.currentJumpCount = 0;
        this.updateSignals();
      }
    });

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 暴露signals到全局
    window.__signals__ = this.signals;

    this.updateInfoText();
  }

  update(time, delta) {
    // 检测空格键按下（使用justDown避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleJump();
    }

    // 更新信息显示
    this.updateInfoText();

    // 检测是否在空中
    if (!this.player.body.touching.down && this.signals.isGrounded) {
      this.signals.isGrounded = false;
      this.updateSignals();
    }
  }

  handleJump() {
    // 检查是否还能跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      
      // 更新统计信息
      this.signals.totalJumps++;
      this.signals.currentJumpCount = this.jumpCount;
      
      // 如果是第二次跳跃，记录双跳使用次数
      if (this.jumpCount === 2) {
        this.signals.doubleJumpsUsed++;
      }
      
      this.signals.isGrounded = false;
      this.updateSignals();

      // 输出日志
      console.log(JSON.stringify({
        event: 'jump',
        jumpNumber: this.jumpCount,
        totalJumps: this.signals.totalJumps,
        doubleJumpsUsed: this.signals.doubleJumpsUsed,
        timestamp: Date.now()
      }));
    }
  }

  updateInfoText() {
    const status = this.player.body.touching.down ? '着地' : '空中';
    const jumpsLeft = this.maxJumps - this.jumpCount;
    
    this.infoText.setText([
      `状态: ${status}`,
      `可用跳跃次数: ${jumpsLeft}/${this.maxJumps}`,
      `当前跳跃计数: ${this.jumpCount}`,
      `总跳跃次数: ${this.signals.totalJumps}`,
      `双跳使用次数: ${this.signals.doubleJumpsUsed}`,
      '',
      '按空格键跳跃'
    ]);
  }

  updateSignals() {
    // 触发signals更新事件
    window.dispatchEvent(new CustomEvent('signalsUpdate', { 
      detail: this.signals 
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 监听signals更新（用于测试验证）
window.addEventListener('signalsUpdate', (event) => {
  console.log(JSON.stringify({
    event: 'signalsUpdate',
    signals: event.detail,
    timestamp: Date.now()
  }));
});