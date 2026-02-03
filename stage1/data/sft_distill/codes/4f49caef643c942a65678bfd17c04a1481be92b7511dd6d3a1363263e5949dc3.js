class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 冲刺次数统计
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 添加说明文本
    this.add.text(16, 560, '点击鼠标左键进行冲刺（速度720，冷却2.5秒）', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  attemptDash(pointer) {
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    const dashSpeed = 240 * 3; // 720
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;

    // 执行冲刺
    this.player.setVelocity(velocityX, velocityY);

    // 更新状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    this.updateStatusText();

    // 冲刺持续时间（0.2秒后恢复正常）
    this.time.delayedCall(200, () => {
      this.isDashing = false;
      this.updateStatusText();
    });

    // 冷却时间（2.5秒）
    const cooldownDuration = 2500;
    let cooldownElapsed = 0;

    const cooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次进度条
      callback: () => {
        cooldownElapsed += 50;
        const progress = cooldownElapsed / cooldownDuration;
        this.drawCooldownBar(progress);

        if (cooldownElapsed >= cooldownDuration) {
          this.canDash = true;
          this.cooldownBar.clear();
          this.updateStatusText();
          cooldownTimer.destroy();
        }
      },
      loop: true
    });
  }

  drawCooldownBar(progress) {
    this.cooldownBar.clear();
    
    // 背景条
    this.cooldownBar.fillStyle(0x333333, 0.8);
    this.cooldownBar.fillRect(this.player.x - 30, this.player.y - 40, 60, 8);
    
    // 进度条
    const color = progress < 1 ? 0xff0000 : 0x00ff00;
    this.cooldownBar.fillStyle(color, 1);
    this.cooldownBar.fillRect(this.player.x - 30, this.player.y - 40, 60 * progress, 8);
  }

  updateStatusText() {
    const dashStatus = this.isDashing ? '冲刺中' : (this.canDash ? '就绪' : '冷却中');
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${dashStatus}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  update(time, delta) {
    // 持续更新位置显示
    if (this.player) {
      this.statusText.setText([
        `冲刺次数: ${this.dashCount}`,
        `状态: ${this.isDashing ? '冲刺中' : (this.canDash ? '就绪' : '冷却中')}`,
        `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
        `速度: ${Math.round(this.player.body.speed)}`
      ]);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);