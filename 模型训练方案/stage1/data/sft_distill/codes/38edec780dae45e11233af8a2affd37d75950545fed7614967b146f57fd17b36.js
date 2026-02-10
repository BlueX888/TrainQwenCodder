const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态
let health = 3;
const MAX_HEALTH = 3;

// 游戏对象
let healthBars = [];
let healthText;
let healTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建标题
  const title = this.add.text(400, 50, '血条系统演示', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建说明文字
  const instruction = this.add.text(400, 100, '鼠标右键扣血 | 每0.5秒自动回复1点', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);

  // 创建血条容器
  const healthContainer = this.add.container(250, 300);

  // 创建3个血条方块
  for (let i = 0; i < MAX_HEALTH; i++) {
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(0, 0, 80, 80);
    barBg.lineStyle(3, 0x666666, 1);
    barBg.strokeRect(0, 0, 80, 80);

    const barFill = this.add.graphics();
    barFill.fillStyle(0xff0000, 1);
    barFill.fillRect(5, 5, 70, 70);

    const barContainer = this.add.container(i * 100, 0);
    barContainer.add([barBg, barFill]);

    healthBars.push(barFill);
    healthContainer.add(barContainer);
  }

  // 创建生命值文本显示
  healthText = this.add.text(400, 420, `生命值: ${health}/${MAX_HEALTH}`, {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5);

  // 创建状态提示文本
  const statusText = this.add.text(400, 500, '', {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 监听鼠标右键事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      if (health > 0) {
        health--;
        updateHealthDisplay();
        statusText.setText('受到伤害！-1 HP');
        
        // 清除之前的提示
        this.time.delayedCall(1000, () => {
          statusText.setText('');
        });
      } else {
        statusText.setText('生命值已为0！');
        this.time.delayedCall(1000, () => {
          statusText.setText('');
        });
      }
    }
  });

  // 创建自动回血定时器 - 每0.5秒触发一次
  healTimer = this.time.addEvent({
    delay: 500,  // 0.5秒 = 500毫秒
    callback: () => {
      if (health < MAX_HEALTH) {
        health++;
        updateHealthDisplay();
        statusText.setText('自动回复！+1 HP');
        
        // 清除提示
        this.time.delayedCall(800, () => {
          statusText.setText('');
        });
      }
    },
    loop: true  // 循环执行
  });

  // 更新血条显示的函数
  function updateHealthDisplay() {
    // 更新每个血条的显示状态
    for (let i = 0; i < MAX_HEALTH; i++) {
      healthBars[i].clear();
      if (i < health) {
        // 有血 - 红色
        healthBars[i].fillStyle(0xff0000, 1);
      } else {
        // 无血 - 深灰色
        healthBars[i].fillStyle(0x444444, 1);
      }
      healthBars[i].fillRect(5, 5, 70, 70);
    }

    // 更新文本显示
    healthText.setText(`生命值: ${health}/${MAX_HEALTH}`);
    
    // 根据生命值改变文本颜色
    if (health === 0) {
      healthText.setColor('#ff0000');
    } else if (health === MAX_HEALTH) {
      healthText.setColor('#00ff00');
    } else {
      healthText.setColor('#ffff00');
    }
  }

  // 初始化显示
  updateHealthDisplay();

  // 添加调试信息
  const debugText = this.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#888888'
  });

  // 在update中更新调试信息
  this.updateDebug = () => {
    const elapsed = healTimer.getElapsed();
    const remaining = healTimer.getRemaining();
    debugText.setText(
      `Debug Info:\n` +
      `Health: ${health}/${MAX_HEALTH}\n` +
      `Next Heal: ${(remaining / 1000).toFixed(2)}s\n` +
      `Timer Elapsed: ${(elapsed / 1000).toFixed(2)}s`
    );
  };
}

function update(time, delta) {
  // 更新调试信息
  if (this.updateDebug) {
    this.updateDebug();
  }
}

new Phaser.Game(config);