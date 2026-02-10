class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.skillStates = {}; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    this.add.text(400, 20, 'Multi-Skill Cooldown System', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 50, 'Press 1-9, 0, Q-J to activate skills', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 技能按键映射
    const keyMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

    // 创建20个技能
    const cols = 10;
    const rows = 2;
    const skillSize = 60;
    const spacing = 10;
    const startX = 50;
    const startY = 100;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (skillSize + spacing);
      const y = startY + row * (skillSize + spacing + 40);

      // 技能冷却时间：2.5秒基准，每个技能递增0.5秒
      const cooldownTime = 2.5 + i * 0.5;

      const skill = {
        id: i,
        key: keyMap[i],
        x: x,
        y: y,
        size: skillSize,
        cooldownTime: cooldownTime * 1000, // 转换为毫秒
        remainingTime: 0,
        isOnCooldown: false,
        activations: 0 // 状态追踪
      };

      // 创建技能图标背景
      const iconBg = this.add.graphics();
      iconBg.fillStyle(0x2d4059, 1);
      iconBg.fillRoundedRect(x, y, skillSize, skillSize, 8);
      skill.iconBg = iconBg;

      // 创建技能图标（程序化生成不同颜色）
      const hue = (i * 18) % 360;
      const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.7, 0.9);
      const iconColor = Phaser.Display.Color.GetColor(
        Math.floor(color.r * 255),
        Math.floor(color.g * 255),
        Math.floor(color.b * 255)
      );

      const icon = this.add.graphics();
      icon.fillStyle(iconColor, 1);
      icon.fillCircle(x + skillSize / 2, y + skillSize / 2, 20);
      icon.lineStyle(3, 0xffffff, 0.8);
      icon.strokeCircle(x + skillSize / 2, y + skillSize / 2, 20);
      skill.icon = icon;

      // 创建冷却遮罩
      const cooldownMask = this.add.graphics();
      skill.cooldownMask = cooldownMask;

      // 创建按键文本
      const keyText = this.add.text(x + 5, y + 5, keyMap[i], {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      });
      skill.keyText = keyText;

      // 创建冷却时间文本
      const cooldownText = this.add.text(x + skillSize / 2, y + skillSize / 2, '', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      skill.cooldownText = cooldownText;

      // 创建技能信息文本
      const infoText = this.add.text(x + skillSize / 2, y + skillSize + 5, 
        `CD: ${cooldownTime.toFixed(1)}s`, {
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5, 0);
      skill.infoText = infoText;

      // 创建激活次数文本
      const activationText = this.add.text(x + skillSize / 2, y + skillSize + 20, 
        'Used: 0', {
        fontSize: '10px',
        color: '#888888'
      }).setOrigin(0.5, 0);
      skill.activationText = activationText;

      this.skills.push(skill);
      this.skillStates[`skill_${i}`] = {
        cooldown: cooldownTime,
        activations: 0,
        isReady: true
      };
    }

    // 设置键盘输入
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toUpperCase();
      const skill = this.skills.find(s => s.key === key);
      
      if (skill && !skill.isOnCooldown) {
        this.activateSkill(skill);
      }
    });

    // 状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '14px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 统计信息
    this.statsText = this.add.text(10, 570, 'Total Activations: 0 | Ready Skills: 20/20', {
      fontSize: '12px',
      color: '#ffffff'
    });

    this.updateStats();
  }

  activateSkill(skill) {
    if (skill.isOnCooldown) return;

    // 激活技能
    skill.isOnCooldown = true;
    skill.remainingTime = skill.cooldownTime;
    skill.activations++;

    // 更新状态信号
    this.skillStates[`skill_${skill.id}`].activations++;
    this.skillStates[`skill_${skill.id}`].isReady = false;

    // 视觉反馈：闪烁效果
    this.tweens.add({
      targets: skill.icon,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 更新激活次数显示
    skill.activationText.setText(`Used: ${skill.activations}`);

    // 显示状态消息
    this.statusText.setText(`Skill ${skill.key} activated! (${(skill.cooldownTime / 1000).toFixed(1)}s cooldown)`);
    this.statusText.setColor('#00ff00');

    // 创建冷却计时器
    const timer = this.time.addEvent({
      delay: skill.cooldownTime,
      callback: () => {
        skill.isOnCooldown = false;
        skill.remainingTime = 0;
        this.skillStates[`skill_${skill.id}`].isReady = true;
        
        // 技能就绪视觉反馈
        this.tweens.add({
          targets: skill.icon,
          scale: 1.2,
          duration: 150,
          yoyo: true
        });

        this.updateStats();
      },
      callbackScope: this
    });

    this.updateStats();
  }

  update(time, delta) {
    // 更新所有技能的冷却显示
    this.skills.forEach(skill => {
      if (skill.isOnCooldown) {
        skill.remainingTime = Math.max(0, skill.remainingTime - delta);
        
        // 计算冷却进度
        const progress = 1 - (skill.remainingTime / skill.cooldownTime);
        
        // 绘制冷却遮罩
        skill.cooldownMask.clear();
        skill.cooldownMask.fillStyle(0x000000, 0.7);
        
        if (progress < 1) {
          // 绘制扇形遮罩（从上方开始顺时针）
          const centerX = skill.x + skill.size / 2;
          const centerY = skill.y + skill.size / 2;
          const radius = skill.size / 2;
          const startAngle = -Math.PI / 2; // 从顶部开始
          const endAngle = startAngle + (1 - progress) * Math.PI * 2;

          skill.cooldownMask.beginPath();
          skill.cooldownMask.moveTo(centerX, centerY);
          skill.cooldownMask.arc(centerX, centerY, radius, startAngle, endAngle, false);
          skill.cooldownMask.closePath();
          skill.cooldownMask.fillPath();
        }

        // 显示剩余时间
        const remainingSeconds = skill.remainingTime / 1000;
        skill.cooldownText.setText(remainingSeconds.toFixed(1));
        skill.cooldownText.setVisible(true);
        
        // 图标变暗
        skill.icon.setAlpha(0.5);
      } else {
        skill.cooldownMask.clear();
        skill.cooldownText.setVisible(false);
        skill.icon.setAlpha(1);
      }
    });
  }

  updateStats() {
    const totalActivations = this.skills.reduce((sum, skill) => sum + skill.activations, 0);
    const readySkills = this.skills.filter(skill => !skill.isOnCooldown).length;
    
    this.statsText.setText(
      `Total Activations: ${totalActivations} | Ready Skills: ${readySkills}/20`
    );

    // 如果有技能在冷却中，更新状态文本颜色
    if (readySkills < 20) {
      this.statusText.setColor('#ffaa00');
    } else {
      this.statusText.setColor('#00ff00');
      this.statusText.setText('All skills ready!');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillSystem,
  parent: 'game-container'
};

new Phaser.Game(config);