class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.dashCount = 0;          // 冲刺次数统计
    this.isDashing = false;      // 是否正在冲刺
    this.dashCooldown = false;   // 是否在冷却中
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const DASH_SPEED = 360 * 3;  // 1080
    const DASH_DURATION = 200;    // 冲刺持续时间（毫秒）
    const COOLDOWN_TIME = 2000;   // 冷却时间（毫秒）
    const NORMAL_SPEED = 200;     // 正常移动速度

    // 创建橙色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建冷却指示器（灰色圆圈）
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0x888888, 0.5);
    cooldownGraphics.fillCircle(16, 16, 20);
    cooldownGraphics.generateTexture('cooldownIndicator', 32, 32);
    cooldownGraphics.destroy();

    this.cooldownIndicator = this.add.sprite(
      this.player.x,
      this.player.y,
      'cooldownIndicator'
    );
    this.cooldownIndicator.setVisible(false);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 更新状态显示
    this.updateStatusText();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (this.isDashing || this.dashCooldown) {
      return;
    }

    const DASH_SPEED = 360 * 3;
    const DASH_DURATION = 200;
    const COOLDOWN_TIME = 2000;

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 设置冲刺状态
    this.isDashing = true;
    this.dashCount++;

    // 应用冲刺速度
    this.player.setVelocity(
      Math.cos(angle) * DASH_SPEED,
      Math.sin(angle) * DASH_SPEED
    );

    // 冲刺持续时间结束后恢复正常
    this.time.addEvent({
      delay: DASH_DURATION,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0, 0);
        
        // 开始冷却
        this.dashCooldown = true;
        this.cooldownIndicator.setVisible(true);
        
        // 冷却结束
        this.time.addEvent({
          delay: COOLDOWN_TIME,
          callback: () => {
            this.dashCooldown = false;
            this.cooldownIndicator.setVisible(false);
            this.updateStatusText();
          }
        });
        
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    const NORMAL_SPEED = 200;

    // 更新冷却指示器位置
    this.cooldownIndicator.setPosition(this.player.x, this.player.y);

    // 只有在非冲刺状态下才能用键盘控制
    if (!this.isDashing) {
      this.player.setVelocity(0, 0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-NORMAL_SPEED);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(NORMAL_SPEED);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-NORMAL_SPEED);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(NORMAL_SPEED);
      }
    }
  }

  updateStatusText() {
    const status = [
      `Dash Count: ${this.dashCount}`,
      `Status: ${this.isDashing ? 'DASHING!' : this.dashCooldown ? 'Cooldown...' : 'Ready'}`,
      `Speed: ${Math.round(this.player.body.speed)}`,
      '',
      'Controls:',
      '- Arrow Keys: Move',
      '- Right Click: Dash (2s cooldown)'
    ];
    this.statusText.setText(status.join('\n'));
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);