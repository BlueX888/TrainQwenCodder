class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '粉色血条演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, '按空格键扣血', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2 + barWidth / 2;
    const startY = 200;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深色边框）
      const background = this.add.graphics();
      background.fillStyle(0x8b4789, 1); // 深粉色边框
      background.fillRect(x - barWidth / 2 - 2, startY - barHeight / 2 - 2, barWidth + 4, barHeight + 4);

      // 创建血条本体（粉色）
      const bar = this.add.graphics();
      bar.fillStyle(0xff69b4, 1); // 粉色
      bar.fillRect(x - barWidth / 2, startY - barHeight / 2, barWidth, barHeight);

      // 添加高光效果
      const highlight = this.add.graphics();
      highlight.fillStyle(0xffb6d9, 0.6); // 浅粉色高光
      highlight.fillRect(x - barWidth / 2 + 2, startY - barHeight / 2 + 2, barWidth - 4, barHeight / 3);

      this.healthBars.push({
        background: background,
        bar: bar,
        highlight: highlight
      });
    }
  }

  takeDamage() {
    if (this.gameOver) {
      return;
    }

    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);

      // 添加扣血动画效果
      const index = this.health;
      if (index >= 0 && index < this.healthBars.length) {
        const bar = this.healthBars[index];
        
        // 闪烁效果
        this.tweens.add({
          targets: [bar.bar, bar.highlight],
          alpha: 0,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            bar.bar.setVisible(false);
            bar.highlight.setVisible(false);
          }
        });
      }

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 隐藏已损失的生命值格子
    for (let i = this.health; i < this.maxHealth; i++) {
      this.healthBars[i].bar.setVisible(false);
      this.healthBars[i].highlight.setVisible(false);
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // Game Over 文本动画
    this.gameOverText.setScale(0);
    this.tweens.add({
      targets: this.gameOverText,
      scale: 1,
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 禁用输入
    this.spaceKey.off('down', this.takeDamage, this);

    // 添加重启提示
    this.time.delayedCall(1000, () => {
      this.add.text(400, 380, '按 R 键重新开始', {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // 监听 R 键重启游戏
      const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      rKey.on('down', () => {
        this.scene.restart();
      });
    });
  }

  update(time, delta) {
    // 血条呼吸效果（当生命值较低时）
    if (this.health > 0 && this.health <= 3 && !this.gameOver) {
      const pulse = Math.sin(time / 200) * 0.2 + 0.8;
      for (let i = 0; i < this.health; i++) {
        this.healthBars[i].bar.setAlpha(pulse);
        this.healthBars[i].highlight.setAlpha(pulse * 0.6);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

new Phaser.Game(config);