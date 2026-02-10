// 技能冷却系统
class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skills = {};
    this.signals = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号输出
    window.__signals__ = this.signals;

    // 技能配置
    const skillConfig = [
      { key: 'W', keyCode: 'W', x: 100, y: 100, name: 'Skill W' },
      { key: 'A', keyCode: 'A', x: 100, y: 200, name: 'Skill A' },
      { key: 'S', keyCode: 'S', x: 100, y: 300, name: 'Skill S' },
      { key: 'D', keyCode: 'D', x: 100, y: 400, name: 'Skill D' }
    ];

    // 创建技能UI
    skillConfig.forEach(config => {
      this.createSkill(config);
    });

    // 添加说明文字
    this.add.text(400, 50, 'Press W/A/S/D to use skills', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 80, 'Each skill has 3 second cooldown', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 技能使用计数器
    this.skillUseCount = { W: 0, A: 0, S: 0, D: 0 };
    this.totalSkillsUsed = 0;

    // 显示统计信息
    this.statsText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.updateStatsDisplay();

    // 记录初始状态
    this.logSignal('game_start', { timestamp: Date.now() });
  }

  createSkill(config) {
    const { key, keyCode, x, y, name } = config;

    // 技能状态
    this.skills[key] = {
      isReady: true,
      cooldownTimer: null,
      cooldownDuration: 3000, // 3秒冷却
      cooldownRemaining: 0,
      lastUsedTime: 0
    };

    // 背景框
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRoundedRect(x - 5, y - 5, 310, 90, 5);

    // 技能按钮（橙色方块）
    const button = this.add.graphics();
    button.fillStyle(0xff8800, 1);
    button.fillRoundedRect(x, y, 80, 80, 8);
    
    // 按键文字
    const keyText = this.add.text(x + 40, y + 40, key, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 技能名称
    const nameText = this.add.text(x + 100, y + 20, name, {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 冷却时间显示
    const cooldownText = this.add.text(x + 100, y + 45, 'Ready', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 冷却进度条背景
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x555555, 1);
    progressBg.fillRect(x + 100, y + 65, 200, 10);

    // 冷却进度条
    const progressBar = this.add.graphics();

    // 存储UI引用
    this.skills[key].ui = {
      button,
      keyText,
      nameText,
      cooldownText,
      progressBg,
      progressBar
    };

    // 监听键盘输入
    this.input.keyboard.on(`keydown-${keyCode}`, () => {
      this.useSkill(key);
    });
  }

  useSkill(key) {
    const skill = this.skills[key];

    if (!skill.isReady) {
      // 技能冷却中，无法使用
      this.logSignal('skill_cooldown', {
        skill: key,
        remaining: skill.cooldownRemaining,
        timestamp: Date.now()
      });
      
      // 视觉反馈：按钮闪烁红色
      skill.ui.button.clear();
      skill.ui.button.fillStyle(0xff0000, 1);
      skill.ui.button.fillRoundedRect(
        skill.ui.button.x || (key === 'W' ? 100 : key === 'A' ? 100 : key === 'S' ? 100 : 100),
        skill.ui.button.y || (key === 'W' ? 100 : key === 'A' ? 200 : key === 'S' ? 300 : 400),
        80, 80, 8
      );
      
      this.time.delayedCall(100, () => {
        skill.ui.button.clear();
        skill.ui.button.fillStyle(0x666666, 1);
        skill.ui.button.fillRoundedRect(
          skill.ui.button.x || (key === 'W' ? 100 : key === 'A' ? 100 : key === 'S' ? 100 : 100),
          skill.ui.button.y || (key === 'W' ? 100 : key === 'A' ? 200 : key === 'S' ? 300 : 400),
          80, 80, 8
        );
      });
      
      return;
    }

    // 使用技能
    skill.isReady = false;
    skill.lastUsedTime = Date.now();
    skill.cooldownRemaining = skill.cooldownDuration;

    // 更新统计
    this.skillUseCount[key]++;
    this.totalSkillsUsed++;
    this.updateStatsDisplay();

    // 记录技能使用
    this.logSignal('skill_used', {
      skill: key,
      useCount: this.skillUseCount[key],
      totalUses: this.totalSkillsUsed,
      timestamp: Date.now()
    });

    // 视觉反馈：技能释放效果
    this.createSkillEffect(key);

    // 更新按钮为冷却状态（灰色）
    skill.ui.button.clear();
    skill.ui.button.fillStyle(0x666666, 1);
    const positions = { W: 100, A: 200, S: 300, D: 400 };
    skill.ui.button.fillRoundedRect(100, positions[key], 80, 80, 8);

    // 启动冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldownDuration,
      callback: () => {
        this.resetSkill(key);
      },
      callbackScope: this
    });
  }

  createSkillEffect(key) {
    // 在屏幕中央创建技能释放特效
    const centerX = 400;
    const centerY = 300;
    
    const effect = this.add.graphics();
    effect.fillStyle(0xff8800, 0.8);
    effect.fillCircle(centerX, centerY, 20);

    // 扩散动画
    this.tweens.add({
      targets: effect,
      alpha: 0,
      duration: 500,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const radius = 20 + progress * 80;
        effect.clear();
        effect.fillStyle(0xff8800, 0.8 * (1 - progress));
        effect.fillCircle(centerX, centerY, radius);
      },
      onComplete: () => {
        effect.destroy();
      }
    });

    // 显示技能文字
    const skillText = this.add.text(centerX, centerY, `${key} Skill!`, {
      fontSize: '28px',
      color: '#ff8800',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: skillText,
      y: centerY - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        skillText.destroy();
      }
    });
  }

  resetSkill(key) {
    const skill = this.skills[key];
    skill.isReady = true;
    skill.cooldownRemaining = 0;

    // 恢复按钮为就绪状态（橙色）
    skill.ui.button.clear();
    skill.ui.button.fillStyle(0xff8800, 1);
    const positions = { W: 100, A: 200, S: 300, D: 400 };
    skill.ui.button.fillRoundedRect(100, positions[key], 80, 80, 8);

    // 更新文字
    skill.ui.cooldownText.setText('Ready');
    skill.ui.cooldownText.setColor('#00ff00');

    // 清空进度条
    skill.ui.progressBar.clear();

    // 记录技能就绪
    this.logSignal('skill_ready', {
      skill: key,
      timestamp: Date.now()
    });
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    Object.keys(this.skills).forEach(key => {
      const skill = this.skills[key];
      
      if (!skill.isReady && skill.cooldownTimer) {
        // 计算剩余时间
        const elapsed = skill.cooldownTimer.getElapsed();
        skill.cooldownRemaining = Math.max(0, skill.cooldownDuration - elapsed);
        
        const remainingSeconds = (skill.cooldownRemaining / 1000).toFixed(1);
        skill.ui.cooldownText.setText(`Cooldown: ${remainingSeconds}s`);
        skill.ui.cooldownText.setColor('#ff0000');

        // 更新进度条
        const progress = elapsed / skill.cooldownDuration;
        skill.ui.progressBar.clear();
        skill.ui.progressBar.fillStyle(0xff8800, 1);
        const positions = { W: 100, A: 200, S: 300, D: 400 };
        skill.ui.progressBar.fillRect(100, positions[key] + 65, 200 * progress, 10);
      }
    });
  }

  updateStatsDisplay() {
    const stats = `Total Skills Used: ${this.totalSkillsUsed} | W: ${this.skillUseCount.W} | A: ${this.skillUseCount.A} | S: ${this.skillUseCount.S} | D: ${this.skillUseCount.D}`;
    this.statsText.setText(stats);
  }

  logSignal(event, data) {
    const signal = {
      event,
      data,
      gameTime: this.time.now
    };
    this.signals.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene
};

// 启动游戏
new Phaser.Game(config);