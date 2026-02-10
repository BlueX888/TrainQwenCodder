class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.signals = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      skillsUsed: [],
      currentCooldowns: [],
      totalSkillUses: 0
    };

    // 创建标题
    this.add.text(400, 20, '多技能冷却系统 (20 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 50, '按键 1-9, Q-K 触发技能', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 创建 20 个技能
    const keyMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    
    const cols = 5;
    const rows = 4;
    const startX = 150;
    const startY = 100;
    const spacing = 120;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      // 技能数据：冷却时间递增
      const skill = {
        id: i,
        key: keyMap[i],
        cooldown: 2000 + (i * 500), // 2秒基准，每个技能增加0.5秒
        isReady: true,
        remainingTime: 0,
        timer: null,
        x: x,
        y: y,
        uses: 0
      };

      this.skills.push(skill);

      // 创建技能 UI
      const graphics = this.add.graphics();
      this.skillGraphics.push(graphics);

      // 绘制技能图标背景
      this.drawSkillIcon(graphics, skill, true);

      // 添加技能标签
      this.add.text(x, y - 45, `${skill.key}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 添加冷却时间标签
      const cooldownText = this.add.text(x, y + 45, `CD: ${(skill.cooldown / 1000).toFixed(1)}s`, {
        fontSize: '12px',
        color: '#ffff00'
      }).setOrigin(0.5);
      skill.cooldownText = cooldownText;

      // 添加剩余时间文本
      const remainingText = this.add.text(x, y, '', {
        fontSize: '16px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      skill.remainingText = remainingText;

      // 绑定键盘输入
      this.input.keyboard.on(`keydown-${skill.key}`, () => {
        this.useSkill(skill);
      });
    }

    // 创建统计信息显示
    this.statsText = this.add.text(400, 550, '', {
      fontSize: '14px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.updateStats();
  }

  drawSkillIcon(graphics, skill, isReady) {
    graphics.clear();
    
    const size = 60;
    const x = skill.x;
    const y = skill.y;

    // 绘制背景框
    graphics.lineStyle(3, isReady ? 0x00ff00 : 0x666666, 1);
    graphics.fillStyle(isReady ? 0x003300 : 0x333333, 1);
    graphics.fillRect(x - size / 2, y - size / 2, size, size);
    graphics.strokeRect(x - size / 2, y - size / 2, size, size);

    // 绘制技能图标（使用技能 ID 生成不同的图案）
    const hue = (skill.id * 18) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9).color;
    
    graphics.fillStyle(color, isReady ? 1 : 0.3);
    
    // 根据技能 ID 绘制不同形状
    const shapeType = skill.id % 4;
    switch (shapeType) {
      case 0: // 圆形
        graphics.fillCircle(x, y, 20);
        break;
      case 1: // 三角形
        graphics.fillTriangle(x, y - 20, x - 17, y + 10, x + 17, y + 10);
        break;
      case 2: // 菱形
        graphics.fillTriangle(x, y - 20, x - 20, y, x, y + 20);
        graphics.fillTriangle(x, y - 20, x + 20, y, x, y + 20);
        break;
      case 3: // 星形简化版
        graphics.fillCircle(x, y, 15);
        graphics.fillRect(x - 3, y - 25, 6, 50);
        graphics.fillRect(x - 25, y - 3, 50, 6);
        break;
    }
  }

  drawCooldownOverlay(graphics, skill, progress) {
    const size = 60;
    const x = skill.x;
    const y = skill.y;

    // 绘制冷却遮罩（从上到下填充）
    const overlayHeight = size * (1 - progress);
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(x - size / 2, y - size / 2, size, overlayHeight);

    // 绘制进度条
    const barWidth = size;
    const barHeight = 4;
    const barY = y + size / 2 + 5;

    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(x - barWidth / 2, barY, barWidth * progress, barHeight);
  }

  useSkill(skill) {
    if (!skill.isReady) {
      // 技能冷却中，记录尝试
      this.signals.push({
        time: this.time.now,
        action: 'skill_blocked',
        skillId: skill.id,
        key: skill.key,
        remaining: skill.remainingTime
      });
      return;
    }

    // 使用技能
    skill.isReady = false;
    skill.remainingTime = skill.cooldown;
    skill.uses++;

    // 记录技能使用
    this.signals.push({
      time: this.time.now,
      action: 'skill_used',
      skillId: skill.id,
      key: skill.key,
      cooldown: skill.cooldown
    });

    window.__signals__.skillsUsed.push({
      id: skill.id,
      key: skill.key,
      time: this.time.now
    });
    window.__signals__.totalSkillUses++;

    // 更新图标为冷却状态
    this.drawSkillIcon(this.skillGraphics[skill.id], skill, false);

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isReady = true;
        skill.remainingTime = 0;
        skill.remainingText.setText('');
        this.drawSkillIcon(this.skillGraphics[skill.id], skill, true);
        
        // 记录技能就绪
        this.signals.push({
          time: this.time.now,
          action: 'skill_ready',
          skillId: skill.id,
          key: skill.key
        });
      },
      callbackScope: this
    });

    this.updateStats();
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    let activeCooldowns = 0;

    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      
      if (!skill.isReady && skill.timer) {
        skill.remainingTime = skill.timer.getRemaining();
        const progress = 1 - (skill.remainingTime / skill.cooldown);
        
        // 重绘技能图标和冷却遮罩
        this.drawSkillIcon(this.skillGraphics[i], skill, false);
        this.drawCooldownOverlay(this.skillGraphics[i], skill, progress);
        
        // 更新剩余时间文本
        skill.remainingText.setText((skill.remainingTime / 1000).toFixed(1) + 's');
        
        activeCooldowns++;
      }
    }

    // 更新 signals
    window.__signals__.currentCooldowns = this.skills
      .filter(s => !s.isReady)
      .map(s => ({
        id: s.id,
        key: s.key,
        remaining: s.remainingTime
      }));

    window.__signals__.activeCooldowns = activeCooldowns;
  }

  updateStats() {
    const totalUses = this.skills.reduce((sum, skill) => sum + skill.uses, 0);
    const readySkills = this.skills.filter(s => s.isReady).length;
    
    this.statsText.setText(
      `技能使用总次数: ${totalUses} | 就绪技能: ${readySkills}/20`
    );

    window.__signals__.readySkills = readySkills;
    window.__signals__.totalUses = totalUses;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillSystemScene
};

new Phaser.Game(config);