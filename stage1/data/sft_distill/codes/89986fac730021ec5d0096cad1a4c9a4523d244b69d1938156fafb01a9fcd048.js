const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 游戏状态
let health = 3; // 可验证的状态信号
const maxHealth = 3;
let healthBars = [];
let healTimer;
let keys;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建标题文字
  this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 150, '按 W/A/S/D 键扣血，每1.5秒自动回血1点', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 创建血条容器
  const startX = 250;
  const startY = 300;
  const barWidth = 80;
  const barHeight = 30;
  const spacing = 20;

  // 绘制3个血条
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + spacing);
    
    // 背景（边框）
    const bg = this.add.graphics();
    bg.lineStyle(3, 0x666666, 1);
    bg.strokeRect(x, startY, barWidth, barHeight);
    
    // 血条填充
    const bar = this.add.graphics();
    healthBars.push(bar);
  }

  // 初始化血条显示
  updateHealthBars.call(this);

  // 显示当前生命值文字
  this.healthText = this.add.text(400, 400, `当前生命值: ${health}/${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 设置键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 监听WASD键按下事件
  const damageKeys = [keys.w, keys.a, keys.s, keys.d];
  damageKeys.forEach(key => {
    key.on('down', () => {
      takeDamage.call(this);
    });
  });

  // 创建自动回血定时器（每1.5秒执行一次）
  healTimer = this.time.addEvent({
    delay: 1500,
    callback: autoHeal,
    callbackScope: this,
    loop: true
  });

  // 提示信息
  this.add.text(400, 500, '提示: 生命值为0时仍可继续回血', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

function update() {
  // 主循环逻辑（本例中不需要）
}

// 扣血函数
function takeDamage() {
  if (health > 0) {
    health--;
    updateHealthBars.call(this);
    updateHealthText.call(this);
    
    // 显示扣血反馈
    const damageText = this.add.text(400, 250, '-1', {
      fontSize: '32px',
      color: '#ff0000'
    }).setOrigin(0.5);
    
    // 扣血文字动画
    this.tweens.add({
      targets: damageText,
      y: 200,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    });
  }
}

// 自动回血函数
function autoHeal() {
  if (health < maxHealth) {
    health++;
    updateHealthBars.call(this);
    updateHealthText.call(this);
    
    // 显示回血反馈
    const healText = this.add.text(400, 250, '+1', {
      fontSize: '32px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // 回血文字动画
    this.tweens.add({
      targets: healText,
      y: 200,
      alpha: 0,
      duration: 800,
      onComplete: () => healText.destroy()
    });
  }
}

// 更新血条显示
function updateHealthBars() {
  const startX = 250;
  const startY = 300;
  const barWidth = 80;
  const barHeight = 30;
  const spacing = 20;

  healthBars.forEach((bar, index) => {
    const x = startX + index * (barWidth + spacing);
    
    bar.clear();
    
    if (index < health) {
      // 有生命值：红色填充
      bar.fillStyle(0xff0000, 1);
      bar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    } else {
      // 无生命值：灰色填充
      bar.fillStyle(0x333333, 1);
      bar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
  });
}

// 更新生命值文字
function updateHealthText() {
  this.healthText.setText(`当前生命值: ${health}/${maxHealth}`);
  
  // 根据生命值改变文字颜色
  if (health === 0) {
    this.healthText.setColor('#ff0000');
  } else if (health === maxHealth) {
    this.healthText.setColor('#00ff00');
  } else {
    this.healthText.setColor('#ffff00');
  }
}

new Phaser.Game(config);