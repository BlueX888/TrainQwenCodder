const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let health = 5;
const maxHealth = 5;
let healthBars = [];
let healthText;
let spaceKey;
let regenTimer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化生命值
  health = maxHealth;
  
  // 创建标题文本
  const title = this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 创建说明文本
  const instruction = this.add.text(400, 150, '按空格键扣血 | 每1.5秒自动回复1点', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);
  
  // 创建血条容器
  const startX = 250;
  const startY = 250;
  const barWidth = 60;
  const barHeight = 80;
  const spacing = 10;
  
  healthBars = [];
  
  for (let i = 0; i < maxHealth; i++) {
    const graphics = this.add.graphics();
    const x = startX + i * (barWidth + spacing);
    
    // 绘制血条背景（边框）
    graphics.lineStyle(3, 0x666666, 1);
    graphics.strokeRect(x, startY, barWidth, barHeight);
    
    // 绘制血条填充
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    
    healthBars.push({
      graphics: graphics,
      x: x,
      y: startY,
      width: barWidth,
      height: barHeight
    });
  }
  
  // 创建生命值文本显示
  healthText = this.add.text(400, 370, `生命值: ${health} / ${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  healthText.setOrigin(0.5);
  
  // 创建状态信息文本（用于验证）
  const statusText = this.add.text(400, 420, '状态: 正常', {
    fontSize: '18px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);
  this.statusText = statusText;
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 创建回血定时器（每1.5秒回复1点生命值）
  regenTimer = this.time.addEvent({
    delay: 1500,
    callback: () => {
      if (health < maxHealth) {
        health++;
        updateHealthDisplay.call(this);
        console.log('回血: 当前生命值 =', health);
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 初始化血条显示
  updateHealthDisplay.call(this);
}

function update() {
  // 检测空格键按下（使用justDown避免连续触发）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (health > 0) {
      health--;
      updateHealthDisplay.call(this);
      console.log('扣血: 当前生命值 =', health);
      
      // 更新状态文本
      if (health === 0) {
        this.statusText.setText('状态: 死亡');
        this.statusText.setColor('#ff0000');
      } else if (health <= 2) {
        this.statusText.setText('状态: 危险');
        this.statusText.setColor('#ff9900');
      }
    }
  }
}

function updateHealthDisplay() {
  // 更新血条显示
  for (let i = 0; i < maxHealth; i++) {
    const bar = healthBars[i];
    bar.graphics.clear();
    
    // 绘制边框
    bar.graphics.lineStyle(3, 0x666666, 1);
    bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
    
    // 根据当前生命值绘制填充
    if (i < health) {
      // 有血：红色
      bar.graphics.fillStyle(0xff0000, 1);
    } else {
      // 无血：深灰色
      bar.graphics.fillStyle(0x333333, 1);
    }
    bar.graphics.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
  }
  
  // 更新生命值文本
  healthText.setText(`生命值: ${health} / ${maxHealth}`);
  
  // 更新状态文本
  if (health === maxHealth) {
    this.statusText.setText('状态: 满血');
    this.statusText.setColor('#00ff00');
  } else if (health > 2) {
    this.statusText.setText('状态: 正常');
    this.statusText.setColor('#00ff00');
  } else if (health > 0) {
    this.statusText.setText('状态: 危险');
    this.statusText.setColor('#ff9900');
  }
}

new Phaser.Game(config);