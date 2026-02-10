const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

// 状态变量
let cursors;
let shakeCount = 0;
let statusText;
let lastShakeTime = 0;
let isShaking = false;

// 方向键状态记录（防止连续触发）
let keyStates = {
  up: false,
  down: false,
  left: false,
  right: false
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 绘制背景网格，便于观察抖动效果
  const graphics = this.add.graphics();
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心参考点
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(400, 300, 20);
  
  // 绘制四个角的参考方块
  const cornerSize = 40;
  graphics.fillStyle(0x4ecdc4, 1);
  graphics.fillRect(10, 10, cornerSize, cornerSize);
  graphics.fillRect(750, 10, cornerSize, cornerSize);
  graphics.fillRect(10, 550, cornerSize, cornerSize);
  graphics.fillRect(750, 550, cornerSize, cornerSize);
  
  // 添加说明文本
  const instructionText = this.add.text(400, 50, 'Press Arrow Keys to Shake Camera', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial',
    align: 'center'
  });
  instructionText.setOrigin(0.5);
  
  // 添加状态文本（可验证信号）
  statusText = this.add.text(400, 550, 'Shake Count: 0', {
    fontSize: '20px',
    color: '#ffd93d',
    fontFamily: 'Arial',
    align: 'center',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setOrigin(0.5);
  
  // 添加方向提示文本
  const directionText = this.add.text(400, 100, 'Last Direction: None', {
    fontSize: '18px',
    color: '#95e1d3',
    fontFamily: 'Arial',
    align: 'center'
  });
  directionText.setOrigin(0.5);
  directionText.setName('directionText');
  
  // 监听相机抖动完成事件
  this.cameras.main.on('camerashakecomplete', () => {
    isShaking = false;
  });
}

function update(time, delta) {
  // 获取方向文本对象
  const directionText = this.children.getByName('directionText');
  
  // 检测方向键按下（使用 justDown 模式防止连续触发）
  if (cursors.up.isDown && !keyStates.up) {
    triggerShake.call(this, 'UP');
    keyStates.up = true;
    if (directionText) directionText.setText('Last Direction: UP ↑');
  } else if (!cursors.up.isDown) {
    keyStates.up = false;
  }
  
  if (cursors.down.isDown && !keyStates.down) {
    triggerShake.call(this, 'DOWN');
    keyStates.down = true;
    if (directionText) directionText.setText('Last Direction: DOWN ↓');
  } else if (!cursors.down.isDown) {
    keyStates.down = false;
  }
  
  if (cursors.left.isDown && !keyStates.left) {
    triggerShake.call(this, 'LEFT');
    keyStates.left = true;
    if (directionText) directionText.setText('Last Direction: LEFT ←');
  } else if (!cursors.left.isDown) {
    keyStates.left = false;
  }
  
  if (cursors.right.isDown && !keyStates.right) {
    triggerShake.call(this, 'RIGHT');
    keyStates.right = true;
    if (directionText) directionText.setText('Last Direction: RIGHT →');
  } else if (!cursors.right.isDown) {
    keyStates.right = false;
  }
}

/**
 * 触发相机抖动效果
 * @param {string} direction - 触发的方向键
 */
function triggerShake(direction) {
  const currentTime = Date.now();
  
  // 防止抖动期间重复触发（可选的防抖逻辑）
  if (isShaking) {
    return;
  }
  
  // 触发相机抖动
  // 参数: duration(ms), intensity(抖动强度)
  this.cameras.main.shake(500, 0.01);
  
  isShaking = true;
  lastShakeTime = currentTime;
  
  // 增加抖动计数
  shakeCount++;
  
  // 更新状态文本
  if (statusText) {
    statusText.setText(`Shake Count: ${shakeCount}`);
  }
  
  // 控制台输出（便于调试验证）
  console.log(`Camera shake triggered by ${direction} key. Total shakes: ${shakeCount}`);
}

// 创建游戏实例
new Phaser.Game(config);