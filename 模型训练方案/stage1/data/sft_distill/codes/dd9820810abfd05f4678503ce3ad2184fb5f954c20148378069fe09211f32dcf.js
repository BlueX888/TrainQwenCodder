class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.skillTexts = [];
    this.cooldownTexts = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      skillsUsed: [],
      totalSkillUses: 0,
      currentCooldowns: []
    };

    // 创建标题
    this.add.text(400, 20, 'Multi-Skill System (20 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press 1-9, Q-K to activate skills', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 技能键位映射
    const keyMap = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'
    ];

    // 创建20个技能
    for (let i = 0; i < 20; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        key: keyMap[i],
        cooldown: (i + 1) * 1000, // 1秒递增：1s, 2s, 3s...20s
        isOnCooldown: false,
        remainingTime: 0,
        cooldownProgress: 0,
        totalUses: 0
      };

      this.skills.push(skill);

      // 计算技能图标位置（4列5行布局）
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 100 + col * 180;
      const y = 100 + row * 110;

      // 创建技能图标背景
      const graphics = this.add.graphics();
      graphics.x = x;
      graphics.y = y;
      this.skillGraphics.push(graphics);

      // 技能名称和按键提示
      const skillText = this.add.text(x, y - 45, `${skill.name} [${skill.key}]`, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.skillTexts.push(skillText);

      // 冷却时间文本
      const cooldownText = this.add.text(x, y + 45, `CD: ${(skill.cooldown / 1000).toFixed(1)}s`, {
        fontSize: '12px',
        color: '#00ff00'
      }).setOrigin(0.5);
      this.cooldownTexts.push(cooldownText);

      // 绑定按键
      this.input.keyboard.on(`keydown-${skill.key}`, () => {
        this.activateSkill(skill);
      });
    }

    // 创建统计信息文本
    this.statsText = this.add.text(400, 570, '', {
      fontSize: '14px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStats();
  }

  activateSkill(skill) {
    if (skill.isOnCooldown) {
      console.log(`Skill ${skill.id + 1} is on cooldown! ${(skill.remainingTime / 1000).toFixed(1)}s remaining`);
      return;
    }

    // 激活技能
    skill.isOnCooldown = true;
    skill.remainingTime = skill.cooldown;
    skill.totalUses++;

    // 记录到验证信号
    window.__signals__.skillsUsed.push({
      skillId: skill.id,
      skillName: skill.name,
      timestamp: Date.now(),
      cooldown: skill.cooldown
    });
    window.__signals__.totalSkillUses++;

    console.log(`Activated ${skill.name} (CD: ${skill.cooldown / 1000}s)`);

    // 创建冷却计时器
    const timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.remainingTime = 0;
        skill.cooldownProgress = 0;
        console.log(`${skill.name} ready!`);
      },
      callbackScope: this
    });

    this.updateStats();
  }

  update(time, delta) {
    // 更新所有技能的冷却状态
    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      const graphics = this.skillGraphics[i];
      const cooldownText = this.cooldownTexts[i];

      // 更新剩余时间
      if (skill.isOnCooldown) {
        skill.remainingTime = Math.max(0, skill.remainingTime - delta);
        skill.cooldownProgress = 1 - (skill.remainingTime / skill.cooldown);
      }

      // 绘制技能图标
      graphics.clear();

      // 外框
      graphics.lineStyle(2, skill.isOnCooldown ? 0xff0000 : 0x00ff00, 1);
      graphics.strokeRect(-30, -30, 60, 60);

      // 背景
      graphics.fillStyle(skill.isOnCooldown ? 0x440000 : 0x004400, 0.8);
      graphics.fillRect(-30, -30, 60, 60);

      // 技能图标（简单的几何形状代表）
      const shapeType = i % 5;
      graphics.fillStyle(skill.isOnCooldown ? 0x666666 : 0x00ffff, 1);
      
      switch (shapeType) {
        case 0: // 圆形
          graphics.fillCircle(0, 0, 15);
          break;
        case 1: // 正方形
          graphics.fillRect(-12, -12, 24, 24);
          break;
        case 2: // 三角形
          graphics.fillTriangle(0, -15, -15, 15, 15, 15);
          break;
        case 3: // 菱形
          graphics.fillTriangle(0, -15, 15, 0, 0, 15);
          graphics.fillTriangle(0, -15, -15, 0, 0, 15);
          break;
        case 4: // 星形（简化）
          graphics.fillCircle(0, 0, 12);
          graphics.fillRect(-15, -3, 30, 6);
          graphics.fillRect(-3, -15, 6, 30);
          break;
      }

      // 冷却遮罩（从下往上减少）
      if (skill.isOnCooldown) {
        const maskHeight = 60 * (1 - skill.cooldownProgress);
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRect(-30, -30, 60, maskHeight);

        // 冷却进度条
        const barWidth = 60;
        const barHeight = 4;
        const barY = 35;
        
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(-30, barY, barWidth, barHeight);
        
        graphics.fillStyle(0xff6600, 1);
        graphics.fillRect(-30, barY, barWidth * skill.cooldownProgress, barHeight);
      }

      // 更新冷却文本
      if (skill.isOnCooldown) {
        cooldownText.setText(`${(skill.remainingTime / 1000).toFixed(1)}s`);
        cooldownText.setColor('#ff0000');
      } else {
        cooldownText.setText(`Ready`);
        cooldownText.setColor('#00ff00');
      }
    }

    // 更新验证信号
    window.__signals__.currentCooldowns = this.skills.map(skill => ({
      skillId: skill.id,
      isOnCooldown: skill.isOnCooldown,
      remainingTime: skill.remainingTime,
      progress: skill.cooldownProgress,
      totalUses: skill.totalUses
    }));
  }

  updateStats() {
    const totalUses = this.skills.reduce((sum, skill) => sum + skill.totalUses, 0);
    const onCooldown = this.skills.filter(skill => skill.isOnCooldown).length;
    const ready = 20 - onCooldown;

    this.statsText.setText(
      `Total Skill Uses: ${totalUses} | Ready: ${ready}/20 | On Cooldown: ${onCooldown}/20`
    );
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