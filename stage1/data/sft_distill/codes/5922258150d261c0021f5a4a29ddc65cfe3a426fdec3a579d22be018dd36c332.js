const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制20个随机位置的黄色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制等边三角形（边长24px）
    // 三角形顶点坐标计算：
    // 顶点：(0, -高度的2/3)
    // 左下：(-边长/2, 高度的1/3)
    // 右下：(边长/2, 高度的1/3)
    const size = 24;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height * 2 / 3,           // 顶点
      -size / 2, height / 3,         // 左下
      size / 2, height / 3           // 右下
    );
    
    // 设置随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);