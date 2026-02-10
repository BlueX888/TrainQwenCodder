const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建5个紫色三角形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充样式
    graphics.fillStyle(0x800080, 1);
    
    // 绘制等边三角形
    // 三角形的三个顶点坐标（相对于 graphics 对象的原点）
    // 顶点：(0, -h), (-w/2, h/2), (w/2, h/2)
    // 其中 h = 64 * sqrt(3) / 2 ≈ 55.4
    const size = 64;
    const height = size * Math.sqrt(3) / 2;
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶部顶点
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 随机设置位置（确保三角形完全在画布内）
    const margin = size / 2;
    graphics.setPosition(
      Phaser.Math.Between(margin, 800 - margin),
      Phaser.Math.Between(margin, 600 - margin)
    );
  }
}

new Phaser.Game(config);