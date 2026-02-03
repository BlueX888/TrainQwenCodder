class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 8; // 初始生命值
    this.maxHealth = 8;
    this.gameOver = false;
    
    // 初始化信号系统
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      keyPresses: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press W/A/S/D to lose health', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 420, 'Press R to Restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };

    // 为每个键添加监听器
    ['w', 'a', 's', 'd'].forEach(key => {
      this.keys[key].on('down', () => {
        if (!this.gameOver) {
          this.takeDamage(key.toUpperCase());
        }
      });
    });

    // R 键重启
    this.keys.r.on('down', () => {
      if (this.gameOver) {
        this.restartGame();
      }
    });

    // 输出初始信号
    this.updateSignals();
    console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
  }

  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 60;  // 每格宽度
    const barHeight = 40; // 每格高度
    const barGap = 10;    // 格子间隙
    const startX = 400 - ((barWidth + barGap) * this.maxHealth - barGap) / 2; // 居中
    const startY = 150;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      
      if (i < this.health) {
        // 有血的格子：绿色填充
        this.healthBarGraphics.fillStyle(0x00ff00, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 深绿色边框
        this.healthBarGraphics.lineStyle(3, 0x00aa00, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 空血的格子：深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 灰色边框
        this.healthBarGraphics.lineStyle(3, 0x666666, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  takeDamage(key) {
    if (this.health > 0) {
      this.health--;
      
      // 记录按键
      window.__signals__.keyPresses.push({
        key: key,
        timestamp: Date.now(),
        healthAfter: this.health
      });

      // 更新显示
      this.drawHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 更新文本颜色
      if (this.health <= 2) {
        this.healthText.setColor('#ff0000'); // 低血量红色
      } else if (this.health <= 4) {
        this.healthText.setColor('#ffaa00'); // 中等血量橙色
      }

      // 检查游戏结束
      if (this.health <= 0) {
        this.triggerGameOver();
      }

      // 更新信号
      this.updateSignals();
      console.log(`Key ${key} pressed. Health: ${this.health}`, JSON.stringify(window.__signals__, null, 2));
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.updateSignals();
    console.log('GAME OVER!', JSON.stringify(window.__signals__, null, 2));
  }

  restartGame() {
    this.health = this.maxHealth;
    this.gameOver = false;
    
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);
    this.healthText.setColor('#00ff00');
    
    this.drawHealthBar();
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 重置信号
    window.__signals__.keyPresses = [];
    this.updateSignals();
    console.log('Game restarted:', JSON.stringify(window.__signals__, null, 2));
  }

  updateSignals() {
    window.__signals__.health = this.health;
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.timestamp = Date.now();
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
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