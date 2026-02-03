class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.skillUsedCount = 0;
    this.cooldownDuration = 3000; // 3秒冷却
    this.cooldownTimer = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家角色（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建技能弹幕纹理（绿色圆形）
    const skillGraphics = this.add.graphics();
    skillGraphics.fillStyle(0x00ff00, 1);
    skillGraphics.fillCircle(10, 10, 10);
    skillGraphics.generateTexture('skill', 20, 20);
    skillGraphics.destroy();

    // 技能弹幕组
    this.skills = this.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(300, 50, 200, 30);

    // 创建冷却进度条
    this.cooldownBar = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(320, 55, 'Ready!', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建技能使用次数文本
    this.countText = this.add.text(10, 10, 'Skills Used: 0', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    });

    // 创建说明文本
    this.add.text(10, 550, 'Press Arrow Keys to cast skill (3s cooldown)', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 用于验证的状态变量
    this.gameState = {
      skillUsedCount: 0,
      isOnCooldown: false,
      lastSkillTime: 0
    };
  }

  update(time, delta) {
    // 检测方向键输入并释放技能
    if (!this.skillOnCooldown) {
      let direction = null;
      let velocityX = 0;
      let velocityY = 0;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        direction = 'LEFT';
        velocityX = -300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        direction = 'RIGHT';
        velocityX = 300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        direction = 'UP';
        velocityY = -300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        direction = 'DOWN';
        velocityY = 300;
      }

      if (direction) {
        this.castSkill(velocityX, velocityY);
      }
    }

    // 更新冷却进度条
    if (this.skillOnCooldown && this.cooldownTimer) {
      this.cooldownProgress = this.cooldownTimer.getProgress();
      this.updateCooldownBar();
    }

    // 清理超出边界的技能弹幕
    this.skills.children.entries.forEach(skill => {
      if (skill.x < -50 || skill.x > 850 || skill.y < -50 || skill.y > 650) {
        skill.destroy();
      }
    });
  }

  castSkill(velocityX, velocityY) {
    // 创建技能弹幕
    const skill = this.add.sprite(this.player.x, this.player.y, 'skill');
    this.skills.add(skill);

    // 设置弹幕移动
    this.tweens.add({
      targets: skill,
      x: skill.x + velocityX,
      y: skill.y + velocityY,
      duration: 2000,
      ease: 'Linear'
    });

    // 增加技能使用次数
    this.skillUsedCount++;
    this.gameState.skillUsedCount = this.skillUsedCount;
    this.gameState.lastSkillTime = this.time.now;
    this.countText.setText(`Skills Used: ${this.skillUsedCount}`);

    // 开始冷却
    this.startCooldown();
  }

  startCooldown() {
    this.skillOnCooldown = true;
    this.gameState.isOnCooldown = true;
    this.cooldownProgress = 0;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });

    this.statusText.setText('Cooling...');
    this.statusText.setColor('#ff0000');
  }

  onCooldownComplete() {
    this.skillOnCooldown = false;
    this.gameState.isOnCooldown = false;
    this.cooldownProgress = 1;
    this.updateCooldownBar();

    // 延迟清空进度条
    this.time.delayedCall(200, () => {
      this.cooldownBar.clear();
      this.statusText.setText('Ready!');
      this.statusText.setColor('#00ff00');
    });

    this.cooldownTimer = null;
  }

  updateCooldownBar() {
    this.cooldownBar.clear();
    
    // 计算进度条宽度（从满到空）
    const barWidth = 200 * (1 - this.cooldownProgress);
    
    if (barWidth > 0) {
      // 根据进度改变颜色：红色->黄色->绿色
      let color;
      if (this.cooldownProgress < 0.5) {
        color = 0xff0000; // 红色
      } else if (this.cooldownProgress < 0.8) {
        color = 0xffff00; // 黄色
      } else {
        color = 0x00ff00; // 绿色
      }

      this.cooldownBar.fillStyle(color, 0.8);
      this.cooldownBar.fillRect(300, 50, barWidth, 30);
    }

    // 更新冷却时间文本
    const remainingTime = ((1 - this.cooldownProgress) * this.cooldownDuration / 1000).toFixed(1);
    this.statusText.setText(`${remainingTime}s`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);