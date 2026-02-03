class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺（冷却状态）
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

    // 创建角色精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力使冲刺后逐渐减速

    // 添加冷却指示器（圆环）
    this.cooldownIndicator = this.add.graphics();
    this.cooldownProgress = 1; // 冷却进度 0-1

    // 添加状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 添加提示文本
    this.add.text(400, 550, '点击鼠标左键进行冲刺', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    const dashSpeed = 300 * 3; // 900
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;

    // 施加冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 冲刺持续时间（短距离冲刺，持续150ms）
    this.time.delayedCall(150, () => {
      this.isDashing = false;
      // 冲刺结束后减速
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 冷却时间 2.5 秒
    this.cooldownProgress = 0;
    this.time.addEvent({
      delay: 2500,
      callback: () => {
        this.canDash = true;
        this.cooldownProgress = 1;
      }
    });
  }

  update(time, delta) {
    // 更新冷却进度
    if (!this.canDash && this.cooldownProgress < 1) {
      this.cooldownProgress += delta / 2500;
      if (this.cooldownProgress > 1) {
        this.cooldownProgress = 1;
      }
    }

    // 绘制冷却指示器
    this.cooldownIndicator.clear();
    this.cooldownIndicator.lineStyle(4, this.canDash ? 0x00ff00 : 0xff0000, 1);
    
    const startAngle = -90; // 从顶部开始
    const endAngle = startAngle + (360 * this.cooldownProgress);
    
    this.cooldownIndicator.beginPath();
    this.cooldownIndicator.arc(
      this.player.x,
      this.player.y,
      30,
      Phaser.Math.DegToRad(startAngle),
      Phaser.Math.DegToRad(endAngle),
      false
    );
    this.cooldownIndicator.strokePath();

    // 更新状态文本
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    ).toFixed(0);
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `当前速度: ${speed}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `冷却状态: ${this.canDash ? '就绪' : '冷却中'}`,
      `冷却进度: ${(this.cooldownProgress * 100).toFixed(0)}%`
    ]);
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
  scene: DashScene
};

new Phaser.Game(config);