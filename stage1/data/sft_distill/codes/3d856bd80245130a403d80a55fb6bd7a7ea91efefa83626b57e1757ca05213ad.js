class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.skillTimers = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化技能系统
    this.initSkills();
    
    // 创建技能UI
    this.createSkillUI();
    
    // 绑定输入
    this.setupInput();
    
    // 添加说明文本
    this.add.text(10, 10, 'Press 1-9, Q-K to use skills', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    // 添加状态信号变量（用于验证）
    this.totalSkillsUsed = 0;
    this.activeCooldowns = 0;
    
    // 状态显示
    this.statusText = this.add.text(10, 35, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
  }

  initSkills() {
    // 创建 20 个技能，冷却时间递增
    const keyBindings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 
                         'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'K'];
    
    for (let i = 0; i < 20; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        cooldownTime: 4000 + i * 2000, // 4s, 6s, 8s, ..., 42s
        currentCooldown: 0,
        isOnCooldown: false,
        key: keyBindings[i],
        color: this.generateSkillColor(i),
        usedCount: 0
      };
      this.skills.push(skill);
      this.skillTimers.push(null);
    }
  }

  generateSkillColor(index) {
    // 为每个技能生成不同的颜色
    const hue = (index * 18) % 360;
    return Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.5).color;
  }

  createSkillUI() {
    const startX = 50;
    const startY = 80;
    const skillSize = 60;
    const padding = 10;
    const skillsPerRow = 5;

    this.skills.forEach((skill, index) => {
      const row = Math.floor(index / skillsPerRow);
      const col = index % skillsPerRow;
      const x = startX + col * (skillSize + padding);
      const y = startY + row * (skillSize + padding + 30);

      // 创建技能容器
      const container = this.add.container(x, y);
      
      // 背景圆
      const bgGraphics = this.add.graphics();
      bgGraphics.fillStyle(0x333333, 1);
      bgGraphics.fillCircle(skillSize / 2, skillSize / 2, skillSize / 2);
      container.add(bgGraphics);
      
      // 技能图标（彩色圆）
      const iconGraphics = this.add.graphics();
      iconGraphics.fillStyle(skill.color, 1);
      iconGraphics.fillCircle(skillSize / 2, skillSize / 2, skillSize / 2 - 5);
      container.add(iconGraphics);
      
      // 冷却遮罩（灰色半透明）
      const cooldownGraphics = this.add.graphics();
      cooldownGraphics.setDepth(1);
      container.add(cooldownGraphics);
      
      // 技能键位文本
      const keyText = this.add.text(skillSize / 2, skillSize / 2, skill.key, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      keyText.setDepth(2);
      container.add(keyText);
      
      // 冷却时间文本
      const cooldownText = this.add.text(skillSize / 2, skillSize + 10, '', {
        fontSize: '12px',
        color: '#ffff00'
      }).setOrigin(0.5);
      container.add(cooldownText);
      
      // 技能名称和冷却时长
      const infoText = this.add.text(skillSize / 2, skillSize + 25, 
        `CD: ${skill.cooldownTime / 1000}s`, {
        fontSize: '10px',
        color: '#888888'
      }).setOrigin(0.5);
      container.add(infoText);
      
      // 保存引用
      skill.container = container;
      skill.iconGraphics = iconGraphics;
      skill.cooldownGraphics = cooldownGraphics;
      skill.cooldownText = cooldownText;
      skill.keyText = keyText;
      skill.infoText = infoText;
    });
  }

  setupInput() {
    // 为每个技能绑定键盘输入
    this.skills.forEach(skill => {
      const key = this.input.keyboard.addKey(skill.key);
      key.on('down', () => {
        this.useSkill(skill.id);
      });
    });
  }

  useSkill(skillId) {
    const skill = this.skills[skillId];
    
    // 如果技能正在冷却，不能使用
    if (skill.isOnCooldown) {
      console.log(`${skill.name} is on cooldown!`);
      return;
    }
    
    // 使用技能
    console.log(`Used ${skill.name} (CD: ${skill.cooldownTime / 1000}s)`);
    skill.usedCount++;
    this.totalSkillsUsed++;
    
    // 开始冷却
    this.startCooldown(skill);
    
    // 视觉反馈：闪烁效果
    this.tweens.add({
      targets: skill.iconGraphics,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  startCooldown(skill) {
    skill.isOnCooldown = true;
    skill.currentCooldown = skill.cooldownTime;
    skill.cooldownStartTime = this.time.now;
    this.activeCooldowns++;
    
    // 清除旧的计时器（如果存在）
    if (this.skillTimers[skill.id]) {
      this.skillTimers[skill.id].destroy();
    }
    
    // 创建新的计时器
    this.skillTimers[skill.id] = this.time.addEvent({
      delay: skill.cooldownTime,
      callback: () => {
        this.endCooldown(skill);
      },
      callbackScope: this
    });
  }

  endCooldown(skill) {
    skill.isOnCooldown = false;
    skill.currentCooldown = 0;
    this.activeCooldowns--;
    
    // 清除冷却显示
    skill.cooldownGraphics.clear();
    skill.cooldownText.setText('');
    
    // 恢复图标亮度
    skill.iconGraphics.setAlpha(1);
    
    // 完成动画效果
    this.tweens.add({
      targets: skill.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true
    });
    
    console.log(`${skill.name} is ready!`);
  }

  update(time, delta) {
    // 更新所有技能的冷却状态
    this.skills.forEach(skill => {
      if (skill.isOnCooldown) {
        const elapsed = time - skill.cooldownStartTime;
        const remaining = Math.max(0, skill.cooldownTime - elapsed);
        const progress = 1 - (remaining / skill.cooldownTime);
        
        // 更新冷却进度（扇形遮罩）
        this.drawCooldownMask(skill, progress);
        
        // 更新冷却时间文本
        skill.cooldownText.setText(`${(remaining / 1000).toFixed(1)}s`);
        
        // 降低图标亮度
        skill.iconGraphics.setAlpha(0.4);
      }
    });
    
    // 更新状态文本
    this.statusText.setText(
      `Skills Used: ${this.totalSkillsUsed} | Active Cooldowns: ${this.activeCooldowns}`
    );
  }

  drawCooldownMask(skill, progress) {
    const graphics = skill.cooldownGraphics;
    graphics.clear();
    
    const centerX = 30;
    const centerY = 30;
    const radius = 25;
    
    if (progress < 1) {
      // 绘制扇形遮罩
      graphics.fillStyle(0x000000, 0.7);
      graphics.beginPath();
      graphics.moveTo(centerX, centerY);
      
      // 从顶部开始，顺时针绘制
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (2 * Math.PI * (1 - progress));
      
      graphics.arc(centerX, centerY, radius, startAngle, endAngle, false);
      graphics.lineTo(centerX, centerY);
      graphics.closePath();
      graphics.fillPath();
      
      // 绘制进度圆环
      graphics.lineStyle(3, 0xff0000, 1);
      graphics.beginPath();
      graphics.arc(centerX, centerY, radius, startAngle, startAngle + (2 * Math.PI * progress), false);
      graphics.strokePath();
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SkillSystem,
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);