const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let health = 10;
const maxHealth = 10;
let healthBars = [];
let healthText;
let healTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建标题文本
  const title = this.add.text(400, 100, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建说明文本
  const instruction = this.add.text(400, 150, '点击鼠标左键扣血，每4秒自动回复1点', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);

  // 创建血量显示文本
  healthText = this.add.text(400, 200, `生命值: ${health}/${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建10个血条格子
  const startX = 250;
  const startY = 250;
  const barWidth = 40;
  const barHeight = 60;
  const gap = 10;

  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + gap);
    const y = startY;

    // 创建血条背景（边框）
    const border = this.add.graphics();
    border.lineStyle(3, 0x666666, 1);
    border.strokeRect(x, y, barWidth, barHeight);

    // 创建血条填充
    const bar = this.add.graphics();
    bar.fillStyle(0xff0000, 1);
    bar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

    healthBars.push({ bar, x, y, width: barWidth, height: barHeight });
  }

  // 初始化血条显示
  updateHealthDisplay.call(this);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      takeDamage.call(this, 1);
    }
  });

  // 创建回血定时器，每4秒回复1点生命值
  healTimer = this.time.addEvent({
    delay: 4000,
    callback: heal,
    callbackScope: this,
    loop: true
  });

  // 添加调试信息
  this.add.text(400, 500, '当前状态会在控制台输出', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);

  console.log('游戏初始化完成，初始生命值:', health);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 扣血函数
function takeDamage(amount) {
  if (health > 0) {
    health = Math.max(0, health - amount);
    updateHealthDisplay.call(this);
    console.log(`受到伤害! 当前生命值: ${health}/${maxHealth}`);

    if (health === 0) {
      console.log('生命值归零！');
      showGameOver.call(this);
    }
  }
}

// 回血函数
function heal() {
  if (health < maxHealth && health > 0) {
    health = Math.min(maxHealth, health + 1);
    updateHealthDisplay.call(this);
    console.log(`回复生命! 当前生命值: ${health}/${maxHealth}`);
  }
}

// 更新血条显示
function updateHealthDisplay() {
  // 更新文本
  healthText.setText(`生命值: ${health}/${maxHealth}`);

  // 更新血条格子
  for (let i = 0; i < maxHealth; i++) {
    const { bar, x, y, width, height } = healthBars[i];
    bar.clear();

    if (i < health) {
      // 有血 - 红色
      bar.fillStyle(0xff0000, 1);
    } else {
      // 无血 - 灰色
      bar.fillStyle(0x333333, 1);
    }

    bar.fillRect(x + 2, y + 2, width - 4, height - 4);
  }
}

// 显示游戏结束
function showGameOver() {
  const gameOverText = this.add.text(400, 400, 'GAME OVER', {
    fontSize: '48px',
    color: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 停止回血定时器
  if (healTimer) {
    healTimer.remove();
  }

  // 添加闪烁效果
  this.tweens.add({
    targets: gameOverText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1
  });
}

new Phaser.Game(config);