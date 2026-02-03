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
  // 无需加载外部资源
}

function create() {
  // 初始化生命值
  health = maxHealth;
  
  // 创建标题文本
  const title = this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建提示文本
  const hint = this.add.text(400, 150, '按空格键扣血 | 每1.5秒自动回血', {
    fontSize: '20px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建血条容器（5个方块）
  const startX = 250;
  const startY = 300;
  const barWidth = 60;
  const barHeight = 80;
  const spacing = 20;
  
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + spacing);
    
    // 创建背景框（灰色边框）
    const bg = this.add.graphics();
    bg.lineStyle(3, 0x666666, 1);
    bg.strokeRect(x, startY, barWidth, barHeight);
    
    // 创建血条填充（红色）
    const bar = this.add.graphics();
    bar.fillStyle(0xff0000, 1);
    bar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    
    healthBars.push(bar);
  }
  
  // 显示当前血量数值
  healthText = this.add.text(400, 420, `生命值: ${health} / ${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 创建回血定时器（每1.5秒回复1点）
  regenTimer = this.time.addEvent({
    delay: 1500,
    callback: regenerateHealth,
    callbackScope: this,
    loop: true
  });
  
  // 创建状态显示文本（用于验证）
  this.add.text(10, 10, '状态验证信号:', {
    fontSize: '16px',
    color: '#888888'
  });
  
  this.statusText = this.add.text(10, 35, '', {
    fontSize: '14px',
    color: '#00ff00'
  });
}

function update() {
  // 检测空格键按下（使用 justDown 避免连续触发）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    takeDamage(this);
  }
  
  // 更新状态验证信号
  if (this.statusText) {
    this.statusText.setText(
      `health=${health}, maxHealth=${maxHealth}, timer=${regenTimer.getElapsed().toFixed(0)}ms`
    );
  }
}

// 扣血函数
function takeDamage(scene) {
  if (health > 0) {
    health--;
    updateHealthBar();
    healthText.setText(`生命值: ${health} / ${maxHealth}`);
    
    // 血量为0时显示提示
    if (health === 0) {
      scene.add.text(400, 500, '生命值已耗尽！等待回血...', {
        fontSize: '20px',
        color: '#ff6666'
      }).setOrigin(0.5);
    }
  }
}

// 回血函数
function regenerateHealth() {
  if (health < maxHealth) {
    health++;
    updateHealthBar();
    healthText.setText(`生命值: ${health} / ${maxHealth}`);
    
    // 创建回血特效文字
    const regenText = this.add.text(400, 250, '+1', {
      fontSize: '28px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // 文字上浮动画
    this.tweens.add({
      targets: regenText,
      y: 200,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        regenText.destroy();
      }
    });
  }
}

// 更新血条显示
function updateHealthBar() {
  for (let i = 0; i < maxHealth; i++) {
    healthBars[i].clear();
    
    if (i < health) {
      // 有血：红色填充
      healthBars[i].fillStyle(0xff0000, 1);
    } else {
      // 无血：深灰色填充
      healthBars[i].fillStyle(0x333333, 1);
    }
    
    const startX = 250;
    const startY = 300;
    const barWidth = 60;
    const barHeight = 80;
    const spacing = 20;
    const x = startX + i * (barWidth + spacing);
    
    healthBars[i].fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
  }
}

new Phaser.Game(config);