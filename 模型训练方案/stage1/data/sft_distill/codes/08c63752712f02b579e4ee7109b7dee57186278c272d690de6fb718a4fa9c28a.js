class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCooldown = 0; // 冷却剩余时间（毫秒）
    this.isDashing = false; // 是否正在冲刺
    this.dashCount = 0; // 冲刺次数（可验证状态）
    this.dashSpeed = 160 * 3; // 冲刺速度 480
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 2000; // 冷却时间（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建冷却状态显示
    this.cooldownText = this.add.text(10, 10, 'Dash Ready', {
      fontSize: '20px',
      color: '#00ff00'
    });

    // 创建状态信息显示
    this.statusText = this.add.text(10, 40, 'Dash Count: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 创建冷却指示器（圆形）
    this.cooldownIndicator = this.add.graphics();
    
    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 添加说明文字
    this.add.text(10, 550, 'Click mouse to dash towards cursor', {
      fontSize: '16px',
      color: '#ffff00'
    });
  }

  attemptDash(pointer) {
    // 检查是否在冷却中
    if (this.dashCooldown > 0) {
      return;
    }

    // 检查是否已经在冲刺中
    if (this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 设置冲刺速度
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    
    this.player.setVelocity(velocityX, velocityY);

    // 标记为冲刺状态
    this.isDashing = true;
    this.dashCount++;
    
    // 更新状态显示
    this.statusText.setText(`Dash Count: ${this.dashCount}`);

    // 冲刺结束后恢复正常
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0, 0);
      
      // 开始冷却
      this.startCooldown();
    });
  }

  startCooldown() {
    this.dashCooldown = this.cooldownTime;
    this.cooldownText.setText('Cooling Down...');
    this.cooldownText.setColor('#ff0000');

    // 使用 TimerEvent 实现冷却
    this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.dashCooldown = 0;
        this.cooldownText.setText('Dash Ready');
        this.cooldownText.setColor('#00ff00');
      }
    });
  }

  update(time, delta) {
    // 更新冷却计时
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    }

    // 绘制冷却指示器
    this.cooldownIndicator.clear();
    
    if (this.dashCooldown > 0) {
      const progress = 1 - (this.dashCooldown / this.cooldownTime);
      
      // 绘制背景圆
      this.cooldownIndicator.fillStyle(0x333333, 0.5);
      this.cooldownIndicator.fillCircle(this.player.x, this.player.y - 30, 15);
      
      // 绘制进度扇形
      this.cooldownIndicator.fillStyle(0x00ff00, 0.8);
      this.cooldownIndicator.slice(
        this.player.x,
        this.player.y - 30,
        15,
        Phaser.Math.DegToRad(270),
        Phaser.Math.DegToRad(270 + 360 * progress),
        false
      );
      this.cooldownIndicator.fillPath();
    } else if (!this.isDashing) {
      // 显示准备就绪指示器
      this.cooldownIndicator.fillStyle(0x00ff00, 0.8);
      this.cooldownIndicator.fillCircle(this.player.x, this.player.y - 30, 15);
    }

    // 冲刺时的视觉效果（轻微放大）
    if (this.isDashing) {
      this.player.setScale(1.2);
    } else {
      this.player.setScale(1.0);
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