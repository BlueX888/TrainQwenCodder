class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillStates = {}; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化技能状态
    for (let i = 0; i < 5; i++) {
      this.skillStates[`skill${i + 1}`] = {
        isOnCooldown: false,
        cooldownRemaining: 0,
        totalUses: 0
      };
    }

    // 添加标题
    this.add.text(400, 50, '多技能系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 100, '按数字键 1-5 释放技能', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建5个技能
    const skillColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
    const baseCooldown = 1500; // 1.5秒基准

    for (let i = 0; i < 5; i++) {
      const skill = this.createSkill(
        150 + i * 130,
        300,
        skillColors[i],
        baseCooldown * (i + 1),
        i + 1
      );
      this.skills.push(skill);
    }

    // 设置键盘输入
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key;
      if (key >= '1' && key <= '5') {
        const index = parseInt(key) - 1;
        this.useSkill(index);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  createSkill(x, y, color, cooldown, number) {
    const container = this.add.container(x, y);

    // 技能背景
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRoundedRect(-50, -50, 100, 100, 10);
    container.add(bg);

    // 技能图标
    const icon = this.add.graphics();
    icon.fillStyle(color, 1);
    icon.fillCircle(0, 0, 35);
    container.add(icon);

    // 技能编号
    const numberText = this.add.text(0, 0, number.toString(), {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(numberText);

    // 冷却遮罩
    const cooldownMask = this.add.graphics();
    cooldownMask.setAlpha(0.7);
    container.add(cooldownMask);

    // 冷却时间文本
    const cooldownText = this.add.text(0, 0, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(cooldownText);

    // 冷却时间标签
    const cooldownLabel = this.add.text(0, 65, `CD: ${(cooldown / 1000).toFixed(1)}s`, {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    container.add(cooldownLabel);

    return {
      container,
      icon,
      cooldownMask,
      cooldownText,
      cooldown,
      isOnCooldown: false,
      timer: null,
      startTime: 0,
      color,
      number
    };
  }

  useSkill(index) {
    const skill = this.skills[index];
    
    if (skill.isOnCooldown) {
      // 技能冷却中，无法使用
      this.flashSkill(skill, 0xff0000);
      return;
    }

    // 使用技能
    skill.isOnCooldown = true;
    skill.startTime = this.time.now;
    
    // 更新状态信号
    this.skillStates[`skill${index + 1}`].isOnCooldown = true;
    this.skillStates[`skill${index + 1}`].cooldownRemaining = skill.cooldown;
    this.skillStates[`skill${index + 1}`].totalUses++;

    // 技能效果动画
    this.flashSkill(skill, 0xffffff);
    
    // 创建技能特效
    this.createSkillEffect(skill);

    // 启动冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isOnCooldown = false;
        skill.timer = null;
        skill.cooldownMask.clear();
        skill.cooldownText.setText('');
        
        // 更新状态信号
        this.skillStates[`skill${index + 1}`].isOnCooldown = false;
        this.skillStates[`skill${index + 1}`].cooldownRemaining = 0;
        
        // 技能就绪动画
        this.flashSkill(skill, 0x00ff00);
        this.updateStatusText();
      },
      callbackScope: this
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    this.skills.forEach((skill, index) => {
      if (skill.isOnCooldown && skill.timer) {
        const elapsed = time - skill.startTime;
        const progress = elapsed / skill.cooldown;
        const remaining = skill.cooldown - elapsed;

        // 更新冷却遮罩
        skill.cooldownMask.clear();
        skill.cooldownMask.fillStyle(0x000000, 0.7);
        
        // 绘制扇形遮罩
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * progress);
        
        skill.cooldownMask.beginPath();
        skill.cooldownMask.moveTo(0, 0);
        skill.cooldownMask.arc(0, 0, 50, startAngle, endAngle, false);
        skill.cooldownMask.closePath();
        skill.cooldownMask.fillPath();

        // 更新冷却时间文本
        const remainingSeconds = Math.ceil(remaining / 1000);
        skill.cooldownText.setText(remainingSeconds.toString());

        // 更新状态信号
        this.skillStates[`skill${index + 1}`].cooldownRemaining = remaining;
      }
    });
  }

  flashSkill(skill, color) {
    // 闪烁效果
    const originalAlpha = skill.icon.alpha;
    
    this.tweens.add({
      targets: skill.icon,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        skill.icon.alpha = originalAlpha;
      }
    });

    // 边框高亮
    const highlight = this.add.graphics();
    highlight.lineStyle(4, color, 1);
    highlight.strokeCircle(skill.container.x, skill.container.y, 50);
    
    this.tweens.add({
      targets: highlight,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        highlight.destroy();
      }
    });
  }

  createSkillEffect(skill) {
    // 创建技能释放特效
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.add.graphics();
      particle.fillStyle(skill.color, 1);
      particle.fillCircle(0, 0, 5);
      particle.x = skill.container.x;
      particle.y = skill.container.y;
      
      const targetX = skill.container.x + Math.cos(angle) * 100;
      const targetY = skill.container.y + Math.sin(angle) * 100;
      
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
      
      particles.push(particle);
    }
  }

  updateStatusText() {
    let statusLines = ['=== 技能状态 ==='];
    
    this.skills.forEach((skill, index) => {
      const state = this.skillStates[`skill${index + 1}`];
      const status = state.isOnCooldown 
        ? `冷却中 (${(state.cooldownRemaining / 1000).toFixed(1)}s)` 
        : '就绪';
      const uses = state.totalUses;
      
      statusLines.push(
        `技能${skill.number}: ${status} | 使用次数: ${uses}`
      );
    });
    
    this.statusText.setText(statusLines.join('\n'));
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

new Phaser.Game(config);