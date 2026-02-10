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
let rotationSpeed = 200; // 每秒 200 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（使用两个三角形组合）
  // 菱形中心点在 (0, 0)，四个顶点分别在上下左右
  const size = 80;
  
  // 上三角形
  diamond.fillTriangle(
    0, -size,      // 顶点
    -size, 0,      // 左点
    size, 0        // 右点
  );
  
  // 下三角形
  diamond.fillTriangle(
    -size, 0,      // 左点
    size, 0,       // 右点
    0, size        // 底点
  );
  
  // 将菱形移动到画布中心
  diamond.x = config.width / 2;
  diamond.y = config.height / 2;
  
  // 添加提示文字
  this.add.text(10, 10, '菱形旋转速度: 200°/秒', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 根据时间增量更新旋转角度
  // delta 是毫秒，需要转换为秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 将角度转换为弧度（Phaser 使用弧度）
  const rotationRadians = Phaser.Math.DegToRad(rotationDelta);
  
  // 累加旋转角度
  diamond.rotation += rotationRadians;
}

new Phaser.Game(config);