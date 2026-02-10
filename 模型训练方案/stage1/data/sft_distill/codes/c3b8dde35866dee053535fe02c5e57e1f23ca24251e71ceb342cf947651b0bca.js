class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillUsageCount = 0; // 可验证状态变量
    this.totalSkillsCast = [0, 0, 0, 0, 0, 0, 0, 0]; // 每个技能使用次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化技能系统
    this.initSkills();
    
    // 绘制UI
    this.drawSkillUI();
    
    // 设置键盘输入
    this.setupInput();
    
    // 添加说明文本
    this.add.text(20, 20, 'Multi-Skill System', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    this.add.text(20, 50, 'Press 1-8 to cast skills', {
      fontSize: '16px',
      color: '#cccccc'
    });
    
    // 状态显示
    this.statusText = this.add.text(20, 80, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
    
    this.updateStatusText();
  }

  initSkills() {
    const baseX = 100;
    const baseY = 200;
    const spacing = 90;
    const baseCooldown = 2500; // 2.5秒基准（毫秒）
    
    const skillColors = [
      0xff0000, // 红
      0xff8800, // 橙
      0xffff00, // 黄
      0x00ff00, // 绿
      0x00ffff, // 青
      0x0088ff, // 蓝
      0x8800ff, // 紫
      0xff00ff  // 品红
    ];
    
    for (let i = 0; i < 8; i++) {
      const skill = {
        id: i,
        key: (i + 1).toString(),
        x: baseX + (i * spacing),
        y: baseY,
        cooldown: baseCooldown * (i + 1), // 递增冷却时间
        currentCooldown: 0,
        isOnCooldown: false,
        color: skillColors[i],
        graphics: null,
        cooldownGraphics: null,
        textObj: null,
        timerEvent: null
      };
      
      this.skills.push(skill);
    }
  }

  drawSkillUI() {
    const skillSize = 70;
    const borderWidth = 3;
    
    this.skills.forEach((skill, index) => {
      // 技能背景框
      const bg = this.add.graphics();
      bg.lineStyle(borderWidth, 0xffffff, 1);
      bg.fillStyle(0x222222, 1);
      bg.fillRect(skill.x - skillSize/2, skill.y - skillSize/2, skillSize, skillSize);
      bg.strokeRect(skill.x - skillSize/2, skill.y - skillSize/2, skillSize, skillSize);
      
      // 技能图标（彩色方块）
      skill.graphics = this.add.graphics();
      skill.graphics.fillStyle(skill.color, 1);
      skill.graphics.fillRect(
        skill.x - skillSize/2 + 5,
        skill.y - skillSize/2 + 5,
        skillSize - 10,
        skillSize - 10
      );
      
      // 冷却遮罩（初始不可见）
      skill.cooldownGraphics = this.add.graphics();
      skill.cooldownGraphics.setDepth(1);
      
      // 技能键位文本
      this.add.text(skill.x, skill.y - skillSize/2 - 20, skill.key, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 冷却时间文本
      skill.textObj = this.add.text(skill.x, skill.y, '', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(2);
      
      // 冷却时长标签
      this.add.text(skill.x, skill.y + skillSize/2 + 15, `CD: ${(skill.cooldown/1000).toFixed(1)}s`, {
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
    });
  }

  setupInput() {
    // 监听数字键 1-8
    for (let i = 1; i <= 8; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`DIGIT${i}`]);
      key.on('down', () => this.castSkill(i - 1));
    }
    
    // 同时监听小键盘数字键
    for (let i = 1; i <= 8; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`NUMPAD_${i}`]);
      key.on('down', () => this.castSkill(i - 1));
    }
  }

  castSkill(skillIndex) {
    const skill = this.skills[skillIndex];
    
    if (!skill || skill.isOnCooldown) {
      return; // 技能在冷却中
    }
    
    // 施放技能
    skill.isOnCooldown = true;
    skill.currentCooldown = skill.cooldown;
    this.skillUsageCount++;
    this.totalSkillsCast[skillIndex]++;
    
    // 视觉反馈：闪烁效果
    this.tweens.add({
      targets: skill.graphics,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
    
    // 启动冷却计时器
    skill.timerEvent = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.currentCooldown = 0;
        skill.timerEvent = null;
        this.updateSkillDisplay(skill);
      },
      callbackScope: this
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 更新所有冷却中的技能显示
    this.skills.forEach(skill => {
      if (skill.isOnCooldown && skill.timerEvent) {
        skill.currentCooldown = skill.timerEvent.getRemaining();
        this.updateSkillDisplay(skill);
      }
    });
  }

  updateSkillDisplay(skill) {
    const skillSize = 70;
    skill.cooldownGraphics.clear();
    
    if (skill.isOnCooldown) {
      // 计算冷却进度
      const progress = skill.currentCooldown / skill.cooldown;
      const height = (skillSize - 10) * progress;
      
      // 绘制半透明黑色遮罩
      skill.cooldownGraphics.fillStyle(0x000000, 0.7);
      skill.cooldownGraphics.fillRect(
        skill.x - skillSize/2 + 5,
        skill.y - skillSize/2 + 5,
        skillSize - 10,
        height
      );
      
      // 显示剩余时间
      const remainingTime = (skill.currentCooldown / 1000).toFixed(1);
      skill.textObj.setText(remainingTime + 's');
      skill.textObj.setVisible(true);
    } else {
      // 冷却完成，隐藏文本
      skill.textObj.setVisible(false);
    }
  }

  updateStatusText() {
    const statusLines = [
      `Total Skills Cast: ${this.skillUsageCount}`,
      `Individual Usage: [${this.totalSkillsCast.join(', ')}]`
    ];
    this.statusText.setText(statusLines.join('\n'));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#1a1a2e',
  scene: SkillSystemScene,
  parent: 'game-container'
};

new Phaser.Game(config);