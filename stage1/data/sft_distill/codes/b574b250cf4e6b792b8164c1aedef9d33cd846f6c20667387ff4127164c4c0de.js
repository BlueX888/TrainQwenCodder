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
  // 三角形的大小（边长）
  const size = 64;
  
  // 计算等边三角形的高度
  const height = (Math.sqrt(3) / 2) * size;
  
  // 绘制12个随机位置的粉色三角形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置（确保三角形完全在画布内）
    const x = Phaser.Math.Between(size / 2, 800 - size / 2);
    const y = Phaser.Math.Between(height, 600 - height / 2);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xff69b4, 1);
    
    // 绘制等边三角形（顶点朝上）
    // 三个顶点坐标相对于中心点
    const x1 = x;                    // 顶部顶点
    const y1 = y - height / 2;
    
    const x2 = x - size / 2;         // 左下顶点
    const y2 = y + height / 2;
    
    const x3 = x + size / 2;         // 右下顶点
    const y3 = y + height / 2;
    
    // 填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  }
}

new Phaser.Game(config);