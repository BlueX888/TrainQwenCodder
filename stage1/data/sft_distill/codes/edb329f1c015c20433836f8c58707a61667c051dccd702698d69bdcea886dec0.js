class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储血条矩形对象
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加提示文本
    this.add.text(400, 100, 'Click anywhere to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.takeDamage, this);
  }

  createHealthBar() {
    const barWidth = 50; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 5; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2; // 居中起始位置
    const startY = 150;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 使用 Graphics 绘制血条
      const graphics = this.add.graphics();
      
      // 绘制青色填充矩形
      graphics.fillStyle(0x00ffff, 1);
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制白色边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 存储血条信息
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        active: true
      });
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.updateHealthBar();
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 检查是否游戏结束
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 从右到左更新血条（最后一个有效的血条变灰）
    for (let i = this.maxHealth - 1; i >= 0; i--) {
      if (this.healthBars[i].active && i >= this.health) {
        const bar = this.healthBars[i];
        
        // 清除原有绘制
        bar.graphics.clear();
        
        // 绘制灰色填充矩形（表示失去的生命值）
        bar.graphics.fillStyle(0x333333, 1);
        bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
        
        // 绘制白色边框
        bar.graphics.lineStyle(2, 0x666666, 1);
        bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
        
        bar.active = false;
        break;
      }
    }
  }

  showGameOver() {
    this.gameOver = true;
    
    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    
    // 显示 Game Over 文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 显示重新开始提示
    this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加动画效果或其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);