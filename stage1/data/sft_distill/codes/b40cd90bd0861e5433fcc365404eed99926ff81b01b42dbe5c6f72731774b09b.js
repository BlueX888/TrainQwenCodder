class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证的状态信号
    this.isDashing = false;
    this.canDash = true;
    this.normalSpeed = 300;
    this.dashSpeed = 300 * 3; // 900
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 3000; // 冷却时间（毫秒）
  }

  preload() {
    // 使用Graphics创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 冷却指示器（圆形）
    this.cooldownIndicator = this.add.graphics();
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 更新状态文本
    this.updateStatusText();
    
    // 绘制冷却指示器
    this.drawCooldownIndicator();
    
    // 如果正在冲刺，不处理普通移动
    if (this.isDashing) {
      return;
    }
    
    // 普通移动控制
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
    
    // 归一化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }
    
    this.player.setVelocity(velocityX, velocityY);
    
    // 检测空格键按下触发冲刺
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canDash) {
      this.performDash();
    }
  }

  performDash() {
    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++; // 增加冲刺计数
    
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
    
    // 归一化方向向量
    const magnitude = Math.sqrt(dashDirectionX * dashDirectionX + dashDirectionY * dashDirectionY);
    if (magnitude > 0) {
      dashDirectionX /= magnitude;
      dashDirectionY /= magnitude;
    }
    
    // 设置冲刺速度
    this.player.setVelocity(
      dashDirectionX * this.dashSpeed,
      dashDirectionY * this.dashSpeed
    );
    
    // 改变颜色表示冲刺状态（变为亮红色）
    this.player.setTint(0xffaaaa);
    
    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0, 0);
        this.player.clearTint();
      }
    });
    
    // 冷却时间
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
      }
    });
  }

  updateStatusText() {
    const dashStatus = this.canDash ? '准备就绪' : '冷却中';
    const dashingStatus = this.isDashing ? ' [冲刺中]' : '';
    this.statusText.setText(
      `冲刺状态: ${dashStatus}${dashingStatus}\n` +
      `冲刺次数: ${this.dashCount}\n` +
      `方向键移动 | 空格键冲刺`
    );
  }

  drawCooldownIndicator() {
    this.cooldownIndicator.clear();
    
    if (!this.canDash && this.cooldownTimer) {
      // 计算冷却进度
      const progress = this.cooldownTimer.getProgress();
      const angle = Phaser.Math.PI2 * progress;
      
      // 绘制冷却圆环
      this.cooldownIndicator.lineStyle(4, 0xffff00, 1);
      this.cooldownIndicator.beginPath();
      this.cooldownIndicator.arc(
        this.player.x,
        this.player.y - 30,
        20,
        -Math.PI / 2,
        -Math.PI / 2 + angle,
        false
      );
      this.cooldownIndicator.strokePath();
    } else if (this.canDash) {
      // 绘制就绪指示器（完整圆圈）
      this.cooldownIndicator.lineStyle(4, 0x00ff00, 1);
      this.cooldownIndicator.strokeCircle(this.player.x, this.player.y - 30, 20);
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