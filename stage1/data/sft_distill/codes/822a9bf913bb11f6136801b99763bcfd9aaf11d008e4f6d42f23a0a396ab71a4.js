class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.isDashOnCooldown = false; // 冷却状态
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 使用 Graphics 生成紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 生成冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xff0000, 0.5);
    cooldownGraphics.fillCircle(20, 20, 20);
    cooldownGraphics.generateTexture('cooldown', 40, 40);
    cooldownGraphics.destroy();
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建紫色角色
    this.player = this.physics.add.sprite(centerX, centerY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力，冲刺后会逐渐减速

    // 创建冷却指示器（初始隐藏）
    this.cooldownIndicator = this.add.sprite(
      this.player.x,
      this.player.y,
      'cooldown'
    );
    this.cooldownIndicator.setVisible(false);

    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 键盘控制（WASD）
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.updateInfoText();
  }

  performDash(pointer) {
    // 检查是否在冷却中
    if (this.isDashOnCooldown) {
      console.log('Dash on cooldown!');
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const deltaX = pointer.worldX - this.player.x;
    const deltaY = pointer.worldY - this.player.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance === 0) return;

    // 归一化方向向量
    const dirX = deltaX / distance;
    const dirY = deltaY / distance;

    // 设置冲刺速度 (300 * 3 = 900)
    const dashSpeed = 900;
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 增加冲刺计数
    this.dashCount++;

    // 启动冷却
    this.startCooldown();

    console.log(`Dash #${this.dashCount} performed!`);
  }

  startCooldown() {
    this.isDashOnCooldown = true;
    this.cooldownRemaining = 2.5;

    // 显示冷却指示器
    this.cooldownIndicator.setVisible(true);

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: () => {
        this.isDashOnCooldown = false;
        this.cooldownRemaining = 0;
        this.cooldownIndicator.setVisible(false);
        console.log('Dash ready!');
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    // 基础移动控制（速度 300）
    const moveSpeed = 300;
    let velocityX = 0;
    let velocityY = 0;

    if (this.keys.A.isDown) {
      velocityX = -moveSpeed;
    } else if (this.keys.D.isDown) {
      velocityX = moveSpeed;
    }

    if (this.keys.W.isDown) {
      velocityY = -moveSpeed;
    } else if (this.keys.S.isDown) {
      velocityY = moveSpeed;
    }

    // 只在没有冲刺时应用基础移动
    if (!this.isDashOnCooldown || this.player.body.speed < moveSpeed * 2) {
      // 如果速度低于冲刺速度的阈值，允许控制
      if (velocityX !== 0 || velocityY !== 0) {
        this.player.setVelocity(velocityX, velocityY);
      }
    }

    // 更新冷却指示器位置
    this.cooldownIndicator.setPosition(this.player.x, this.player.y);

    // 更新冷却剩余时间
    if (this.isDashOnCooldown && this.cooldownTimer) {
      this.cooldownRemaining = Math.max(
        0,
        2.5 - this.cooldownTimer.getElapsed() / 1000
      );
    }

    // 更新信息文本
    this.updateInfoText();
  }

  updateInfoText() {
    const status = this.isDashOnCooldown
      ? `COOLDOWN: ${this.cooldownRemaining.toFixed(1)}s`
      : 'READY';
    
    this.infoText.setText([
      'Controls:',
      '  WASD - Move (speed: 300)',
      '  Right Click - Dash (speed: 900)',
      '',
      `Dash Count: ${this.dashCount}`,
      `Status: ${status}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Speed: ${Math.round(this.player.body.speed)}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DashGameScene
};

new Phaser.Game(config);