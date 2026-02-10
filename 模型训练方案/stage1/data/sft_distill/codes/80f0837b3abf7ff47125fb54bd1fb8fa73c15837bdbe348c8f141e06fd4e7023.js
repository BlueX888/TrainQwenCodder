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

// 椭圆对象和键盘输入
let ellipse;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建椭圆图形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(0, 0, 60, 40); // 在原点绘制椭圆（宽60，高40）
  
  // 生成纹理并创建精灵
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并设置初始位置
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 设置键盘输入监听 WASD
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算每帧的移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新椭圆位置
  if (keys.w.isDown) {
    ellipse.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    ellipse.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    ellipse.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    ellipse.x += distance; // 向右移动
  }
  
  // 可选：边界限制，防止椭圆移出屏幕
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 30, 770);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 20, 580);
}

// 启动游戏
new Phaser.Game(config);