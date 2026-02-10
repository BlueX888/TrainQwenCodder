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
// 键盘输入
let keys;
// 移动速度（像素/秒）
const SPEED = 80;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建玩家矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 40, 40);
  
  // 生成纹理
  graphics.generateTexture('playerRect', 40, 40);
  graphics.destroy();
  
  // 创建玩家精灵并设置初始位置
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间差（转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    player.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    player.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    player.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    player.x += distance; // 向右移动
  }
  
  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

// 启动游戏
new Phaser.Game(config);