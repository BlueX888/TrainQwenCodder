class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    
    // 可验证的状态信号
    this.skillUsageCount = { skill1: 0, skill2: 0, skill3: 0 };
    this.totalSkillsUsed = 0;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 技能配置
    this.skills = [
      {
        id: 'skill1',
        name: 'Fire Bolt',
        key: 'Q',
        cooldown: 1000, // 1秒
        currentCooldown: 0,
        isReady: true,
        x: 100,
        y: 500,
        color: 0xff4444,
        timerEvent: null
      },
      {
        id: 'skill2',
        name: 'Ice Shield',
        key: 'W',
        cooldown: 2000, // 2秒
        currentCooldown: 0,
        isReady: true,
        x: 300,
        y: 500,
        color: 0x4444ff,
        timerEvent: null
      },
      {
        id: 'skill3',
        name: 'Thunder Storm',
        key: 'E',
        cooldown: 3000, // 3秒
        currentCooldown: 0,
        isReady: true,
        x: 500,
        y: 500,
        color: 0xffff44,
        timerEvent: null
      }
    ];

    // 创建标题
    this.add.text(400, 50, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Press Q / W / E to use skills', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建状态显示
    this.statusText = this.add.text(400, 150, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 为每个技能创建UI
    this.skills.forEach(skill => {
      this.createSkillUI(skill);
    });

    // 设置键盘输入
    this.input.keyboard.on('keydown-Q', () => this.useSkill(0));
    this.input.keyboard.on('keydown-W', () => this.useSkill(1));
    this.input.keyboard.on('keydown-E', () => this.useSkill(2));

    // 更新状态显示
    this.updateStatusDisplay();
  }

  createSkillUI(skill) {
    const width = 120;
    const height = 120;

    // 创建技能图标背景
    skill.bgGraphics = this.add.graphics();
    skill.bgGraphics.fillStyle(0x333333, 1);
    skill.bgGraphics.fillRoundedRect(skill.x - width/2, skill.y - height/2, width, height, 10);

    // 创建技能图标（使用颜色区分）
    skill.iconGraphics = this.add.graphics();
    skill.iconGraphics.fillStyle(skill.color, 1);
    skill.iconGraphics.fillCircle(skill.x, skill.y - 20, 30);

    // 创建冷却遮罩
    skill.cooldownGraphics = this.add.graphics();
    skill.cooldownGraphics.setDepth(1);

    // 技能名称
    skill.nameText = this.add.text(skill.x, skill.y + 30, skill.name, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 快捷键显示
    skill.keyText = this.add.text(skill.x, skill.y + 50, `[${skill.key}]`, {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却时间文本
    skill.cooldownText = this.add.text(skill.x, skill.y - 20, '', {
      fontSize: '20px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    skill.cooldownText.setVisible(false);

    // 进度条背景
    const barWidth = 100;
    const barHeight = 8;
    const barY = skill.y + 65;
    
    skill.progressBarBg = this.add.graphics();
    skill.progressBarBg.fillStyle(0x555555, 1);
    skill.progressBarBg.fillRect(skill.x - barWidth/2, barY, barWidth, barHeight);

    // 进度条前景
    skill.progressBar = this.add.graphics();

    // 就绪指示器
    skill.readyIndicator = this.add.graphics();
    skill.readyIndicator.fillStyle(0x00ff00, 1);
    skill.readyIndicator.fillCircle(skill.x + width/2 - 15, skill.y - height/2 + 15, 8);
  }

  useSkill(index) {
    const skill = this.skills[index];

    // 检查技能是否就绪
    if (!skill.isReady) {
      console.log(`${skill.name} is on cooldown!`);
      return;
    }

    // 使用技能
    skill.isReady = false;
    skill.currentCooldown = skill.cooldown;
    
    // 更新状态计数
    this.skillUsageCount[skill.id]++;
    this.totalSkillsUsed++;

    console.log(`Used ${skill.name}! Total uses: ${this.skillUsageCount[skill.id]}`);

    // 显示技能效果（闪烁动画）
    this.showSkillEffect(skill);

    // 隐藏就绪指示器
    skill.readyIndicator.setVisible(false);

    // 创建冷却计时器
    skill.timerEvent = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => this.updateSkillCooldown(skill),
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.updateStatusDisplay();
  }

  updateSkillCooldown(skill) {
    skill.currentCooldown -= 50;

    if (skill.currentCooldown <= 0) {
      // 冷却完成
      skill.currentCooldown = 0;
      skill.isReady = true;
      
      if (skill.timerEvent) {
        skill.timerEvent.destroy();
        skill.timerEvent = null;
      }

      // 显示就绪指示器
      skill.readyIndicator.setVisible(true);
      skill.cooldownText.setVisible(false);
      
      // 清除冷却遮罩
      skill.cooldownGraphics.clear();
      
      // 清除进度条
      skill.progressBar.clear();

      console.log(`${skill.name} is ready!`);
      this.updateStatusDisplay();
    } else {
      // 更新冷却显示
      this.updateCooldownDisplay(skill);
    }
  }

  updateCooldownDisplay(skill) {
    const remainingSeconds = (skill.currentCooldown / 1000).toFixed(1);
    const progress = 1 - (skill.currentCooldown / skill.cooldown);

    // 更新冷却时间文本
    skill.cooldownText.setText(remainingSeconds + 's');
    skill.cooldownText.setVisible(true);

    // 更新冷却遮罩（从上到下消失）
    skill.cooldownGraphics.clear();
    skill.cooldownGraphics.fillStyle(0x000000, 0.7);
    
    const width = 120;
    const height = 120;
    const maskHeight = height * (1 - progress);
    
    skill.cooldownGraphics.fillRoundedRect(
      skill.x - width/2, 
      skill.y - height/2, 
      width, 
      maskHeight, 
      10
    );

    // 更新进度条
    skill.progressBar.clear();
    skill.progressBar.fillStyle(skill.color, 1);
    
    const barWidth = 100;
    const barHeight = 8;
    const barY = skill.y + 65;
    
    skill.progressBar.fillRect(
      skill.x - barWidth/2, 
      barY, 
      barWidth * progress, 
      barHeight
    );
  }

  showSkillEffect(skill) {
    // 创建技能使用的视觉效果
    const effectGraphics = this.add.graphics();
    effectGraphics.lineStyle(4, skill.color, 1);
    effectGraphics.strokeCircle(skill.x, skill.y - 20, 35);

    // 闪烁动画
    this.tweens.add({
      targets: effectGraphics,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        effectGraphics.destroy();
      }
    });

    // 图标闪烁
    this.tweens.add({
      targets: skill.iconGraphics,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  updateStatusDisplay() {
    const readySkills = this.skills.filter(s => s.isReady).length;
    const status = `Skills Ready: ${readySkills}/3 | Total Skills Used: ${this.totalSkillsUsed}`;
    const details = `Q:${this.skillUsageCount.skill1} W:${this.skillUsageCount.skill2} E:${this.skillUsageCount.skill3}`;
    
    this.statusText.setText(status + '\n' + details);
  }

  update(time, delta) {
    // 每帧更新由TimerEvent自动处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SkillSystemScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);