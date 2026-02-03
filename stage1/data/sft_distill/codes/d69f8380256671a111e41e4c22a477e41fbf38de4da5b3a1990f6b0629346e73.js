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
  // 创建橙色星形图形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制星形的路径
  const star = new Phaser.Geom.Star(0, 0, 5, 20, 40);
  graphics.fillPoints(star.points, true);
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const starSprite = this.add.image(100, 300, 'star');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: starSprite,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 2.5秒
    yoyo: true, // 启用往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);