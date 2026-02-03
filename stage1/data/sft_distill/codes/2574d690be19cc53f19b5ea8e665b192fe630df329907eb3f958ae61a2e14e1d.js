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

// 椭圆对象和按键变量
let ellipse;
let keyW, keyA, keyS, keyD;
let ellipseX = 400;
let ellipseY = 300;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ff00, 1); // 绿色椭圆
  ellipse.fillEllipse(0, 0, 60, 40); // 以中心点绘制，宽60高40
  
  // 设置初始位置
  ellipse.x = ellipseX;
  ellipse.y = ellipseY;
  
  // 添加 WASD 按键监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the ellipse', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    ellipseY -= distance; // 向上移动
  }
  if (keyS.isDown) {
    ellipseY += distance; // 向下移动
  }
  if (keyA.isDown) {
    ellipseX -= distance; // 向左移动
  }
  if (keyD.isDown) {
    ellipseX += distance; // 向右移动
  }
  
  // 边界限制（可选，防止椭圆移出屏幕）
  ellipseX = Phaser.Math.Clamp(ellipseX, 30, 770);
  ellipseY = Phaser.Math.Clamp(ellipseY, 20, 580);
  
  // 更新椭圆显示位置
  ellipse.x = ellipseX;
  ellipse.y = ellipseY;
}

// 启动游戏
new Phaser.Game(config);