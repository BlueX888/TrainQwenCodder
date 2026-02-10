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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制紫色椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为紫色
  graphics.fillStyle(0x9b59b6, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 80，高度 50）
  graphics.fillEllipse(0, 0, 80, 50);
  
  // 设置初始位置（左侧，垂直居中）
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 4000,              // 持续时间 4 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加说明文字
  this.add.text(400, 50, '紫色椭圆 4 秒往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);