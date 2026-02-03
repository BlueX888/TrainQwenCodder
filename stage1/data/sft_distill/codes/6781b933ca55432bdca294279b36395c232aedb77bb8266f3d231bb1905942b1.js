class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.cooldownTexts = [];
    this.totalSkillsUsed = 0; // 可验证状态
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 初始化 20 个技能
    const skillKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
                       'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    
    for (let i = 0; i < 20; i++) {
      this.skills.push({
        id: i,
        name: `Skill ${i + 1}`,
        key: skillKeys[i],
        cooldown: 4000 + (i * 2000), // 基准 4 秒，每个技能递增 2 秒
        remainingTime: 0,
        isReady: true,
        lastUsedTime: 0
      });
    }

    // 绘制技能网格（4 列 x 5 行）
    const cols = 4;
    const rows = 5;
    const skillSize = 80;
    const padding = 20;
    const startX = 100;
    const startY = 80;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (skillSize + padding);
      const y = startY + row * (skillSize + padding);

      // 创建技能图标背景
      const graphics = this.add.graphics();
      graphics.x = x;
      graphics.y = y;
      this.skillGraphics.push(graphics);

      // 绘制技能边框
      this.drawSkillIcon(graphics, this.skills[i], 0);

      // 技能按键文本
      this.add.text(x + 5, y + 5, this.skills[i].key, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff'
      });

      // 技能编号
      this.add.text(x + skillSize / 2, y + skillSize / 2 - 10, `S${i + 1}`, {
        fontSize: '12px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // 冷却时间文本
      const cooldownText = this.add.text(x + skillSize / 2, y + skillSize + 5, '', {
        fontSize: '11px',
        color: '#ffff00',
        align: 'center'
      }).setOrigin(0.5);
      this.cooldownTexts.push(cooldownText);
    }

    // 标题和说明
    this.add.text(400, 20, '多技能冷却系统', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 50, '按键盘 1-0, Q-P 使用技能 | 绿色=就绪 红色=冷却中', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 状态显示
    this.statusText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 绑定键盘输入
    this.input.keyboard.on('keydown', (event) => {
      this.handleKeyPress(event.key.toUpperCase());
    });

    this.updateStatus();
  }

  update(time, delta) {
    // 更新所有技能的冷却状态
    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];
      
      if (!skill.isReady) {
        skill.remainingTime = Math.max(0, skill.cooldown - (time - skill.lastUsedTime));
        
        if (skill.remainingTime <= 0) {
          skill.isReady = true;
          skill.remainingTime = 0;
        }
      }

      // 计算冷却进度 (0-1)
      const progress = skill.isReady ? 0 : (skill.remainingTime / skill.cooldown);
      
      // 更新图标显示
      this.drawSkillIcon(this.skillGraphics[i], skill, progress);
      
      // 更新冷却时间文本
      if (skill.isReady) {
        this.cooldownTexts[i].setText(`CD: ${(skill.cooldown / 1000).toFixed(1)}s`);
        this.cooldownTexts[i].setColor('#00ff00');
      } else {
        this.cooldownTexts[i].setText(`${(skill.remainingTime / 1000).toFixed(1)}s`);
        this.cooldownTexts[i].setColor('#ff0000');
      }
    }
  }

  drawSkillIcon(graphics, skill, cooldownProgress) {
    graphics.clear();
    
    const size = 80;
    
    // 背景色（就绪=绿色，冷却=红色）
    if (skill.isReady) {
      graphics.fillStyle(0x00aa00, 0.3);
    } else {
      graphics.fillStyle(0xaa0000, 0.3);
    }
    graphics.fillRect(0, 0, size, size);

    // 边框
    graphics.lineStyle(2, skill.isReady ? 0x00ff00 : 0xff0000, 1);
    graphics.strokeRect(0, 0, size, size);

    // 冷却遮罩（从下往上）
    if (cooldownProgress > 0) {
      graphics.fillStyle(0x000000, 0.7);
      const maskHeight = size * cooldownProgress;
      graphics.fillRect(0, size - maskHeight, size, maskHeight);
    }

    // 进度条
    if (!skill.isReady) {
      const barHeight = 4;
      const barY = size - barHeight - 2;
      const barProgress = 1 - cooldownProgress;
      
      graphics.fillStyle(0x333333, 1);
      graphics.fillRect(2, barY, size - 4, barHeight);
      
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(2, barY, (size - 4) * barProgress, barHeight);
    }
  }

  handleKeyPress(key) {
    // 查找对应技能
    const skill = this.skills.find(s => s.key === key);
    
    if (!skill) return;

    if (skill.isReady) {
      // 使用技能
      this.useSkill(skill);
    } else {
      // 技能冷却中
      this.showMessage(`${skill.name} 冷却中! 剩余 ${(skill.remainingTime / 1000).toFixed(1)}s`);
    }
  }

  useSkill(skill) {
    skill.isReady = false;
    skill.lastUsedTime = this.time.now;
    skill.remainingTime = skill.cooldown;
    this.totalSkillsUsed++;

    this.showMessage(`使用 ${skill.name}! (CD: ${skill.cooldown / 1000}s)`);
    this.updateStatus();

    // 创建视觉反馈
    this.createSkillEffect(skill);
  }

  createSkillEffect(skill) {
    const cols = 4;
    const skillSize = 80;
    const padding = 20;
    const startX = 100;
    const startY = 80;
    
    const col = skill.id % cols;
    const row = Math.floor(skill.id / cols);
    const x = startX + col * (skillSize + padding) + skillSize / 2;
    const y = startY + row * (skillSize + padding) + skillSize / 2;

    // 创建爆炸效果
    const circle = this.add.graphics();
    circle.fillStyle(0xffff00, 0.8);
    circle.fillCircle(x, y, 10);

    this.tweens.add({
      targets: circle,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy()
    });
  }

  showMessage(text) {
    if (this.messageText) {
      this.messageText.destroy();
    }

    this.messageText = this.add.text(400, 500, text, {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
    });
  }

  updateStatus() {
    const readyCount = this.skills.filter(s => s.isReady).length;
    this.statusText.setText(
      `就绪技能: ${readyCount}/20 | 总使用次数: ${this.totalSkillsUsed}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillSystemScene
};

new Phaser.Game(config);