class SkillSystem extends Phaser.Scene {
  constructor() {
    super('SkillSystem');
    this.skills = [];
    this.statusText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化技能数据
    this.skills = [
      {
        id: 1,
        name: 'Skill 1',
        key: 'Q',
        cooldown: 1000, // 1秒
        isReady: true,
        currentCooldown: 0,
        timer: null,
        x: 100,
        y: 500,
        color: 0xff4444
      },
      {
        id: 2,
        name: 'Skill 2',
        key: 'W',
        cooldown: 2000, // 2秒
        isReady: true,
        currentCooldown: 0,
        timer: null,
        x: 250,
        y: 500,
        color: 0x44ff44
      },
      {
        id: 3,
        name: 'Skill 3',
        key: 'E',
        cooldown: 3000, // 3秒
        isReady: true,
        currentCooldown: 0,
        timer: null,
        x: 400,
        y: 500,
        color: 0x4444ff
      }
    ];

    // 创建标题
    this.add.text(400, 50, 'Multi-Skill System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Press Q / W / E to use skills', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 为每个技能创建 Graphics 对象
    this.skills.forEach(skill => {
      skill.graphics = this.add.graphics();
      skill.progressGraphics = this.add.graphics();
      skill.text = this.add.text(skill.x, skill.y + 80, '', {
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
    });

    // 创建状态文本
    this.statusText = this.add.text(400, 200, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 绑定键盘输入
    this.input.keyboard.on('keydown-Q', () => this.useSkill(0));
    this.input.keyboard.on('keydown-W', () => this.useSkill(1));
    this.input.keyboard.on('keydown-E', () => this.useSkill(2));

    // 初始绘制
    this.drawSkills();

    // 创建使用记录文本
    this.usageLog = this.add.text(400, 350, 'Skill Usage Log:', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.logLines = [];
    for (let i = 0; i < 5; i++) {
      const line = this.add.text(400, 380 + i * 25, '', {
        fontSize: '14px',
        color: '#888888'
      }).setOrigin(0.5);
      this.logLines.push(line);
    }
  }

  useSkill(index) {
    const skill = this.skills[index];
    
    if (!skill.isReady) {
      this.showStatus(`${skill.name} is on cooldown!`, 0xff0000);
      return;
    }

    // 技能释放
    skill.isReady = false;
    skill.currentCooldown = skill.cooldown;
    
    this.showStatus(`${skill.name} (${skill.key}) used!`, 0x00ff00);
    this.addLog(`${skill.name} activated - ${skill.cooldown / 1000}s cooldown`);

    // 创建冷却计时器
    skill.timer = this.time.addEvent({
      delay: skill.cooldown,
      callback: () => {
        skill.isReady = true;
        skill.currentCooldown = 0;
        skill.timer = null;
        this.showStatus(`${skill.name} is ready!`, 0x00ffff);
        this.drawSkills();
      },
      callbackScope: this
    });

    this.drawSkills();
  }

  update(time, delta) {
    // 更新每个技能的冷却进度
    let needsRedraw = false;
    
    this.skills.forEach(skill => {
      if (!skill.isReady && skill.timer) {
        skill.currentCooldown = skill.cooldown - skill.timer.getElapsed();
        if (skill.currentCooldown < 0) skill.currentCooldown = 0;
        needsRedraw = true;
      }
    });

    if (needsRedraw) {
      this.drawSkills();
    }
  }

  drawSkills() {
    this.skills.forEach(skill => {
      // 清除之前的绘制
      skill.graphics.clear();
      skill.progressGraphics.clear();

      const size = 60;
      const x = skill.x;
      const y = skill.y;

      // 绘制技能图标背景
      skill.graphics.fillStyle(0x333333, 1);
      skill.graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);

      // 绘制技能颜色
      if (skill.isReady) {
        skill.graphics.fillStyle(skill.color, 1);
      } else {
        skill.graphics.fillStyle(skill.color, 0.3);
      }
      skill.graphics.fillRoundedRect(x - size / 2 + 4, y - size / 2 + 4, size - 8, size - 8, 6);

      // 绘制按键提示
      skill.graphics.fillStyle(0xffffff, 1);
      const keyText = this.add.text(x, y, skill.key, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 绘制冷却进度条
      if (!skill.isReady) {
        const progress = 1 - (skill.currentCooldown / skill.cooldown);
        const barWidth = size;
        const barHeight = 8;
        const barY = y + size / 2 + 10;

        // 背景
        skill.progressGraphics.fillStyle(0x555555, 1);
        skill.progressGraphics.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

        // 进度
        skill.progressGraphics.fillStyle(0x00ff00, 1);
        skill.progressGraphics.fillRect(x - barWidth / 2, barY, barWidth * progress, barHeight);

        // 冷却时间文本
        const remainingTime = (skill.currentCooldown / 1000).toFixed(1);
        skill.text.setText(`${remainingTime}s`);
        skill.text.setColor('#ff6666');
      } else {
        skill.text.setText('READY');
        skill.text.setColor('#00ff00');
      }

      // 绘制技能名称
      this.add.text(x, y - size / 2 - 20, skill.name, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
    });
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后清除状态
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  addLog(message) {
    // 向上滚动日志
    for (let i = this.logLines.length - 1; i > 0; i--) {
      this.logLines[i].setText(this.logLines[i - 1].text);
    }
    
    const timestamp = new Date().toLocaleTimeString();
    this.logLines[0].setText(`[${timestamp}] ${message}`);
    this.logLines[0].setColor('#ffffff');
    
    // 逐渐变暗旧日志
    for (let i = 1; i < this.logLines.length; i++) {
      const brightness = Math.max(0x44, 0xff - i * 0x33);
      this.logLines[i].setColor('#' + brightness.toString(16).repeat(3));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillSystem
};

new Phaser.Game(config);