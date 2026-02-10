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
  // 使用 Graphics 绘制红色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆（宽80，高50）
  
  // 将 Graphics 转换为纹理以便用于 Sprite
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建使用该纹理的精灵，初始位置在左侧
  const ellipseSprite = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画：从左移动到右，4秒完成，往返循环
  this.tweens.add({
    targets: ellipseSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 4000, // 4秒
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    repeat: -1, // 无限循环（-1 表示永久重复）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);