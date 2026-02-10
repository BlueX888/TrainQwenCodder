class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 360 * 3; // 1080
    this.normalSpeed = 200;
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 500; // 冷却时间（毫秒）
    this.canDash = true;
    this.isDashing = false;
    this.dashCount = 0;
  }

  preload() {
    // 创建黄色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      dashCount: 0,
      isDashing: false,
      canDash: true,
      playerX: 400,
      playerY: 300,
      lastDashDirection: null,
      cooldownRemaining: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    // 冲刺计时器
    this.dashTimer = null;
    this.cooldownTimer = null;

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now(),
      dashSpeed: this.dashSpeed,
      cooldown: this.dashCooldown
    }));
  }

  update(time, delta) {
    // 更新信号
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;
    window.__signals__.isDashing = this.isDashing;
    window.__signals__.canDash = this.canDash;
    window.__signals__.dashCount = this.dashCount;

    // 获取输入方向
    let directionX = 0;
    let directionY = 0;

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      directionX = -1;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      directionX = 1;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      directionY = -1;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      directionY = 1;
    }

    // 尝试冲刺
    if (!this.isDashing && this.canDash && (directionX !== 0 || directionY !== 0)) {
      // 检测按键刚按下（防止长按连续触发）
      const justPressed = 
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.keys.W) ||
        Phaser.Input.Keyboard.JustDown(this.keys.A) ||
        Phaser.Input.Keyboard.JustDown(this.keys.S) ||
        Phaser.Input.Keyboard.JustDown(this.keys.D);

      if (justPressed) {
        this.startDash(directionX, directionY);
      }
    }

    // 非冲刺状态下的普通移动
    if (!this.isDashing) {
      if (directionX !== 0 || directionY !== 0) {
        // 归一化对角线速度
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        this.player.setVelocity(
          (directionX / length) * this.normalSpeed,
          (directionY / length) * this.normalSpeed
        );
      } else {
        this.player.setVelocity(0, 0);
      }
    }

    // 更新UI
    this.updateUI();
  }

  startDash(directionX, directionY) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 归一化方向
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedX = directionX / length;
    const normalizedY = directionY / length;

    // 记录冲刺方向
    const direction = this.getDirectionName(normalizedX, normalizedY);
    window.__signals__.lastDashDirection = direction;

    // 应用冲刺速度
    this.player.setVelocity(
      normalizedX * this.dashSpeed,
      normalizedY * this.dashSpeed
    );

    // 改变颜色表示冲刺状态
    this.player.setTint(0xff8800);

    console.log(JSON.stringify({
      event: 'dash_started',
      timestamp: Date.now(),
      direction: direction,
      dashCount: this.dashCount,
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
    }));

    // 冲刺持续时间结束
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.endDash();
      }
    });
  }

  endDash() {
    this.isDashing = false;
    this.player.setVelocity(0, 0);
    this.player.clearTint();

    console.log(JSON.stringify({
      event: 'dash_ended',
      timestamp: Date.now(),
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
    }));

    // 开始冷却
    this.startCooldown();
  }

  startCooldown() {
    const startTime = Date.now();
    
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        window.__signals__.cooldownRemaining = 0;
        
        console.log(JSON.stringify({
          event: 'cooldown_complete',
          timestamp: Date.now(),
          totalDashes: this.dashCount
        }));
      }
    });

    // 更新冷却剩余时间
    this.time.addEvent({
      delay: 50,
      repeat: Math.ceil(this.dashCooldown / 50),
      callback: () => {
        if (this.cooldownTimer) {
          const elapsed = Date.now() - startTime;
          window.__signals__.cooldownRemaining = Math.max(0, this.dashCooldown - elapsed);
        }
      }
    });
  }

  getDirectionName(x, y) {
    if (x > 0.5 && Math.abs(y) < 0.5) return 'right';
    if (x < -0.5 && Math.abs(y) < 0.5) return 'left';
    if (y < -0.5 && Math.abs(x) < 0.5) return 'up';
    if (y > 0.5 && Math.abs(x) < 0.5) return 'down';
    if (x > 0 && y < 0) return 'up-right';
    if (x < 0 && y < 0) return 'up-left';
    if (x > 0 && y > 0) return 'down-right';
    if (x < 0 && y > 0) return 'down-left';
    return 'unknown';
  }

  updateUI() {
    const status = this.isDashing ? 'DASHING!' : (this.canDash ? 'Ready' : 'Cooling down...');
    const cooldownPercent = this.canDash ? 100 : 
      Math.max(0, 100 - (window.__signals__.cooldownRemaining / this.dashCooldown * 100));

    this.infoText.setText([
      `Status: ${status}`,
      `Dash Count: ${this.dashCount}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Cooldown: ${cooldownPercent.toFixed(0)}%`,
      '',
      'Controls: Arrow Keys or WASD to dash'
    ]);

    // 绘制冷却条
    this.cooldownBar.clear();
    this.cooldownBar.fillStyle(0x333333, 0.8);
    this.cooldownBar.fillRect(10, 120, 200, 20);
    
    if (cooldownPercent > 0) {
      const color = this.canDash ? 0x00ff00 : 0xff0000;
      this.cooldownBar.fillStyle(color, 1);
      this.cooldownBar.fillRect(10, 120, 200 * (cooldownPercent / 100), 20);
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
  scene: DashScene
};

new Phaser.Game(config);