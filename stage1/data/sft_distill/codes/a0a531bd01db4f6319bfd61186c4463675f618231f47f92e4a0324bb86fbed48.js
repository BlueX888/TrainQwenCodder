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
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制等边三角形（大小为 32 像素）
  // 三角形顶点：顶部居中，底部两个角
  const size = 32;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  graphics.fillTriangle(
    size / 2, 0,           // 顶点（顶部中心）
    0, height,             // 左下角
    size, height           // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', size, size);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在随机位置创建 20 个三角形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（考虑三角形大小，避免超出边界）
    const x = Phaser.Math.Between(size / 2, config.width - size / 2);
    const y = Phaser.Math.Between(size / 2, config.height - size / 2);
    
    // 使用生成的纹理创建图像
    this.add.image(x, y, 'triangle');
  }
}

new Phaser.Game(config);