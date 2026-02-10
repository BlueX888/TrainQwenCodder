const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式 (RGB: 255, 192, 203)
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 绘制一个等边三角形，大小为 64 像素
  // 三角形顶点坐标：顶部中心、左下、右下
  const size = 64;
  const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
  
  graphics.fillTriangle(
    size / 2, 0,           // 顶点（顶部中心）
    0, height,             // 左下角
    size, height           // 右下角
  );
  
  // 将 Graphics 生成为纹理，命名为 'pinkTriangle'
  graphics.generateTexture('pinkTriangle', size, height);
  
  // 销毁 Graphics 对象，因为纹理已生成
  graphics.destroy();
  
  // 创建12个随机位置的三角形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置，确保三角形完全在画布内
    const x = Phaser.Math.Between(size / 2, config.width - size / 2);
    const y = Phaser.Math.Between(height / 2, config.height - height / 2);
    
    // 在随机位置创建三角形图像
    this.add.image(x, y, 'pinkTriangle');
  }
}

new Phaser.Game(config);