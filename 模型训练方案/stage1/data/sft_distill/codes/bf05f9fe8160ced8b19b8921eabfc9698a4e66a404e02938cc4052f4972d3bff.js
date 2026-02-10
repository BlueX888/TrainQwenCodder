class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    // 可验证的状态信号
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 创建白色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建玩家角色（物理精灵）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 基础移动速度
    this.baseSpeed = 200;
    // 冲刺速度（基础速度 * 3）
    this.dashSpeed = this.baseSpeed * 3;
    // 冲刺持续时间（毫秒）
    this.dashDuration = 300;
    // 冷却时间（毫秒）
    this.cooldownTime = 3000;
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键按下
    this.spaceKey.on('down', () => {
      this.performDash();
    });
    
    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(16, 560, 
      '方向键移动 | 空格键冲刺 (冷却3秒)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 冷却计时器引用
    this.cooldownTimer = null;
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
    
    // 对角线移动时标准化速度
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      dashVelocityX *= factor;
      dashVelocityY *= factor;
    }
    
    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    
    // 设置冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);
    
    // 视觉反馈：冲刺时改变颜色
    this.player.setTint(0xffff00);
    
    // 冲刺持续时间结束后恢复正常移动
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
      // 恢复到正常移动速度
      this.updateNormalMovement();
    });
    
    // 开始冷却计时
    this.cooldownRemaining = this.cooldownTime;
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
      }
    });
  }

  updateNormalMovement() {
    if (this.isDashing) {
      return; // 冲刺时不处理正常移动
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
    
    // 对角线移动时标准化速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }
    
    this.player.setVelocity(velocityX, velocityY);
  }

  update(time, delta) {
    // 更新正常移动
    this.updateNormalMovement();
    
    // 更新冷却剩余时间
    if (this.cooldownTimer && this.cooldownTimer.getRemaining) {
      this.cooldownRemaining = Math.ceil(this.cooldownTimer.getRemaining());
    }
    
    // 更新状态显示
    const cooldownStatus = this.canDash ? '就绪' : `冷却中 (${(this.cooldownRemaining / 1000).toFixed(1)}s)`;
    const dashStatus = this.isDashing ? '冲刺中!' : '正常';
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${dashStatus}`,
      `冷却: ${cooldownStatus}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }
}

// 游戏配置
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
  scene: DashGameScene
};

// 创建游戏实例
new Phaser.Game(config);