// 完整的 Phaser3 代码 - WASD 控制圆形移动
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

// 全局变量存储游戏对象
let player;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 本游戏不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(25, 25, 25); // 半径 25 的圆形
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建玩家圆形 Sprite，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');

  // 绑定 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the circle', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);

  // 检测 W 键（向上）
  if (keys.w.isDown) {
    player.y -= distance;
  }

  // 检测 S 键（向下）
  if (keys.s.isDown) {
    player.y += distance;
  }

  // 检测 A 键（向左）
  if (keys.a.isDown) {
    player.x -= distance;
  }

  // 检测 D 键（向右）
  if (keys.d.isDown) {
    player.x += distance;
  }

  // 边界限制（可选）- 防止圆形移出画布
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);