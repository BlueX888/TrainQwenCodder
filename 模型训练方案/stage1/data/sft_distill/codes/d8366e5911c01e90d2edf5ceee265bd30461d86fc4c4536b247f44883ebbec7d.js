class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.canTakeDamage = true; // 防止连续按键造成过快扣血
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 说明文本
    this.add.text(400, 100, '按任意方向键扣血 | 每秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建3个血条方块
    this.createHealthBars();

    // 创建生命值数字显示
    this.healthText = this.add.text(400, 400, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听所有方向键
    this.input.keyboard.on('keydown', (event) => {
      if (this.canTakeDamage && 
          (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
           event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        this.takeDamage();
      }
    });

    // 创建自动回血定时器（每1秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 状态日志文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBars() {
    const barWidth = 80;
    const barHeight = 40;
    const spacing = 20;
    const startX = 400 - (barWidth * 1.5 + spacing);
    const startY = 250;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建血条容器
      const barContainer = this.add.container(x, startY);
      
      // 背景（边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0xffffff, 1);
      background.strokeRect(0, 0, barWidth, barHeight);
      
      // 血条填充
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(2, 2, barWidth - 4, barHeight - 4);
      
      barContainer.add([background, fill]);
      
      this.healthBars.push({
        container: barContainer,
        fill: fill,
        active: true
      });
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthDisplay();
      this.statusText.setText('受到伤害！');
      
      // 添加短暂冷却防止连续扣血
      this.canTakeDamage = false;
      this.time.delayedCall(200, () => {
        this.canTakeDamage = true;
      });

      // 清除状态文本
      this.time.delayedCall(1000, () => {
        this.statusText.setText('');
      });

      // 死亡检测
      if (this.currentHealth === 0) {
        this.statusText.setText('生命值耗尽！');
        this.statusText.setColor('#ff0000');
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthDisplay();
      this.statusText.setText('自动回复生命值！');
      this.statusText.setColor('#00ff00');
      
      // 清除状态文本
      this.time.delayedCall(1000, () => {
        this.statusText.setText('');
      });
    }
  }

  updateHealthDisplay() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();
      
      if (i < this.currentHealth) {
        // 有血 - 红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.active = true;
      } else {
        // 空血 - 深灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.active = false;
      }
      
      bar.fill.fillRect(2, 2, 76, 36);
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth === 0) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth === this.maxHealth) {
      this.healthText.setColor('#00ff00');
    } else {
      this.healthText.setColor('#ffff00');
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);