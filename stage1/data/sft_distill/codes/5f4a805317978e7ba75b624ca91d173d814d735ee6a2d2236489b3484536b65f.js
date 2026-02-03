class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.skillTexts = [];
    
    // 验证信号
    window.__signals__ = {
      skillsUsed: [],
      cooldownStates: [],
      timestamp: Date.now()
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化 10 个技能
    this.initializeSkills();
    
    // 绘制技能 UI
    this.createSkillUI();
    
    // 设置键盘输入
    this.setupInput();
    
    // 添加标题和说明
    this.add.text(400, 30, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(400, 70, 'Press 1-0 keys to use skills | Each skill has increasing cooldown (1-10s)', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);
    
    // 添加统计信息文本
    this.statsText = this.add.text(400, 550, '', {
      fontSize: '14px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // 定期更新验证信号
    this.time.addEvent({
      delay: 100,
      callback: this.updateSignals,
      callbackScope: this,
      loop: true
    });
  }

  initializeSkills() {
    const skillColors = [
      0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x00ffff,
      0x0077ff, 0x0000ff, 0x7700ff, 0xff00ff, 0xff0077
    ];
    
    for (let i = 0; i < 10; i++) {
      this.skills.push({
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: (i + 1) * 1000, // 1-10 秒冷却
        isReady: true,
        remainingCooldown: 0,
        color: skillColors[i],
        usageCount: 0,
        lastUsedTime: 0,
        timer: null
      });
    }
  }

  createSkillUI() {
    const startX = 100;
    const startY = 150;
    const skillWidth = 60;
    const skillHeight = 60;
    const spacing = 70;
    
    for (let i = 0; i < 10; i++) {
      const skill = this.skills[i];
      const x = startX + (i % 5) * spacing;
      const y = startY + Math.floor(i / 5) * 150;
      
      // 创建技能图标背景
      const graphics = this.add.graphics();
      graphics.setPosition(x, y);
      this.skillGraphics.push(graphics);
      
      // 技能键位提示
      const keyText = this.add.text(x + skillWidth / 2, y - 20, 
        i === 9 ? '0' : `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 技能名称和冷却时间
      const infoText = this.add.text(x + skillWidth / 2, y + skillHeight + 10, 
        `${skill.name}\n${(skill.cooldown / 1000).toFixed(1)}s CD`, {
        fontSize: '12px',
        color: '#cccccc',
        align: 'center'
      }).setOrigin(0.5);
      
      // 冷却状态文本
      const statusText = this.add.text(x + skillWidth / 2, y + skillHeight / 2, 
        'READY', {
        fontSize: '14px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.skillTexts.push({
        key: keyText,
        info: infoText,
        status: statusText
      });
    }
  }

  setupInput() {
    // 数字键 1-9
    for (let i = 1; i <= 9; i++) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`DIGIT${i}`]);
      key.on('down', () => this.useSkill(i - 1));
    }
    
    // 数字键 0 对应技能 10
    const key0 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DIGIT0);
    key0.on('down', () => this.useSkill(9));
    
    // 小键盘支持
    for (let i = 1; i <= 9; i++) {
      const numpadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`NUMPAD_${i}`]);
      numpadKey.on('down', () => this.useSkill(i - 1));
    }
    
    const numpad0 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO);
    numpad0.on('down', () => this.useSkill(9));
  }

  useSkill(index) {
    const skill = this.skills[index];
    
    if (!skill.isReady) {
      console.log(`Skill ${skill.name} is on cooldown!`);
      return;
    }
    
    // 使用技能
    skill.isReady = false;
    skill.remainingCooldown = skill.cooldown;
    skill.usageCount++;
    skill.lastUsedTime = Date.now();
    
    // 记录到验证信号
    window.__signals__.skillsUsed.push({
      skillId: skill.id,
      skillName: skill.name,
      timestamp: Date.now(),
      usageCount: skill.usageCount
    });
    
    console.log(`Used ${skill.name} (Cooldown: ${skill.cooldown / 1000}s)`);
    
    // 创建使用效果（闪烁动画）
    this.createSkillEffect(index);
    
    // 启动冷却计时器
    if (skill.timer) {
      skill.timer.destroy();
    }
    
    skill.timer = this.time.addEvent({
      delay: 50, // 每 50ms 更新一次
      callback: () => this.updateCooldown(index),
      callbackScope: this,
      repeat: skill.cooldown / 50 - 1
    });
  }

  updateCooldown(index) {
    const skill = this.skills[index];
    skill.remainingCooldown -= 50;
    
    if (skill.remainingCooldown <= 0) {
      skill.remainingCooldown = 0;
      skill.isReady = true;
      console.log(`${skill.name} is ready!`);
    }
  }

  createSkillEffect(index) {
    const skill = this.skills[index];
    const x = 100 + (index % 5) * 70 + 30;
    const y = 150 + Math.floor(index / 5) * 150 + 30;
    
    // 创建爆炸效果
    const particles = this.add.graphics();
    particles.setPosition(x, y);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 40;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      this.tweens.add({
        targets: particles,
        alpha: { from: 1, to: 0 },
        duration: 300,
        onUpdate: (tween) => {
          particles.clear();
          particles.fillStyle(skill.color, 1 - tween.progress);
          const progress = tween.progress;
          particles.fillCircle(
            targetX * progress,
            targetY * progress,
            5 * (1 - progress)
          );
        },
        onComplete: () => particles.destroy()
      });
    }
  }

  update(time, delta) {
    // 更新所有技能的 UI
    for (let i = 0; i < 10; i++) {
      this.updateSkillUI(i);
    }
    
    // 更新统计信息
    const totalUsage = this.skills.reduce((sum, skill) => sum + skill.usageCount, 0);
    const readyCount = this.skills.filter(skill => skill.isReady).length;
    this.statsText.setText(
      `Total Skills Used: ${totalUsage} | Ready: ${readyCount}/10`
    );
  }

  updateSkillUI(index) {
    const skill = this.skills[index];
    const graphics = this.skillGraphics[index];
    const texts = this.skillTexts[index];
    
    graphics.clear();
    
    const skillWidth = 60;
    const skillHeight = 60;
    
    // 绘制技能图标背景
    if (skill.isReady) {
      // 可用状态 - 亮色
      graphics.fillStyle(skill.color, 1);
      graphics.fillRect(0, 0, skillWidth, skillHeight);
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(0, 0, skillWidth, skillHeight);
      
      texts.status.setText('READY');
      texts.status.setColor('#00ff00');
    } else {
      // 冷却状态 - 暗色
      graphics.fillStyle(0x333333, 1);
      graphics.fillRect(0, 0, skillWidth, skillHeight);
      graphics.lineStyle(2, 0x666666, 1);
      graphics.strokeRect(0, 0, skillWidth, skillHeight);
      
      // 绘制冷却进度
      const progress = 1 - (skill.remainingCooldown / skill.cooldown);
      graphics.fillStyle(skill.color, 0.5);
      graphics.fillRect(0, skillHeight * (1 - progress), skillWidth, skillHeight * progress);
      
      // 绘制冷却遮罩
      graphics.fillStyle(0x000000, 0.6);
      graphics.fillRect(0, 0, skillWidth, skillHeight * (1 - progress));
      
      // 显示剩余冷却时间
      const remaining = (skill.remainingCooldown / 1000).toFixed(1);
      texts.status.setText(`${remaining}s`);
      texts.status.setColor('#ff6666');
    }
    
    // 绘制技能图标（简单图形）
    graphics.fillStyle(0xffffff, skill.isReady ? 0.8 : 0.3);
    const centerX = skillWidth / 2;
    const centerY = skillHeight / 2;
    const iconSize = 15;
    
    // 根据技能 ID 绘制不同形状
    switch (index % 5) {
      case 0: // 圆形
        graphics.fillCircle(centerX, centerY, iconSize);
        break;
      case 1: // 方形
        graphics.fillRect(centerX - iconSize, centerY - iconSize, iconSize * 2, iconSize * 2);
        break;
      case 2: // 三角形
        graphics.fillTriangle(
          centerX, centerY - iconSize,
          centerX - iconSize, centerY + iconSize,
          centerX + iconSize, centerY + iconSize
        );
        break;
      case 3: // 星形
        graphics.fillStar(centerX, centerY, 5, iconSize, iconSize * 0.5);
        break;
      case 4: // 菱形
        graphics.fillTriangle(
          centerX, centerY - iconSize,
          centerX + iconSize, centerY,
          centerX, centerY + iconSize
        );
        graphics.fillTriangle(
          centerX, centerY - iconSize,
          centerX - iconSize, centerY,
          centerX, centerY + iconSize
        );
        break;
    }
  }

  updateSignals() {
    window.__signals__.cooldownStates = this.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      isReady: skill.isReady,
      remainingCooldown: skill.remainingCooldown,
      cooldownProgress: skill.isReady ? 1 : (1 - skill.remainingCooldown / skill.cooldown),
      usageCount: skill.usageCount
    }));
    window.__signals__.timestamp = Date.now();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SkillSystemScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);