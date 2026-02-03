class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 冲刺次数统计
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺（冷却状态）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();

    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.normalSpeed = 160;
    this.dashSpeed = this.normalSpeed * 3; // 480
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 1500; // 冷却时间（毫秒）

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.performDash();
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownIndicator = this.add.graphics();
    
    // 创建地面参考线
    const ground = this.add.graphics();
    ground.lineStyle(2, 0x00ff00, 1);
    ground.lineBetween(0, 500, 800, 500);

    // 更新状态显示
    this.updateStatus();
  }

  performDash() {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 获取当前移动方向
    let dashVelocityX = 0;
    let dashVelocityY = 0;

    if (this.cursors.left.isDown) {
      dashVelocityX = -this.dashSpeed;
    } else if (this.cursors.right.isDown) {
      dashVelocityX = this.dashSpeed;
    }

    if (this.cursors.up.isDown) {
      dashVelocityY = -this.dashSpeed;
    } else if (this.cursors.down.isDown) {
      dashVelocityY = this.dashSpeed;
    }

    // 如果没有按方向键，默认向右冲刺
    if (dashVelocityX === 0 && dashVelocityY === 0) {
      dashVelocityX = this.dashSpeed;
    }

    // 归一化对角线速度
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const length = Math.sqrt(dashVelocityX * dashVelocityX + dashVelocityY * dashVelocityY);
      dashVelocityX = (dashVelocityX / length) * this.dashSpeed;
      dashVelocityY = (dashVelocityY / length) * this.dashSpeed;
    }

    // 执行冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    
    // 设置冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);
    
    // 改变角色颜色表示冲刺状态
    this.player.setTint(0xffff00);

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        // 恢复正常移动控制
      }
    });

    // 冷却时间结束
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.updateStatus();
      }
    });

    this.updateStatus();
  }

  update(time, delta) {
    // 如果不在冲刺状态，使用正常移动控制
    if (!this.isDashing) {
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

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新状态显示
    this.updateStatus();
    
    // 绘制冷却指示器
    this.drawCooldownIndicator();
  }

  updateStatus() {
    const dashStatus = this.isDashing ? 'DASHING!' : (this.canDash ? 'Ready' : 'Cooling down...');
    const cooldownProgress = this.canDash ? 100 : 
      Math.floor((1 - this.cooldownTimer.getRemaining() / this.dashCooldown) * 100);
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${dashStatus}`,
      `Cooldown: ${this.canDash ? 'Ready' : cooldownProgress + '%'}`,
      `Speed: ${this.isDashing ? this.dashSpeed : this.normalSpeed}`,
      '',
      'Controls:',
      'Arrow Keys - Move',
      'Space - Dash'
    ]);
  }

  drawCooldownIndicator() {
    this.cooldownIndicator.clear();
    
    // 绘制冷却条背景
    this.cooldownIndicator.fillStyle(0x333333, 1);
    this.cooldownIndicator.fillRect(10, 150, 200, 20);
    
    // 绘制冷却进度
    if (!this.canDash && this.cooldownTimer) {
      const progress = 1 - (this.cooldownTimer.getRemaining() / this.dashCooldown);
      const color = this.isDashing ? 0xffff00 : 0x00ff00;
      this.cooldownIndicator.fillStyle(color, 1);
      this.cooldownIndicator.fillRect(10, 150, 200 * progress, 20);
    } else if (this.canDash) {
      this.cooldownIndicator.fillStyle(0x00ff00, 1);
      this.cooldownIndicator.fillRect(10, 150, 200, 20);
    }
    
    // 绘制边框
    this.cooldownIndicator.lineStyle(2, 0xffffff, 1);
    this.cooldownIndicator.strokeRect(10, 150, 200, 20);
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