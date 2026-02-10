class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 当前生命值
    this.maxHealth = 20; // 最大生命值
    this.healthBars = []; // 存储血条格子的 Graphics 对象
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `Health: ${this.health} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });
  }

  createHealthBar() {
    const barWidth = 30; // 每格血条的宽度
    const barHeight = 40; // 每格血条的高度
    const barGap = 5; // 格子之间的间隙
    const startX = 400 - (this.maxHealth * (barWidth + barGap)) / 2; // 居中起始位置
    const startY = 200;

    // 创建 20 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      const y = startY;

      // 创建血条格子背景（深灰色边框）
      const barBg = this.add.graphics();
      barBg.lineStyle(2, 0x333333, 1);
      barBg.strokeRect(x, y, barWidth, barHeight);

      // 创建血条格子填充（灰色）
      const barFill = this.add.graphics();
      barFill.fillStyle(0x808080, 1);
      barFill.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      // 存储血条格子引用
      this.healthBars.push({
        background: barBg,
        fill: barFill,
        x: x,
        y: y,
        width: barWidth,
        height: barHeight
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health} / ${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示，将损失的血量格子变为深灰色
    const lostHealth = this.maxHealth - this.health;
    
    for (let i = 0; i < lostHealth; i++) {
      const index = this.maxHealth - 1 - i; // 从右边开始扣血
      const bar = this.healthBars[index];
      
      // 清除原有填充
      bar.fill.clear();
      
      // 重新绘制为深灰色（表示已损失）
      bar.fill.fillStyle(0x2a2a2a, 1);
      bar.fill.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
    }
  }

  showGameOver() {
    this.gameOver = true;

    // 创建半透明黑色遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 Game Over 文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 显示重启提示
    this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加动画效果，例如血条闪烁等
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);