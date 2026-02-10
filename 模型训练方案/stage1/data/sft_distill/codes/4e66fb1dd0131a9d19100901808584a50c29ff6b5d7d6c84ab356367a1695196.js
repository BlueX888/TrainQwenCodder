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

let diamond;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建菱形 Graphics 对象
  diamond = this.add.graphics();
  diamond.x = 400; // 初始位置 x
  diamond.y = 300; // 初始位置 y
  
  // 绘制菱形（中心点为原点）
  diamond.fillStyle(0x00ff00, 1);
  diamond.beginPath();
  diamond.moveTo(0, -30);    // 上顶点
  diamond.lineTo(25, 0);     // 右顶点
  diamond.lineTo(0, 30);     // 下顶点
  diamond.lineTo(-25, 0);    // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 设置键盘输入（WASD）
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  // delta 单位是毫秒，需要转换为秒
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    diamond.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    diamond.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    diamond.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    diamond.x += distance; // 向右移动
  }
  
  // 可选：限制菱形在画布范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
  diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
}

new Phaser.Game(config);