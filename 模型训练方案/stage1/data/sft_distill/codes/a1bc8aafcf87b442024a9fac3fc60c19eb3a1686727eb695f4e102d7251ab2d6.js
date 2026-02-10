class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证状态：冲刺次数
    this.isDashing = false;
    this.dashCooldown = false;
    this.cooldownRemaining = 0;
  }

  preload() {
    // 创建黄色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    cooldownGraphics.fillStyle(0xff0000, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 20);
    cooldownGraphics.generateTexture('cooldownBar', 100, 20);
    cooldownGraphics.destroy();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景网格
    const bg = this.add.graphics();
    bg.lineStyle(1, 0x333333, 0.5);
    for (let i = 0; i <= width; i += 50) {
      bg.lineBetween(i, 0, i, height);
    }
    for (let i = 0; i <= height; i += 50) {
      bg.lineBetween(0, i, width, i);
    }

    // 创建黄色角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加阻力使冲刺后减速

    // 创建冷却指示器
    this.cooldownBar = this.add.rectangle(width / 2, 50, 0, 20, 0xff0000, 0.5);
    this.cooldownBar.setOrigin(0.5, 0.5);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 30, 
      'Click Left Mouse Button to Dash', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    this.updateStatusText();
  }

  attemptDash(pointer) {
    // 检查是否在冷却中
    if (this.dashCooldown) {
      console.log('Dash on cooldown!');
      return;
    }

    // 计算从角色到鼠标的方向
    const dx = pointer.worldX - this.player.x;
    const dy = pointer.worldY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 冲刺速度：360 * 3 = 1080
    const dashSpeed = 360 * 3;
    
    // 设置速度
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 标记冲刺状态
    this.isDashing = true;
    this.dashCount++;

    // 冲刺持续时间（短距离冲刺约0.2秒）
    this.time.delayedCall(200, () => {
      this.isDashing = false;
    });

    // 开始冷却
    this.startCooldown();

    this.updateStatusText();
    console.log(`Dash #${this.dashCount} executed! Speed: ${dashSpeed}`);
  }

  startCooldown() {
    this.dashCooldown = true;
    this.cooldownRemaining = 3000; // 3秒冷却

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.dashCooldown = false;
        this.cooldownRemaining = 0;
        this.cooldownBar.width = 0;
        this.updateStatusText();
        console.log('Dash ready!');
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    // 更新冷却条
    if (this.dashCooldown && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownTimer.getRemaining();
      const progress = 1 - (this.cooldownRemaining / 3000);
      this.cooldownBar.width = progress * 100;
    }

    // 更新状态文本
    this.updateStatusText();

    // 显示速度信息（调试用）
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    );
    
    // 如果正在冲刺，显示速度
    if (this.isDashing) {
      this.hintText.setText(`DASHING! Speed: ${Math.round(speed)}`);
      this.hintText.setStyle({ fill: '#ff0000' });
    } else if (this.dashCooldown) {
      this.hintText.setText(`Cooldown: ${(this.cooldownRemaining / 1000).toFixed(1)}s`);
      this.hintText.setStyle({ fill: '#ff9900' });
    } else {
      this.hintText.setText('Click Left Mouse Button to Dash');
      this.hintText.setStyle({ fill: '#ffff00' });
    }
  }

  updateStatusText() {
    const cooldownStatus = this.dashCooldown ? 
      `${(this.cooldownRemaining / 1000).toFixed(1)}s` : 'Ready';
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Cooldown: ${cooldownStatus}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Dashing: ${this.isDashing ? 'YES' : 'NO'}`
    ]);
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