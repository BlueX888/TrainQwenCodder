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
  // 获取画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 三角形大小参数
  const size = 32;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - size / 2;
  
  // 顶点2：左下角
  const x2 = centerX - size / 2;
  const y2 = centerY + size / 2;
  
  // 顶点3：右下角
  const x3 = centerX + size / 2;
  const y3 = centerY + size / 2;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加白色边框使三角形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);