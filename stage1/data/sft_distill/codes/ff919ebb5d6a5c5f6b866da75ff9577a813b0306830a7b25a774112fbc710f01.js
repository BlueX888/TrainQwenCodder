class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.skillGraphics = [];
    this.cooldownTexts = [];
    
    // 验证信号
    window.__signals__ = {
      skillsUsed: [],
      totalSkillUses: 0,
      currentCooldowns: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 30, 'Multi-Skill System (Press 1-0 to use skills)', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明
    this.add.text(400, 60, 'Each skill has cooldown: 1s, 2s, 3s ... 10s', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始化10个技能
    for (let i = 0; i < 10; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: (i + 1) * 1000, // 1秒到10秒
        isOnCooldown: false,
        remainingTime: 0,
        totalUses: 0,
        key: i === 9 ? '0' : `${i + 1}` // 1-9和0键
      };
      this.skills.push(skill);

      // 计算技能图标位置（两行显示）
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = 160 + col * 130;
      const y = 150 + row * 200;

      // 创建技能图标容器
      this.createSkillIcon(skill, x, y);
    }

    // 设置键盘输入
    this.setupInput();

    // 添加统计信息显示
    this.statsText = this.add.text(400, 550, '', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStats();
  }

  createSkillIcon(skill, x, y) {
    const graphics = this.add.graphics();
    
    // 绘制技能图标背景（圆形）
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillCircle(x, y, 40);
    
    // 绘制技能图标边框
    graphics.lineStyle(3, 0x00ff00, 1);
    graphics.strokeCircle(x, y, 40);
    
    // 绘制技能内部装饰（根据技能ID不同颜色）
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x00ffff,
                    0x0088ff, 0x0000ff, 0x8800ff, 0xff00ff, 0xff0088];
    graphics.fillStyle(colors[skill.id], 1);
    graphics.fillCircle(x, y, 30);

    // 添加技能编号
    this.add.text(x, y, skill.key, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建冷却遮罩图层
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.setDepth(1);

    // 添加技能名称
    this.add.text(x, y + 55, skill.name, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加冷却时间文本
    const cooldownText = this.add.text(x, y + 75, `CD: ${skill.cooldown / 1000}s`, {
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 添加剩余时间文本
    const remainingText = this.add.text(x, y + 95, '', {
      fontSize: '14px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 保存引用
    skill.graphics = graphics;
    skill.cooldownGraphics = cooldownGraphics;
    skill.cooldownText = cooldownText;
    skill.remainingText = remainingText;
    skill.position = { x, y };

    this.skillGraphics.push({ skill, graphics, cooldownGraphics });
  }

  setupInput() {
    // 监听数字键 1-0
    const keys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 
                  'SIX', 'SEVEN', 'EIGHT', 'NINE', 'ZERO'];
    
    keys.forEach((keyName, index) => {
      this.input.keyboard.on(`keydown-${keyName}`, () => {
        this.useSkill(index);
      });
    });
  }

  useSkill(index) {
    const skill = this.skills[index];
    
    if (skill.isOnCooldown) {
      console.log(`Skill ${skill.name} is on cooldown! ${(skill.remainingTime / 1000).toFixed(1)}s remaining`);
      return;
    }

    // 使用技能
    skill.isOnCooldown = true;
    skill.remainingTime = skill.cooldown;
    skill.totalUses++;

    console.log(`Used ${skill.name}! Cooldown: ${skill.cooldown / 1000}s`);

    // 记录到信号
    window.__signals__.skillsUsed.push({
      skillId: skill.id,
      skillName: skill.name,
      timestamp: Date.now(),
      cooldown: skill.cooldown
    });
    window.__signals__.totalSkillUses++;

    // 创建冷却计时器
    const timer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => {
        skill.remainingTime -= 50;
        
        if (skill.remainingTime <= 0) {
          skill.remainingTime = 0;
          skill.isOnCooldown = false;
          timer.destroy();
          console.log(`${skill.name} is ready!`);
        }
        
        this.updateSkillDisplay(skill);
      },
      loop: true
    });

    // 立即更新显示
    this.updateSkillDisplay(skill);
    this.updateStats();
  }

  updateSkillDisplay(skill) {
    const { cooldownGraphics, remainingText, position } = skill;
    
    // 清除之前的冷却遮罩
    cooldownGraphics.clear();

    if (skill.isOnCooldown) {
      // 计算冷却进度（0-1）
      const progress = skill.remainingTime / skill.cooldown;
      
      // 绘制冷却遮罩（扇形）
      cooldownGraphics.fillStyle(0x000000, 0.7);
      cooldownGraphics.beginPath();
      cooldownGraphics.moveTo(position.x, position.y);
      cooldownGraphics.arc(
        position.x, 
        position.y, 
        40, 
        Phaser.Math.DegToRad(-90), 
        Phaser.Math.DegToRad(-90 + 360 * progress),
        false
      );
      cooldownGraphics.closePath();
      cooldownGraphics.fillPath();

      // 更新剩余时间文本
      remainingText.setText(`${(skill.remainingTime / 1000).toFixed(1)}s`);
      remainingText.setVisible(true);
    } else {
      // 技能可用，隐藏剩余时间
      remainingText.setVisible(false);
    }
  }

  updateStats() {
    const totalUses = this.skills.reduce((sum, skill) => sum + skill.totalUses, 0);
    const onCooldown = this.skills.filter(s => s.isOnCooldown).length;
    
    this.statsText.setText(
      `Total Skills Used: ${totalUses} | Skills on Cooldown: ${onCooldown}/10`
    );
  }

  update(time, delta) {
    // 更新统计信息
    this.updateStats();

    // 更新验证信号中的当前冷却状态
    window.__signals__.currentCooldowns = this.skills.map(skill => ({
      skillId: skill.id,
      isOnCooldown: skill.isOnCooldown,
      remainingTime: skill.remainingTime,
      totalUses: skill.totalUses
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: SkillSystem,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 输出初始验证信号
console.log('Multi-Skill System initialized');
console.log('Press keys 1-0 to use skills');
console.log('Signals available at: window.__signals__');