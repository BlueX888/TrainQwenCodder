class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.totalSkillsUsed = 0; // 可验证状态
  }

  preload() {
    // 程序化生成技能图标纹理
    this.generateSkillTextures();
  }

  generateSkillTextures() {
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
      0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xff0088,
      0x88ff00, 0x0088ff, 0xff4444, 0x44ff44, 0x4444ff,
      0xffaa00, 0xaa00ff, 0x00ffaa, 0xff00aa, 0xaaff00
    ];

    for (let i = 0; i < 20; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillRoundedRect(0, 0, 60, 60, 8);
      
      // 添加技能编号
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(30, 30, 15);
      
      graphics.generateTexture(`skill_${i}`, 60, 60);
      graphics.destroy();
    }

    // 生成冷却遮罩纹理
    const maskGraphics = this.add.graphics();
    maskGraphics.fillStyle(0x000000, 0.7);
    maskGraphics.fillRoundedRect(0, 0, 60, 60, 8);
    maskGraphics.generateTexture('cooldown_mask', 60, 60);
    maskGraphics.destroy();
  }

  create() {
    // 标题
    this.add.text(400, 20, 'Multi-Skill System (20 Skills)', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 60, 'Total Skills Used: 0', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 提示信息
    this.add.text(400, 90, 'Press 1-9, 0, Q-J to use skills', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始化技能系统
    this.initializeSkills();

    // 绘制技能网格
    this.drawSkillGrid();

    // 设置键盘输入
    this.setupInput();
  }

  initializeSkills() {
    const keyMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

    for (let i = 0; i < 20; i++) {
      const skill = {
        id: i,
        name: `Skill ${i + 1}`,
        cooldown: 2.5 + i * 0.5, // 2.5s, 3.0s, 3.5s, ... 12.0s
        currentCooldown: 0,
        isReady: true,
        key: keyMap[i],
        timer: null,
        icon: null,
        mask: null,
        cooldownText: null,
        keyText: null
      };
      this.skills.push(skill);
    }
  }

  drawSkillGrid() {
    const startX = 100;
    const startY = 140;
    const spacing = 80;
    const cols = 5;

    this.skills.forEach((skill, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      // 技能图标
      skill.icon = this.add.image(x, y, `skill_${index}`);

      // 冷却遮罩（初始隐藏）
      skill.mask = this.add.image(x, y, 'cooldown_mask');
      skill.mask.setVisible(false);

      // 冷却时间文本
      skill.cooldownText = this.add.text(x, y, '', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      skill.cooldownText.setVisible(false);

      // 快捷键提示
      skill.keyText = this.add.text(x, y + 35, skill.key, {
        fontSize: '14px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5);

      // 技能名称
      this.add.text(x, y - 35, skill.name, {
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // 冷却时间显示
      this.add.text(x, y + 50, `CD: ${skill.cooldown.toFixed(1)}s`, {
        fontSize: '10px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
    });
  }

  setupInput() {
    const keyMap = {
      'ONE': 0, 'TWO': 1, 'THREE': 2, 'FOUR': 3, 'FIVE': 4,
      'SIX': 5, 'SEVEN': 6, 'EIGHT': 7, 'NINE': 8, 'ZERO': 9,
      'Q': 10, 'W': 11, 'E': 12, 'R': 13, 'T': 14,
      'Y': 15, 'U': 16, 'I': 17, 'O': 18, 'P': 19
    };

    Object.entries(keyMap).forEach(([keyCode, skillIndex]) => {
      this.input.keyboard.on(`keydown-${keyCode}`, () => {
        this.useSkill(skillIndex);
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
    console.log(`Used ${skill.name} (Cooldown: ${skill.cooldown}s)`);
    this.totalSkillsUsed++;
    this.statusText.setText(`Total Skills Used: ${this.totalSkillsUsed}`);

    // 技能特效（图标闪烁）
    this.tweens.add({
      targets: skill.icon,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // 开始冷却
    this.startCooldown(skill);
  }

  startCooldown(skill) {
    skill.isReady = false;
    skill.currentCooldown = skill.cooldown;

    // 显示冷却遮罩和文本
    skill.mask.setVisible(true);
    skill.cooldownText.setVisible(true);

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: 100, // 每 100ms 更新一次
      callback: () => {
        skill.currentCooldown -= 0.1;

        if (skill.currentCooldown <= 0) {
          // 冷却结束
          this.endCooldown(skill);
        } else {
          // 更新冷却显示
          skill.cooldownText.setText(skill.currentCooldown.toFixed(1));
          
          // 更新遮罩透明度（根据剩余时间）
          const alpha = skill.currentCooldown / skill.cooldown;
          skill.mask.setAlpha(alpha * 0.7);
        }
      },
      loop: true
    });
  }

  endCooldown(skill) {
    skill.isReady = true;
    skill.currentCooldown = 0;

    // 隐藏冷却显示
    skill.mask.setVisible(false);
    skill.cooldownText.setVisible(false);

    // 停止并销毁计时器
    if (skill.timer) {
      skill.timer.destroy();
      skill.timer = null;
    }

    // 技能就绪特效
    this.tweens.add({
      targets: skill.icon,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });

    console.log(`${skill.name} is ready!`);
  }

  update(time, delta) {
    // 主循环可用于额外的状态更新
    // 当前冷却逻辑由 TimerEvent 处理
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystem,
  parent: 'game-container'
};

new Phaser.Game(config);