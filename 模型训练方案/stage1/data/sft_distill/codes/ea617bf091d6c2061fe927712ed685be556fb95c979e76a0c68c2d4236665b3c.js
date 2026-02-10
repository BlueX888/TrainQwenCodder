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
  // 使用 Graphics 绘制黄色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制椭圆（中心点在 50, 30，宽度 100，高度 60）
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('yellowEllipse', 100, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象
  const ellipse = this.add.sprite(100, 300, 'yellowEllipse');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 动画时长 1 秒
    yoyo: true, // 往返效果（到达终点后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);