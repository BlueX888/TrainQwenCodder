const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号用于验证
window.__signals__ = {
  health: 10,
  healthChanges: []
};

let healthBar = [];
let currentHealth = 10;
const maxHealth = 10;
let spaceKey;
let healTimer;
let healthText;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 初始化生命值
  currentHealth = maxHealth;
  window.__signals__.health = currentHealth;
  
  // 创建标题文本
  const title = this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建说明文本
  const instructions = this.add.text(400, 150, '按空格键扣血 | 每3秒自动回复1点', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建生命值文本显示
  healthText = this.add.text(400, 250, `生命值: ${currentHealth}/${maxHealth}`, {
    fontSize: '24px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建血条（10个方格）
  const barStartX = 250;
  const barY = 320;
  const cellWidth = 28;
  const cellHeight = 40;
  const cellGap = 2;
  
  for (let i = 0; i < maxHealth; i++) {
    const x = barStartX + i * (cellWidth + cellGap);
    
    // 创建血格背景（灰色边框）
    const bgGraphics = this.add.graphics();
    bgGraphics.lineStyle(2, 0x666666, 1);
    bgGraphics.strokeRect(x, barY, cellWidth, cellHeight);
    
    // 创建血格填充（红色）
    const fillGraphics = this.add.graphics();
    fillGraphics.fillStyle(0xff0000, 1);
    fillGraphics.fillRect(x + 2, barY + 2, cellWidth - 4, cellHeight - 4);
    
    healthBar.push({
      bg: bgGraphics,
      fill: fillGraphics,
      x: x,
      y: barY
    });
  }
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 创建自动回血定时器（每3秒执行一次）
  healTimer = this.time.addEvent({
    delay: 3000,
    callback: healHealth,
    callbackScope: this,
    loop: true
  });
  
  // 创建日志文本区域
  const logTitle = this.add.text(400, 420, '操作日志:', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.logText = this.add.text(400, 460, '', {
    fontSize: '14px',
    color: '#ffff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 初始化日志
  addLog(this, '游戏开始，生命值满格');
}

function update() {
  // 检测空格键按下（使用justDown避免连续触发）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    takeDamage(this);
  }
}

// 扣血函数
function takeDamage(scene) {
  if (currentHealth > 0) {
    currentHealth--;
    updateHealthBar();
    updateHealthText();
    
    // 记录到signals
    window.__signals__.health = currentHealth;
    window.__signals__.healthChanges.push({
      type: 'damage',
      health: currentHealth,
      timestamp: Date.now()
    });
    
    addLog(scene, `受到伤害！生命值: ${currentHealth}/${maxHealth}`);
    
    // 如果生命值为0
    if (currentHealth === 0) {
      addLog(scene, '生命值耗尽！');
      console.log('Game Over - Health depleted');
    }
  }
}

// 回血函数
function healHealth() {
  if (currentHealth < maxHealth) {
    currentHealth++;
    updateHealthBar();
    updateHealthText();
    
    // 记录到signals
    window.__signals__.health = currentHealth;
    window.__signals__.healthChanges.push({
      type: 'heal',
      health: currentHealth,
      timestamp: Date.now()
    });
    
    addLog(this, `自动回复！生命值: ${currentHealth}/${maxHealth}`);
  }
}

// 更新血条显示
function updateHealthBar() {
  for (let i = 0; i < maxHealth; i++) {
    if (i < currentHealth) {
      // 显示血格（红色）
      healthBar[i].fill.clear();
      healthBar[i].fill.fillStyle(0xff0000, 1);
      healthBar[i].fill.fillRect(
        healthBar[i].x + 2,
        healthBar[i].y + 2,
        26,
        36
      );
    } else {
      // 隐藏血格（透明）
      healthBar[i].fill.clear();
    }
  }
}

// 更新生命值文本
function updateHealthText() {
  const color = currentHealth > 6 ? '#00ff00' : currentHealth > 3 ? '#ffaa00' : '#ff0000';
  healthText.setText(`生命值: ${currentHealth}/${maxHealth}`);
  healthText.setColor(color);
}

// 添加日志
function addLog(scene, message) {
  if (scene.logText) {
    scene.logText.setText(message);
  }
  console.log(JSON.stringify({
    event: 'health_change',
    health: currentHealth,
    maxHealth: maxHealth,
    message: message,
    timestamp: Date.now()
  }));
}

new Phaser.Game(config);