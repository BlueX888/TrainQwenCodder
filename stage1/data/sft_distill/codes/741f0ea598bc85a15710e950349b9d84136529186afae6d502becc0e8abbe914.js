class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.skillTexts = [];
    this.cooldownBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      skills: [],
      activations: 0,
      timestamp: Date.now()
    };

    // 创建标题
    this.add.text(400, 20, 'Multi-Skill System (20 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press 1-9, Q-K to activate skills', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 初始化20个技能
    for (let i = 0; i < 20; i++) {
      this.skills.push({
        id: i,
        cooldown: (i + 1) * 1000, // 冷却时间：1秒、2秒、3秒...20秒
        remainingTime: 0,
        isOnCooldown: false,
        activationCount: 0
      });

      window.__signals__.skills.push({
        id: i,
        cooldown: (i + 1) * 1000,
        ready: true,
        activations: 0
      });
    }

    // 创建技能UI（4x5网格布局）
    const startX = 100;
    const startY = 100;
    const cellWidth = 140;
    const cellHeight = 100;
    const cols = 4;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;

      // 技能槽背景
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(x, y, 120, 80, 8);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRoundedRect(x, y, 120, 80, 8);

      // 冷却遮罩层
      const cooldownBar = this.add.graphics();
      this.cooldownBars.push(cooldownBar);

      // 技能编号和冷却时间
      const skillText = this.add.text(x + 60, y + 25, `Skill ${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const cooldownText = this.add.text(x + 60, y + 45, `CD: ${(i + 1)}s`, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      const statusText = this.add.text(x + 60, y + 65, 'READY', {
        fontSize: '14px',
        color: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.skillTexts.push({
        skill: skillText,
        cooldown: cooldownText,
        status: statusText
      });

      this.skillGraphics.push({ bg, x, y });
    }

    // 设置键盘输入
    this.setupInput();

    // 显示统计信息
    this.statsText = this.add.text(400, 580, '', {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log('[SkillSystem] Initialized with 20 skills');
  }

  setupInput() {
    // 数字键 1-9 对应技能 0-8
    const numberKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    numberKeys.forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.activateSkill(index);
      });
    });

    // 字母键 Q-K 对应技能 9-19
    const letterKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A'];
    letterKeys.forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.activateSkill(9 + index);
      });
    });
  }

  activateSkill(skillId) {
    if (skillId < 0 || skillId >= 20) return;

    const skill = this.skills[skillId];

    if (skill.isOnCooldown) {
      console.log(`[Skill ${skillId + 1}] On cooldown, ${(skill.remainingTime / 1000).toFixed(1)}s remaining`);
      return;
    }

    // 激活技能
    skill.isOnCooldown = true;
    skill.remainingTime = skill.cooldown;
    skill.activationCount++;

    window.__signals__.activations++;
    window.__signals__.skills[skillId].ready = false;
    window.__signals__.skills[skillId].activations = skill.activationCount;

    console.log(`[Skill ${skillId + 1}] Activated! Cooldown: ${skill.cooldown / 1000}s`);

    // 创建冷却计时器
    const timer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => {
        skill.remainingTime -= 50;

        if (skill.remainingTime <= 0) {
          skill.remainingTime = 0;
          skill.isOnCooldown = false;
          window.__signals__.skills[skillId].ready = true;
          timer.destroy();
          console.log(`[Skill ${skillId + 1}] Ready!`);
        }
      },
      loop: true
    });

    // 视觉反馈
    this.tweens.add({
      targets: this.skillGraphics[skillId].bg,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

  update(time, delta) {
    // 更新所有技能的UI显示
    for (let i = 0; i < 20; i++) {
      const skill = this.skills[i];
      const graphics = this.skillGraphics[i];
      const texts = this.skillTexts[i];
      const cooldownBar = this.cooldownBars[i];

      // 清除冷却条
      cooldownBar.clear();

      if (skill.isOnCooldown) {
        // 绘制冷却进度
        const progress = skill.remainingTime / skill.cooldown;
        const barHeight = 80 * progress;

        cooldownBar.fillStyle(0x000000, 0.7);
        cooldownBar.fillRoundedRect(
          graphics.x,
          graphics.y,
          120,
          barHeight,
          8
        );

        // 更新状态文本
        texts.status.setText(`${(skill.remainingTime / 1000).toFixed(1)}s`);
        texts.status.setColor('#ff6666');
      } else {
        // 技能就绪
        texts.status.setText('READY');
        texts.status.setColor('#00ff00');
      }

      // 更新激活次数
      if (skill.activationCount > 0) {
        texts.cooldown.setText(`CD: ${(skill.cooldown / 1000)}s (x${skill.activationCount})`);
      }
    }

    // 更新统计信息
    const readyCount = this.skills.filter(s => !s.isOnCooldown).length;
    const totalActivations = this.skills.reduce((sum, s) => sum + s.activationCount, 0);

    this.statsText.setText(
      `Ready: ${readyCount}/20 | Total Activations: ${totalActivations}`
    );

    // 更新信号时间戳
    window.__signals__.timestamp = Date.now();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystemScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证函数
window.getSkillStatus = function(skillId) {
  if (skillId < 0 || skillId >= 20) return null;
  return window.__signals__.skills[skillId];
};

window.getAllSkillsStatus = function() {
  return {
    skills: window.__signals__.skills,
    totalActivations: window.__signals__.activations,
    readyCount: window.__signals__.skills.filter(s => s.ready).length
  };
};

console.log('[SkillSystem] Game initialized. Use window.getAllSkillsStatus() to check status');