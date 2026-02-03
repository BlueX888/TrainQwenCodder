class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.signals = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const SKILL_COUNT = 20;
    const BASE_COOLDOWN = 2000; // 2秒基准
    const COOLDOWN_INCREMENT = 500; // 每个技能增加0.5秒
    
    // 初始化技能数据
    for (let i = 0; i < SKILL_COUNT; i++) {
      this.skills.push({
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: BASE_COOLDOWN + (i * COOLDOWN_INCREMENT), // 冷却时间递增
        isOnCooldown: false,
        cooldownRemaining: 0,
        cooldownProgress: 0,
        timer: null,
        usageCount: 0
      });
    }

    // 创建技能UI网格（4列 x 5行）
    const COLS = 4;
    const ROWS = 5;
    const SKILL_SIZE = 80;
    const PADDING = 20;
    const START_X = 100;
    const START_Y = 80;

    for (let i = 0; i < SKILL_COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = START_X + col * (SKILL_SIZE + PADDING);
      const y = START_Y + row * (SKILL_SIZE + PADDING);

      const graphics = this.add.graphics();
      this.skillGraphics.push({
        graphics: graphics,
        x: x,
        y: y,
        skillId: i
      });

      this.drawSkill(i, x, y);
    }

    // 设置键盘输入
    this.setupInput();

    // 添加标题和说明
    this.add.text(400, 20, 'Multi-Skill System (20 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press 1-9, Q-K to activate skills | Cooldown increases per skill', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(100, 500, '', {
      fontSize: '12px',
      color: '#ffffff'
    });

    // 初始化信号系统
    window.__signals__ = {
      skills: [],
      totalActivations: 0,
      timestamp: Date.now()
    };

    this.logSignal('system_initialized', { skillCount: SKILL_COUNT });
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
    const letterKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'K'];
    letterKeys.forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.activateSkill(9 + index);
      });
    });

    // 鼠标点击技能
    this.input.on('pointerdown', (pointer) => {
      this.skillGraphics.forEach(sg => {
        if (pointer.x >= sg.x && pointer.x <= sg.x + 80 &&
            pointer.y >= sg.y && pointer.y <= sg.y + 80) {
          this.activateSkill(sg.skillId);
        }
      });
    });
  }

  activateSkill(skillId) {
    if (skillId < 0 || skillId >= this.skills.length) return;

    const skill = this.skills[skillId];

    if (skill.isOnCooldown) {
      this.logSignal('skill_on_cooldown', {
        skillId: skillId,
        remainingMs: skill.cooldownRemaining
      });
      return;
    }

    // 激活技能
    skill.usageCount++;
    skill.isOnCooldown = true;
    skill.cooldownRemaining = skill.cooldown;
    skill.cooldownProgress = 1;

    this.logSignal('skill_activated', {
      skillId: skillId,
      skillName: skill.name,
      cooldownMs: skill.cooldown,
      usageCount: skill.usageCount
    });

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.cooldownRemaining = 0;
        skill.cooldownProgress = 0;
        skill.timer = null;
        
        this.logSignal('skill_ready', {
          skillId: skillId,
          skillName: skill.name
        });
      },
      callbackScope: this
    });

    // 重绘技能
    this.drawSkill(skillId, this.skillGraphics[skillId].x, this.skillGraphics[skillId].y);
  }

  drawSkill(skillId, x, y) {
    const skill = this.skills[skillId];
    const graphics = this.skillGraphics[skillId].graphics;
    graphics.clear();

    const size = 80;
    const borderColor = skill.isOnCooldown ? 0x666666 : 0x00ff00;
    const bgColor = skill.isOnCooldown ? 0x333333 : 0x004400;

    // 背景
    graphics.fillStyle(bgColor, 1);
    graphics.fillRect(x, y, size, size);

    // 边框
    graphics.lineStyle(2, borderColor, 1);
    graphics.strokeRect(x, y, size, size);

    // 冷却进度条（从下往上填充）
    if (skill.isOnCooldown && skill.cooldownProgress > 0) {
      const progressHeight = size * skill.cooldownProgress;
      graphics.fillStyle(0xff0000, 0.5);
      graphics.fillRect(x, y + size - progressHeight, size, progressHeight);
    }

    // 技能编号
    const textStyle = {
      fontSize: '16px',
      color: skill.isOnCooldown ? '#888888' : '#ffffff',
      fontStyle: 'bold'
    };
    
    if (this.skillTexts && this.skillTexts[skillId]) {
      this.skillTexts[skillId].destroy();
    }
    if (!this.skillTexts) this.skillTexts = [];

    this.skillTexts[skillId] = this.add.text(x + size / 2, y + 20, `${skillId + 1}`, textStyle)
      .setOrigin(0.5);

    // 冷却时间显示
    const cdText = `${(skill.cooldown / 1000).toFixed(1)}s`;
    if (this.cooldownTexts && this.cooldownTexts[skillId]) {
      this.cooldownTexts[skillId].destroy();
    }
    if (!this.cooldownTexts) this.cooldownTexts = [];

    this.cooldownTexts[skillId] = this.add.text(x + size / 2, y + 40, cdText, {
      fontSize: '10px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 剩余冷却时间
    if (skill.isOnCooldown) {
      if (this.remainingTexts && this.remainingTexts[skillId]) {
        this.remainingTexts[skillId].destroy();
      }
      if (!this.remainingTexts) this.remainingTexts = [];

      const remaining = (skill.cooldownRemaining / 1000).toFixed(1);
      this.remainingTexts[skillId] = this.add.text(x + size / 2, y + 60, remaining, {
        fontSize: '14px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else if (this.remainingTexts && this.remainingTexts[skillId]) {
      this.remainingTexts[skillId].destroy();
      this.remainingTexts[skillId] = null;
    }
  }

  update(time, delta) {
    // 更新所有技能的冷却状态
    let activeCooldowns = 0;
    let totalActivations = 0;

    this.skills.forEach((skill, index) => {
      if (skill.isOnCooldown && skill.timer) {
        skill.cooldownRemaining = skill.timer.getRemaining();
        skill.cooldownProgress = skill.cooldownRemaining / skill.cooldown;
        
        // 重绘技能显示冷却进度
        this.drawSkill(index, this.skillGraphics[index].x, this.skillGraphics[index].y);
        activeCooldowns++;
      }
      totalActivations += skill.usageCount;
    });

    // 更新状态文本
    const readySkills = this.skills.filter(s => !s.isOnCooldown).length;
    this.statusText.setText(
      `Ready Skills: ${readySkills}/20 | Active Cooldowns: ${activeCooldowns} | Total Activations: ${totalActivations}`
    );

    // 更新信号
    window.__signals__.totalActivations = totalActivations;
    window.__signals__.readySkills = readySkills;
    window.__signals__.activeCooldowns = activeCooldowns;
  }

  logSignal(event, data) {
    const signal = {
      event: event,
      timestamp: Date.now(),
      data: data
    };
    
    this.signals.push(signal);
    window.__signals__.skills.push(signal);
    
    console.log(`[SIGNAL] ${event}:`, data);
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