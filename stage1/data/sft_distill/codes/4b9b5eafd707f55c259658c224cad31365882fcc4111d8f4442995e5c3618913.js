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
  // 创建粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(0, 0, 80, 50); // 在中心绘制椭圆（宽80，高50）
  
  // 将 graphics 转换为纹理以便应用到精灵上
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,        // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左到右）
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达目标后反向播放）
    repeat: -1               // 无限循环（-1 表示永远重复）
  });
}

new Phaser.Game(config);