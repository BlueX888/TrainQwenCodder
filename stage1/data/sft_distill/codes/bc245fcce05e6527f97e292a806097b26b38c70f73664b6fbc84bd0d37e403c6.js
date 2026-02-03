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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 120，高度 80）
  graphics.fillEllipse(0, 0, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipseTexture', 120, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建椭圆精灵，放置在屏幕中央
  const ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,
    scaleX: 0.64,  // 缩放到 64%
    scaleY: 0.64,
    duration: 1250, // 2.5秒的一半，因为需要来回
    yoyo: true,     // 启用 yoyo 效果，动画结束后反向播放
    repeat: -1,     // 无限循环 (-1 表示永久重复)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, '椭圆循环缩放动画\n2.5秒一个周期', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);