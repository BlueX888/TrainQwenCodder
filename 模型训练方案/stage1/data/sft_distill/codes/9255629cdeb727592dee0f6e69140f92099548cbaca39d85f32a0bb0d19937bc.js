class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skillUsageCount = 0; // 可验证的状态信号
    this.skills = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化技能系统
    this.initSkills();
    
    // 创建UI
    this.createSkillUI();
    
    // 设置键盘输入
    this.setupInput();
    
    // 添加说明文本
    this.createInstructions();
    
    // 添加状态显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  initSkills() {
    const baseCD = 2.5; // 基准冷却时间（秒）
    const skillColors = [
      0xff0000, // 红色
      0xff8800, // 橙色
      0xffff00, // 黄色
      0x00ff00, // 绿色
      0x00ffff, // 青色
      0x0088ff, // 蓝色
      0x8800ff, // 紫色
      0xff00ff  // 品红
    ];

    for (let i = 0; i < 8; i++) {
      this.skills.push({
        id: i + 1,
        name: `Skill ${i + 1}`,
        cooldown: baseCD * (i + 1), // 递增冷却时间
        currentCD: 0, // 当前冷却剩余时间
        isReady: true, // 是否就绪
        color: skillColors[i],
        usageCount: 0, // 使用次数
        timer: null // 计时器引用
      });
    }
  }

  createSkillUI() {
    const startX = 100;
    const startY = 150;
    const spacing = 90;
    const iconSize = 70;

    this.skills.forEach((skill, index) => {
      const x = startX + (index % 4) * spacing;
      const y = startY + Math.floor(index / 4) * spacing;

      // 创建技能图标背景
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(x, y, iconSize, iconSize, 8);
      skill.bgGraphics = bg;

      // 创建技能图标
      const icon = this.add.graphics();
      icon.fillStyle(skill.color, 1);
      icon.fillRoundedRect(x + 5, y + 5, iconSize - 10, iconSize - 10, 5);
      
      // 添加技能编号
      const numberText = this.add.text(x + iconSize / 2, y + iconSize / 2, skill.id.toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      numberText.setOrigin(0.5);
      skill.numberText = numberText;

      // 创建冷却遮罩
      const cooldownMask = this.add.graphics();
      skill.cooldownMask = cooldownMask;

      // 创建冷却时间文本
      const cdText = this.add.text(x + iconSize / 2, y + iconSize + 10, '', {
        fontSize: '14px',
        color: '#ffff00'
      });
      cdText.setOrigin(0.5);
      skill.cdText = cdText;

      // 创建技能名称和CD信息
      const infoText = this.add.text(x + iconSize / 2, y - 15, 
        `${skill.name}\nCD: ${skill.cooldown}s`, {
        fontSize: '10px',
        color: '#aaaaaa',
        align: 'center'
      });
      infoText.setOrigin(0.5);
      skill.infoText = infoText;

      skill.iconGraphics = icon;
      skill.position = { x, y, size: iconSize };
    });
  }

  setupInput() {
    // 监听数字键1-8
    for (let i = 1; i <= 8; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`DIGIT${i}`]);
      key.on('down', () => this.useSkill(i - 1));
    }

    // 同时支持小键盘
    for (let i = 1; i <= 8; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`NUMPAD_${i}`]);
      key.on('down', () => this.useSkill(i - 1));
    }
  }

  createInstructions() {
    const instructions = this.add.text(400, 50, 
      '按数字键 1-8 使用对应技能\n每个技能有不同的冷却时间', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    });
    instructions.setOrigin(0.5);
  }

  useSkill(index) {
    const skill = this.skills[index];
    
    if (!skill.isReady) {
      // 技能未就绪，显示提示
      this.showSkillNotReady(skill);
      return;
    }

    // 使用技能
    skill.isReady = false;
    skill.currentCD = skill.cooldown;
    skill.usageCount++;
    this.skillUsageCount++;

    // 显示技能使用效果
    this.showSkillEffect(skill);

    // 启动冷却计时器
    this.startCooldown(skill);

    // 更新状态文本
    this.updateStatusText();
  }

  startCooldown(skill) {
    // 清除旧的计时器（如果存在）
    if (skill.timer) {
      skill.timer.destroy();
    }

    // 创建新的计时器，每100ms更新一次
    skill.timer = this.time.addEvent({
      delay: 100,
      callback: () => {
        skill.currentCD -= 0.1;
        
        if (skill.currentCD <= 0) {
          skill.currentCD = 0;
          skill.isReady = true;
          skill.timer.destroy();
          skill.timer = null;
        }
        
        this.updateSkillUI(skill);
      },
      loop: true
    });
  }

  updateSkillUI(skill) {
    const pos = skill.position;
    const progress = skill.isReady ? 0 : skill.currentCD / skill.cooldown;

    // 更新冷却遮罩
    skill.cooldownMask.clear();
    if (!skill.isReady) {
      skill.cooldownMask.fillStyle(0x000000, 0.7);
      const maskHeight = pos.size * progress;
      skill.cooldownMask.fillRoundedRect(
        pos.x + 5, 
        pos.y + 5, 
        pos.size - 10, 
        maskHeight - 10, 
        5
      );

      // 更新冷却时间文本
      skill.cdText.setText(skill.currentCD.toFixed(1) + 's');
    } else {
      // 技能就绪，清空文本
      skill.cdText.setText('READY');
      skill.cdText.setColor('#00ff00');
      
      // 短暂显示后隐藏
      this.time.delayedCall(500, () => {
        skill.cdText.setText('');
      });
    }

    // 更新图标透明度
    skill.iconGraphics.alpha = skill.isReady ? 1 : 0.5;
  }

  showSkillEffect(skill) {
    const pos = skill.position;
    
    // 创建技能使用效果（闪光）
    const flash = this.add.graphics();
    flash.fillStyle(skill.color, 0.8);
    flash.fillCircle(
      pos.x + pos.size / 2, 
      pos.y + pos.size / 2, 
      pos.size / 2 + 10
    );

    // 效果动画
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 在屏幕中央显示技能使用提示
    const useText = this.add.text(400, 300, 
      `${skill.name} 已使用！`, {
      fontSize: '24px',
      color: '#' + skill.color.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    useText.setOrigin(0.5);

    this.tweens.add({
      targets: useText,
      y: 250,
      alpha: 0,
      duration: 800,
      onComplete: () => useText.destroy()
    });
  }

  showSkillNotReady(skill) {
    const pos = skill.position;
    
    // 抖动效果
    this.tweens.add({
      targets: [skill.iconGraphics, skill.bgGraphics, skill.numberText],
      x: '+=5',
      duration: 50,
      yoyo: true,
      repeat: 2
    });
  }

  updateStatusText() {
    const readyCount = this.skills.filter(s => s.isReady).length;
    const totalUsage = this.skillUsageCount;
    
    let statusInfo = `总使用次数: ${totalUsage} | 就绪技能: ${readyCount}/8\n`;
    statusInfo += '各技能使用次数: ';
    statusInfo += this.skills.map(s => `${s.id}(${s.usageCount})`).join(' ');
    
    this.statusText.setText(statusInfo);
  }

  update(time, delta) {
    // 每帧更新可以在这里添加额外逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystem
};

new Phaser.Game(config);