const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('yellowEllipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'yellowEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标位置（右侧）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环（-1 表示永远重复）
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);