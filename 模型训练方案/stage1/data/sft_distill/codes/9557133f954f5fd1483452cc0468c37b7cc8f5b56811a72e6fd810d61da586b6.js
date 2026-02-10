class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 可验证的状态变量
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 使用 Graphics 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建红色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 基础速度
    this.baseSpeed = 300;
    this.dashSpeed = 300 * 3; // 900
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 冷却时间 3 秒
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 冷却计时器引用
    this.cooldownTimer = null;
    
    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建控制说明
    this.add.text(10, 560, '方向键移动 | 空格键冲刺 (冷却3秒)', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 监听空格键按下
    this.spaceKey.on('down', () => {
      this.performDash();
    });
  }

  performDash() {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }
    
    // 获取当前移动方向
    let dashDirectionX = 0;
    let dashDirectionY = 0;
    
    if (this.cursors.left.isDown) {
      dashDirectionX = -1;
    } else if (this.cursors.right.isDown) {
      dashDirectionX = 1;
    }
    
    if (this.cursors.up.isDown) {
      dashDirectionY = -1;
    } else if (this.cursors.down.isDown) {
      dashDirectionY = 1;
    }
    
    // 如果没有按方向键，默认向右冲刺
    if (dashDirectionX === 0 && dashDirectionY === 0) {
      dashDirectionX = 1;
    }
    
    // 归一化方向向量（对角线移动时保持速度一致）
    const magnitude = Math.sqrt(dashDirectionX * dashDirectionX + dashDirectionY * dashDirectionY);
    if (magnitude > 0) {
      dashDirectionX /= magnitude;
      dashDirectionY /= magnitude;
    }
    
    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    
    // 设置冲刺速度
    this.player.setVelocity(
      dashDirectionX * this.dashSpeed,
      dashDirectionY * this.dashSpeed
    );
    
    // 视觉反馈：冲刺时变为橙色
    this.player.setTint(0xffaa00);
    
    // 冲刺持续时间后恢复正常
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
    });
    
    // 开始冷却
    this.cooldownRemaining = this.dashCooldown;
    this.cooldownTimer = this.time.addEvent({
      delay: 100, // 每 100ms 更新一次
      callback: () => {
        this.cooldownRemaining -= 100;
        if (this.cooldownRemaining <= 0) {
          this.canDash = true;
          this.cooldownRemaining = 0;
          if (this.cooldownTimer) {
            this.cooldownTimer.destroy();
            this.cooldownTimer = null;
          }
        }
      },
      repeat: (this.dashCooldown / 100) - 1
    });
  }

  update(time, delta) {
    // 如果不在冲刺状态，使用正常移动控制
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
      
      // 归一化对角线移动速度
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }
      
      this.player.setVelocity(velocityX, velocityY);
    }
    
    // 更新状态显示
    const cooldownText = this.canDash ? '就绪' : `冷却中: ${(this.cooldownRemaining / 1000).toFixed(1)}s`;
    const dashStatus = this.isDashing ? '冲刺中!' : '正常';
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${dashStatus}`,
      `冲刺技能: ${cooldownText}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
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