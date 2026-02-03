class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 初始生命值
    this.maxHealth = 20;
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '按方向键扣血', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 初始绘制血条
    this.drawHealthBar();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建提示文本
    this.add.text(400, 500, '使用方向键 ↑ ↓ ← → 扣血', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 记录按键状态，避免长按连续扣血
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update() {
    if (this.isGameOver) {
      return; // 游戏结束后不再处理输入
    }

    // 检测方向键按下（只在按键从未按下到按下时触发一次）
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.keyPressed.up = true;
      this.takeDamage();
    } else if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.keyPressed.down = true;
      this.takeDamage();
    } else if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.keyPressed.left = true;
      this.takeDamage();
    } else if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.keyPressed.right = true;
      this.takeDamage();
    } else if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
      this.drawHealthBar();

      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 30; // 每格宽度
    const barHeight = 40; // 每格高度
    const barGap = 5; // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barGap)) / 2; // 居中显示
    const startY = 200;

    // 绘制血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      const y = startY;

      if (i < this.health) {
        // 有血的格子：蓝色填充
        this.healthBarGraphics.fillStyle(0x0066ff, 1);
        this.healthBarGraphics.fillRect(x, y, barWidth, barHeight);
        
        // 添加边框
        this.healthBarGraphics.lineStyle(2, 0x003399, 1);
        this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);
      } else {
        // 无血的格子：深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, y, barWidth, barHeight);
        
        // 添加边框
        this.healthBarGraphics.lineStyle(2, 0x666666, 1);
        this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 显示重启提示
    this.add.text(400, 370, '刷新页面重新开始', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};