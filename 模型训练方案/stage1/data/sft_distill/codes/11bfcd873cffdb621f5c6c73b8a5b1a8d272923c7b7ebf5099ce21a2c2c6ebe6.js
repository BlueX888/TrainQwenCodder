class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储每个生命格的 Graphics 对象
    this.gameOverText = null;
    this.isGameOver = false;
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
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 绘制血条
    this.createHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听，避免 update 中的重复触发
    this.spaceKey.on('down', () => {
      if (!this.isGameOver) {
        this.takeDamage();
      }
    });
  }

  createHealthBar() {
    const barWidth = 50; // 每格血条的宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 5; // 格子之间的间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 250;

    // 创建 10 个生命格
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制橙色填充矩形
      graphics.fillStyle(0xff8800, 1); // 橙色
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        visible: true
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加受伤闪烁效果
      this.cameras.main.shake(100, 0.005);

      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 清空对应位置的血条（从右到左消失）
    const index = this.health; // 当前要清空的格子索引
    
    if (index < this.maxHealth && this.healthBars[index].visible) {
      const bar = this.healthBars[index];
      
      // 清除原有内容
      bar.graphics.clear();
      
      // 只绘制边框（空血条效果）
      bar.graphics.lineStyle(2, 0x666666, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      // 绘制灰色半透明填充表示空血
      bar.graphics.fillStyle(0x333333, 0.5);
      bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      
      bar.visible = false;
    }
  }

  showGameOver() {
    this.isGameOver = true;

    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 Game Over 文本
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 显示重启提示
    this.add.text(400, 400, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 禁用输入
    this.spaceKey.enabled = false;
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
if (typeof window !== 'undefined') {
  window.getGameState = () => ({
    health: game.scene.scenes[0].health,
    maxHealth: game.scene.scenes[0].maxHealth,
    isGameOver: game.scene.scenes[0].isGameOver
  });
}