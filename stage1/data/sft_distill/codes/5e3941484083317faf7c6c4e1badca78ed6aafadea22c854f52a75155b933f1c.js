class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.canTakeDamage = true;
    this.damageDelay = 300; // 防止连续扣血
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题文本
    this.add.text(400, 50, 'Health System Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage\nAuto Heal: 1 HP per second', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建生命值显示
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置自动回血定时器（每1秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 1000,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加键盘事件监听
    this.input.keyboard.on('keydown', (event) => {
      if (this.canTakeDamage) {
        const key = event.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
          this.takeDamage(key);
        }
      }
    });

    // 显示当前状态
    this.updateStatusText('Ready! Press any arrow key');
  }

  createHealthBar() {
    const startX = 250;
    const startY = 250;
    const spacing = 100;
    const heartSize = 60;

    // 创建3个生命值格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * spacing;
      const y = startY;

      // 创建心形容器
      const heartContainer = this.add.container(x, y);

      // 绘制心形背景（空心）
      const bgHeart = this.add.graphics();
      this.drawHeart(bgHeart, 0, 0, heartSize, 0x555555, 0.5);
      heartContainer.add(bgHeart);

      // 绘制心形填充（实心）
      const fillHeart = this.add.graphics();
      this.drawHeart(fillHeart, 0, 0, heartSize, 0xff0000, 1);
      heartContainer.add(fillHeart);

      this.healthBars.push({
        container: heartContainer,
        fill: fillHeart,
        bg: bgHeart
      });
    }

    this.updateHealthDisplay();
  }

  drawHeart(graphics, x, y, size, color, alpha) {
    graphics.fillStyle(color, alpha);
    
    // 简化的心形（使用圆形和三角形组合）
    const radius = size / 4;
    
    // 左上圆
    graphics.fillCircle(x - radius / 2, y - radius / 2, radius);
    // 右上圆
    graphics.fillCircle(x + radius / 2, y - radius / 2, radius);
    
    // 下方三角形
    graphics.beginPath();
    graphics.moveTo(x - radius * 1.2, y - radius / 2);
    graphics.lineTo(x, y + radius * 1.5);
    graphics.lineTo(x + radius * 1.2, y - radius / 2);
    graphics.closePath();
    graphics.fillPath();
  }

  updateHealthDisplay() {
    // 更新每个生命值格子的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.healthBars[i];
      if (i < this.currentHealth) {
        // 有生命值：显示红色心形
        heart.fill.setAlpha(1);
      } else {
        // 无生命值：显示灰色背景
        heart.fill.setAlpha(0);
      }
    }
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthDisplay();
      
      // 添加伤害反馈动画
      const damagedHeart = this.healthBars[this.currentHealth];
      this.tweens.add({
        targets: damagedHeart.container,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });

      this.updateStatusText(`Took damage from ${key}! Health: ${this.currentHealth}/${this.maxHealth}`);

      if (this.currentHealth === 0) {
        this.updateStatusText('Health depleted! Waiting for auto-heal...');
      }

      // 防止连续扣血
      this.canTakeDamage = false;
      this.time.delayedCall(this.damageDelay, () => {
        this.canTakeDamage = true;
      });
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthDisplay();
      
      // 添加回血动画
      const healedHeart = this.healthBars[this.currentHealth - 1];
      this.tweens.add({
        targets: healedHeart.fill,
        alpha: { from: 0, to: 1 },
        duration: 300,
        ease: 'Power2'
      });

      // 容器缩放动画
      this.tweens.add({
        targets: healedHeart.container,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      this.updateStatusText(`Healed +1! Health: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  updateStatusText(message) {
    this.statusText.setText(message);
    
    // 文本闪烁效果
    this.tweens.add({
      targets: this.statusText,
      alpha: { from: 1, to: 0.5 },
      duration: 200,
      yoyo: true
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖事件驱动
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露状态变量用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    canTakeDamage: scene.canTakeDamage
  };
};