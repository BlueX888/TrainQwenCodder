const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 玩家对象和按键
let player;
let keys;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家矩形（使用 Rectangle 游戏对象）
  player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
  
  // 设置矩形的原点为中心（默认就是中心，但明确设置更清晰）
  player.setOrigin(0.5, 0.5);
  
  // 添加 WASD 按键监听
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 速度：300 像素/秒
  const speed = 300;
  
  // 计算本帧应该移动的距离（delta 单位是毫秒）
  const distance = speed * (delta / 1000);
  
  // 初始化移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检查按键状态并设置移动方向
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.S.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.A.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.D.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个键，进行对角线移动的归一化
  if (velocityX !== 0 && velocityY !== 0) {
    // 使用勾股定理归一化向量，保持对角线移动速度一致
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（可选，防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);