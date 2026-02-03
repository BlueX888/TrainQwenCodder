class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.isDashReady = true; // 可验证的状态信号：冲刺是否就绪
  }

  preload() {
    // 使用 Graphics 创建青色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建青色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 正常移动速度
    this.normalSpeed = 200;
    this.dashSpeed = 200 * 3; // 冲刺速度 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 1000; // 冷却时间 1 秒
    
    // 冲刺状态
    this.isDashing = false;
    this.dashTimer = null;
    this.cooldownTimer = null;
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });
    
    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 550, 
      '方向键移动 | 鼠标右键冲刺', {
      fontSize: '14px',
      fill: '#00FFFF'
    });
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.isDashReady || this.isDashing) {
      return;
    }
    
    // 计算冲刺方向（从角色指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x, 
      this.player.y, 
      pointer.worldX, 
      pointer.worldY
    );
    
    // 设置冲刺速度
    this.isDashing = true;
    this.isDashReady = false;
    this.dashCount++; // 增加冲刺次数
    
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    
    this.player.setVelocity(velocityX, velocityY);
    
    // 冲刺持续时间后恢复正常
    if (this.dashTimer) {
      this.dashTimer.destroy();
    }
    
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        // 如果没有按键输入，停止移动
        if (!this.cursors.left.isDown && !this.cursors.right.isDown &&
            !this.cursors.up.isDown && !this.cursors.down.isDown) {
          this.player.setVelocity(0, 0);
        }
      }
    });
    
    // 开始冷却
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }
    
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.isDashReady = true;
      }
    });
  }

  update(time, delta) {
    // 只有在非冲刺状态下才响应键盘移动
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
      
      // 对角线移动时归一化速度
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }
      
      this.player.setVelocity(velocityX, velocityY);
    }
    
    // 更新状态显示
    const cooldownRemaining = this.cooldownTimer && this.cooldownTimer.getRemaining 
      ? Math.ceil(this.cooldownTimer.getRemaining() / 1000) 
      : 0;
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冲刺状态: ${this.isDashReady ? '就绪' : '冷却中 (' + cooldownRemaining + 's)'}`,
      `当前速度: ${Math.round(this.player.body.speed)}`
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