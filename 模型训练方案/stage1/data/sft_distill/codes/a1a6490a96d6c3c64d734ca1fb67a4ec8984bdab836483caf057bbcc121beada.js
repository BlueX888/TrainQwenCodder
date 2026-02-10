class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.skillKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
                      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  }

  preload() {
    // 程序化生成技能图标纹理
    this.createSkillTextures();
  }

  createSkillTextures() {
    // 创建可用状态的技能图标
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(30, 30, 28);
    graphics.lineStyle(3, 0x00aa00, 1);
    graphics.strokeCircle(30, 30, 28);
    graphics.generateTexture('skill_ready', 60, 60);
    graphics.clear();

    // 创建冷却中的技能图标
    graphics.fillStyle(0x666666, 1);
    graphics.fillCircle(30, 30, 28);
    graphics.lineStyle(3, 0x333333, 1);
    graphics.strokeCircle(30, 30, 28);
    graphics.generateTexture('skill_cooldown', 60, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题
    this.add.text(400, 20, 'Multi-Skill System (20 Skills)', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press keys 1-0, Q-P to use skills', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始化20个技能
    this.initializeSkills();

    // 创建技能UI
    this.createSkillUI();

    // 设置键盘输入
    this.setupKeyboardInput();

    // 添加状态显示
    this.statusText = this.add.text(400, 560, 'Skills Ready: 20 | Skills on Cooldown: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  initializeSkills() {
    for (let i = 0; i < 20; i++) {
      const skill = {
        id: i,
        name: `Skill ${this.skillKeys[i]}`,
        key: this.skillKeys[i],
        baseCooldown: 2.5 + (i * 0.5), // 2.5秒基准，每个技能递增0.5秒
        currentCooldown: 0,
        isReady: true,
        timerEvent: null,
        // UI元素
        container: null,
        icon: null,
        cooldownOverlay: null,
        cooldownText: null,
        keyText: null,
        nameText: null
      };
      this.skills.push(skill);
    }
  }

  createSkillUI() {
    const startX = 50;
    const startY = 100;
    const skillSize = 60;
    const spacing = 10;
    const skillsPerRow = 10;

    this.skills.forEach((skill, index) => {
      const row = Math.floor(index / skillsPerRow);
      const col = index % skillsPerRow;
      const x = startX + col * (skillSize + spacing);
      const y = startY + row * (skillSize + spacing + 60);

      // 创建容器
      skill.container = this.add.container(x, y);

      // 技能图标
      skill.icon = this.add.sprite(0, 0, 'skill_ready');
      skill.container.add(skill.icon);

      // 冷却遮罩（扇形进度）
      skill.cooldownOverlay = this.add.graphics();
      skill.container.add(skill.cooldownOverlay);

      // 冷却时间文本
      skill.cooldownText = this.add.text(0, 0, '', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      skill.container.add(skill.cooldownText);

      // 按键提示
      skill.keyText = this.add.text(0, -35, skill.key, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      skill.container.add(skill.keyText);

      // 技能名称和冷却时间
      skill.nameText = this.add.text(0, 40, `CD: ${skill.baseCooldown.toFixed(1)}s`, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      skill.container.add(skill.nameText);
    });
  }

  setupKeyboardInput() {
    // 为每个技能设置键盘监听
    this.skills.forEach(skill => {
      const key = this.input.keyboard.addKey(skill.key);
      key.on('down', () => this.useSkill(skill));
    });
  }

  useSkill(skill) {
    if (!skill.isReady) {
      // 技能正在冷却中
      this.showSkillFeedback(skill, false);
      return;
    }

    // 使用技能
    skill.isReady = false;
    skill.currentCooldown = skill.baseCooldown;
    
    // 显示技能使用反馈
    this.showSkillFeedback(skill, true);

    // 更新图标
    skill.icon.setTexture('skill_cooldown');

    // 创建冷却计时器
    skill.timerEvent = this.time.addEvent({
      delay: 100, // 每100ms更新一次
      callback: () => {
        skill.currentCooldown -= 0.1;
        
        if (skill.currentCooldown <= 0) {
          // 冷却完成
          skill.currentCooldown = 0;
          skill.isReady = true;
          skill.icon.setTexture('skill_ready');
          skill.cooldownText.setText('');
          skill.cooldownOverlay.clear();
          
          if (skill.timerEvent) {
            skill.timerEvent.destroy();
            skill.timerEvent = null;
          }

          // 显示技能就绪动画
          this.tweens.add({
            targets: skill.icon,
            scale: { from: 1.2, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
          });
        }
      },
      loop: true
    });
  }

  showSkillFeedback(skill, success) {
    if (success) {
      // 成功使用技能的反馈
      const flash = this.add.graphics();
      flash.fillStyle(0x00ff00, 0.5);
      flash.fillCircle(skill.container.x, skill.container.y, 35);
      
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => flash.destroy()
      });

      // 图标缩放动画
      this.tweens.add({
        targets: skill.icon,
        scale: { from: 0.9, to: 1 },
        duration: 150,
        yoyo: true
      });
    } else {
      // 技能冷却中的反馈
      this.tweens.add({
        targets: skill.container,
        x: skill.container.x + 5,
        duration: 50,
        yoyo: true,
        repeat: 2
      });
    }
  }

  update(time, delta) {
    let readyCount = 0;
    let cooldownCount = 0;

    // 更新所有技能的冷却显示
    this.skills.forEach(skill => {
      if (skill.isReady) {
        readyCount++;
      } else {
        cooldownCount++;
        
        // 更新冷却时间文本
        skill.cooldownText.setText(skill.currentCooldown.toFixed(1));

        // 绘制冷却进度（扇形遮罩）
        const progress = skill.currentCooldown / skill.baseCooldown;
        skill.cooldownOverlay.clear();
        skill.cooldownOverlay.fillStyle(0x000000, 0.7);
        
        // 绘制扇形表示冷却进度
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * progress);
        
        skill.cooldownOverlay.beginPath();
        skill.cooldownOverlay.moveTo(0, 0);
        skill.cooldownOverlay.arc(0, 0, 28, startAngle, endAngle, false);
        skill.cooldownOverlay.closePath();
        skill.cooldownOverlay.fillPath();
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Skills Ready: ${readyCount} | Skills on Cooldown: ${cooldownCount}`
    );
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

const game = new Phaser.Game(config);