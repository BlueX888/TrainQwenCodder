const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号记录
window.__signals__ = {
  health: 15,
  maxHealth: 15,
  events: []
};

let healthBar = [];
let currentHealth = 15;
const maxHealth = 15;
let healthText;
let healTimer;
let spaceKey;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建标题文本
  const title = this.add.text(400, 50, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 创建说明文本
  const instruction = this.add.text(400, 100, '按空格键扣血 | 每4秒自动回复1点', {
    fontSize: '18px',
    color: '#cccccc'
  });
  instruction.setOrigin(0.5);

  // 创建生命值显示文本
  healthText = this.add.text(400, 150, `生命值: ${currentHealth}/${maxHealth}`, {
    fontSize: '24px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  healthText.setOrigin(0.5);

  // 创建血条容器
  const startX = 200;
  const startY = 250;
  const cellWidth = 25;
  const cellHeight = 40;
  const gap = 2;

  // 绘制15格血条
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (cellWidth + gap);
    
    // 背景框（灰色边框）
    const bg = this.add.graphics();
    bg.lineStyle(2, 0x666666, 1);
    bg.strokeRect(x, startY, cellWidth, cellHeight);
    
    // 血量填充（红色）
    const fill = this.add.graphics();
    fill.fillStyle(0xff0000, 1);
    fill.fillRect(x + 2, startY + 2, cellWidth - 4, cellHeight - 4);
    
    healthBar.push({ bg, fill, x, y: startY });
  }

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    if (currentHealth > 0) {
      currentHealth--;
      updateHealthBar(this);
      logEvent('damage', currentHealth);
    }
  });

  // 创建自动回血定时器（每4秒执行一次）
  healTimer = this.time.addEvent({
    delay: 4000,
    callback: autoHeal,
    callbackScope: this,
    loop: true
  });

  // 创建事件日志显示区域
  const logTitle = this.add.text(400, 350, '事件日志:', {
    fontSize: '20px',
    color: '#ffffff'
  });
  logTitle.setOrigin(0.5);

  // 初始化信号
  window.__signals__.health = currentHealth;
  window.__signals__.events.push({
    type: 'init',
    health: currentHealth,
    timestamp: Date.now()
  });
}

function update(time, delta) {
  // 每帧更新逻辑（本例中主要逻辑在事件驱动中）
}

// 自动回血函数
function autoHeal() {
  if (currentHealth < maxHealth) {
    currentHealth++;
    updateHealthBar(this);
    logEvent('heal', currentHealth);
  }
}

// 更新血条显示
function updateHealthBar(scene) {
  for (let i = 0; i < maxHealth; i++) {
    const cell = healthBar[i];
    cell.fill.clear();
    
    if (i < currentHealth) {
      // 有生命值：红色
      cell.fill.fillStyle(0xff0000, 1);
      cell.fill.fillRect(cell.x + 2, cell.y + 2, 23, 36);
    } else {
      // 无生命值：深灰色
      cell.fill.fillStyle(0x333333, 1);
      cell.fill.fillRect(cell.x + 2, cell.y + 2, 23, 36);
    }
  }
  
  // 更新文本显示
  healthText.setText(`生命值: ${currentHealth}/${maxHealth}`);
  
  // 根据生命值改变文本颜色
  if (currentHealth <= 3) {
    healthText.setColor('#ff0000'); // 危险：红色
  } else if (currentHealth <= 8) {
    healthText.setColor('#ffaa00'); // 警告：橙色
  } else {
    healthText.setColor('#00ff00'); // 安全：绿色
  }
  
  // 更新全局信号
  window.__signals__.health = currentHealth;
}

// 记录事件日志
function logEvent(type, health) {
  const event = {
    type: type,
    health: health,
    timestamp: Date.now()
  };
  
  window.__signals__.events.push(event);
  
  // 控制台输出JSON格式日志
  console.log(JSON.stringify(event));
  
  // 限制事件数组长度，保留最近20条
  if (window.__signals__.events.length > 20) {
    window.__signals__.events.shift();
  }
}

new Phaser.Game(config);