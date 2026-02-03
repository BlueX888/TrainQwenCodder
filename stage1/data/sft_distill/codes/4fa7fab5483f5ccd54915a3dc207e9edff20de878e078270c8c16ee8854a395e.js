class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCooldown = false; // 冷却状态（可验证信号）
    this.isDashing = false; // 冲刺状态（可验证信号）
    this.dashCount = 0; // 冲刺次数（可验证信号）
  }

  preload() {
    // 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 基础移动速度
    this.baseSpeed = 200;
    this.dashSpeed = this.baseSpeed * 3; // 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownDuration = 1000; // 冷却时间（毫秒）

    // 键盘控制（WASD）
    this.cursors = this.input.keyboard.addKeys({
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

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(10, 550, '使用 WASD 移动，鼠标右键冲刺', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  performDash(pointer) {
    // 检查是否在冷却中或正在冲刺
    if (this.dashCooldown || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 避免除以零
    if (distance === 0) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 设置冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);

    // 标记正在冲刺
    this.isDashing = true;
    this.dashCount++;

    // 冲刺持续时间后停止
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        // 恢复到正常移动速度（如果有按键输入）
        this.updateMovement();
      }
    });

    // 启动冷却
    this.dashCooldown = true;
    this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.dashCooldown = false;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  updateMovement() {
    // 如果正在冲刺，不处理键盘输入
    if (this.isDashing) {
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.baseSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.baseSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.baseSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.baseSpeed;
    }

    // 对角线移动时归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);
  }

  updateStatusText() {
    const cooldownStatus = this.dashCooldown ? '冷却中' : '就绪';
    const dashStatus = this.isDashing ? '冲刺中' : '正常';
    this.statusText.setText(
      `冲刺状态: ${dashStatus}\n` +
      `冷却状态: ${cooldownStatus}\n` +
      `冲刺次数: ${this.dashCount}`
    );
  }

  update(time, delta) {
    // 更新普通移动
    this.updateMovement();

    // 实时更新状态文本（仅在冲刺时）
    if (this.isDashing) {
      this.updateStatusText();
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