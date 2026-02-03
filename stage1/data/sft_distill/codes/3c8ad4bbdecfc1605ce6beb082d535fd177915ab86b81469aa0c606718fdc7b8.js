class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    
    // 状态信号变量
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.baseSpeed = 160;
    this.dashSpeed = this.baseSpeed * 3; // 480
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（毫秒）

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建空格键
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
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(16, 60, 200, 20);

    // 创建冲刺方向指示器
    this.dashIndicator = this.add.graphics();

    // 冷却计时器引用
    this.cooldownTimer = null;
    this.dashTimer = null;

    // 上次移动方向
    this.lastDirection = { x: 1, y: 0 };

    this.updateStatusText();
  }

  update(time, delta) {
    // 如果不在冲刺状态，处理正常移动
    if (!this.isDashing) {
      this.player.setVelocity(0);

      let moving = false;

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.baseSpeed);
        this.lastDirection = { x: -1, y: 0 };
        moving = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.baseSpeed);
        this.lastDirection = { x: 1, y: 0 };
        moving = true;
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.baseSpeed);
        this.lastDirection = { x: 0, y: -1 };
        moving = true;
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.baseSpeed);
        this.lastDirection = { x: 0, y: 1 };
        moving = true;
      }

      // 归一化对角线移动速度
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        if (this.cursors.up.isDown || this.cursors.down.isDown) {
          this.player.body.velocity.normalize().scale(this.baseSpeed);
          
          // 更新对角线方向
          this.lastDirection = {
            x: this.player.body.velocity.x > 0 ? 1 : (this.player.body.velocity.x < 0 ? -1 : 0),
            y: this.player.body.velocity.y > 0 ? 1 : (this.player.body.velocity.y < 0 ? -1 : 0)
          };
        }
      }
    }

    // 检测空格键按下并执行冲刺
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canDash && !this.isDashing) {
      this.executeDash();
    }

    // 更新冷却条
    this.updateCooldownBar();

    // 更新冲刺指示器
    this.updateDashIndicator();
  }

  executeDash() {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度（朝最后移动方向）
    const dashVelocityX = this.lastDirection.x * this.dashSpeed;
    const dashVelocityY = this.lastDirection.y * this.dashSpeed;
    
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffff00);

    // 冲刺持续时间计时器
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        this.player.setVelocity(0);
      },
      callbackScope: this
    });

    // 冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
      },
      callbackScope: this
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isDashing ? 'DASHING!' : (this.canDash ? 'Ready' : 'Cooling down...');
    this.statusText.setText(
      `Dash Count: ${this.dashCount}\n` +
      `Status: ${status}\n` +
      `Speed: ${this.isDashing ? this.dashSpeed : this.baseSpeed}\n` +
      `Controls: Arrow Keys + Space to Dash`
    );
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (!this.canDash && this.cooldownTimer) {
      const progress = 1 - (this.cooldownTimer.getProgress());
      const barWidth = 200 * progress;
      
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(16, 60, barWidth, 20);
    } else if (this.canDash) {
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(16, 60, 200, 20);
    }

    this.updateStatusText();
  }

  updateDashIndicator() {
    this.dashIndicator.clear();

    if (this.isDashing) {
      // 绘制冲刺方向指示器
      this.dashIndicator.lineStyle(3, 0xffff00, 1);
      const startX = this.player.x;
      const startY = this.player.y;
      const endX = startX + this.lastDirection.x * 50;
      const endY = startY + this.lastDirection.y * 50;
      
      this.dashIndicator.lineBetween(startX, startY, endX, endY);
      
      // 绘制箭头
      const angle = Math.atan2(this.lastDirection.y, this.lastDirection.x);
      const arrowSize = 10;
      
      this.dashIndicator.fillStyle(0xffff00, 1);
      this.dashIndicator.fillTriangle(
        endX, endY,
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6),
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
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