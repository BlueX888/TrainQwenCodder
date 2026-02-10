class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 状态信号变量
    this.dashCount = 0; // 冲刺次数统计
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺（冷却完成）
  }

  preload() {
    // 创建白色方块纹理作为角色
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建物理角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9); // 添加阻力使移动更平滑

    // 基础移动速度
    this.normalSpeed = 300;
    this.dashSpeed = 300 * 3; // 900
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 500; // 冷却时间（毫秒）

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却指示器
    this.cooldownBar = this.add.graphics();

    // 说明文字
    this.add.text(width / 2, 30, '使用WASD/方向键移动，鼠标右键冲刺', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标）
    const dx = pointer.worldX - this.player.x;
    const dy = pointer.worldY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果鼠标太近，不执行冲刺
    if (distance < 10) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);

    // 冲刺持续时间结束后恢复正常
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        // 冲刺结束后减速
        this.player.setVelocity(
          this.player.body.velocity.x * 0.3,
          this.player.body.velocity.y * 0.3
        );
      }
    });

    // 冷却时间
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
      }
    });
  }

  update(time, delta) {
    // 正常移动控制（非冲刺时）
    if (!this.isDashing) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        velocityX = -this.normalSpeed;
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        velocityX = this.normalSpeed;
      }

      if (this.cursors.up.isDown || this.wasd.up.isDown) {
        velocityY = -this.normalSpeed;
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        velocityY = this.normalSpeed;
      }

      // 对角线移动归一化
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新状态文本
    const dashStatus = this.isDashing ? '冲刺中' : (this.canDash ? '就绪' : '冷却中');
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${dashStatus}`,
      `速度: ${Math.round(this.player.body.speed)}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);

    // 绘制冷却条
    this.cooldownBar.clear();
    if (!this.canDash) {
      const cooldownProgress = this.canDash ? 1 : 0;
      this.cooldownBar.fillStyle(0xff0000, 0.5);
      this.cooldownBar.fillRect(16, 100, 200 * (1 - cooldownProgress), 20);
    }
    this.cooldownBar.lineStyle(2, 0xffffff, 1);
    this.cooldownBar.strokeRect(16, 100, 200, 20);
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