// 多技能系统 - 20个技能各有不同冷却时间
class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.signals = {
      skillsUsed: [],
      cooldownStates: {},
      totalSkillUses: 0
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = this.signals;

    // 创建标题
    this.add.text(400, 20, '多技能系统 (20个技能)', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 50, '按键1-9和Q-K触发技能 | 每个技能冷却时间不同', {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 创建20个技能
    this.createSkills();

    // 绘制所有技能UI
    this.drawSkillsUI();

    // 设置键盘输入
    this.setupInput();

    // 创建统计信息显示
    this.statsText = this.add.text(400, 580, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatsDisplay();
  }

  createSkills() {
    // 创建20个技能，冷却时间从2秒开始递增2秒
    const keyBindings = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'
    ];

    for (let i = 0; i < 20; i++) {
      const cooldownTime = (i + 1) * 2000; // 2秒基准递增：2s, 4s, 6s...40s
      
      this.skills.push({
        id: i,
        name: `技能${i + 1}`,
        cooldown: cooldownTime,
        isOnCooldown: false,
        cooldownTimer: null,
        cooldownProgress: 0,
        keyBinding: keyBindings[i],
        usageCount: 0
      });

      this.signals.cooldownStates[`skill_${i}`] = {
        isOnCooldown: false,
        progress: 0,
        usageCount: 0
      };
    }
  }

  drawSkillsUI() {
    const startX = 50;
    const startY = 100;
    const skillSize = 60;
    const spacing = 10;
    const skillsPerRow = 10;

    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      const row = Math.floor(i / skillsPerRow);
      const col = i % skillsPerRow;
      const x = startX + col * (skillSize + spacing);
      const y = startY + row * (skillSize + spacing + 40);

      // 创建技能图形容器
      const graphics = this.add.graphics();
      graphics.skillId = i;
      graphics.x = x;
      graphics.y = y;

      this.skillGraphics.push(graphics);

      // 绘制技能背景框
      this.drawSkillBox(graphics, skill, 0, 0, skillSize);

      // 添加技能编号文本
      this.add.text(x + skillSize / 2, y + skillSize / 2, `${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 添加按键提示
      this.add.text(x + skillSize / 2, y + skillSize + 10, skill.keyBinding, {
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      // 添加冷却时间显示
      this.add.text(x + skillSize / 2, y + skillSize + 25, `CD: ${skill.cooldown / 1000}s`, {
        fontSize: '10px',
        color: '#00ff00'
      }).setOrigin(0.5);
    }
  }

  drawSkillBox(graphics, skill, x, y, size) {
    graphics.clear();

    // 绘制背景
    if (skill.isOnCooldown) {
      graphics.fillStyle(0x333333, 1);
    } else {
      graphics.fillStyle(0x0066cc, 1);
    }
    graphics.fillRect(x, y, size, size);

    // 绘制边框
    graphics.lineStyle(2, skill.isOnCooldown ? 0x666666 : 0x00aaff, 1);
    graphics.strokeRect(x, y, size, size);

    // 如果在冷却中，绘制冷却遮罩
    if (skill.isOnCooldown && skill.cooldownProgress > 0) {
      const maskHeight = size * skill.cooldownProgress;
      graphics.fillStyle(0x000000, 0.7);
      graphics.fillRect(x, y, size, maskHeight);

      // 绘制进度文本
      const remainingPercent = Math.ceil((1 - skill.cooldownProgress) * 100);
      const textY = y + size / 2;
      
      // 临时创建文本对象显示百分比
      if (!graphics.cooldownText) {
        graphics.cooldownText = this.add.text(x + size / 2, textY, '', {
          fontSize: '14px',
          color: '#ff0000',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }
      graphics.cooldownText.setText(`${remainingPercent}%`);
      graphics.cooldownText.setPosition(x + size / 2, textY);
    } else if (graphics.cooldownText) {
      graphics.cooldownText.setText('');
    }
  }

  setupInput() {
    // 监听数字键 1-9, 0
    for (let i = 1; i <= 9; i++) {
      this.input.keyboard.on(`keydown-${i}`, () => {
        this.useSkill(i - 1);
      });
    }
    this.input.keyboard.on('keydown-ZERO', () => {
      this.useSkill(9);
    });

    // 监听字母键 Q-P
    const letters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    letters.forEach((letter, index) => {
      this.input.keyboard.on(`keydown-${letter}`, () => {
        this.useSkill(10 + index);
      });
    });
  }

  useSkill(skillId) {
    if (skillId < 0 || skillId >= this.skills.length) return;

    const skill = this.skills[skillId];

    // 检查技能是否在冷却中
    if (skill.isOnCooldown) {
      console.log(`技能${skillId + 1}正在冷却中...`);
      return;
    }

    // 使用技能
    skill.usageCount++;
    this.signals.totalSkillUses++;
    
    console.log(`使用技能${skillId + 1} (冷却时间: ${skill.cooldown / 1000}秒)`);

    // 记录到signals
    this.signals.skillsUsed.push({
      skillId: skillId,
      skillName: skill.name,
      timestamp: Date.now(),
      cooldown: skill.cooldown
    });

    // 启动冷却
    this.startCooldown(skill);

    // 更新统计显示
    this.updateStatsDisplay();
  }

  startCooldown(skill) {
    skill.isOnCooldown = true;
    skill.cooldownProgress = 0;

    // 创建冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        this.endCooldown(skill);
      },
      callbackScope: this
    });

    // 更新信号状态
    this.signals.cooldownStates[`skill_${skill.id}`] = {
      isOnCooldown: true,
      progress: 0,
      usageCount: skill.usageCount,
      startTime: Date.now()
    };
  }

  endCooldown(skill) {
    skill.isOnCooldown = false;
    skill.cooldownProgress = 0;
    skill.cooldownTimer = null;

    console.log(`技能${skill.id + 1}冷却完成！`);

    // 更新信号状态
    this.signals.cooldownStates[`skill_${skill.id}`].isOnCooldown = false;
    this.signals.cooldownStates[`skill_${skill.id}`].progress = 1;
  }

  updateStatsDisplay() {
    const totalUses = this.skills.reduce((sum, skill) => sum + skill.usageCount, 0);
    const onCooldownCount = this.skills.filter(s => s.isOnCooldown).length;
    
    this.statsText.setText(
      `总使用次数: ${totalUses} | 冷却中: ${onCooldownCount}/20`
    );
  }

  update(time, delta) {
    // 更新所有技能的冷却进度
    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      const graphics = this.skillGraphics[i];

      if (skill.isOnCooldown && skill.cooldownTimer) {
        // 计算冷却进度 (0到1)
        skill.cooldownProgress = skill.cooldownTimer.getProgress();
        
        // 更新信号
        this.signals.cooldownStates[`skill_${skill.id}`].progress = skill.cooldownProgress;
      }

      // 重绘技能框
      this.drawSkillBox(graphics, skill, 0, 0, 60);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystemScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出信号说明
console.log('=== 多技能系统已启动 ===');
console.log('使用按键1-9, 0, Q-P触发对应技能');
console.log('可通过 window.__signals__ 查看技能使用记录和冷却状态');
console.log('技能冷却时间: 2s, 4s, 6s ... 40s (递增)');