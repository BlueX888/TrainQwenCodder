class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 验证信号：冲刺次数
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
    this.dashCooldown = 2500; // 冷却时间（毫秒）
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashSpeed = 600; // 冲刺速度（200*3）
  }

  preload() {
    // 创建灰色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键作为冲刺键（可选，也可以只用方向键）
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 如果正在冲刺，不处理普通移动
    if (this.isDashing) {
      return;
    }

    // 普通移动（速度200）
    const normalSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-normalSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(normalSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-normalSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(normalSpeed);
    }

    // 检测冲刺输入（双击方向键或按住方向键+空格）
    if (this.canDash && !this.isDashing) {
      let dashDirection = null;

      // 检测方向键是否刚按下（用于冲刺）
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        dashDirection = { x: -1, y: 0 };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        dashDirection = { x: 1, y: 0 };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        dashDirection = { x: 0, y: -1 };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        dashDirection = { x: 0, y: 1 };
      }

      // 或者按空格键时根据当前方向冲刺
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        if (this.cursors.left.isDown) {
          dashDirection = { x: -1, y: 0 };
        } else if (this.cursors.right.isDown) {
          dashDirection = { x: 1, y: 0 };
        } else if (this.cursors.up.isDown) {
          dashDirection = { x: 0, y: -1 };
        } else if (this.cursors.down.isDown) {
          dashDirection = { x: 0, y: 1 };
        }
      }

      if (dashDirection) {
        this.performDash(dashDirection);
      }
    }

    this.updateStatusText();
  }

  performDash(direction) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++; // 增加冲刺次数

    // 设置冲刺速度
    this.player.setVelocity(
      direction.x * this.dashSpeed,
      direction.y * this.dashSpeed
    );

    // 视觉反馈：改变颜色
    this.player.setTint(0xffff00);

    // 冲刺持续时间
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0);
      this.player.clearTint();
    });

    // 冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      },
      callbackScope: this
    });

    // 存储计时器以便绘制冷却条
    this.activeCooldownTimer = cooldownTimer;
  }

  updateStatusText() {
    const status = this.canDash ? '准备就绪' : '冷却中';
    const cooldownProgress = this.activeCooldownTimer 
      ? (this.activeCooldownTimer.getProgress() * 100).toFixed(0)
      : 100;

    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${status}`,
      `冷却: ${cooldownProgress}%`,
      '',
      '操作说明:',
      '方向键移动 (速度200)',
      '双击方向键冲刺 (速度600)',
      '或方向键+空格冲刺'
    ]);

    // 绘制冷却条
    this.cooldownBar.clear();
    if (!this.canDash && this.activeCooldownTimer) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 16;
      const barY = 180;
      const progress = this.activeCooldownTimer.getProgress();

      // 背景
      this.cooldownBar.fillStyle(0x333333, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

      // 进度条
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);

      // 边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
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
  scene: DashScene
};

new Phaser.Game(config);