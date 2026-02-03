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
    // 初始化可验证的信号系统
    window.__signals__ = this.signals;
    
    // 技能配置
    const skillConfig = {
      W: { x: 200, y: 150, key: 'W', name: '技能W' },
      A: { x: 100, y: 250, key: 'A', name: '技能A' },
      S: { x: 200, y: 250, key: 'S', name: '技能S' },
      D: { x: 300, y: 250, key: 'D', name: '技能D' }
    };

    const cooldownTime = 3000; // 3秒冷却

    // 创建标题
    this.add.text(400, 50, '橙色技能冷却系统', {
      fontSize: '32px',
      color: '#ff8800',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 100, '按 W A S D 释放技能（冷却3秒）', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 为每个技能创建UI和逻辑
    Object.values(skillConfig).forEach(config => {
      this.createSkill(config, cooldownTime);
    });

    // 创建日志显示区域
    this.logText = this.add.text(400, 400, '技能释放日志：', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5, 0);

    // 记录初始化信号
    this.addSignal('INIT', 'System initialized with 4 skills');
  }

  createSkill(config, cooldownTime) {
    const { x, y, key, name } = config;

    // 创建技能对象
    const skill = {
      key: key,
      name: name,
      isOnCooldown: false,
      cooldownTimer: null,
      cooldownStartTime: 0,
      cooldownDuration: cooldownTime
    };

    // 创建技能背景（橙色方块）
    const bg = this.add.graphics();
    bg.fillStyle(0xff8800, 1);
    bg.fillRoundedRect(x - 40, y - 40, 80, 80, 8);

    // 创建冷却遮罩（半透明黑色）
    const cooldownMask = this.add.graphics();
    cooldownMask.setDepth(1);
    cooldownMask.setVisible(false);
    skill.cooldownMask = cooldownMask;

    // 创建冷却进度条背景
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333, 1);
    progressBg.fillRect(x - 35, y + 50, 70, 10);

    // 创建冷却进度条
    const progressBar = this.add.graphics();
    progressBar.setDepth(2);
    skill.progressBar = progressBar;

    // 创建按键文本
    this.add.text(x, y - 10, key, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    // 创建技能名称
    this.add.text(x, y + 15, name, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(3);

    // 创建冷却时间文本
    const cooldownText = this.add.text(x, y + 35, '', {
      fontSize: '12px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    skill.cooldownText = cooldownText;

    // 存储技能数据
    this.skills[key] = skill;

    // 绑定按键事件
    this.input.keyboard.on(`keydown-${key}`, () => {
      this.activateSkill(skill);
    });
  }

  activateSkill(skill) {
    // 检查是否在冷却中
    if (skill.isOnCooldown) {
      this.addSignal('SKILL_BLOCKED', `${skill.name} is on cooldown`);
      console.log(`${skill.name} 冷却中，无法使用`);
      return;
    }

    // 释放技能
    console.log(`释放 ${skill.name}！`);
    this.addSignal('SKILL_USED', `${skill.name} activated`);

    // 开始冷却
    skill.isOnCooldown = true;
    skill.cooldownStartTime = this.time.now;
    skill.cooldownMask.setVisible(true);

    // 创建冷却计时器
    skill.cooldownTimer = this.time.addEvent({
      delay: skill.cooldownDuration,
      callback: () => {
        this.resetSkill(skill);
      },
      callbackScope: this
    });

    // 更新日志
    this.updateLog(`${skill.name} 已释放！冷却中...`);
  }

  resetSkill(skill) {
    skill.isOnCooldown = false;
    skill.cooldownTimer = null;
    skill.cooldownMask.setVisible(false);
    skill.cooldownText.setText('');
    skill.progressBar.clear();

    console.log(`${skill.name} 冷却完成！`);
    this.addSignal('SKILL_READY', `${skill.name} cooldown finished`);
    this.updateLog(`${skill.name} 冷却完成！`);
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    Object.values(this.skills).forEach(skill => {
      if (skill.isOnCooldown && skill.cooldownTimer) {
        const elapsed = time - skill.cooldownStartTime;
        const progress = Math.min(elapsed / skill.cooldownDuration, 1);
        const remaining = Math.max(0, skill.cooldownDuration - elapsed);

        // 更新冷却遮罩
        const maskHeight = 80 * (1 - progress);
        skill.cooldownMask.clear();
        skill.cooldownMask.fillStyle(0x000000, 0.6);
        skill.cooldownMask.fillRoundedRect(
          this.getSkillX(skill.key) - 40,
          this.getSkillY(skill.key) - 40,
          80,
          maskHeight,
          8
        );

        // 更新进度条
        skill.progressBar.clear();
        skill.progressBar.fillStyle(0x00ff00, 1);
        skill.progressBar.fillRect(
          this.getSkillX(skill.key) - 35,
          this.getSkillY(skill.key) + 50,
          70 * progress,
          10
        );

        // 更新冷却时间文本
        skill.cooldownText.setText(`${(remaining / 1000).toFixed(1)}s`);
      }
    });
  }

  getSkillX(key) {
    const positions = { W: 200, A: 100, S: 200, D: 300 };
    return positions[key];
  }

  getSkillY(key) {
    const positions = { W: 150, A: 250, S: 250, D: 250 };
    return positions[key];
  }

  addSignal(type, message) {
    const signal = {
      timestamp: this.time.now,
      type: type,
      message: message
    };
    this.signals.push(signal);
    console.log(`[SIGNAL] ${type}: ${message}`);
  }

  updateLog(message) {
    const logs = this.signals
      .filter(s => s.type === 'SKILL_USED' || s.type === 'SKILL_READY')
      .slice(-5)
      .map(s => s.message)
      .join('\n');
    
    this.logText.setText('技能释放日志：\n' + logs);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);