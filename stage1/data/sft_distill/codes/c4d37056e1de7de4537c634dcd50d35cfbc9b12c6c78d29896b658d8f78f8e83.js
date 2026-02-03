const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号记录
window.__signals__ = {
  skillsUsed: [],
  cooldownStates: [],
  timestamp: Date.now()
};

// 技能数据
const SKILLS = [];
for (let i = 0; i < 10; i++) {
  SKILLS.push({
    id: i,
    name: `Skill ${i + 1}`,
    cooldown: (i + 1) * 1000, // 1秒到10秒
    key: i === 9 ? '0' : `${i + 1}`, // 1-9键和0键
    isReady: true,
    currentCooldown: 0,
    graphics: null,
    progressBar: null,
    text: null,
    cooldownText: null
  });
}

let scene;
let keys = {};

function preload() {
  scene = this;
}

function create() {
  // 标题
  const title = this.add.text(400, 30, 'Multi-Skill System (Press 1-0 to use skills)', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 说明文字
  const instruction = this.add.text(400, 60, 'Each skill has different cooldown (1s - 10s)', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);

  // 创建技能UI
  const startX = 50;
  const startY = 120;
  const skillWidth = 70;
  const skillHeight = 70;
  const gap = 5;

  SKILLS.forEach((skill, index) => {
    const x = startX + (skillWidth + gap) * index;
    const y = startY;

    // 技能背景框
    const bg = this.add.graphics();
    bg.fillStyle(0x444444, 1);
    bg.fillRoundedRect(x, y, skillWidth, skillHeight, 5);

    // 技能图标（使用不同颜色区分）
    const iconGraphics = this.add.graphics();
    const hue = (index * 36) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9);
    const colorInt = Phaser.Display.Color.GetColor(color.r * 255, color.g * 255, color.b * 255);
    
    iconGraphics.fillStyle(colorInt, 1);
    iconGraphics.fillRoundedRect(x + 10, y + 10, 50, 50, 3);
    skill.graphics = iconGraphics;

    // 冷却遮罩
    const cooldownMask = this.add.graphics();
    cooldownMask.fillStyle(0x000000, 0.7);
    skill.progressBar = cooldownMask;

    // 技能按键文字
    const keyText = this.add.text(x + skillWidth / 2, y + skillHeight / 2, skill.key, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    keyText.setOrigin(0.5);
    skill.text = keyText;

    // 冷却时间文字
    const cooldownText = this.add.text(x + skillWidth / 2, y + skillHeight / 2, '', {
      fontSize: '20px',
      color: '#ff6666',
      fontStyle: 'bold'
    });
    cooldownText.setOrigin(0.5);
    cooldownText.setVisible(false);
    skill.cooldownText = cooldownText;

    // 技能名称和冷却时间
    const nameText = this.add.text(x + skillWidth / 2, y + skillHeight + 10, skill.name, {
      fontSize: '12px',
      color: '#ffffff'
    });
    nameText.setOrigin(0.5, 0);

    const cdInfo = this.add.text(x + skillWidth / 2, y + skillHeight + 25, `CD: ${skill.cooldown / 1000}s`, {
      fontSize: '10px',
      color: '#aaaaaa'
    });
    cdInfo.setOrigin(0.5, 0);
  });

  // 状态显示区域
  const statusY = 250;
  this.add.text(50, statusY, 'Status Log:', {
    fontSize: '18px',
    color: '#ffffff',
    fontStyle: 'bold'
  });

  const logText = this.add.text(50, statusY + 30, '', {
    fontSize: '14px',
    color: '#00ff00',
    wordWrap: { width: 700 }
  });

  // 统计信息
  const statsText = this.add.text(50, statusY + 200, '', {
    fontSize: '14px',
    color: '#ffff00'
  });

  // 保存引用
  this.logText = logText;
  this.statsText = statsText;
  this.logMessages = [];

  // 注册键盘输入
  keys = {
    ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    SIX: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
    SEVEN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
    EIGHT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
    NINE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NINE),
    ZERO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO)
  };

  // 绑定技能使用事件
  const keyMap = [keys.ONE, keys.TWO, keys.THREE, keys.FOUR, keys.FIVE, 
                  keys.SIX, keys.SEVEN, keys.EIGHT, keys.NINE, keys.ZERO];

  keyMap.forEach((key, index) => {
    key.on('down', () => {
      useSkill(index);
    });
  });

  // 添加日志函数
  this.addLog = function(message) {
    this.logMessages.unshift(message);
    if (this.logMessages.length > 8) {
      this.logMessages.pop();
    }
    this.logText.setText(this.logMessages.join('\n'));
  };

  this.addLog('System initialized. Press 1-0 to use skills!');
}

