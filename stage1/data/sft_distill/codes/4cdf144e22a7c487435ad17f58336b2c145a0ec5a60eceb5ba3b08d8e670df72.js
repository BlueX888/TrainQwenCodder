class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCooldown = false;
    this.isDashing = false;
    this.dashCount = 0;
    this.normalSpeed = 200;
    this.dashSpeed = 200 * 3; // 600
    this.dashDuration = 200; // 冲刺持续时间 200ms
    this.cooldownTime = 500; // 冷却时间 500ms
  }

  preload() {
    // 创建灰色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    const ground = this.physics.add.staticSprite(400, 575, 'ground');
    
    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    
    // 添加碰撞
    this.physics.add.collider(this.player, ground);
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.performDash();
    });
    
    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 初始化信号对象
    window.__signals__ = {
      dashCount: 0,
      isDashing: false,
      dashCooldown: false,
      playerX: this.player.x,
      playerY: this.player.y,
      currentSpeed: 0
    };
    
    // 输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      normalSpeed: this.normalSpeed,
      dashSpeed: this.dashSpeed,
      dashDuration: this.dashDuration,
      cooldownTime: this.cooldownTime
    }));
  }

  performDash() {
    // 检查是否在冷却中或正在冲刺
    if (this.dashCooldown || this.isDashing) {
      console.log(JSON.stringify({
        event: 'dash_blocked',
        reason: this.dashCooldown ? 'cooldown' : 'already_dashing',
        timestamp: Date.now()
      }));
      return;
    }
    
    // 开始冲刺
    this.isDashing = true;
    this.dashCount++;
    
    // 确定冲刺方向（基于当前朝向或移动方向）
    let dashDirection = 1; // 默认向右
    if (this.cursors.left.isDown) {
      dashDirection = -1;
    } else if (this.cursors.right.isDown) {
      dashDirection = 1;
    } else {
      // 如果没有按方向键，使用上次的朝向
      dashDirection = this.player.flipX ? -1 : 1;
    }
    
    // 设置冲刺速度
    this.player.setVelocityX(this.dashSpeed * dashDirection);
    
    // 视觉反馈：改变颜色
    this.player.setTint(0xffff00);
    
    console.log(JSON.stringify({
      event: 'dash_start',
      dashCount: this.dashCount,
      direction: dashDirection,
      speed: this.dashSpeed,
      position: { x: this.player.x, y: this.player.y },
      timestamp: Date.now()
    }));
    
    // 冲刺持续时间定时器
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocityX(0);
        this.player.clearTint();
        
        console.log(JSON.stringify({
          event: 'dash_end',
          position: { x: this.player.x, y: this.player.y },
          timestamp: Date.now()
        }));
        
        // 开始冷却
        this.startCooldown();
      }
    });
  }

  startCooldown() {
    this.dashCooldown = true;
    
    console.log(JSON.stringify({
      event: 'cooldown_start',
      duration: this.cooldownTime,
      timestamp: Date.now()
    }));
    
    // 冷却定时器
    this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.dashCooldown = false;
        
        console.log(JSON.stringify({
          event: 'cooldown_end',
          timestamp: Date.now()
        }));
      }
    });
  }

  update(time, delta) {
    // 普通移动控制（非冲刺状态）
    if (!this.isDashing) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.normalSpeed);
        this.player.flipX = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.normalSpeed);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }
    }
    
    // 更新状态文本
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Dashing: ${this.isDashing}`,
      `Cooldown: ${this.dashCooldown}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Speed: ${Math.abs(this.player.body.velocity.x).toFixed(0)}`,
      '',
      'Controls:',
      'Arrow Keys: Move',
      'Space: Dash'
    ]);
    
    // 更新信号对象
    window.__signals__.dashCount = this.dashCount;
    window.__signals__.isDashing = this.isDashing;
    window.__signals__.dashCooldown = this.dashCooldown;
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;
    window.__signals__.currentSpeed = Math.abs(this.player.body.velocity.x);
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: DashScene
};

new Phaser.Game(config);