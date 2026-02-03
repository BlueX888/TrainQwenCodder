// 完整的 Phaser3 血条系统代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象，用于验证状态
window.__signals__ = {
  health: 12,
  maxHealth: 12,
  events: []
};

let healthBar;
let currentHealth = 12;
const MAX_HEALTH = 12;
const HEALTH_BAR_WIDTH = 30;  // 每格血条宽度
const HEALTH_BAR_HEIGHT = 40; // 血条高度
const HEALTH_BAR_SPACING = 5; // 血条间距
const REGEN_INTERVAL = 2500;  // 回血间隔（毫秒）

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文字
  const title = this.add.text(400, 50, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 创建提示文字
  const instruction = this.add.text(400, 100, '鼠标右键：扣血 | 自动回血：每2.5秒+1', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  instruction.setOrigin(0.5);
  
  // 创建生命值文字显示
  const healthText = this.add.text(400, 150, `生命值: ${currentHealth} / ${MAX_HEALTH}`, {
    fontSize: '24px',
    color: '#00ff00'
  });
  healthText.setOrigin(0.5);
  healthText.setName('healthText');
  
  // 创建血条容器
  healthBar = this.add.graphics();
  
  // 初始化血条显示
  updateHealthBar(scene);
  
  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      damageHealth(scene);
    }
  });
  
  // 创建自动回血定时器
  const regenTimer = this.time.addEvent({
    delay: REGEN_INTERVAL,
    callback: () => {
      healHealth(scene);
    },
    loop: true
  });
  
  // 记录初始状态
  logEvent('游戏开始', currentHealth);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 更新血条显示
function updateHealthBar(scene) {
  healthBar.clear();
  
  // 计算血条起始位置（居中显示）
  const totalWidth = (HEALTH_BAR_WIDTH + HEALTH_BAR_SPACING) * MAX_HEALTH - HEALTH_BAR_SPACING;
  const startX = (800 - totalWidth) / 2;
  const startY = 250;
  
  // 绘制所有血条格子
  for (let i = 0; i < MAX_HEALTH; i++) {
    const x = startX + i * (HEALTH_BAR_WIDTH + HEALTH_BAR_SPACING);
    
    // 绘制边框
    healthBar.lineStyle(2, 0x666666, 1);
    healthBar.strokeRect(x, startY, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
    
    // 如果当前格子有生命值，填充红色
    if (i < currentHealth) {
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(x + 2, startY + 2, HEALTH_BAR_WIDTH - 4, HEALTH_BAR_HEIGHT - 4);
    } else {
      // 空血条显示暗灰色
      healthBar.fillStyle(0x333333, 1);
      healthBar.fillRect(x + 2, startY + 2, HEALTH_BAR_WIDTH - 4, HEALTH_BAR_HEIGHT - 4);
    }
  }
  
  // 更新生命值文字
  const healthText = scene.children.getByName('healthText');
  if (healthText) {
    healthText.setText(`生命值: ${currentHealth} / ${MAX_HEALTH}`);
    
    // 根据生命值改变文字颜色
    if (currentHealth <= 3) {
      healthText.setColor('#ff0000'); // 低血量红色警告
    } else if (currentHealth <= 6) {
      healthText.setColor('#ffaa00'); // 中等血量橙色
    } else {
      healthText.setColor('#00ff00'); // 高血量绿色
    }
  }
  
  // 更新全局信号
  window.__signals__.health = currentHealth;
}

// 扣血函数
function damageHealth(scene) {
  if (currentHealth > 0) {
    currentHealth--;
    updateHealthBar(scene);
    logEvent('受到伤害', currentHealth);
    
    // 播放视觉反馈（血条闪烁）
    scene.cameras.main.shake(100, 0.005);
    
    if (currentHealth === 0) {
      showGameOver(scene);
    }
  }
}

// 回血函数
function healHealth(scene) {
  if (currentHealth < MAX_HEALTH) {
    currentHealth++;
    updateHealthBar(scene);
    logEvent('自动回血', currentHealth);
    
    // 播放视觉反馈（绿色闪光）
    scene.cameras.main.flash(200, 0, 255, 0, false);
  }
}

// 显示游戏结束
function showGameOver(scene) {
  const gameOverText = scene.add.text(400, 400, '生命值耗尽！', {
    fontSize: '48px',
    color: '#ff0000',
    fontStyle: 'bold'
  });
  gameOverText.setOrigin(0.5);
  
  logEvent('游戏结束', 0);
  
  // 3秒后重置游戏
  scene.time.delayedCall(3000, () => {
    currentHealth = MAX_HEALTH;
    updateHealthBar(scene);
    gameOverText.destroy();
    logEvent('游戏重置', currentHealth);
  });
}

// 记录事件日志
function logEvent(eventName, health) {
  const event = {
    timestamp: Date.now(),
    event: eventName,
    health: health,
    maxHealth: MAX_HEALTH
  };
  
  window.__signals__.events.push(event);
  console.log(JSON.stringify(event));
}

// 启动游戏
new Phaser.Game(config);