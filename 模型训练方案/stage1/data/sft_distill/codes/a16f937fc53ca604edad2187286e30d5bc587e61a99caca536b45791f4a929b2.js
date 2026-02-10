class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 可验证的状态信号
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力使冲刺后减速

    // 冲刺参数
    this.dashSpeed = 300 * 3; // 900
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 冷却时间3秒
    this.dashTimer = null;
    this.cooldownTimer = null;

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && this.canDash && !this.isDashing) {
        this.performDash(pointer);
      }
    });

    // 添加键盘控制（WASD移动）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却提示
    this.cooldownText = this.add.text(400, 50, '', {
      fontSize: '24px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建操作提示
    this.add.text(400, 550, 'WASD移动 | 鼠标右键冲刺', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    console.log('游戏初始化完成 - 状态变量:', {
      dashCount: this.dashCount,
      canDash: this.canDash,
      isDashing: this.isDashing
    });
  }

  performDash(pointer) {
    // 计算冲刺方向（从玩家指向鼠标）
    const dx = pointer.worldX - this.player.x;
    const dy = pointer.worldY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffffff);

    // 施加冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);

    console.log(`执行冲刺 #${this.dashCount} - 方向:(${dirX.toFixed(2)}, ${dirY.toFixed(2)}) 速度:${this.dashSpeed}`);

    // 冲刺持续时间结束后恢复
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        console.log('冲刺结束');
      }
    });

    // 开始冷却计时
    this.cooldownRemaining = this.dashCooldown;
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        console.log('冲刺冷却完成');
      }
    });
  }

  update(time, delta) {
    // 更新冷却剩余时间
    if (!this.canDash && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownTimer.getRemaining();
    }

    // 正常移动（非冲刺时）
    if (!this.isDashing) {
      const moveSpeed = 200;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -moveSpeed;
      } else if (this.cursors.right.isDown) {
        velocityX = moveSpeed;
      }

      if (this.cursors.up.isDown) {
        velocityY = -moveSpeed;
      } else if (this.cursors.down.isDown) {
        velocityY = moveSpeed;
      }

      // 只在非冲刺时设置普通速度
      if (velocityX !== 0 || velocityY !== 0) {
        this.player.setVelocity(velocityX, velocityY);
      }
    }

    // 更新状态文本
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `可冲刺: ${this.canDash ? '是' : '否'}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: ${Math.floor(this.player.body.speed)}`
    ]);

    // 更新冷却提示
    if (!this.canDash) {
      this.cooldownText.setText(`冷却中: ${(this.cooldownRemaining / 1000).toFixed(1)}s`);
      this.cooldownText.setVisible(true);
    } else {
      this.cooldownText.setVisible(false);
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