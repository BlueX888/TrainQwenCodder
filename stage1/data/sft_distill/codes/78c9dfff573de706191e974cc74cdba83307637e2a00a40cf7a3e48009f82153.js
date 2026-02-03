class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.cooldownBars = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化技能数据
    this.initializeSkills();
    
    // 绘制UI
    this.createSkillUI();
    
    // 设置输入
    this.setupInput();
    
    // 添加说明文本
    this.createInstructions();
    
    // 状态信号
    this.totalSkillsUsed = 0;
    this.skillUsageCount = new Array(15).fill(0);
  }

  initializeSkills() {
    const baseKeyBinds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Q', 'W', 'E', 'R', 'T', 'Y'];
    const baseCooldown = 2500; // 2.5秒基准
    
    for (let i = 0; i < 15; i++) {
      this.skills.push({
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: baseCooldown * (i + 1), // 递增冷却时间
        remainingCooldown: 0,
        isOnCooldown: false,
        key: baseKeyBinds[i],
        color: this.getSkillColor(i)
      });
    }
  }

  getSkillColor(index) {
    const colors = [
      0xff0000, 0xff4500, 0xff8c00, 0xffd700, 0xffff00,
      0x7fff00, 0x00ff00, 0x00ff7f, 0x00ffff, 0x1e90ff,
      0x0000ff, 0x8a2be2, 0x9400d3, 0xff00ff, 0xff1493
    ];
    return colors[index];
  }

  createSkillUI() {
    const startX = 50;
    const startY = 100;
    const skillSize = 80;
    const gap = 20;
    const cols = 5;
    
    // 标题
    const title = this.add.text(400, 30, 'Multi-Skill System (15 Skills)', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    for (let i = 0; i < 15; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (skillSize + gap);
      const y = startY + row * (skillSize + gap);
      
      // 技能背景框
      const graphics = this.add.graphics();
      graphics.fillStyle(0x333333, 1);
      graphics.fillRect(x, y, skillSize, skillSize);
      graphics.lineStyle(2, 0x666666, 1);
      graphics.strokeRect(x, y, skillSize, skillSize);
      
      // 技能图标（使用颜色填充的圆形）
      const iconGraphics = this.add.graphics();
      iconGraphics.fillStyle(this.skills[i].color, 1);
      iconGraphics.fillCircle(x + skillSize / 2, y + skillSize / 2, 25);
      
      // 技能按键文本
      const keyText = this.add.text(x + skillSize / 2, y + skillSize / 2, this.skills[i].key, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      keyText.setOrigin(0.5);
      
      // 冷却时间文本
      const cooldownText = this.add.text(x + skillSize / 2, y + skillSize - 10, 
        `${(this.skills[i].cooldown / 1000).toFixed(1)}s`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      });
      cooldownText.setOrigin(0.5);
      
      // 冷却遮罩层
      const cooldownGraphics = this.add.graphics();
      
      this.skillGraphics.push({
        background: graphics,
        icon: iconGraphics,
        keyText: keyText,
        cooldownText: cooldownText,
        cooldownOverlay: cooldownGraphics,
        x: x,
        y: y,
        size: skillSize
      });
      
      // 冷却进度条（在技能下方）
      const barWidth = skillSize;
      const barHeight = 8;
      const barY = y + skillSize + 5;
      
      const barBg = this.add.graphics();
      barBg.fillStyle(0x222222, 1);
      barBg.fillRect(x, barY, barWidth, barHeight);
      
      const barFill = this.add.graphics();
      
      this.cooldownBars.push({
        background: barBg,
        fill: barFill,
        x: x,
        y: barY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  setupInput() {
    // 数字键 1-9
    for (let i = 1; i <= 9; i++) {
      this.input.keyboard.on(`keydown-${i}`, () => {
        this.useSkill(i - 1);
      });
    }
    
    // 字母键 Q, W, E, R, T, Y
    const letterKeys = ['Q', 'W', 'E', 'R', 'T', 'Y'];
    letterKeys.forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.useSkill(9 + index);
      });
    });
  }

  useSkill(skillIndex) {
    if (skillIndex < 0 || skillIndex >= 15) return;
    
    const skill = this.skills[skillIndex];
    
    // 检查是否在冷却中
    if (skill.isOnCooldown) {
      console.log(`${skill.name} is on cooldown!`);
      return;
    }
    
    // 使用技能
    console.log(`Used ${skill.name} (Cooldown: ${skill.cooldown / 1000}s)`);
    this.totalSkillsUsed++;
    this.skillUsageCount[skillIndex]++;
    
    // 触发技能效果（视觉反馈）
    this.showSkillEffect(skillIndex);
    
    // 开始冷却
    this.startCooldown(skillIndex);
  }

  showSkillEffect(skillIndex) {
    const graphics = this.skillGraphics[skillIndex];
    
    // 闪烁效果
    this.tweens.add({
      targets: graphics.icon,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    // 缩放效果
    const originalScale = graphics.icon.scaleX;
    this.tweens.add({
      targets: graphics.icon,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  startCooldown(skillIndex) {
    const skill = this.skills[skillIndex];
    
    skill.isOnCooldown = true;
    skill.remainingCooldown = skill.cooldown;
    
    // 创建冷却计时器
    const timerEvent = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.remainingCooldown = 0;
        console.log(`${skill.name} is ready!`);
      },
      callbackScope: this
    });
    
    skill.timerEvent = timerEvent;
  }

  createInstructions() {
    const instructions = [
      'Press keys to use skills:',
      '1-9: Skills 1-9',
      'Q, W, E, R, T, Y: Skills 10-15',
      '',
      'Each skill has increasing cooldown time'
    ];
    
    let yPos = 450;
    instructions.forEach(line => {
      this.add.text(50, yPos, line, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#cccccc'
      });
      yPos += 20;
    });
    
    // 统计信息
    this.statsText = this.add.text(550, 450, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    for (let i = 0; i < 15; i++) {
      const skill = this.skills[i];
      const graphics = this.skillGraphics[i];
      const bar = this.cooldownBars[i];
      
      if (skill.isOnCooldown && skill.timerEvent) {
        // 更新剩余冷却时间
        skill.remainingCooldown = skill.timerEvent.getRemaining();
        
        // 计算冷却进度 (0-1)
        const progress = 1 - (skill.remainingCooldown / skill.cooldown);
        
        // 绘制冷却遮罩
        graphics.cooldownOverlay.clear();
        graphics.cooldownOverlay.fillStyle(0x000000, 0.7);
        const coverHeight = graphics.size * (1 - progress);
        graphics.cooldownOverlay.fillRect(
          graphics.x, 
          graphics.y, 
          graphics.size, 
          coverHeight
        );
        
        // 更新进度条
        bar.fill.clear();
        bar.fill.fillStyle(skill.color, 1);
        bar.fill.fillRect(
          bar.x,
          bar.y,
          bar.width * progress,
          bar.height
        );
        
        // 显示剩余时间
        graphics.cooldownText.setText(`${(skill.remainingCooldown / 1000).toFixed(1)}s`);
        graphics.cooldownText.setColor('#ff0000');
      } else {
        // 技能可用状态
        graphics.cooldownOverlay.clear();
        bar.fill.clear();
        graphics.cooldownText.setText(`${(skill.cooldown / 1000).toFixed(1)}s`);
        graphics.cooldownText.setColor('#aaaaaa');
      }
    }
    
    // 更新统计信息
    this.statsText.setText([
      `Total Skills Used: ${this.totalSkillsUsed}`,
      `Most Used: Skill ${this.getMostUsedSkill() + 1} (${Math.max(...this.skillUsageCount)} times)`
    ]);
  }

  getMostUsedSkill() {
    let maxIndex = 0;
    let maxCount = 0;
    for (let i = 0; i < this.skillUsageCount.length; i++) {
      if (this.skillUsageCount[i] > maxCount) {
        maxCount = this.skillUsageCount[i];
        maxIndex = i;
      }
    }
    return maxIndex;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: SkillSystemScene
};

new Phaser.Game(config);