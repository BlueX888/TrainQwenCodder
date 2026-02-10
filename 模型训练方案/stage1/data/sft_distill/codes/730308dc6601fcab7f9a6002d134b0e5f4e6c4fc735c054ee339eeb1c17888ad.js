const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let maxHealth = 10;
let currentHealth = 10;
let healthBarGraphics;
let healthText;
let healTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建标题文本
  const title = this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 创建说明文本
  const instruction = this.add.text(400, 150, '点击鼠标左键扣血，每 0.5 秒自动回复 1 点', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);

  // 创建血条图形对象
  healthBarGraphics = this.add.graphics();

  // 创建生命值文本显示
  healthText = this.add.text(400, 350, `生命值: ${currentHealth} / ${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
  healthText.setOrigin(0.5);

  // 绘制初始血条
  drawHealthBar();

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      takeDamage(1);
    }
  });

  // 创建自动回血定时器，每 0.5 秒执行一次
  healTimer = this.time.addEvent({
    delay: 500,  // 0.5 秒
    callback: heal,
    callbackScope: this,
    loop: true
  });

  // 创建状态显示文本（用于验证）
  const statusText = this.add.text(10, 10, '状态: 运行中', {
    fontSize: '16px',
    color: '#00ff00'
  });
}

function update(time, delta) {
  // 本示例主要逻辑在事件回调中，update 可为空
}

// 绘制血条
function drawHealthBar() {
  healthBarGraphics.clear();

  const barWidth = 40;  // 每格宽度
  const barHeight = 30; // 每格高度
  const barSpacing = 5; // 格子间距
  const startX = 400 - (maxHealth * (barWidth + barSpacing) - barSpacing) / 2; // 居中
  const startY = 250;

  // 绘制所有血格
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + barSpacing);
    
    // 绘制边框
    healthBarGraphics.lineStyle(2, 0xffffff, 1);
    healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

    // 根据当前生命值填充颜色
    if (i < currentHealth) {
      // 满血格 - 红色渐变
      const gradient = i / maxHealth;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 255, g: 50, b: 50 },
        { r: 200, g: 0, b: 0 },
        maxHealth,
        i
      );
      const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      healthBarGraphics.fillStyle(hexColor, 1);
      healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    } else {
      // 空血格 - 深灰色
      healthBarGraphics.fillStyle(0x333333, 0.5);
      healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    }
  }

  // 更新生命值文本
  healthText.setText(`生命值: ${currentHealth} / ${maxHealth}`);
  
  // 根据生命值改变文本颜色
  if (currentHealth <= 0) {
    healthText.setColor('#ff0000');
  } else if (currentHealth <= 3) {
    healthText.setColor('#ff9900');
  } else {
    healthText.setColor('#ffffff');
  }
}

// 扣血函数
function takeDamage(amount) {
  if (currentHealth > 0) {
    currentHealth = Math.max(0, currentHealth - amount);
    drawHealthBar();
    
    console.log(`受到 ${amount} 点伤害，当前生命值: ${currentHealth}`);
  }
}

// 回血函数
function heal() {
  if (currentHealth < maxHealth) {
    currentHealth = Math.min(maxHealth, currentHealth + 1);
    drawHealthBar();
    
    console.log(`回复 1 点生命值，当前生命值: ${currentHealth}`);
  }
}

new Phaser.Game(config);