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
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制橙色菱形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  // 菱形中心在 (50, 50)，宽度 100，高度 100
  const diamondPoints = [
    50, 0,    // 上顶点
    100, 50,  // 右顶点
    50, 100,  // 下顶点
    0, 50     // 左顶点
  ];
  
  graphics.fillPoints(diamondPoints, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁原始 graphics 对象（已经生成纹理）
  graphics.destroy();
  
  // 在屏幕中心创建使用该纹理的 Image 对象
  const diamond = this.add.image(400, 300, 'diamond');
  
  // 设置旋转中心点（默认已经是中心）
  diamond.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    angle: 360,                 // 旋转到 360 度
    duration: 4000,             // 持续时间 4 秒
    ease: 'Linear',             // 线性缓动，保持匀速旋转
    repeat: -1,                 // 无限循环 (-1 表示永久重复)
    yoyo: false                 // 不使用往返效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, '橙色菱形 4 秒旋转一周（循环）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);