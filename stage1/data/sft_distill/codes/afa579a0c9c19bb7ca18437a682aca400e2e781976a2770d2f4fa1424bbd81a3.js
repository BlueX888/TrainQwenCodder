class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 8; // 当前生命值
    this.maxHealth = 8; // 最大生命值
    this.healthBars = []; // 存储血条方块
    this.healthText = null; // 显示生命值文本
    this.healTimer = null; // 回血定时器
    this.canTakeDamage = true; // 防止连续扣血
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 100, '按方向键扣血，每1.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建回血定时器 - 每1.5秒触发一次
    this.healTimer = this.time.addEvent({
      delay: 1500, // 1.5秒
      callback: this.healHealth,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加额外的键盘事件监听（防止长按）
    this.input.keyboard.on('keydown', this.handleKeyPress, this);

    // 创建状态信息面板
    this.add.text(400, 450, '状态信息:', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.statusText = this.add.text(400, 480, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 250; // 血条起始X坐标
    const startY = 250; // 血条起始Y坐标
    const barWidth = 40; // 每格血条宽度
    const barHeight = 40; // 每格血条高度
    const gap = 5; // 血条间隙

    // 清空旧的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    // 创建8格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      const y = startY;

      // 创建血条背景（灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, barWidth, barHeight);

      // 创建血条前景（红色）
      const foreground = this.add.graphics();
      if (i < this.health) {
        foreground.fillStyle(0xff0000, 1);
        foreground.fillRect(x, y, barWidth, barHeight);
      }

      // 添加边框
      const border = this.add.graphics();
      border.lineStyle(2, 0xffffff, 1);
      border.strokeRect(x, y, barWidth, barHeight);

      this.healthBars.push({
        background,
        foreground,
        border,
        x,
        y,
        width: barWidth,
        height: barHeight
      });
    }
  }

  handleKeyPress(event) {
    // 检查是否是方向键
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if (arrowKeys.includes(event.key) && this.canTakeDamage) {
      this.takeDamage();
      
      // 防止连续扣血（0.2秒冷却）
      this.canTakeDamage = false;
      this.time.delayedCall(200, () => {
        this.canTakeDamage = true;
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.updateStatusText('受到伤害！');
      
      // 添加受伤效果（闪烁）
      this.cameras.main.shake(100, 0.005);
    } else {
      this.updateStatusText('生命值已为0！');
    }
  }

  healHealth() {
    if (this.health < this.maxHealth) {
      this.health++;
      this.updateHealthBar();
      this.updateStatusText('回复1点生命值');
      
      // 添加回血效果（绿色闪光）
      const flash = this.add.graphics();
      flash.fillStyle(0x00ff00, 0.3);
      flash.fillRect(0, 0, 800, 600);
      this.time.delayedCall(100, () => {
        flash.destroy();
      });
    }
  }

  updateHealthBar() {
    // 更新血条显示
    this.healthBars.forEach((bar, index) => {
      bar.foreground.clear();
      if (index < this.health) {
        // 根据生命值比例显示不同颜色
        let color = 0xff0000; // 红色
        if (this.health <= 2) {
          color = 0xff0000; // 危险：红色
        } else if (this.health <= 4) {
          color = 0xff8800; // 警告：橙色
        } else {
          color = 0xff0000; // 健康：红色
        }
        
        bar.foreground.fillStyle(color, 1);
        bar.foreground.fillRect(bar.x, bar.y, bar.width, bar.height);
      }
    });

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.health <= 2) {
      this.healthText.setColor('#ff0000');
    } else if (this.health <= 4) {
      this.healthText.setColor('#ff8800');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  updateStatusText(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.statusText.setText(`[${timestamp}] ${message} (当前: ${this.health}/${this.maxHealth})`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前版本使用事件驱动，不需要在update中处理
  }
}

// Phaser游戏配置
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