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
  // 使用 Graphics 绘制红色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆（宽80，高50）
  
  // 将 graphics 转换为纹理以便于移动
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy(); // 销毁原始 graphics
  
  // 创建椭圆精灵对象，初始位置在左侧
  const ellipse = this.add.image(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 移动到右侧位置
    duration: 4000,             // 持续时间 4 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 往返效果（到达终点后反向播放）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);