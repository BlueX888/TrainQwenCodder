class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9966ff, 1); // 紫色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力，让冲刺后逐渐减速

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();
    this.cooldownText = this.add.text(10, 10, 'Dash Ready', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 创建状态文本
    this.statusText = this.add.text(10, 40, 'Dash Count: 0', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 添加键盘控制（WASD移动）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加提示文本
    this.add.text(10, 560, 'WASD: Move | Left Click: Dash', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const direction = new Phaser.Math.Vector2(
      pointer.x - this.player.x,
      pointer.y - this.player.y
    ).normalize();

    // 执行冲刺
    this.performDash(direction);
  }

  performDash(direction) {
    const dashSpeed = 300 * 3; // 900
    const dashDuration = 200; // 冲刺持续时间（毫秒）

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 更新状态文本
    this.statusText.setText(`Dash Count: ${this.dashCount}`);
    this.cooldownText.setText('Dashing!');
    this.cooldownText.setColor('#ffff00');

    // 应用冲刺速度
    this.player.setVelocity(
      direction.x * dashSpeed,
      direction.y * dashSpeed
    );

    // 冲刺视觉效果：角色变亮
    this.player.setTint(0xffffff);

    // 冲刺持续时间结束
    this.time.delayedCall(dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
      
      // 开始冷却
      this.startCooldown();
    });
  }

  startCooldown() {
    const cooldownTime = 2500; // 2.5秒
    let elapsedTime = 0;

    this.cooldownText.setText('Cooling down...');
    this.cooldownText.setColor('#ff0000');

    // 创建冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => {
        elapsedTime += 50;
        const progress = elapsedTime / cooldownTime;

        // 更新冷却条
        this.updateCooldownBar(progress);

        if (elapsedTime >= cooldownTime) {
          this.canDash = true;
          this.cooldownText.setText('Dash Ready');
          this.cooldownText.setColor('#00ff00');
          cooldownTimer.destroy();
        }
      },
      loop: true
    });
  }

  updateCooldownBar(progress) {
    this.cooldownBar.clear();
    
    // 背景条
    this.cooldownBar.fillStyle(0x333333, 1);
    this.cooldownBar.fillRect(150, 10, 200, 20);

    // 进度条
    const color = progress < 1 ? 0xff0000 : 0x00ff00;
    this.cooldownBar.fillStyle(color, 1);
    this.cooldownBar.fillRect(150, 10, 200 * progress, 20);

    // 边框
    this.cooldownBar.lineStyle(2, 0xffffff, 1);
    this.cooldownBar.strokeRect(150, 10, 200, 20);
  }

  update(time, delta) {
    // 非冲刺状态下的正常移动
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

      // 只在非冲刺时设置常规速度
      if (velocityX !== 0 || velocityY !== 0) {
        this.player.setVelocity(velocityX, velocityY);
      } else if (this.player.body.velocity.length() < 50) {
        // 速度很低时停止
        this.player.setVelocity(0, 0);
      }
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
  scene: GameScene
};

new Phaser.Game(config);