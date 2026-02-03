const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let health = 3;
const MAX_HEALTH = 3;

// 血条方块数组
let healthBlocks = [];

// 文本显示
let healthText;

// 回血定时器
let healTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建标题文本
  const titleText = this.add.text(400, 100, '生命值系统演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 创建提示文本
  const hintText = this.add.text(400, 150, '点击鼠标左键扣血 | 每秒自动回复1点', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);

  // 创建血条容器
  const startX = 250;
  const startY = 300;
  const blockWidth = 80;
  const blockHeight = 40;
  const blockSpacing = 20;

  // 创建3个血条方块
  for (let i = 0; i < MAX_HEALTH; i++) {
    const x = startX + i * (blockWidth + blockSpacing);
    const block = this.add.graphics();
    
    // 绘制边框
    block.lineStyle(3, 0x666666, 1);
    block.strokeRect(x, startY, blockWidth, blockHeight);
    
    // 绘制填充（初始全满）
    block.fillStyle(0xff0000, 1);
    block.fillRect(x + 3, startY + 3, blockWidth - 6, blockHeight - 6);
    
    healthBlocks.push({
      graphics: block,
      x: x,
      y: startY,
      width: blockWidth,
      height: blockHeight
    });
  }

  // 创建生命值数值显示
  healthText = this.add.text(400, 380, `生命值: ${health} / ${MAX_HEALTH}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  healthText.setOrigin(0.5);

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      takeDamage(this);
    }
  });

  // 创建回血定时器（每1秒触发一次）
  healTimer = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: healHealth,  // 回调函数
    callbackScope: this,   // 作用域
    loop: true            // 循环执行
  });

  // 创建状态显示文本
  const statusText = this.add.text(400, 500, '状态: 运行中', {
    fontSize: '18px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);
}

function update(time, delta) {
  // 每帧更新逻辑（本示例中主要逻辑在事件中处理）
}

// 扣血函数
function takeDamage(scene) {
  if (health > 0) {
    health--;
    updateHealthBar(scene);
    console.log(`受到伤害！当前生命值: ${health}`);
    
    // 如果生命值归零
    if (health === 0) {
      console.log('生命值已耗尽！');
    }
  }
}

// 回血函数
function healHealth() {
  if (health < MAX_HEALTH) {
    health++;
    updateHealthBar(this);
    console.log(`回复生命！当前生命值: ${health}`);
  }
}

// 更新血条显示
function updateHealthBar(scene) {
  // 更新每个血条方块
  for (let i = 0; i < MAX_HEALTH; i++) {
    const block = healthBlocks[i];
    const graphics = block.graphics;
    
    // 清除之前的绘制
    graphics.clear();
    
    // 绘制边框
    graphics.lineStyle(3, 0x666666, 1);
    graphics.strokeRect(block.x, block.y, block.width, block.height);
    
    // 根据当前生命值决定填充颜色
    if (i < health) {
      // 有生命值：红色
      graphics.fillStyle(0xff0000, 1);
    } else {
      // 无生命值：深灰色
      graphics.fillStyle(0x333333, 1);
    }
    
    graphics.fillRect(
      block.x + 3, 
      block.y + 3, 
      block.width - 6, 
      block.height - 6
    );
  }
  
  // 更新文本显示
  healthText.setText(`生命值: ${health} / ${MAX_HEALTH}`);
  
  // 根据生命值改变文本颜色
  if (health === 0) {
    healthText.setColor('#ff0000');
  } else if (health === MAX_HEALTH) {
    healthText.setColor('#00ff00');
  } else {
    healthText.setColor('#ffff00');
  }
}

// 启动游戏
new Phaser.Game(config);