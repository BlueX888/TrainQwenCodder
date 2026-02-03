const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆：中心点 (0, 0)，宽度 200，高度 120
  graphics.fillEllipse(0, 0, 200, 120);
  
  // 设置椭圆位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.8,                // 水平缩放到 80%
    scaleY: 0.8,                // 垂直缩放到 80%
    duration: 2000,             // 动画时长 2 秒
    yoyo: true,                 // 启用往返效果（缩小后自动恢复）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 使用平滑的缓动函数
  });
  
  // 添加文字提示
  this.add.text(400, 50, 'Ellipse Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The ellipse scales to 80% and back in 2 seconds (looping)', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);