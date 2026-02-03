const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  health: 8,
  maxHealth: 8,
  damageCount: 0,
  healCount: 0,
  logs: []
};

let health = 8;
const maxHealth = 8;
let healthBarGraphics;
let healthText;
let infoText;

function preload() {
  // 无需加载外部资源
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
  const instruction = this.add.text(400, 100, '点击鼠标左键扣血 | 每秒自动回复1点', {
    fontSize: '18px',
    color: '#cccccc'
  });
  instruction.setOrigin(0.5);

  // 创建血条容器
  healthBarGraphics = this.add.graphics();
  
  // 创建血量文本
  healthText = this.add.text(400, 250, `生命值: ${health}/${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
  healthText.setOrigin(0.5);

  // 创建信息文本
  infoText = this.add.text(400, 300, '', {
    fontSize: '18px',
    color: '#ffff00'
  });
  infoText.setOrigin(0.5);

  // 绘制初始血条
  drawHealthBar();

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      takeDamage();
    }
  });

  // 创建自动回血定时器（每1秒触发一次）
  this.time.addEvent({
    delay: 1000,
    callback: heal,
    callbackScope: this,
    loop: true
  });

  // 记录初始状态
  logSignal('游戏开始', { health, maxHealth });
}

function update(time, delta) {
  // 更新显示
  healthText.setText(`生命值: ${health}/${maxHealth}`);
  
  // 更新全局信号
  window.__signals__.health = health;
}

// 绘制血条函数
function drawHealthBar() {
  healthBarGraphics.clear();

  const barWidth = 50;  // 每格血条宽度
  const barHeight = 30; // 血条高度
  const gap = 5;        // 格子间隔
  const startX = 400 - (barWidth * maxHealth + gap * (maxHealth - 1)) / 2;
  const startY = 150;

  // 绘制每一格血条
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + gap);
    
    // 绘制边框
    healthBarGraphics.lineStyle(2, 0xffffff, 1);
    healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
    
    // 根据当前生命值填充颜色
    if (i < health) {
      // 有生命值的格子 - 红色渐变
      const ratio = health / maxHealth;
      let color;
      if (ratio > 0.6) {
        color = 0x00ff00; // 绿色（健康）
      } else if (ratio > 0.3) {
        color = 0xffaa00; // 橙色（警告）
      } else {
        color = 0xff0000; // 红色（危险）
      }
      healthBarGraphics.fillStyle(color, 1);
      healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    } else {
      // 空血格子 - 深灰色
      healthBarGraphics.fillStyle(0x333333, 0.5);
      healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    }
  }
}

// 扣血函数
function takeDamage() {
  if (health > 0) {
    health--;
    window.__signals__.damageCount++;
    drawHealthBar();
    infoText.setText('受到伤害！-1 HP');
    infoText.setColor('#ff0000');
    
    logSignal('受到伤害', { health, damage: 1 });
    
    if (health === 0) {
      infoText.setText('生命值耗尽！');
      logSignal('生命值耗尽', { health: 0 });
    }
  } else {
    infoText.setText('已经没有生命值了！');
  }
}

// 回血函数
function heal() {
  if (health < maxHealth) {
    health++;
    window.__signals__.healCount++;
    drawHealthBar();
    infoText.setText('自动回复！+1 HP');
    infoText.setColor('#00ff00');
    
    logSignal('自动回复', { health, heal: 1 });
  } else {
    infoText.setText('生命值已满');
    infoText.setColor('#ffffff');
  }
}

// 记录信号日志
function logSignal(event, data) {
  const logEntry = {
    timestamp: Date.now(),
    event: event,
    data: data
  };
  window.__signals__.logs.push(logEntry);
  console.log(JSON.stringify(logEntry));
}

new Phaser.Game(config);