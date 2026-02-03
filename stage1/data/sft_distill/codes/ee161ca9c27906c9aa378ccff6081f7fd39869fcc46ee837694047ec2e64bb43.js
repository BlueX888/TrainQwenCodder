class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号
    this.canDash = true; // 冲刺冷却状态
    this.isDashing = false; // 是否正在冲刺
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

    // 创建物理精灵角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建冷却指示器
    this.cooldownText = this.add.text(10, 10, 'Dash Ready', {
      fontSize: '20px',
      color: '#00ff00'
    });

    // 创建状态显示
    this.statusText = this.add.text(10, 40, 'Dash Count: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 创建提示文本
    this.add.text(400, 550, 'Click Mouse Left to Dash', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 键盘控制（可选，用于基础移动）
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 冲刺速度：240 * 3 = 720
    const dashSpeed = 240 * 3;

    // 设置冲刺速度
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 标记正在冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 更新状态显示
    this.statusText.setText(`Dash Count: ${this.dashCount}`);
    this.cooldownText.setText('Dashing...').setColor('#ff0000');

    // 冲刺持续时间（短距离冲刺，约0.2秒）
    this.time.delayedCall(200, () => {
      this.isDashing = false;
      // 冲刺结束后减速
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 2秒冷却时间
    this.time.delayedCall(2000, () => {
      this.canDash = true;
      this.cooldownText.setText('Dash Ready').setColor('#00ff00');
    });
  }

  update(time, delta) {
    // 基础移动控制（非冲刺状态）
    if (!this.isDashing) {
      const baseSpeed = 240;
      
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-baseSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(baseSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-baseSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(baseSpeed);
      }
    }

    // 显示当前速度（用于调试）
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    );
    
    if (this.speedText) {
      this.speedText.destroy();
    }
    this.speedText = this.add.text(10, 70, `Speed: ${Math.round(speed)}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
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