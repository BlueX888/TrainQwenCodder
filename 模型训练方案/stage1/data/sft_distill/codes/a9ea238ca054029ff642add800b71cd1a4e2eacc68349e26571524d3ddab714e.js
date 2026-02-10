class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.skillTexts = [];
    this.cooldownTexts = [];
    this.totalSkillsUsed = 0; // 可验证状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 20, 'Multi-Skill System (15 Skills)', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press 1-9, 0, Q, W, E, R, T to use skills', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 80, 'Skills Used: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 初始化15个技能
    const baseDelay = 2500; // 2.5秒基准
    const keyBindings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Q', 'W', 'E', 'R', 'T'];
    
    for (let i = 0; i < 15; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: baseDelay * (i + 1), // 递增冷却时间
        isReady: true,
        currentCooldown: 0,
        timer: null,
        key: keyBindings[i]
      };
      this.skills.push(skill);
    }

    // 创建技能UI（3行5列布局）
    const startX = 100;
    const startY = 150;
    const skillSize = 80;
    const gapX = 140;
    const gapY = 140;

    for (let i = 0; i < 15; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      // 创建技能图标背景
      const graphics = this.add.graphics();
      graphics.x = x;
      graphics.y = y;
      this.skillGraphics.push(graphics);

      // 技能名称和快捷键
      const nameText = this.add.text(x, y - 50, `${this.skills[i].name}\n[${this.skills[i].key}]`, {
        fontSize: '14px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.skillTexts.push(nameText);

      // 冷却时间显示
      const cooldownText = this.add.text(x, y + 50, `CD: ${(this.skills[i].cooldown / 1000).toFixed(1)}s`, {
        fontSize: '12px',
        color: '#00ff00',
        align: 'center'
      }).setOrigin(0.5);
      this.cooldownTexts.push(cooldownText);

      // 绘制初始状态
      this.drawSkillIcon(i);
    }

    // 设置键盘输入
    this.setupKeyboardInput();
  }

  setupKeyboardInput() {
    // 为每个技能绑定按键
    this.skills.forEach((skill, index) => {
      const key = this.input.keyboard.addKey(skill.key);
      key.on('down', () => {
        this.useSkill(index);
      });
    });
  }

  useSkill(skillIndex) {
    const skill = this.skills[skillIndex];

    if (!skill.isReady) {
      console.log(`${skill.name} is on cooldown!`);
      return;
    }

    // 使用技能
    console.log(`Used ${skill.name}! Cooldown: ${skill.cooldown / 1000}s`);
    skill.isReady = false;
    skill.currentCooldown = skill.cooldown;
    this.totalSkillsUsed++;
    this.statusText.setText(`Skills Used: ${this.totalSkillsUsed}`);

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isReady = true;
        skill.currentCooldown = 0;
        this.drawSkillIcon(skillIndex);
        this.cooldownTexts[skillIndex].setText(`CD: ${(skill.cooldown / 1000).toFixed(1)}s`);
        this.cooldownTexts[skillIndex].setColor('#00ff00');
        console.log(`${skill.name} is ready!`);
      },
      callbackScope: this
    });

    // 立即更新显示
    this.drawSkillIcon(skillIndex);
  }

  drawSkillIcon(skillIndex) {
    const skill = this.skills[skillIndex];
    const graphics = this.skillGraphics[skillIndex];
    const skillSize = 80;

    graphics.clear();

    if (skill.isReady) {
      // 技能就绪 - 绿色边框，蓝色填充
      graphics.fillStyle(0x0066cc, 1);
      graphics.fillRoundedRect(-skillSize / 2, -skillSize / 2, skillSize, skillSize, 8);
      graphics.lineStyle(3, 0x00ff00, 1);
      graphics.strokeRoundedRect(-skillSize / 2, -skillSize / 2, skillSize, skillSize, 8);
    } else {
      // 技能冷却中 - 红色边框，灰色填充
      graphics.fillStyle(0x333333, 1);
      graphics.fillRoundedRect(-skillSize / 2, -skillSize / 2, skillSize, skillSize, 8);
      graphics.lineStyle(3, 0xff0000, 1);
      graphics.strokeRoundedRect(-skillSize / 2, -skillSize / 2, skillSize, skillSize, 8);

      // 绘制冷却进度（扇形遮罩）
      const progress = skill.currentCooldown / skill.cooldown;
      if (progress > 0) {
        graphics.fillStyle(0x000000, 0.7);
        graphics.slice(0, 0, skillSize / 2, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + 360 * progress), false);
        graphics.fillPath();
      }
    }

    // 绘制技能编号
    graphics.fillStyle(0xffffff, 1);
    const fontSize = 24;
    // 使用简单的数字标识
    const label = (skillIndex + 1).toString();
    graphics.fillCircle(0, 0, 15);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(0, 0, 12);
  }

  update(time, delta) {
    // 更新所有冷却中的技能显示
    this.skills.forEach((skill, index) => {
      if (!skill.isReady && skill.timer) {
        // 计算剩余冷却时间
        const elapsed = skill.timer.getElapsed();
        skill.currentCooldown = skill.cooldown - elapsed;

        if (skill.currentCooldown < 0) {
          skill.currentCooldown = 0;
        }

        // 更新冷却文本
        const remainingSeconds = (skill.currentCooldown / 1000).toFixed(1);
        this.cooldownTexts[index].setText(`CD: ${remainingSeconds}s`);
        this.cooldownTexts[index].setColor('#ff6600');

        // 更新图标显示
        this.drawSkillIcon(index);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillSystemScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);