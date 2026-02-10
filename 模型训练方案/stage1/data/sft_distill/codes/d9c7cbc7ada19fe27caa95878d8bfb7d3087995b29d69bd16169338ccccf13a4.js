// 全局信号对象
window.__signals__ = {
  dashCount: 0,
  isDashing: false,
  canDash: true,
  playerX: 0,
  playerY: 0,
  lastDashTime: 0
};

class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.player = null;
    this.cursors = null;
    this.isDashing = false;
    this.canDash = true;
    this.dashSpeed = 240 * 3; // 720
    this.normalSpeed = 240;
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冷却时间（毫秒）
    this.dashTimer = null;
    this.cooldownTimer = null;
    this.statusText = null;
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

    // 创建物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听按键按下事件，触发冲刺
    this.input.keyboard.on('keydown', (event) => {
      if (this.canDash && !this.isDashing) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
          this.startDash(key);
        }
      }
    });

    console.log(JSON.stringify({
      event: 'game_started',
      playerPosition: { x: 400, y: 300 },
      dashSpeed: this.dashSpeed,
      normalSpeed: this.normalSpeed,
      cooldown: this.dashCooldown
    }));
  }

  startDash(direction) {
    this.isDashing = true;
    this.canDash = false;
    window.__signals__.isDashing = true;
    window.__signals__.canDash = false;
    window.__signals__.dashCount++;
    window.__signals__.lastDashTime = Date.now();

    // 根据方向设置冲刺速度
    let velocityX = 0;
    let velocityY = 0;

    switch(direction) {
      case 'w':
        velocityY = -this.dashSpeed;
        break;
      case 's':
        velocityY = this.dashSpeed;
        break;
      case 'a':
        velocityX = -this.dashSpeed;
        break;
      case 'd':
        velocityX = this.dashSpeed;
        break;
    }

    this.player.setVelocity(velocityX, velocityY);

    console.log(JSON.stringify({
      event: 'dash_started',
      direction: direction,
      dashCount: window.__signals__.dashCount,
      velocity: { x: velocityX, y: velocityY },
      timestamp: Date.now()
    }));

    // 冲刺持续时间结束后恢复正常
    if (this.dashTimer) {
      this.dashTimer.destroy();
    }
    
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: this.endDash,
      callbackScope: this
    });
  }

  endDash() {
    this.isDashing = false;
    window.__signals__.isDashing = false;
    
    console.log(JSON.stringify({
      event: 'dash_ended',
      timestamp: Date.now()
    }));

    // 开始冷却计时
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: this.resetDash,
      callbackScope: this
    });
  }

  resetDash() {
    this.canDash = true;
    window.__signals__.canDash = true;
    
    console.log(JSON.stringify({
      event: 'dash_ready',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新玩家位置信号
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;

    // 如果不在冲刺状态，使用正常移动
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

    // 更新状态文本
    const cooldownRemaining = this.cooldownTimer && this.cooldownTimer.getRemaining 
      ? Math.ceil(this.cooldownTimer.getRemaining() / 1000) 
      : 0;
    
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Dash Count: ${window.__signals__.dashCount}`,
      `Dashing: ${this.isDashing ? 'YES' : 'NO'}`,
      `Can Dash: ${this.canDash ? 'YES' : `NO (${cooldownRemaining}s)`}`,
      `Speed: ${this.isDashing ? this.dashSpeed : this.normalSpeed}`,
      '',
      'Controls: WASD to move/dash'
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