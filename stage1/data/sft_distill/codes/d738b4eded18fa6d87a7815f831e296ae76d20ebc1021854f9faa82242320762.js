class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashAvailable = true; // 可验证的状态信号
    this.dashCooldown = 0; // 冷却剩余时间（秒）
    this.isDashing = false; // 是否正在冲刺
  }

  preload() {
    // 创建白色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 基础移动速度
    this.baseSpeed = 200;
    this.dashSpeed = this.baseSpeed * 3; // 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 3000; // 冷却时间（毫秒）
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 冷却计时器（初始为null）
    this.cooldownTimer = null;
    
    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 监听空格键按下
    this.spaceKey.on('down', () => {
      this.attemptDash();
    });
    
    // 显示控制说明
    this.add.text(10, 550, '方向键移动 | 空格键冲刺（冷却3秒）', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  attemptDash() {
    // 检查是否可以冲刺
    if (!this.dashAvailable || this.isDashing) {
      return;
    }
    
    // 执行冲刺
    this.executeDash();
  }

  executeDash() {
    this.isDashing = true;
    this.dashAvailable = false;
    
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
    
    // 如果没有方向输入，默认向右冲刺
    if (dashVelocityX === 0 && dashVelocityY === 0) {
      dashVelocityX = this.dashSpeed;
    }
    
    // 对角线移动时归一化速度
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      dashVelocityX *= factor;
      dashVelocityY *= factor;
    }
    
    // 设置冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);
    
    // 冲刺持续时间后恢复正常速度
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      // 恢复到正常移动速度（在update中处理）
    });
    
    // 开始冷却
    this.startCooldown();
  }

  startCooldown() {
    this.dashCooldown = this.cooldownTime / 1000; // 转换为秒
    
    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.dashAvailable = true;
        this.dashCooldown = 0;
        this.cooldownTimer = null;
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    // 更新冷却时间显示
    if (this.cooldownTimer && this.cooldownTimer.getProgress() < 1) {
      this.dashCooldown = ((1 - this.cooldownTimer.getProgress()) * this.cooldownTime / 1000).toFixed(1);
    }
    
    // 更新状态文本
    const status = this.dashAvailable ? '可用' : `冷却中 (${this.dashCooldown}s)`;
    const dashingStatus = this.isDashing ? ' [冲刺中]' : '';
    this.statusText.setText(
      `冲刺状态: ${status}${dashingStatus}\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `速度: ${Math.round(this.player.body.speed)}`
    );
    
    // 非冲刺状态下的正常移动控制
    if (!this.isDashing) {
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