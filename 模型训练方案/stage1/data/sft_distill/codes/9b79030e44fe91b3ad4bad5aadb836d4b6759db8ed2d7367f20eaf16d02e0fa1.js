class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号
    this.canDash = true;
    this.dashSpeed = 240 * 3; // 720
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（屏幕中央）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建冷却提示文本
    this.cooldownText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 添加指示文本
    this.add.text(400, 50, '点击鼠标左键进行冲刺', {
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5);
  }

  attemptDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 设置冲刺速度
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    
    this.player.setVelocity(velocityX, velocityY);

    // 增加冲刺计数
    this.dashCount++;
    this.updateStatusText();

    // 设置冷却状态
    this.canDash = false;
    this.cooldownText.setText('冲刺冷却中...');

    // 冲刺持续时间后减速
    this.time.delayedCall(this.dashDuration, () => {
      const currentVelX = this.player.body.velocity.x;
      const currentVelY = this.player.body.velocity.y;
      this.player.setVelocity(currentVelX * 0.3, currentVelY * 0.3);
    });

    // 2秒冷却计时器
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownText.setText('');
        this.updateStatusText();
      },
      callbackScope: this
    });
  }

  updateStatusText() {
    const status = this.canDash ? '就绪' : '冷却中';
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n` +
      `状态: ${status}\n` +
      `冲刺速度: ${this.dashSpeed}\n` +
      `冷却时间: ${this.dashCooldown / 1000}秒`
    );
  }

  update(time, delta) {
    // 显示当前速度（用于调试）
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    );
    
    // 如果在冷却中，显示剩余时间
    if (!this.canDash && this.cooldownText.text) {
      // 冷却提示已在 TimerEvent 中处理
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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