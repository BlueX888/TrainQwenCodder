class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.player = null;
    this.cursors = null;
    this.spaceKey = null;
    this.isDashing = false;
    this.canDash = true;
    this.normalSpeed = 200;
    this.dashSpeed = 200 * 3; // 600
    this.dashDuration = 200; // 冲刺持续200ms
    this.dashCooldown = 500; // 冷却0.5秒
    this.dashCount = 0;
    this.statusText = null;
  }

  preload() {
    // 创建灰色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x333333, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      dashCount: 0,
      isDashing: false,
      canDash: true,
      playerX: 0,
      playerY: 0,
      velocity: 0,
      cooldownRemaining: 0
    };

    // 创建地面
    const ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 添加碰撞
    this.physics.add.collider(this.player, ground);

    // 设置重力
    this.player.body.setGravityY(300);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.triggerDash();
    });

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 50, '方向键移动，空格键冲刺', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  triggerDash() {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      console.log(JSON.stringify({
        event: 'dash_blocked',
        reason: this.isDashing ? 'already_dashing' : 'on_cooldown',
        timestamp: Date.now()
      }));
      return;
    }

    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 确定冲刺方向（优先使用当前移动方向，否则向右）
    let dashDirection = 1;
    if (this.cursors.left.isDown) {
      dashDirection = -1;
    } else if (this.cursors.right.isDown) {
      dashDirection = 1;
    } else if (this.player.body.velocity.x < 0) {
      dashDirection = -1;
    }

    // 设置冲刺速度
    this.player.setVelocityX(this.dashSpeed * dashDirection);

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffff00);

    console.log(JSON.stringify({
      event: 'dash_start',
      dashCount: this.dashCount,
      direction: dashDirection,
      speed: this.dashSpeed,
      timestamp: Date.now()
    }));

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        
        console.log(JSON.stringify({
          event: 'dash_end',
          timestamp: Date.now()
        }));
      }
    });

    // 冷却时间结束
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        
        console.log(JSON.stringify({
          event: 'dash_ready',
          timestamp: Date.now()
        }));
      }
    });

    // 更新信号
    this.updateSignals();
  }

  update(time, delta) {
    // 正常移动控制（非冲刺状态）
    if (!this.isDashing) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.normalSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.normalSpeed);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 更新状态文本
    const cooldownStatus = this.canDash ? '就绪' : '冷却中';
    const dashStatus = this.isDashing ? '冲刺中' : '正常';
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${dashStatus}`,
      `冷却: ${cooldownStatus}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `速度: ${Math.round(Math.abs(this.player.body.velocity.x))}`
    ]);

    // 更新信号
    this.updateSignals();
  }

  updateSignals() {
    window.__signals__ = {
      dashCount: this.dashCount,
      isDashing: this.isDashing,
      canDash: this.canDash,
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      velocity: Math.round(Math.abs(this.player.body.velocity.x)),
      cooldownRemaining: this.canDash ? 0 : this.dashCooldown
    };
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