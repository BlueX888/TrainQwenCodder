class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 可验证的状态变量
    this.dashCount = 0; // 冲刺次数
    this.totalDistance = 0; // 总冲刺距离
    this.canDash = true; // 是否可以冲刺
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true); // 启用阻尼
    this.player.setDrag(0.9); // 设置阻力，让冲刺后逐渐减速

    // 初始化冲刺参数
    this.dashSpeed = 360 * 3; // 1080
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（毫秒）
    this.isDashing = false;

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 创建UI显示
    this.createUI();

    // 添加键盘控制（WASD移动）
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 记录冲刺起始位置
    this.dashStartPos = { x: 0, y: 0 };
  }

  createUI() {
    // 冷却状态显示
    this.cooldownText = this.add.text(10, 10, 'Dash Ready!', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 统计信息显示
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 说明文字
    this.add.text(10, 550, 'Right Click: Dash | WASD: Move', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.updateStats();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从玩家指向鼠标）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 记录冲刺起始位置
    this.dashStartPos.x = this.player.x;
    this.dashStartPos.y = this.player.y;

    // 设置冲刺速度
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    this.player.setVelocity(velocityX, velocityY);

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 改变颜色表示冲刺中
    this.player.setTint(0xffff00);

    // 冲刺持续时间结束后恢复
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0, 0);
      this.player.clearTint();

      // 计算冲刺距离
      const distance = Phaser.Math.Distance.Between(
        this.dashStartPos.x,
        this.dashStartPos.y,
        this.player.x,
        this.player.y
      );
      this.totalDistance += Math.round(distance);
      this.updateStats();
    });

    // 冷却计时器
    this.cooldownText.setText('Cooling down...');
    this.cooldownText.setColor('#ff0000');

    this.time.delayedCall(this.dashCooldown, () => {
      this.canDash = true;
      this.cooldownText.setText('Dash Ready!');
      this.cooldownText.setColor('#00ff00');
    });
  }

  updateStats() {
    this.statsText.setText(
      `Dash Count: ${this.dashCount}\n` +
      `Total Distance: ${this.totalDistance}px\n` +
      `Can Dash: ${this.canDash}`
    );
  }

  update(time, delta) {
    // 键盘移动控制（非冲刺时）
    if (!this.isDashing) {
      const speed = 200;
      let velocityX = 0;
      let velocityY = 0;

      if (this.keys.A.isDown) {
        velocityX = -speed;
      } else if (this.keys.D.isDown) {
        velocityX = speed;
      }

      if (this.keys.W.isDown) {
        velocityY = -speed;
      } else if (this.keys.S.isDown) {
        velocityY = speed;
      }

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新状态显示
    this.updateStats();
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