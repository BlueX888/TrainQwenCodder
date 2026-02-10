const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 菱形对象
let diamond;
// 键盘输入
let keys;
// 移动速度（像素/秒）
const SPEED = 80;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建菱形 Graphics 对象
  diamond = this.add.graphics();
  diamond.x = 400;
  diamond.y = 300;
  
  // 绘制菱形（中心点为原点）
  diamond.fillStyle(0x00ff00, 1);
  diamond.beginPath();
  diamond.moveTo(0, -30);    // 上顶点
  diamond.lineTo(25, 0);     // 右顶点
  diamond.lineTo(0, 30);     // 下顶点
  diamond.lineTo(-25, 0);    // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 绑定 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态移动菱形
  if (keys.w.isDown) {
    diamond.y -= moveDistance;  // 向上移动
  }
  if (keys.s.isDown) {
    diamond.y += moveDistance;  // 向下移动
  }
  if (keys.a.isDown) {
    diamond.x -= moveDistance;  // 向左移动
  }
  if (keys.d.isDown) {
    diamond.x += moveDistance;  // 向右移动
  }
}

new Phaser.Game(config);