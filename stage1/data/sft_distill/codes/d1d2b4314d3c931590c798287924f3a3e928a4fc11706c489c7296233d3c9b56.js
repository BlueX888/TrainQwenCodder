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
  // 创建 Graphics 对象绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  graphics.fillEllipse(0, 0, 60, 40); // 在原点绘制椭圆（宽60，高40）
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('ellipse', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建使用该纹理的图像对象
  const ellipse = this.add.image(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,        // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左100移动到右700）
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1               // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);