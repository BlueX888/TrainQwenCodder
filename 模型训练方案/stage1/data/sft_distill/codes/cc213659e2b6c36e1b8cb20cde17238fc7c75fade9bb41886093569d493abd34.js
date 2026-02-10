// 完整的 Phaser3 代码 - 绘制蓝色三角形
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;  // 400
  const centerY = this.cameras.main.height / 2; // 300
  
  // 设置三角形大小（从中心点的偏移距离）
  const size = 16;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - size;
  
  // 顶点2：左下角
  const x2 = centerX - size;
  const y2 = centerY + size;
  
  // 顶点3：右下角
  const x3 = centerX + size;
  const y3 = centerY + size;
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x0000ff, 1);
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加白色描边使三角形轮廓更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

// 启动游戏
new Phaser.Game(config);