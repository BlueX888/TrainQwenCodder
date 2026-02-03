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
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形
  // 三角形中心点在 (0, 0)，便于缩放
  const size = 100;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶点
    -size/2, height * 1/3,      // 左下
    size/2, height * 1/3        // 右下
  );
  
  // 将 graphics 定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.24,  // 缩放到 24%
    scaleY: 0.24,  // 缩放到 24%
    duration: 2000,  // 2秒
    yoyo: true,  // 来回播放（缩小后恢复）
    loop: -1,  // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Triangle Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% ↔ 24% (2s loop)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);