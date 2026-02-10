class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 240 * 3; // 720
    this.normalSpeed = 200;
    this.dashDuration = 300; // 冲刺持续时间 300ms
    this.dashCooldown = 2000; // 冷却时间 2秒
    this.canDash = true;
    this.isDashing = false;
    this.dashCount = 0; // 用于验证的状态信号
  }

  preload() {
    // 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x333333, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建物理世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建地面
    const ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // 添加重力
    this.player.body.setGravityY(500);

    // 玩家与地面碰撞
    this.physics.add.collider(this.player, ground);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 添加键盘控制（WASD移动）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从玩家指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++; // 增加冲刺计数

    // 计算冲刺速度向量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffff00); // 黄色表示冲刺中

    // 冲刺持续时间结束后恢复正常
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        // 恢复正常速度（保持方向但降低速度）
        const currentVelocity = this.player.body.velocity;
        if (currentVelocity.length() > this.normalSpeed) {
          currentVelocity.normalize().scale(this.normalSpeed);
          this.player.setVelocity(currentVelocity.x, currentVelocity.y);
        }
      }
    });

    // 冷却时间结束后可以再次冲刺
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
      }
    });
  }

  update(time, delta) {
    // 正常移动控制（非冲刺时）
    if (!this.isDashing) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.normalSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.normalSpeed);
      } else {
        // 保持X轴速度衰减
        this.player.setVelocityX(this.player.body.velocity.x * 0.9);
      }

      // 跳跃（只在地面时）
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-400);
      }
    }

    // 更新状态文本
    const cooldownStatus = this.canDash ? '就绪' : '冷却中';
    const dashStatus = this.isDashing ? '冲刺中' : '正常';
    this.statusText.setText([
      `冲刺状态: ${dashStatus}`,
      `冷却状态: ${cooldownStatus}`,
      `冲刺次数: ${this.dashCount}`,
      `速度: ${Math.round(this.player.body.velocity.length())}`,
      '',
      '操作说明:',
      '鼠标左键: 向鼠标方向冲刺',
      'WASD: 移动和跳跃'
    ]);

    // 绘制冷却条
    this.cooldownBar.clear();
    if (!this.canDash) {
      // 计算冷却进度（需要追踪冷却开始时间）
      this.cooldownBar.fillStyle(0xff0000, 0.7);
      this.cooldownBar.fillRect(10, 180, 200, 20);
      this.cooldownBar.fillStyle(0x00ff00, 0.7);
      // 简化显示：用isDashing状态近似
      const progress = this.isDashing ? 0 : 0.5;
      this.cooldownBar.fillRect(10, 180, 200 * progress, 20);
    } else {
      this.cooldownBar.fillStyle(0x00ff00, 0.7);
      this.cooldownBar.fillRect(10, 180, 200, 20);
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