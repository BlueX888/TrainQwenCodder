class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.isDashOnCooldown = false; // 冷却状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 使用 Graphics 创建白色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的白色圆形
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加阻力使冲刺有减速效果

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 创建UI显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(width / 2, height - 30, '点击鼠标左键进行冲刺', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  performDash(pointer) {
    // 检查冷却状态
    if (this.isDashOnCooldown) {
      console.log('冲刺冷却中...');
      return;
    }

    // 计算冲刺方向
    const playerX = this.player.x;
    const playerY = this.player.y;
    const targetX = pointer.x;
    const targetY = pointer.y;

    // 计算方向向量
    const dx = targetX - playerX;
    const dy = targetY - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 避免除以零
    if (distance === 0) return;

    // 归一化方向向量并乘以冲刺速度 (80 * 3 = 240)
    const dashSpeed = 80 * 3;
    const velocityX = (dx / distance) * dashSpeed;
    const velocityY = (dy / distance) * dashSpeed;

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 增加冲刺计数
    this.dashCount++;

    // 启动冷却
    this.isDashOnCooldown = true;
    this.updateStatusText();

    // 视觉反馈：冲刺时角色变色
    this.player.setTint(0xffff00); // 黄色表示冲刺

    // 1.5秒后恢复
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        this.isDashOnCooldown = false;
        this.player.clearTint();
        this.updateStatusText();
      }
    });

    // 冲刺持续时间（短距离冲刺，0.2秒后开始减速）
    this.time.addEvent({
      delay: 200,
      callback: () => {
        // 通过阻力自然减速，不需要手动设置速度为0
      }
    });
  }

  updateStatusText() {
    const cooldownStatus = this.isDashOnCooldown ? '冷却中' : '就绪';
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n冲刺状态: ${cooldownStatus}`
    );
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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
  scene: GameScene
};

new Phaser.Game(config);