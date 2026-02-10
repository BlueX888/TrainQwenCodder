class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 验证状态变量
    this.dashCount = 0;
    this.isOnCooldown = false;
    this.cooldownRemaining = 0;
  }

  preload() {
    // 创建橙色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建物理角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 冲刺参数
    this.dashSpeed = 360 * 3; // 1080
    this.normalSpeed = 200;
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（毫秒）
    this.isDashing = false;

    // 冷却计时器
    this.cooldownTimer = null;

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.isOnCooldown && !this.isDashing) {
        this.performDash(pointer);
      }
    });

    // 键盘移动控制（WASD）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却提示文本
    this.cooldownText = this.add.text(width / 2, 30, '', {
      fontSize: '24px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // 说明文本
    this.add.text(10, height - 60, 
      'WASD: 移动\n鼠标右键: 向鼠标方向冲刺', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 5 }
    });
  }

  performDash(pointer) {
    // 计算冲刺方向（从角色到鼠标位置）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 设置冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);
    this.isDashing = true;
    this.dashCount++;

    // 冲刺持续时间后恢复正常
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      // 恢复到正常移动速度（如果有按键）
      this.updateMovement();
    });

    // 开始冷却
    this.startCooldown();
  }

  startCooldown() {
    this.isOnCooldown = true;
    this.cooldownRemaining = this.dashCooldown;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.isOnCooldown = false;
        this.cooldownRemaining = 0;
        this.cooldownText.setText('');
      }
    });
  }

  updateMovement() {
    if (this.isDashing) return;

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.normalSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.normalSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.normalSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.normalSpeed;
    }

    // 对角线移动时归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(0.5);
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);
  }

  update(time, delta) {
    // 更新移动（如果不在冲刺中）
    this.updateMovement();

    // 更新冷却时间显示
    if (this.isOnCooldown && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownTimer.getRemaining();
      const seconds = (this.cooldownRemaining / 1000).toFixed(1);
      this.cooldownText.setText(`冷却中: ${seconds}s`);
    }

    // 更新状态文本
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    ).toFixed(0);

    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `当前速度: ${speed}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `冷却状态: ${this.isOnCooldown ? '冷却中' : '就绪'}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ].join('\n'));
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