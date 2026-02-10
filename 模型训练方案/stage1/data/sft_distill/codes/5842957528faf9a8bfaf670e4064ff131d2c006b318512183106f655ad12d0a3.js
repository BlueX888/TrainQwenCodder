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

// 玩家对象
let player;
// 按键对象
let keys;
// 移动速度（像素/秒）
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建玩家精灵，位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 绑定 WASD 按键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
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
  
  // 处理斜向移动时的速度归一化
  if (velocityX !== 0 && velocityY !== 0) {
    // 斜向移动时，使用勾股定理归一化速度
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);