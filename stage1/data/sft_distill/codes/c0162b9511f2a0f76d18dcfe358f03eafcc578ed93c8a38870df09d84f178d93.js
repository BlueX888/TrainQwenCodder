class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.dashCount = 0;        // 冲刺次数
    this.isDashing = false;    // 是否正在冲刺
    this.canDash = true;       // 是否可以冲刺（冷却状态）
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 使用 Graphics 创建粉色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建粉色角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加阻力使角色自然减速

    // 基础移动速度
    this.baseSpeed = 120;
    this.dashSpeed = 120 * 3; // 360
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 冷却时间3秒

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却计时器（初始为null）
    this.cooldownTimer = null;

    console.log('游戏初始化完成 - 按空格键冲刺，方向键移动');
  }

  update(time, delta) {
    // 更新冷却剩余时间显示
    if (this.cooldownTimer) {
      this.cooldownRemaining = Math.max(0, this.cooldownTimer.getRemaining() / 1000);
    } else {
      this.cooldownRemaining = 0;
    }

    // 更新状态文本
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `冷却状态: ${this.canDash ? '就绪' : '冷却中'}`,
      `冷却剩余: ${this.cooldownRemaining.toFixed(1)}秒`
    ]);

    // 检测空格键按下并触发冲刺
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canDash && !this.isDashing) {
      this.performDash();
    }

    // 如果不在冲刺状态，使用基础速度移动
    if (!this.isDashing) {
      this.handleNormalMovement();
    }
  }

  handleNormalMovement() {
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown) {
      velocity.x = -1;
    } else if (this.cursors.right.isDown) {
      velocity.x = 1;
    }

    if (this.cursors.up.isDown) {
      velocity.y = -1;
    } else if (this.cursors.down.isDown) {
      velocity.y = 1;
    }

    // 归一化并应用基础速度
    velocity.normalize();
    this.player.setVelocity(
      velocity.x * this.baseSpeed,
      velocity.y * this.baseSpeed
    );
  }

  performDash() {
    // 确定冲刺方向
    let dashDirection = new Phaser.Math.Vector2(0, 0);

    // 优先使用当前按键方向
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

    // 如果没有按键，使用角色当前朝向（速度方向）
    if (dashDirection.x === 0 && dashDirection.y === 0) {
      const currentVel = this.player.body.velocity;
      if (currentVel.length() > 0) {
        dashDirection.set(currentVel.x, currentVel.y);
      } else {
        // 默认向右冲刺
        dashDirection.set(1, 0);
      }
    }

    // 归一化方向向量
    dashDirection.normalize();

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 应用冲刺速度
    this.player.setVelocity(
      dashDirection.x * this.dashSpeed,
      dashDirection.y * this.dashSpeed
    );

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffff00); // 黄色表示冲刺

    console.log(`冲刺 #${this.dashCount} - 方向: (${dashDirection.x.toFixed(2)}, ${dashDirection.y.toFixed(2)})`);

    // 冲刺持续时间结束
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint(); // 恢复原色
      console.log('冲刺结束');
    });

    // 启动冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
        console.log('冲刺冷却完成，可以再次冲刺');
      },
      callbackScope: this
    });
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
  scene: GameScene
};

new Phaser.Game(config);