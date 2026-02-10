class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    this.dashCount = 0; // 冲刺次数统计
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
  }

  preload() {
    // 创建紫色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8b4513, 1); // 棕色地面
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建地面
    const ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 创建紫色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.body.setGravity(0, 500);

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer.x, pointer.y);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加冷却指示器
    this.cooldownBar = this.add.graphics();
    this.cooldownProgress = 1; // 冷却进度 0-1

    this.updateStatusText();
  }

  performDash(targetX, targetY) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const direction = new Phaser.Math.Vector2(
      targetX - this.player.x,
      targetY - this.player.y
    ).normalize();

    // 设置冲刺速度 (240 * 3 = 720)
    const dashSpeed = 720;
    this.player.setVelocity(
      direction.x * dashSpeed,
      direction.y * dashSpeed
    );

    // 标记正在冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 冲刺持续时间 0.2秒（短距离冲刺）
    this.time.addEvent({
      delay: 200,
      callback: () => {
        this.isDashing = false;
        // 冲刺结束后恢复正常速度
        this.player.setVelocityX(this.player.body.velocity.x * 0.3);
        this.player.setVelocityY(this.player.body.velocity.y * 0.3);
      }
    });

    // 冷却时间 2.5秒
    this.cooldownProgress = 0;
    const cooldownDuration = 2500;
    const cooldownStartTime = this.time.now;

    this.cooldownTimer = this.time.addEvent({
      delay: cooldownDuration,
      callback: () => {
        this.canDash = true;
        this.cooldownProgress = 1;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新冷却进度
    if (!this.canDash && this.cooldownTimer) {
      this.cooldownProgress = this.cooldownTimer.getProgress();
    }

    // 绘制冷却条
    this.cooldownBar.clear();
    this.cooldownBar.fillStyle(0x333333, 0.8);
    this.cooldownBar.fillRect(16, 60, 200, 20);
    
    if (this.cooldownProgress < 1) {
      this.cooldownBar.fillStyle(0xff6b6b, 1);
    } else {
      this.cooldownBar.fillStyle(0x51cf66, 1);
    }
    this.cooldownBar.fillRect(16, 60, 200 * this.cooldownProgress, 20);

    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isDashing ? '冲刺中' : (this.canDash ? '就绪' : '冷却中');
    const cooldownTime = this.canDash ? 0 : ((1 - this.cooldownProgress) * 2.5).toFixed(1);
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${status}`,
      `冷却: ${this.canDash ? '就绪' : cooldownTime + 's'}`,
      `速度: ${Math.round(this.player.body.velocity.length())}`,
      '',
      '点击鼠标左键进行冲刺'
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DashGameScene
};

new Phaser.Game(config);