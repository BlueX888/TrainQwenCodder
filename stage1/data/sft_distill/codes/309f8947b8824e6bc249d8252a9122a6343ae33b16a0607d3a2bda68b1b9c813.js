const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量（可验证）
let totalSkillsUsed = 0;
let skillUsageCount = Array(15).fill(0);

// 技能系统类
class Skill {
  constructor(scene, id, x, y, baseCooldown) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = 45;
    this.cooldown = baseCooldown * (id + 1); // 递增冷却时间
    this.remainingTime = 0;
    this.isOnCooldown = false;
    this.timer = null;
    
    // 创建图形元素
    this.createGraphics();
  }
  
  createGraphics() {
    // 技能背景框
    this.bgGraphics = this.scene.add.graphics();
    this.bgGraphics.lineStyle(2, 0x00ff00, 1);
    this.bgGraphics.strokeRect(this.x, this.y, this.size, this.size);
    
    // 技能图标（使用不同颜色区分）
    this.iconGraphics = this.scene.add.graphics();
    const hue = (this.id * 24) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9);
    const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
    this.iconGraphics.fillStyle(hexColor, 1);
    this.iconGraphics.fillCircle(
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.size / 3
    );
    
    // 冷却遮罩
    this.cooldownGraphics = this.scene.add.graphics();
    
    // 技能ID文本
    this.idText = this.scene.add.text(
      this.x + this.size / 2,
      this.y + this.size / 2,
      (this.id + 1).toString(),
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // 冷却时间文本
    this.cooldownText = this.scene.add.text(
      this.x + this.size / 2,
      this.y + this.size + 5,
      `${this.cooldown.toFixed(1)}s`,
      {
        fontSize: '10px',
        color: '#aaaaaa'
      }
    ).setOrigin(0.5, 0);
    
    // 剩余时间文本
    this.remainingText = this.scene.add.text(
      this.x + this.size / 2,
      this.y + this.size / 2 + 15,
      '',
      {
        fontSize: '12px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  }
  
  use() {
    if (this.isOnCooldown) {
      return false;
    }
    
    this.isOnCooldown = true;
    this.remainingTime = this.cooldown;
    
    // 增加使用统计
    totalSkillsUsed++;
    skillUsageCount[this.id]++;
    
    // 启动冷却计时器
    if (this.timer) {
      this.timer.destroy();
    }
    
    this.timer = this.scene.time.addEvent({
      delay: this.cooldown * 1000,
      callback: () => {
        this.isOnCooldown = false;
        this.remainingTime = 0;
        this.updateDisplay();
      }
    });
    
    this.updateDisplay();
    return true;
  }
  
  updateDisplay() {
    // 清除冷却遮罩
    this.cooldownGraphics.clear();
    
    if (this.isOnCooldown) {
      // 计算冷却进度
      const progress = this.remainingTime / this.cooldown;
      
      // 绘制半透明黑色遮罩
      this.cooldownGraphics.fillStyle(0x000000, 0.7);
      this.cooldownGraphics.fillRect(
        this.x,
        this.y,
        this.size,
        this.size * progress
      );
      
      // 显示剩余时间
      this.remainingText.setText(this.remainingTime.toFixed(1));
      this.remainingText.setVisible(true);
      
      // 边框变红
      this.bgGraphics.clear();
      this.bgGraphics.lineStyle(2, 0xff0000, 1);
      this.bgGraphics.strokeRect(this.x, this.y, this.size, this.size);
    } else {
      this.remainingText.setVisible(false);
      
      // 边框变绿
      this.bgGraphics.clear();
      this.bgGraphics.lineStyle(2, 0x00ff00, 1);
      this.bgGraphics.strokeRect(this.x, this.y, this.size, this.size);
    }
  }
  
  update(delta) {
    if (this.isOnCooldown) {
      this.remainingTime = Math.max(0, this.remainingTime - delta / 1000);
      this.updateDisplay();
    }
  }
}

let skills = [];
let statusText;
let instructionText;

function preload() {
  // 无需预加载资源
}

function create() {
  // 标题
  this.add.text(400, 20, 'Multi-Skill System (15 Skills)', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建15个技能（3x5网格布局）
  const startX = 150;
  const startY = 80;
  const gapX = 80;
  const gapY = 90;
  const cols = 5;
  
  for (let i = 0; i < 15; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * gapX;
    const y = startY + row * gapY;
    
    const skill = new Skill(this, i, x, y, 2.5);
    skills.push(skill);
  }
  
  // 键位映射说明
  instructionText = this.add.text(400, 400, 
    'Press Keys:\n' +
    '1-5: Skills 1-5\n' +
    '6-9,0: Skills 6-10\n' +
    'Q-E: Skills 11-13\n' +
    'R-T: Skills 14-15',
    {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 5
    }
  ).setOrigin(0.5);
  
  // 状态显示
  statusText = this.add.text(400, 520, '', {
    fontSize: '16px',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 详细统计
  this.detailText = this.add.text(400, 550, '', {
    fontSize: '12px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 键盘输入映射
  const keyMappings = {
    'ONE': 0, 'TWO': 1, 'THREE': 2, 'FOUR': 3, 'FIVE': 4,
    'SIX': 5, 'SEVEN': 6, 'EIGHT': 7, 'NINE': 8, 'ZERO': 9,
    'Q': 10, 'W': 11, 'E': 12, 'R': 13, 'T': 14
  };
  
  // 绑定所有按键
  Object.keys(keyMappings).forEach(keyName => {
    const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.Keys[keyName]);
    key.on('down', () => {
      const skillIndex = keyMappings[keyName];
      if (skills[skillIndex]) {
        const success = skills[skillIndex].use();
        if (success) {
          // 技能使用成功的视觉反馈
          this.cameras.main.shake(100, 0.002);
        }
      }
    });
  });
  
  // 更新状态显示
  updateStatus.call(this);
}

function update(time, delta) {
  // 更新所有技能
  skills.forEach(skill => {
    skill.update(delta);
  });
  
  // 更新状态显示
  updateStatus.call(this);
}

function updateStatus() {
  // 计算冷却中的技能数量
  const onCooldown = skills.filter(s => s.isOnCooldown).length;
  const available = 15 - onCooldown;
  
  statusText.setText(
    `Total Skills Used: ${totalSkillsUsed} | Available: ${available}/15 | On Cooldown: ${onCooldown}`
  );
  
  // 显示使用次数最多的技能
  const maxUsage = Math.max(...skillUsageCount);
  if (maxUsage > 0) {
    const mostUsedSkills = skillUsageCount
      .map((count, index) => ({ id: index + 1, count }))
      .filter(s => s.count === maxUsage)
      .map(s => `#${s.id}`)
      .join(', ');
    
    this.detailText.setText(
      `Most Used Skill(s): ${mostUsedSkills} (${maxUsage} times)`
    );
  }
}

new Phaser.Game(config);