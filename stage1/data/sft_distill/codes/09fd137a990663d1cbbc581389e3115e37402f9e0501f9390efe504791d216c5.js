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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制等边三角形（顶点朝上）
  // 三角形高度约为 48 像素，底边约为 48 像素
  const size = 48;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  // 计算三个顶点坐标
  const x1 = centerX;                    // 顶部顶点 x
  const y1 = centerY - height / 2;       // 顶部顶点 y
  const x2 = centerX - size / 2;         // 左下顶点 x
  const y2 = centerY + height / 2;       // 左下顶点 y
  const x3 = centerX + size / 2;         // 右下顶点 x
  const y3 = centerY + height / 2;       // 右下顶点 y
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加边框使三角形更明显
  graphics.lineStyle(2, 0x00aa00, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

// 创建游戏实例
new Phaser.Game(config);