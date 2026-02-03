const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let health = 10;
const maxHealth = 10;
let healthBar;
let healthText;
let cursors;
let healTimer;
let lastKeyPressTime = 0;
const keyPressDelay = 200; // 防止按键过快，200ms内只能按一次

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建标题文本
  this.add.text(400, 50, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建说明文本
  this.add.text(400, 100, '按方向键扣血，每4秒自动回复1点', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);

  // 创建生命值数字显示
  healthText = this.add.text(400, 150, `生命值: ${health}/${maxHealth}`, {
    fontSize: '24px',
    color: '#00ff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建血条容器（使用Graphics）
  healthBar = this.add.graphics();
  drawHealthBar.call(this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建回血定时器，每4秒执行一次
  healTimer = this.time.addEvent({
    delay: 4000,
    callback: healHealth,
    callbackScope: this,
    loop: true
  });

  // 添加按键监听器（使用事件方式，更精确控制）
  this.input.keyboard.on('keydown', handleKeyPress, this);

  // 添加状态显示文本
  this.add.text(400, 500, '状态信息:', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);

  // 添加定时器信息显示
  this.timerText = this.add.text(400, 530, '', {
    fontSize: '14px',
    color: '#888888'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 更新定时器显示
  if (healTimer) {
    const remaining = healTimer.getRemaining();
    const progress = healTimer.getProgress();
    this.timerText.setText(
      `下次回血倒计时: ${(remaining / 1000).toFixed(1)}秒 | 进度: ${(progress * 100).toFixed(0)}%`
    );
  }
}

// 绘制血条函数
function drawHealthBar() {
  healthBar.clear();

  const barWidth = 40;  // 每格血条宽度
  const barHeight = 30; // 血条高度
  const spacing = 5;    // 血条间距
  const startX = 400 - (maxHealth * (barWidth + spacing)) / 2; // 居中起始位置
  const startY = 200;

  // 绘制所有血条格子
  for (let i = 0; i < maxHealth; i++) {
    const x = startX + i * (barWidth + spacing);
    
    if (i < health) {
      // 当前生命值：红色
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(x, startY, barWidth, barHeight);
      
      // 添加高光效果
      healthBar.fillStyle(0xff6666, 0.5);
      healthBar.fillRect(x, startY, barWidth, barHeight / 3);
    } else {
      // 损失的生命值：深灰色
      healthBar.fillStyle(0x444444, 1);
      healthBar.fillRect(x, startY, barWidth, barHeight);
    }
    
    // 绘制边框
    healthBar.lineStyle(2, 0x000000, 1);
    healthBar.strokeRect(x, startY, barWidth, barHeight);
  }
}

// 处理按键扣血
function handleKeyPress(event) {
  const currentTime = this.time.now;
  
  // 防止按键过快
  if (currentTime - lastKeyPressTime < keyPressDelay) {
    return;
  }

  // 检查是否是方向键
  if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP ||
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN ||
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT ||
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
    
    if (health > 0) {
      health--;
      lastKeyPressTime = currentTime;
      updateHealthDisplay.call(this);
      
      // 添加扣血反馈效果
      this.cameras.main.shake(100, 0.005);
      
      // 显示扣血提示
      const damageText = this.add.text(400, 350, '-1', {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: damageText,
        y: 300,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => damageText.destroy()
      });

      if (health === 0) {
        showGameOverMessage.call(this);
      }
    }
  }
}

// 回血函数
function healHealth() {
  if (health < maxHealth) {
    health++;
    updateHealthDisplay.call(this);
    
    // 添加回血反馈效果
    const healText = this.add.text(400, 350, '+1', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: healText,
      y: 300,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => healText.destroy()
    });

    // 闪烁效果
    this.tweens.add({
      targets: healthBar,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
}

// 更新生命值显示
function updateHealthDisplay() {
  healthText.setText(`生命值: ${health}/${maxHealth}`);
  
  // 根据生命值改变文字颜色
  if (health > 6) {
    healthText.setColor('#00ff00'); // 绿色：健康
  } else if (health > 3) {
    healthText.setColor('#ffff00'); // 黄色：警告
  } else {
    healthText.setColor('#ff0000'); // 红色：危险
  }
  
  drawHealthBar.call(this);
}

// 显示游戏结束消息
function showGameOverMessage() {
  const gameOverText = this.add.text(400, 400, '生命值耗尽！等待回血...', {
    fontSize: '28px',
    color: '#ff0000',
    fontStyle: 'bold',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5);

  // 闪烁效果
  this.tweens.add({
    targets: gameOverText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1
  });

  // 当回血后移除提示
  const checkHealth = this.time.addEvent({
    delay: 100,
    callback: () => {
      if (health > 0) {
        gameOverText.destroy();
        checkHealth.remove();
      }
    },
    loop: true
  });
}

new Phaser.Game(config);