function useSkill(skillIndex) {
  const skill = SKILLS[skillIndex];
  
  if (!skill.isReady) {
    scene.addLog(`⚠ ${skill.name} is on cooldown! (${(skill.currentCooldown / 1000).toFixed(1)}s remaining)`);
    return;
  }

  // 使用技能
  skill.isReady = false;
  skill.currentCooldown = skill.cooldown;

  // 记录信号
  window.__signals__.skillsUsed.push({
    skillId: skill.id,
    skillName: skill.name,
    timestamp: Date.now(),
    cooldown: skill.cooldown
  });

  scene.addLog(`✓ Used ${skill.name}! Cooldown: ${skill.cooldown / 1000}s`);

  // 视觉反馈 - 闪烁效果
  scene.tweens.add({
    targets: skill.graphics,
    alpha: 0.3,
    duration: 100,
    yoyo: true,
    repeat: 2
  });

  // 显示冷却文字
  skill.text.setVisible(false);
  skill.cooldownText.setVisible(true);

  // 创建冷却计时器
  const timer = scene.time.addEvent({
    delay: 100,
    callback: () => {
      skill.currentCooldown -= 100;
      
      if (skill.currentCooldown <= 0) {
        skill.isReady = true;
        skill.currentCooldown = 0;
        skill.text.setVisible(true);
        skill.cooldownText.setVisible(false);
        scene.addLog(`✓ ${skill.name} is ready!`);
        timer.destroy();
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // 更新所有技能的冷却显示
  SKILLS.forEach((skill, index) => {
    const x = 50 + (70 + 5) * index;
    const y = 120;
    const skillWidth = 70;
    const skillHeight = 70;

    // 清除之前的遮罩
    skill.progressBar.clear();

    if (!skill.isReady && skill.currentCooldown > 0) {
      // 计算冷却进度
      const progress = skill.currentCooldown / skill.cooldown;
      const maskHeight = skillHeight * progress;

      // 绘制冷却遮罩（从上到下）
      skill.progressBar.fillStyle(0x000000, 0.7);
      skill.progressBar.fillRoundedRect(x + 10, y + 10, 50, maskHeight * 0.8, 3);

      // 更新冷却时间文字
      skill.cooldownText.setText((skill.currentCooldown / 1000).toFixed(1));
    }
  });

  // 更新统计信息
  const readyCount = SKILLS.filter(s => s.isReady).length;
  const cooldownCount = SKILLS.length - readyCount;
  
  scene.statsText.setText(
    `Statistics:\n` +
    `Ready Skills: ${readyCount}/10\n` +
    `Cooling Down: ${cooldownCount}/10\n` +
    `Total Uses: ${window.__signals__.skillsUsed.length}`
  );

  // 更新冷却状态信号（每秒一次）
  if (!this.lastSignalUpdate || time - this.lastSignalUpdate > 1000) {
    this.lastSignalUpdate = time;
    window.__signals__.cooldownStates.push({
      timestamp: Date.now(),
      ready: readyCount,
      cooldown: cooldownCount,
      skills: SKILLS.map(s => ({
        id: s.id,
        isReady: s.isReady,
        remainingCooldown: s.currentCooldown
      }))
    });

    // 限制信号数组大小
    if (window.__signals__.cooldownStates.length > 100) {
      window.__signals__.cooldownStates.shift();
    }
  }
}

new Phaser.Game(config);