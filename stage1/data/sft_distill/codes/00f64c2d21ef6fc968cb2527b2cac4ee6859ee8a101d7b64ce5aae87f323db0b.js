class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.isDashing = false; // 状态信号：是否正在冲刺
    this.canDash = true; // 状态信号：是否可以冲刺（冷却完成）
  }

  preload() {
    // 使用 Graphics 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冲刺效果纹理（更亮的青色）
    const dashGraphics = this.add.graphics();
    dashGraphics.fillStyle(0x00FFFF, 0.5);
    dashGraphics.fillRect(0, 0, 32, 32);
    dashGraphics.generateTexture('playerDash', 32, 32);
    dashGraphics.destroy();
  }

  create() {
    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDrag(800); // 添加拖拽，使移动更平滑

    // 基础移动速度
    this.baseSpeed = 200;
    this.dashSpeed = 200 * 3; // 冲刺速度 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 1000; // 冷却时间1秒

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash();
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '方向键移动 | 鼠标右键冲刺', {
      fontSize: '18px',
      fill: '#00FFFF'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 如果正在冲刺，不处理常规移动
    if (this.isDashing) {
      return;
    }

    // 常规移动控制
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.baseSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.baseSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.baseSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.baseSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 更新状态文本
    this.updateStatusText();
  }

  performDash() {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 获取当前移动方向
    let dashX = 0;
    let dashY = 0;

    if (this.cursors.left.isDown) {
      dashX = -1;
    } else if (this.cursors.right.isDown) {
      dashX = 1;
    }

    if (this.cursors.up.isDown) {
      dashY = -1;
    } else if (this.cursors.down.isDown) {
      dashY = 1;
    }

    // 如果没有方向输入，默认向右冲刺
    if (dashX === 0 && dashY === 0) {
      dashX = 1;
    }

    // 归一化方向向量
    const length = Math.sqrt(dashX * dashX + dashY * dashY);
    if (length > 0) {
      dashX /= length;
      dashY /= length;
    }

    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(dashX * this.dashSpeed, dashY * this.dashSpeed);

    // 改变颜色表示冲刺状态
    this.player.setTexture('playerDash');
    this.player.setAlpha(0.7);

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setTexture('player');
        this.player.setAlpha(1);
        // 恢复正常速度
        const currentVelX = this.player.body.velocity.x;
        const currentVelY = this.player.body.velocity.y;
        const currentLength = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);
        if (currentLength > 0) {
          this.player.setVelocity(
            (currentVelX / currentLength) * this.baseSpeed,
            (currentVelY / currentLength) * this.baseSpeed
          );
        }
      }
    });

    // 冷却时间结束
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
      }
    });
  }

  updateStatusText() {
    const cooldownStatus = this.canDash ? '✓ 就绪' : '✗ 冷却中';
    const dashingStatus = this.isDashing ? '冲刺中!' : '正常';
    
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冷却状态: ${cooldownStatus}`,
      `移动状态: ${dashingStatus}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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