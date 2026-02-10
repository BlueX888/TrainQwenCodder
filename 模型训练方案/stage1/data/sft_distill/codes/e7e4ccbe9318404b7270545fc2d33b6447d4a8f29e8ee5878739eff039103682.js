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

let ellipse;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 设置描边样式为白色
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制椭圆（中心点在0,0，宽度120，高度60）
  graphics.fillEllipse(0, 0, 120, 60);
  graphics.strokeEllipse(0, 0, 120, 60);
  
  // 添加一个标记线，用于观察旋转效果
  graphics.lineStyle(2, 0xff0000, 1);
  graphics.lineBetween(0, 0, 60, 0);
  
  // 设置椭圆位置到屏幕中心
  graphics.setPosition(400, 300);
  
  // 保存引用以便在 update 中使用
  ellipse = graphics;
  
  // 添加说明文字
  const text = this.add.text(400, 50, '椭圆以每秒360度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 每秒旋转360度 = 每毫秒旋转 360/1000 度
  // 转换为弧度：(360/1000) * (Math.PI/180) = 0.00628 弧度/毫秒
  // 或者直接使用 Phaser.Math.DegToRad(360/1000)
  
  const rotationSpeed = Phaser.Math.DegToRad(360); // 每秒360度（弧度制）
  const deltaSeconds = delta / 1000; // 将毫秒转换为秒
  
  // 更新旋转角度
  ellipse.rotation += rotationSpeed * deltaSeconds;
}

// 创建游戏实例
new Phaser.Game(config);