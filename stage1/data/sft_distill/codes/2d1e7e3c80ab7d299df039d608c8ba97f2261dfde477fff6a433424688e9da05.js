const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let currentHealth = 3;
const maxHealth = 3;
let healthBars = [];
let healthText;
let healTimer;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 标题文本
  this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 健康值显示文本
  healthText = this.add.text(400, 150, `生命值: ${currentHealth}/${maxHealth}`, {
    fontSize: '24px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建3个血条方块
  const barWidth = 80;
  const barHeight = 30;
  const barSpacing = 10;
  const startX = 400 - (barWidth * maxHealth + barSpacing * (maxHealth - 1)) / 2;
  const startY = 250;

  for (let i = 0; i < maxHealth; i++) {
    const graphics = this.add.graphics();
    const x = startX + i * (barWidth + barSpacing);
    
    healthBars.push({
      graphics: graphics,
      x: x,
      y: startY,
      width: barWidth,
      height: barHeight,
      index: i
    });
  }

  // 初始化血条显示
  updateHealthBars();

  // 操作说明
  this.add.text(400, 350, '鼠标右键: 扣血', {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);

  this.add.text(400, 380, '自动回血: 每0.5秒恢复1点', {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 状态显示
  this.add.text(400, 450, '当前状态:', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      takeDamage();
    }
  });

  // 设置自动回血定时器 - 每0.5秒触发一次
  healTimer = this.time.addEvent({
    delay: 500,           // 0.5秒 = 500毫秒
    callback: autoHeal,
    callbackScope: this,
    loop: true            // 循环执行
  });
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 扣血函数
function takeDamage() {
  if (currentHealth > 0) {
    currentHealth--;
    updateHealthBars();
    updateHealthText();
    console.log(`受到伤害! 当前生命值: ${currentHealth}/${maxHealth}`);
  } else {
    console.log('生命值已为0，无法继续扣血');
  }
}

// 自动回血函数
function autoHeal() {
  if (currentHealth < maxHealth) {
    currentHealth++;
    updateHealthBars();
    updateHealthText();
    console.log(`自动回血! 当前生命值: ${currentHealth}/${maxHealth}`);
  }
}

// 更新血条显示
function updateHealthBars() {
  healthBars.forEach((bar, index) => {
    bar.graphics.clear();
    
    // 绘制边框
    bar.graphics.lineStyle(3, 0x333333, 1);
    bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
    
    // 根据当前血量决定填充颜色
    if (index < currentHealth) {
      // 有血 - 红色渐变
      const healthPercent = currentHealth / maxHealth;
      let fillColor;
      if (healthPercent > 0.6) {
        fillColor = 0x00ff00; // 绿色 - 健康
      } else if (healthPercent > 0.3) {
        fillColor = 0xffaa00; // 橙色 - 警告
      } else {
        fillColor = 0xff0000; // 红色 - 危险
      }
      bar.graphics.fillStyle(fillColor, 1);
    } else {
      // 无血 - 深灰色
      bar.graphics.fillStyle(0x444444, 0.5);
    }
    
    bar.graphics.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
  });
}

// 更新健康值文本
function updateHealthText() {
  let color = '#00ff00'; // 默认绿色
  if (currentHealth <= 1) {
    color = '#ff0000'; // 低血量红色
  } else if (currentHealth <= 2) {
    color = '#ffaa00'; // 中等血量橙色
  }
  
  healthText.setText(`生命值: ${currentHealth}/${maxHealth}`);
  healthText.setColor(color);
}

new Phaser.Game(config);