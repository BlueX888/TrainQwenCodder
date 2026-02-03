class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.canDash = true; // 状态信号：是否可以冲刺
    this.cooldownRemaining = 0; // 状态信号：剩余冷却时间
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建白色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻尼使冲刺后逐渐减速

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    // 更新状态显示
    this.updateStatusText();
  }

  performDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 冲刺速度：80 * 3 = 240
    const dashSpeed = 240;
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;

    // 施加冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 增加冲刺次数
    this.dashCount++;

    // 进入冷却状态
    this.canDash = false;
    this.cooldownRemaining = 1.5;

    // 创建冷却计时器
    this.time.addEvent({
      delay: 1500, // 1.5秒冷却
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.updateStatusText();
      }
    });

    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    // 更新冷却时间
    if (!this.canDash && this.cooldownRemaining > 0) {
      this.cooldownRemaining -= delta / 1000;
      if (this.cooldownRemaining < 0) {
        this.cooldownRemaining = 0;
      }
      this.updateStatusText();
    }

    // 绘制冷却条
    this.drawCooldownBar();
  }

  updateStatusText() {
    const dashStatus = this.canDash ? '可用' : '冷却中';
    const cooldownText = this.canDash ? '' : ` (${this.cooldownRemaining.toFixed(1)}s)`;
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冲刺状态: ${dashStatus}${cooldownText}`,
      `提示: 点击鼠标左键冲刺`
    ]);
  }

  drawCooldownBar() {
    this.cooldownBar.clear();

    if (!this.canDash) {
      // 绘制冷却条背景
      this.cooldownBar.fillStyle(0x333333, 0.8);
      this.cooldownBar.fillRect(10, 80, 200, 20);

      // 绘制冷却进度
      const progress = 1 - (this.cooldownRemaining / 1.5);
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(10, 80, 200 * progress, 20);

      // 绘制边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(10, 80, 200, 20);
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