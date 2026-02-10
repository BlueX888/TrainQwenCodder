class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBlocks = [];
    
    // 初始化signals记录
    if (!window.__signals__) {
      window.__signals__ = [];
    }
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按空格键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每4秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建日志文本区域
    this.logText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 记录初始状态
    this.logSignal('init', this.currentHealth);
    
    console.log('游戏开始 - 初始生命值:', this.currentHealth);
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const blockSpacing = 5;
    const totalWidth = (blockWidth + blockSpacing) * this.maxHealth - blockSpacing;
    const startX = (800 - totalWidth) / 2;
    const startY = 200;

    // 创建12个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景边框（灰色）
      const bg = this.add.graphics();
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量方块（红色）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff0000, 1);
      healthBlock.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: bg,
        block: healthBlock,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const healthBlock = this.healthBlocks[i];
      healthBlock.block.clear();

      if (i < this.currentHealth) {
        // 有生命值的方块显示为红色
        healthBlock.block.fillStyle(0xff0000, 1);
        healthBlock.block.fillRect(
          healthBlock.x + 2,
          healthBlock.y + 2,
          healthBlock.width - 4,
          healthBlock.height - 4
        );
      } else {
        // 没有生命值的方块显示为深灰色
        healthBlock.block.fillStyle(0x333333, 1);
        healthBlock.block.fillRect(
          healthBlock.x + 2,
          healthBlock.y + 2,
          healthBlock.width - 4,
          healthBlock.height - 4
        );
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.logSignal('damage', this.currentHealth);
      this.showLog(`受到伤害 -${amount} | 当前生命: ${this.currentHealth}`);
      console.log(`受到伤害: -${amount}, 当前生命值: ${this.currentHealth}`);

      if (this.currentHealth === 0) {
        this.showLog('生命值已耗尽！');
        console.log('生命值已耗尽！');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logSignal('heal', this.currentHealth);
      this.showLog(`自动回复 +1 | 当前生命: ${this.currentHealth}`);
      console.log(`自动回复: +1, 当前生命值: ${this.currentHealth}`);
    }
  }

  showLog(message) {
    this.logText.setText(message);
    
    // 1.5秒后清除日志
    this.time.delayedCall(1500, () => {
      this.logText.setText('');
    });
  }

  logSignal(action, health) {
    const signal = {
      timestamp: Date.now(),
      action: action,
      health: health,
      maxHealth: this.maxHealth
    };
    window.__signals__.push(signal);
    console.log('Signal:', JSON.stringify(signal));
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

const game = new Phaser.Game(config);