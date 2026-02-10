class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证信号：冲刺次数
    this.canDash = true; // 可验证信号：是否可以冲刺
    this.isDashing = false; // 当前是否正在冲刺
    this.normalSpeed = 200; // 正常移动速度
    this.dashSpeed = 200 * 3; // 冲刺速度 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冲刺冷却时间（毫秒）
  }

  preload() {
    // 创建灰色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xff0000, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 10);
    cooldownGraphics.generateTexture('cooldownBar', 100, 10);
    cooldownGraphics.destroy();
  }

  create() {
    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加拖拽减速

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却条背景
    this.cooldownBg = this.add.rectangle(400, 550, 100, 10, 0x333333);
    
    // 创建冷却条
    this.cooldownBar = this.add.rectangle(400, 550, 100, 10, 0xff0000);
    this.cooldownBar.setOrigin(0.5, 0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 正常移动逻辑（非冲刺时）
    if (!this.isDashing) {
      const velocity = new Phaser.Math.Vector2(0, 0);

      if (this.cursors.left.isDown) {
        velocity.x = -this.normalSpeed;
      } else if (this.cursors.right.isDown) {
        velocity.x = this.normalSpeed;
      }

      if (this.cursors.up.isDown) {
        velocity.y = -this.normalSpeed;
      } else if (this.cursors.down.isDown) {
        velocity.y = this.normalSpeed;
      }

      // 归一化斜向移动速度
      if (velocity.length() > 0) {
        velocity.normalize().scale(this.normalSpeed);
      }

      this.player.setVelocity(velocity.x, velocity.y);

      // 检测冲刺输入
      this.checkDashInput();
    }

    this.updateStatusText();
  }

  checkDashInput() {
    // 只有在可以冲刺时才检测输入
    if (!this.canDash) return;

    let dashDirection = new Phaser.Math.Vector2(0, 0);

    // 检测方向键并设置冲刺方向
    if (this.cursors.left.isDown) {
      dashDirection.x = -1;
    } else if (this.cursors.right.isDown) {
      dashDirection.x = 1;
    }

    if (this.cursors.up.isDown) {
      dashDirection.y = -1;
    } else if (this.cursors.down.isDown) {
      dashDirection.y = 1;
    }

    // 如果有方向输入，执行冲刺
    if (dashDirection.length() > 0) {
      this.executeDash(dashDirection);
    }
  }

  executeDash(direction) {
    // 归一化方向向量并应用冲刺速度
    direction.normalize().scale(this.dashSpeed);
    
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(direction.x, direction.y);

    // 冲刺持续时间结束后恢复正常
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
      }
    });

    // 冷却计时器
    let cooldownElapsed = 0;
    const cooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次冷却条
      repeat: this.dashCooldown / 50 - 1,
      callback: () => {
        cooldownElapsed += 50;
        const progress = cooldownElapsed / this.dashCooldown;
        this.cooldownBar.setScale(1 - progress, 1);
      }
    });

    // 冷却结束
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownBar.setScale(0, 1);
      }
    });
  }

  updateStatusText() {
    const status = this.canDash ? '可冲刺' : '冷却中';
    const dashingStatus = this.isDashing ? ' [冲刺中]' : '';
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n` +
      `状态: ${status}${dashingStatus}\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `速度: ${Math.round(this.player.body.velocity.length())}`
    );
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