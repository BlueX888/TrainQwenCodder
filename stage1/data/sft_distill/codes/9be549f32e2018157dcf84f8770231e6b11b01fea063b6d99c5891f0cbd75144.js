class SkillSystemScene extends Phaser.Scene {
  constructor() {
    super('SkillSystemScene');
    this.skills = [];
    this.skillGraphics = [];
    this.cooldownTexts = [];
    this.totalSkillsUsed = 0; // 可验证状态
    this.activeCooldowns = 0; // 可验证状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 20, '多技能冷却系统 (20 Skills)', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文字
    this.add.text(400, 50, '按键: 1-9, 0, Q-J 触发对应技能', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始化20个技能
    const keyMap = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
                    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    
    for (let i = 0; i < 20; i++) {
      const cooldownTime = 4000 + i * 500; // 4s, 4.5s, 5s ... 13.5s
      this.skills.push({
        id: i,
        name: `Skill ${i + 1}`,
        key: keyMap[i],
        cooldown: cooldownTime,
        isOnCooldown: false,
        cooldownProgress: 0,
        timer: null,
        usedCount: 0
      });
    }

    // 绘制技能网格 (4列 x 5行)
    const startX = 100;
    const startY = 100;
    const skillSize = 70;
    const padding = 20;
    const cols = 4;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (skillSize + padding);
      const y = startY + row * (skillSize + padding);

      this.createSkillDisplay(x, y, skillSize, i);
    }

    // 设置键盘输入
    this.setupInput();

    // 创建状态显示
    this.statsText = this.add.text(20, 550, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.updateStatsDisplay();
  }

  createSkillDisplay(x, y, size, index) {
    const skill = this.skills[index];
    const graphics = this.add.graphics();

    // 存储位置信息
    skill.displayX = x;
    skill.displayY = y;
    skill.displaySize = size;

    // 绘制技能背景框
    graphics.fillStyle(0x2a2a3e, 1);
    graphics.fillRoundedRect(x, y, size, size, 5);
    
    // 绘制边框
    graphics.lineStyle(2, 0x4a4a6e, 1);
    graphics.strokeRoundedRect(x, y, size, size, 5);

    // 绘制技能图标（简单几何形状）
    const iconColor = this.getSkillColor(index);
    graphics.fillStyle(iconColor, 1);
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 根据索引绘制不同形状
    if (index % 3 === 0) {
      graphics.fillCircle(centerX, centerY, 15);
    } else if (index % 3 === 1) {
      graphics.fillRect(centerX - 15, centerY - 15, 30, 30);
    } else {
      graphics.fillTriangle(
        centerX, centerY - 15,
        centerX - 15, centerY + 15,
        centerX + 15, centerY + 15
      );
    }

    // 按键文字
    const keyText = this.add.text(x + 5, y + 5, skill.key, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 冷却时间文字
    const cooldownText = this.add.text(centerX, y + size - 10, 
      `${(skill.cooldown / 1000).toFixed(1)}s`, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 冷却遮罩图层
    const maskGraphics = this.add.graphics();
    maskGraphics.setDepth(1);

    // 使用次数文字
    const usedText = this.add.text(x + size - 5, y + 5, '0', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(1, 0);

    this.skillGraphics.push({
      base: graphics,
      mask: maskGraphics,
      keyText: keyText,
      cooldownText: cooldownText,
      usedText: usedText
    });
  }

  getSkillColor(index) {
    const colors = [
      0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24,
      0x6c5ce7, 0xfd79a8, 0xfdcb6e, 0x00b894,
      0xff7675, 0x74b9ff, 0xa29bfe, 0xfd79a8,
      0xe17055, 0x00cec9, 0x0984e3, 0xfab1a0,
      0x6c5ce7, 0xe84393, 0xfdcb6e, 0x55efc4
    ];
    return colors[index % colors.length];
  }

  setupInput() {
    const keyMap = {
      'ONE': 0, 'TWO': 1, 'THREE': 2, 'FOUR': 3, 'FIVE': 4,
      'SIX': 5, 'SEVEN': 6, 'EIGHT': 7, 'NINE': 8, 'ZERO': 9,
      'Q': 10, 'W': 11, 'E': 12, 'R': 13, 'T': 14,
      'Y': 15, 'U': 16, 'I': 17, 'O': 18, 'P': 19
    };

    Object.keys(keyMap).forEach(keyCode => {
      this.input.keyboard.on(`keydown-${keyCode}`, () => {
        this.activateSkill(keyMap[keyCode]);
      });
    });
  }

  activateSkill(index) {
    const skill = this.skills[index];
    
    if (skill.isOnCooldown) {
      // 技能冷却中，闪烁提示
      this.flashSkill(index);
      return;
    }

    // 激活技能
    skill.isOnCooldown = true;
    skill.cooldownProgress = 0;
    skill.usedCount++;
    this.totalSkillsUsed++;
    this.activeCooldowns++;

    // 更新使用次数显示
    this.skillGraphics[index].usedText.setText(skill.usedCount.toString());

    // 播放激活动画
    this.playActivationEffect(index);

    // 启动冷却计时器
    const startTime = this.time.now;
    skill.timer = this.time.addEvent({
      delay: 50, // 每50ms更新一次进度
      callback: () => {
        const elapsed = this.time.now - startTime;
        skill.cooldownProgress = Math.min(elapsed / skill.cooldown, 1);
        
        this.updateSkillCooldownDisplay(index);

        if (skill.cooldownProgress >= 1) {
          // 冷却完成
          skill.isOnCooldown = false;
          skill.cooldownProgress = 0;
          this.activeCooldowns--;
          
          if (skill.timer) {
            skill.timer.destroy();
            skill.timer = null;
          }
          
          this.updateSkillCooldownDisplay(index);
          this.playReadyEffect(index);
        }
      },
      loop: true
    });

    this.updateStatsDisplay();
  }

  updateSkillCooldownDisplay(index) {
    const skill = this.skills[index];
    const graphics = this.skillGraphics[index];
    const { displayX, displayY, displaySize } = skill;

    // 清除之前的遮罩
    graphics.mask.clear();

    if (skill.isOnCooldown) {
      // 绘制冷却遮罩（从上到下的渐变遮罩）
      const maskHeight = displaySize * skill.cooldownProgress;
      
      graphics.mask.fillStyle(0x000000, 0.7);
      graphics.mask.fillRect(displayX, displayY, displaySize, maskHeight);

      // 绘制进度条
      const barWidth = displaySize - 10;
      const barHeight = 4;
      const barX = displayX + 5;
      const barY = displayY + displaySize - 20;

      graphics.mask.fillStyle(0x333333, 1);
      graphics.mask.fillRect(barX, barY, barWidth, barHeight);

      graphics.mask.fillStyle(0x00ff00, 1);
      graphics.mask.fillRect(barX, barY, barWidth * skill.cooldownProgress, barHeight);

      // 显示剩余时间
      const remaining = skill.cooldown * (1 - skill.cooldownProgress) / 1000;
      graphics.cooldownText.setText(`${remaining.toFixed(1)}s`);
      graphics.cooldownText.setColor('#ff6b6b');
    } else {
      // 冷却完成，显示就绪
      graphics.cooldownText.setText('Ready!');
      graphics.cooldownText.setColor('#00ff00');
    }
  }

  playActivationEffect(index) {
    const skill = this.skills[index];
    const { displayX, displayY, displaySize } = skill;
    
    // 创建闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillRoundedRect(displayX, displayY, displaySize, displaySize, 5);
    flash.setDepth(2);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  playReadyEffect(index) {
    const skill = this.skills[index];
    const { displayX, displayY, displaySize } = skill;
    
    // 创建就绪光环效果
    const ring = this.add.graphics();
    ring.lineStyle(3, 0x00ff00, 1);
    ring.strokeRoundedRect(displayX, displayY, displaySize, displaySize, 5);
    ring.setDepth(2);

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
  }

  flashSkill(index) {
    const graphics = this.skillGraphics[index];
    
    this.tweens.add({
      targets: [graphics.base, graphics.mask],
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  updateStatsDisplay() {
    this.statsText.setText(
      `Total Skills Used: ${this.totalSkillsUsed} | ` +
      `Active Cooldowns: ${this.activeCooldowns}/20`
    );
  }

  update(time, delta) {
    // 主循环中不需要额外逻辑，计时器自动处理
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

new Phaser.Game(config);