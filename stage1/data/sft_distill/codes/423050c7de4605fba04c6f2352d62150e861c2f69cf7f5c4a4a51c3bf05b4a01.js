const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let health = 3;
const maxHealth = 3;

// UI 元素引用
let healthBars = [];
let healthText;
let healTimer;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 初始化生命值
  health = maxHealth;
  
  // 创建标题文本
  const title = this.add.text(400, 100, 'Health Bar System', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 创建说明文本
  const instruction = this.add.text(400, 150, 'Click to take damage', {
    fontSize: '20px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);
  
  // 创建血条容器
  const barStartX = 250;
  const barStartY = 300;
  const barWidth = 80;
  const barHeight = 80;
  const barGap = 20;
  
  // 绘制3个血条方块
  for (let i = 0; i < maxHealth; i++) {
    const graphics = this.add.graphics();
    const x = barStartX + i * (barWidth + barGap);
    const y = barStartY;
    
    healthBars.push({
      graphics: graphics,
      x: x,
      y: y,
      width: barWidth,
      height: barHeight,
      index: i
    });
  }
  
  // 初始渲染血条
  updateHealthDisplay();
  
  // 创建生命值数字显示
  healthText = this.add.text(400, 420, `Health: ${health} / ${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  healthText.setOrigin(0.5);
  
  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    if (health > 0) {
      health--;
      updateHealthDisplay();
      console.log(`Damage taken! Health: ${health}`);
      
      // 显示伤害反馈
      showDamageEffect.call(this, pointer.x, pointer.y);
    }
  });
  
  // 创建自动回血定时器（每2秒执行一次）
  healTimer = this.time.addEvent({
    delay: 2000,           // 2秒
    callback: autoHeal,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 显示定时器信息
  const timerInfo = this.add.text(400, 480, 'Auto heal every 2 seconds', {
    fontSize: '18px',
    color: '#00ff00'
  });
  timerInfo.setOrigin(0.5);
}

function update(time, delta) {
  // 每帧更新（当前无需特殊处理）
}

// 更新血条显示
function updateHealthDisplay() {
  healthBars.forEach((bar, index) => {
    bar.graphics.clear();
    
    // 绘制边框
    bar.graphics.lineStyle(3, 0x666666, 1);
    bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
    
    // 根据生命值填充颜色
    if (index < health) {
      // 有生命值：红色
      bar.graphics.fillStyle(0xff0000, 1);
    } else {
      // 无生命值：深灰色
      bar.graphics.fillStyle(0x333333, 1);
    }
    
    bar.graphics.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
    
    // 添加光泽效果（如果有生命值）
    if (index < health) {
      bar.graphics.fillStyle(0xff6666, 0.5);
      bar.graphics.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height / 3);
    }
  });
  
  // 更新数字显示
  if (healthText) {
    healthText.setText(`Health: ${health} / ${maxHealth}`);
    
    // 根据生命值改变颜色
    if (health === 0) {
      healthText.setColor('#ff0000');
    } else if (health === maxHealth) {
      healthText.setColor('#00ff00');
    } else {
      healthText.setColor('#ffff00');
    }
  }
}

// 自动回血函数
function autoHeal() {
  if (health < maxHealth) {
    health++;
    updateHealthDisplay();
    console.log(`Healed! Health: ${health}`);
    
    // 显示回血特效
    showHealEffect.call(this);
  }
}

// 显示伤害特效
function showDamageEffect(x, y) {
  const damageText = this.add.text(x, y, '-1', {
    fontSize: '32px',
    color: '#ff0000',
    fontStyle: 'bold'
  });
  damageText.setOrigin(0.5);
  
  // 动画：向上漂浮并淡出
  this.tweens.add({
    targets: damageText,
    y: y - 50,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      damageText.destroy();
    }
  });
}

// 显示回血特效
function showHealEffect() {
  const healText = this.add.text(400, 250, '+1', {
    fontSize: '32px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  healText.setOrigin(0.5);
  
  // 动画：放大并淡出
  this.tweens.add({
    targets: healText,
    scale: 2,
    alpha: 0,
    duration: 600,
    ease: 'Power2',
    onComplete: () => {
      healText.destroy();
    }
  });
  
  // 血条闪烁效果
  healthBars.forEach((bar, index) => {
    if (index === health - 1) {
      this.tweens.add({
        targets: bar.graphics,
        alpha: 0.3,
        duration: 150,
        yoyo: true,
        repeat: 1
      });
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);