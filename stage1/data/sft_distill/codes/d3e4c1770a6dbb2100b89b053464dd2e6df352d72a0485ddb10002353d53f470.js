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

// 玩家对象和按键引用
let player;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形玩家
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(0, 0, 20); // 半径 20 的圆形，中心点在 (0, 0)
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('playerTexture', 40, 40);
  graphics.destroy(); // 销毁临时 Graphics 对象
  
  // 创建玩家精灵并设置初始位置
  player = this.add.sprite(400, 300, 'playerTexture');
  
  // 绑定 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离 = 速度 * 时间（秒）
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
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

// 启动游戏
new Phaser.Game(config);