class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    
    // 技能状态数据（可验证的状态信号）
    this.skillsData = [
      { id: 1, cooldown: 2000, currentCooldown: 0, key: 'ONE', usedCount: 0 },
      { id: 2, cooldown: 4000, currentCooldown: 0, key: 'TWO', usedCount: 0 },
      { id: 3, cooldown: 6000, currentCooldown: 0, key: 'THREE', usedCount: 0 },
      { id: 4, cooldown: 8000, currentCooldown: 0, key: 'FOUR', usedCount: 0 },
      { id: 5, cooldown: 10000, currentCooldown: 0, key: 'FIVE', usedCount: 0 }
    ];
    
    this.skillGraphics = [];
    this.cooldownMasks = [];
    this.skillTexts = [];
    this.timerEvents = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 标题
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(400, 70, 'Press 1-5 to use skills | Each skill has different cooldown', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能图标和UI
    const startX = 150;
    const startY = 200;
    const spacing = 130;

    this.skillsData.forEach((skill, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // 创建技能背景
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(x - 45, y - 45, 90, 90, 10);

      // 创建技能图标（使用不同颜色区分）
      const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
      const icon = this.add.graphics();
      icon.fillStyle(colors[index], 1);
      icon.fillRoundedRect(x - 40, y - 40, 80, 80, 8);
      this.skillGraphics.push(icon);

      // 技能编号
      this.add.text(x, y - 10, `${skill.id}`, {
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建冷却遮罩
      const mask = this.add.graphics();
      mask.setDepth(10);
      this.cooldownMasks.push(mask);

      // 技能信息文本
      const infoText = this.add.text(x, y + 60, `CD: ${skill.cooldown / 1000}s\nReady`, {
        fontSize: '14px',
        color: '#00ff00',
        align: 'center'
      }).setOrigin(0.5);
      this.skillTexts.push(infoText);

      // 使用次数文本
      const countText = this.add.text(x, y + 100, `Used: 0`, {
        fontSize: '12px',
        color: '#888888',
        align: 'center'
      }).setOrigin(0.5);
      skill.countText = countText;
    });

    // 绑定键盘输入
    this.input.keyboard.on('keydown-ONE', () => this.useSkill(0));
    this.input.keyboard.on('keydown-TWO', () => this.useSkill(1));
    this.input.keyboard.on('keydown-THREE', () => this.useSkill(2));
    this.input.keyboard.on('keydown-FOUR', () => this.useSkill(3));
    this.input.keyboard.on('keydown-FIVE', () => this.useSkill(4));

    // 状态显示文本
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 总使用次数统计
    this.totalUsedText = this.add.text(400, 500, 'Total Skills Used: 0', {
      fontSize: '20px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示信息
    this.add.text(400, 550, 'Cooldowns increase by 2s: Skill1=2s, Skill2=4s, Skill3=6s, Skill4=8s, Skill5=10s', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  useSkill(index) {
    const skill = this.skillsData[index];

    // 检查是否在冷却中
    if (skill.currentCooldown > 0) {
      this.statusText.setText(`Skill ${skill.id} is on cooldown! ${(skill.currentCooldown / 1000).toFixed(1)}s remaining`);
      this.statusText.setColor('#ff0000');
      return;
    }

    // 使用技能
    skill.usedCount++;
    skill.currentCooldown = skill.cooldown;
    
    this.statusText.setText(`Skill ${skill.id} activated! Cooldown: ${skill.cooldown / 1000}s`);
    this.statusText.setColor('#00ff00');

    // 更新使用次数
    skill.countText.setText(`Used: ${skill.usedCount}`);
    this.updateTotalUsed();

    // 技能图标闪烁效果
    this.tweens.add({
      targets: this.skillGraphics[index],
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // 创建冷却计时器
    const timer = this.time.addEvent({
      delay: 50, // 每50ms更新一次进度
      callback: () => {
        skill.currentCooldown -= 50;
        
        if (skill.currentCooldown <= 0) {
          skill.currentCooldown = 0;
          timer.destroy();
          this.skillTexts[index].setText(`CD: ${skill.cooldown / 1000}s\nReady`);
          this.skillTexts[index].setColor('#00ff00');
        } else {
          const remaining = (skill.currentCooldown / 1000).toFixed(1);
          this.skillTexts[index].setText(`CD: ${skill.cooldown / 1000}s\n${remaining}s`);
          this.skillTexts[index].setColor('#ff8800');
        }
        
        this.updateCooldownMask(index);
      },
      loop: true
    });

    this.timerEvents[index] = timer;
  }

  updateCooldownMask(index) {
    const skill = this.skillsData[index];
    const mask = this.cooldownMasks[index];
    
    mask.clear();

    if (skill.currentCooldown > 0) {
      const progress = skill.currentCooldown / skill.cooldown;
      const startX = 150 + index * 130;
      const startY = 200;
      
      // 绘制半透明黑色遮罩
      mask.fillStyle(0x000000, 0.7);
      
      // 从上到下的冷却遮罩
      const maskHeight = 80 * progress;
      mask.fillRoundedRect(startX - 40, startY - 40, 80, maskHeight, 8);
      
      // 冷却百分比文字
      const percentage = Math.ceil(progress * 100);
      if (!mask.percentText) {
        mask.percentText = this.add.text(startX, startY + 10, '', {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);
      }
      mask.percentText.setText(`${percentage}%`);
      mask.percentText.setVisible(true);
    } else {
      if (mask.percentText) {
        mask.percentText.setVisible(false);
      }
    }
  }

  updateTotalUsed() {
    const total = this.skillsData.reduce((sum, skill) => sum + skill.usedCount, 0);
    this.totalUsedText.setText(`Total Skills Used: ${total}`);
  }

  update(time, delta) {
    // 更新所有冷却遮罩显示
    this.skillsData.forEach((skill, index) => {
      if (skill.currentCooldown > 0) {
        this.updateCooldownMask(index);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystemScene
};

new Phaser.Game(config);