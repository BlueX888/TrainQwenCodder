class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.cooldownBars = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      skillsUsed: [],
      currentCooldowns: {},
      totalSkillsActivated: 0
    };

    // 创建标题
    const title = this.add.text(400, 20, '多技能冷却系统 (20 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建说明
    const instructions = this.add.text(400, 50, '按键: 1-9, Q-K 触发技能 | 冷却时间: 1-20秒递增', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
    instructions.setOrigin(0.5);

    // 定义技能键位映射
    const keyMappings = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'
    ];

    // 创建20个技能
    for (let i = 0; i < 20; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: (i + 1) * 1000, // 1秒到20秒，单位毫秒
        isOnCooldown: false,
        cooldownProgress: 0,
        timer: null,
        key: keyMappings[i],
        color: this.getSkillColor(i)
      };
      this.skills.push(skill);
    }

    // 布局参数
    const startX = 100;
    const startY = 100;
    const skillSize = 60;
    const padding = 20;
    const cols = 5;

    // 绘制技能图标和进度条
    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (skillSize + padding);
      const y = startY + row * (skillSize + padding);

      // 技能背景框
      const bg = this.add.graphics();
      bg.fillStyle(0x222222, 1);
      bg.fillRect(x, y, skillSize, skillSize);
      bg.lineStyle(2, 0x444444, 1);
      bg.strokeRect(x, y, skillSize, skillSize);

      // 技能图标（使用渐变色块）
      const icon = this.add.graphics();
      icon.fillStyle(this.skills[i].color, 1);
      icon.fillCircle(x + skillSize / 2, y + skillSize / 2, 20);
      this.skillGraphics.push(icon);

      // 技能键位文本
      const keyText = this.add.text(x + skillSize / 2, y + skillSize / 2, this.skills[i].key, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      keyText.setOrigin(0.5);

      // 冷却时间文本
      const cdText = this.add.text(x + skillSize / 2, y + skillSize + 5, `${i + 1}s`, {
        fontSize: '12px',
        color: '#888888'
      });
      cdText.setOrigin(0.5, 0);

      // 冷却遮罩
      const cooldownMask = this.add.graphics();
      this.cooldownBars.push({
        graphics: cooldownMask,
        x: x,
        y: y,
        size: skillSize,
        text: cdText
      });
    }

    // 绑定键盘事件
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toUpperCase();
      const skillIndex = keyMappings.indexOf(key);
      
      if (skillIndex !== -1) {
        this.activateSkill(skillIndex);
      }
    });

    // 创建状态显示
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.statusText.setOrigin(0.5);

    // 创建统计信息
    this.statsText = this.add.text(400, 530, 'Total Skills Activated: 0', {
      fontSize: '14px',
      color: '#ffff00'
    });
    this.statsText.setOrigin(0.5);

    console.log('[SkillSystem] Initialized with 20 skills');
  }

  getSkillColor(index) {
    // 为每个技能生成独特的颜色
    const hue = (index * 18) % 360; // 360/20 = 18度间隔
    return Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9).color;
  }

  activateSkill(index) {
    const skill = this.skills[index];

    if (skill.isOnCooldown) {
      this.statusText.setText(`${skill.name} is on cooldown!`);
      this.statusText.setColor('#ff0000');
      console.log(`[SkillSystem] Skill ${index + 1} blocked - on cooldown`);
      return;
    }

    // 激活技能
    skill.isOnCooldown = true;
    skill.cooldownProgress = 0;

    // 记录信号
    window.__signals__.skillsUsed.push({
      skillId: skill.id,
      skillName: skill.name,
      timestamp: this.time.now,
      cooldownDuration: skill.cooldown
    });
    window.__signals__.totalSkillsActivated++;
    window.__signals__.currentCooldowns[skill.id] = 0;

    // 更新状态文本
    this.statusText.setText(`${skill.name} activated! (${skill.cooldown / 1000}s cooldown)`);
    this.statusText.setColor('#00ff00');

    // 更新统计
    this.statsText.setText(`Total Skills Activated: ${window.__signals__.totalSkillsActivated}`);

    console.log(`[SkillSystem] Skill ${index + 1} activated - cooldown: ${skill.cooldown}ms`);

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.cooldownProgress = 0;
        skill.timer = null;
        delete window.__signals__.currentCooldowns[skill.id];
        console.log(`[SkillSystem] Skill ${index + 1} cooldown complete`);
      },
      callbackScope: this
    });

    // 视觉反馈：图标闪烁
    this.tweens.add({
      targets: this.skillGraphics[index],
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    // 更新所有技能的冷却进度
    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      const bar = this.cooldownBars[i];

      // 清除之前的绘制
      bar.graphics.clear();

      if (skill.isOnCooldown && skill.timer) {
        // 计算冷却进度 (0-1)
        const elapsed = skill.timer.getElapsed();
        skill.cooldownProgress = Math.min(elapsed / skill.cooldown, 1);

        // 更新信号
        window.__signals__.currentCooldowns[skill.id] = skill.cooldownProgress;

        // 绘制半透明黑色遮罩（从下往上减少）
        const maskHeight = bar.size * (1 - skill.cooldownProgress);
        bar.graphics.fillStyle(0x000000, 0.7);
        bar.graphics.fillRect(bar.x, bar.y, bar.size, maskHeight);

        // 绘制进度边框
        bar.graphics.lineStyle(2, 0xff0000, 0.8);
        bar.graphics.strokeRect(bar.x, bar.y, bar.size, bar.size);

        // 更新冷却时间文本
        const remaining = Math.ceil((skill.cooldown - elapsed) / 1000);
        bar.text.setText(`${remaining}s`);
        bar.text.setColor('#ff0000');
      } else {
        // 技能可用状态
        bar.graphics.lineStyle(2, 0x00ff00, 0.5);
        bar.graphics.strokeRect(bar.x, bar.y, bar.size, bar.size);
        bar.text.setText(`${skill.cooldown / 1000}s`);
        bar.text.setColor('#888888');
      }
    }

    // 更新当前冷却中的技能数量
    const cooldownCount = Object.keys(window.__signals__.currentCooldowns).length;
    if (cooldownCount > 0) {
      const avgProgress = Object.values(window.__signals__.currentCooldowns)
        .reduce((sum, p) => sum + p, 0) / cooldownCount;
      window.__signals__.averageCooldownProgress = avgProgress.toFixed(2);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: SkillSystemScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证函数
window.getSkillSystemState = function() {
  return {
    signals: window.__signals__,
    timestamp: Date.now()
  };
};

console.log('[SkillSystem] Game initialized - Press 1-9, Q-P to activate skills');