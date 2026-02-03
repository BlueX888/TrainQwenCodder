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

let triangle;
let currentRotation = 0; // 以度为单位存储当前旋转角度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制三角形
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（以原点为中心）
  // 顶点坐标相对于中心点
  triangle.fillTriangle(
    0, -50,    // 顶部顶点
    -43, 25,   // 左下顶点
    43, 25     // 右下顶点
  );
  
  // 设置三角形位置到屏幕中心
  triangle.setPosition(400, 300);
  
  // 添加提示文本
  const text = this.add.text(400, 50, '三角形以 200°/秒 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 计算本帧应该旋转的角度
  // delta 是毫秒，200 度/秒 = 200 * (delta/1000) 度/帧
  const rotationDegrees = 200 * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationDegrees;
  
  // 将角度转换为弧度并应用到三角形
  // Phaser 使用弧度作为旋转单位
  triangle.rotation = Phaser.Math.DegToRad(currentRotation);
}

// 创建游戏实例
new Phaser.Game(config);