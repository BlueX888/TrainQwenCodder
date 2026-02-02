const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个三角形（等边三角形）
  // 三个顶点坐标：顶部中心、左下、右下
  const triangleSize = 100;
  graphics.fillTriangle(
    0, -triangleSize / 2,           // 顶点（顶部）
    -triangleSize / 2, triangleSize / 2,  // 左下顶点
    triangleSize / 2, triangleSize / 2    // 右下顶点
  );
  
  // 将三角形定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.24,               // X 轴缩放到 24%
    scaleY: 0.24,               // Y 轴缩放到 24%
    duration: 2000,             // 单程持续时间 2 秒
    yoyo: true,                 // 自动反向播放（恢复到原始大小）
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    ease: 'Linear'              // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Triangle Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 24% → 100% (Loop)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);