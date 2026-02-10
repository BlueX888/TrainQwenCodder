class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 状态信号变量
    this.dashCount = 0;  // 冲刺次数统计
    this.canDash = true;  // 是否可以冲刺
    this.cooldownRemaining = 0;  // 剩余冷却时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);  // 黄色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（带物理属性）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);  // 启用阻尼
    this.player.setDrag(0.95);  // 设置阻力，让冲刺后逐渐减速

    // 冷却计时器引用
    this.cooldownTimer = null;

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 添加键盘控制（方便测试移动）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器（圆圈）
    this.cooldownIndicator = this.add.graphics();
    this.cooldownIndicator.setDepth(1);

    console.log('游戏初始化完成 - 点击鼠标左键进行冲刺');
  }

  performDash(pointer) {
    // 检查是否在冷却中
    if (!this.canDash) {
      console.log(`冲刺冷却中，剩余 ${this.cooldownRemaining.toFixed(1)} 秒`);
      return;
    }

    // 计算冲刺方向（从玩家指向鼠标点击位置）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果点击位置太近，不执行冲刺
    if (distance < 10) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 冲刺速度：360 * 3 = 1080
    const dashSpeed = 360 * 3;

    // 设置速度（冲刺）
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 增加冲刺计数
    this.dashCount++;

    // 进入冷却状态
    this.canDash = false;
    this.cooldownRemaining = 3.0;

    console.log(`冲刺 #${this.dashCount}! 方向: (${dirX.toFixed(2)}, ${dirY.toFixed(2)})`);

    // 创建冷却计时器（3秒）
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: 3000,  // 3秒冷却
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        console.log('冲刺冷却完成！');
      },
      callbackScope: this
    });

    // 添加视觉反馈：短暂缩放效果
    this.tweens.add({
      targets: this.player,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 基础移动控制（可选）
    const moveSpeed = 200;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-moveSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(moveSpeed);
    }

    // 更新冷却时间显示
    if (!this.canDash && this.cooldownTimer) {
      this.cooldownRemaining = (this.cooldownTimer.getRemaining() / 1000);
    }

    // 更新状态文本
    const status = this.canDash ? '就绪' : `冷却: ${this.cooldownRemaining.toFixed(1)}s`;
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `状态: ${status}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: ${Math.floor(this.player.body.speed)}`,
      '',
      '操作说明:',
      '- 点击鼠标左键冲刺',
      '- 方向键移动角色'
    ]);

    // 绘制冷却指示器
    this.cooldownIndicator.clear();
    if (!this.canDash) {
      const progress = 1 - (this.cooldownRemaining / 3.0);
      this.cooldownIndicator.lineStyle(4, 0xff0000, 1);
      this.cooldownIndicator.beginPath();
      this.cooldownIndicator.arc(
        this.player.x,
        this.player.y,
        25,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * progress),
        false
      );
      this.cooldownIndicator.strokePath();
    } else {
      // 就绪状态显示绿色圆圈
      this.cooldownIndicator.lineStyle(2, 0x00ff00, 0.5);
      this.cooldownIndicator.strokeCircle(this.player.x, this.player.y, 25);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力
      debug: false
    }
  },
  scene: DashScene
};

// 启动游戏
const game = new Phaser.Game(config);