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

let ellipseGraphics;
let currentRotation = 0;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象并绘制椭圆
  ellipseGraphics = this.add.graphics();
  
  // 设置椭圆的填充颜色
  ellipseGraphics.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心在原点，宽度 200，高度 100）
  ellipseGraphics.fillEllipse(0, 0, 200, 100);
  
  // 设置椭圆位置到屏幕中心
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
  
  // 初始化旋转角度
  currentRotation = 0;
  
  // 添加文字提示
  this.add.text(10, 10, '椭圆旋转速度: 160度/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应该旋转的角度（度）
  // 160 度/秒 * (delta 毫秒 / 1000) = 本帧旋转角度
  const rotationDegrees = 160 * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationDegrees;
  
  // 将角度转换为弧度并应用到 Graphics 对象
  // Phaser 使用弧度制，1度 = Math.PI / 180 弧度
  ellipseGraphics.rotation = Phaser.Math.DegToRad(currentRotation);
}

// 启动游戏
new Phaser.Game(config);