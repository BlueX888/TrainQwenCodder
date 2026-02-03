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

let hexagon;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  const centerX = 0;
  const centerY = 0;
  const radius = 80;
  const sides = 6;
  
  graphics.beginPath();
  
  // 计算六边形的顶点
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使六边形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 将六边形放置在屏幕中心
  graphics.setPosition(400, 300);
  
  // 保存引用以便在 update 中使用
  hexagon = graphics;
}

function update(time, delta) {
  // 每秒旋转 160 度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 160; // 度/秒
  const rotationRadians = Phaser.Math.DegToRad(rotationSpeed); // 转换为弧度/秒
  
  // 根据 delta 时间增加旋转角度
  hexagon.rotation += rotationRadians * (delta / 1000);
}

new Phaser.Game(config);